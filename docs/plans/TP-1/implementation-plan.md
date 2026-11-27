
# TP-4 — TP-1 Hardening: Server-side title validation + trimming (Implementation plan)

## 1) Overview

This document defines the implementation plan for Jira sub-task **TP-4** under **TP-1 (hardening)**. The goal is to harden `POST /api/tasks` by enforcing server-side validation of `title` and normalizing accepted titles via trimming, ensuring invalid titles are rejected and valid titles are persisted/returned in a consistent form.

## 2) Scope

### In scope

- Add server-side validation for `title` on `POST /api/tasks`:
  - Missing (`undefined`/`null`) → HTTP **400**
  - Non-string → HTTP **400**
  - Empty or whitespace-only → HTTP **400**
- Trim surrounding whitespace for valid titles before:
  - inserting into the database
  - returning the created task payload
- Ensure invalid requests do **not** insert a database row.
- Add/extend automated tests to cover:
  - status codes and error payload shape
  - trimming behavior in create response and subsequent listing
  - “no insert on invalid” behavior (observable via listing/count)

### Out of scope

- Frontend/UI changes (e.g., `taskpad/public/app.js`)
- Validation for fields other than `title`
- Changes to endpoints other than `POST /api/tasks`
- Database schema changes/migrations
- Authn/Authz changes

## 3) Requirements table

| ID | Requirement | Priority | Acceptance criteria |
|---:|-------------|:--------:|---------------------|
| R-01 | Reject missing title | P0 | `POST /api/tasks` with `{}` returns **400** with JSON error payload. |
| R-02 | Reject non-string title | P0 | `POST /api/tasks` with `{ "title": 123 }` / `true` / `{}` returns **400** with JSON error payload. |
| R-03 | Reject empty/whitespace-only title | P0 | `POST /api/tasks` with `{ "title": "" }` or `{ "title": "   " }` returns **400** with JSON error payload. |
| R-04 | Trim accepted titles | P0 | `POST /api/tasks` with `{ "title": "  Buy milk  " }` returns **201** and echoes `"Buy milk"`. |
| R-05 | Persist trimmed titles | P0 | Subsequent `GET /api/tasks` includes the created task with title `"Buy milk"` (trimmed). |
| R-06 | No insert on invalid input | P0 | Task count/list is unchanged after invalid `POST /api/tasks`. |
| R-07 | Tests for all behaviors | P0 | Automated tests exist and pass for R-01…R-06. |

## 4) Current-state findings (EXISTS/NEW/UNVERIFIED)

- **EXISTS:** `POST /api/tasks` currently accepts input without strict server-side validation for title.
- **EXISTS:** Empty/whitespace-only titles can be stored, leading to inconsistent client/server behavior.
- **NEW:** Add centralized API-side validation + normalization (trim) for `title` at write time.
- **UNVERIFIED:** Current API error response conventions and exact response schema for task creation (tests will align to existing conventions; if no standard exists, use `{ "error": "Invalid title" }`).

## 5) Proposal

Update the `POST /api/tasks` handler in `taskpad/server.js` to:

1. Read `title` from the request body.
2. Validate:
   - if `title === undefined || title === null` → respond **400**
   - if `typeof title !== "string"` → respond **400**
   - `const trimmed = title.trim()`
   - if `trimmed.length === 0` → respond **400**
3. On success:
   - insert using `trimmed`
   - return the created task payload with the `trimmed` title
4. On failure:
   - short-circuit before any DB insert logic is invoked
   - return a JSON error payload consistent with existing API patterns (fallback: `{ "error": "Invalid title" }`)

API contract notes (no API surface changes beyond validation/normalization):

- Endpoint: `POST /api/tasks`
- Request body (relevant): `{ "title": "string" }`
- Success: **201**, created task JSON; title is trimmed.
- Error: **400**, JSON error payload.

## 6) Milestones

- **M1 — Implement validation + trimming (server):** Update `taskpad/server.js` route handler.
- **M2 — Test coverage:** Add/extend API tests for invalid/valid/trimming/no-insert.
- **M3 — Verification:** Run full test suite; confirm behavior via local/manual smoke checks.

## 7) Task checklist (T-xx)

- **T-01:** Locate `POST /api/tasks` route handler in `taskpad/server.js` and identify current insert flow.
- **T-02:** Implement validation for missing/non-string/empty-or-whitespace-only `title` and return **400**.
- **T-03:** Normalize valid `title` via `trim()` and ensure insert uses normalized value.
- **T-04:** Ensure response payload echoes the normalized title (without changing existing response shape beyond title value).
- **T-05:** Ensure invalid input short-circuits prior to insert (no DB side effects).
- **T-06:** Add tests: missing title → 400.
- **T-07:** Add tests: non-string title variants → 400.
- **T-08:** Add tests: empty and whitespace-only → 400.
- **T-09:** Add tests: trimming `"  Buy milk  "` → 201 with `"Buy milk"` in response.
- **T-10:** Add tests: subsequent listing (`GET /api/tasks`) includes `"Buy milk"` (persisted trimmed).
- **T-11:** Add tests: invalid POST does not change list/count (no insert).
- **T-12:** Ensure tests run reliably in CI (no order dependency; isolate state per test).

## 8) Testing and QA

Automated API tests should assert:

- **400** for:
  - `{}` (missing title)
  - `{ "title": 123 }`, `{ "title": true }`, `{ "title": {} }` (non-string)
  - `{ "title": "" }`, `{ "title": "   " }` (empty/whitespace-only)
- **201** for:
  - `{ "title": "  Buy milk  " }` with response containing `"Buy milk"`
- Persistence check:
  - `GET /api/tasks` returns the created task with the trimmed title.
- No insert on invalid:
  - Compare pre/post list length (or equivalent observable API output) around invalid POST.

Manual QA (optional, minimal):

- Use curl/Postman to validate error payload shape and confirm no task is created on invalid input.

## 9) Rollout

- Backward compatible for valid clients (titles continue to work; now normalized).
- Deployment steps:
  - merge to main
  - run CI test suite
  - deploy server via existing pipeline
- Post-deploy smoke:
  - Create task with trimmed title input; confirm stored/returned trimmed.
  - Attempt invalid titles; confirm 400 and no created task.

## 10) Observability and operations

- Avoid logging request bodies.
- If existing server logging exists, optionally log validation failures at debug level without including raw title content.
- Ensure error responses remain generic (no stack traces).

## 11) Risks and mitigations

- **Risk:** Clients relying on creating blank titles will now fail.
  - **Mitigation:** This is intentional hardening; communicate via release notes/changelog if applicable.
- **Risk:** Inconsistent error payload format across endpoints.
  - **Mitigation:** Follow existing API error conventions; use `{ "error": "Invalid title" }` only if no pattern exists.
- **Risk:** Tests become flaky due to shared DB state.
  - **Mitigation:** Isolate test state (setup/teardown) and assert via API list/count deterministically.

## 12) Assumptions

- `taskpad/server.js` owns the `POST /api/tasks` route and is the correct place to implement validation.
- There is an existing listing endpoint (e.g., `GET /api/tasks`) usable to observe insert/no-insert behavior.
- JavaScript `String.prototype.trim()` is acceptable for whitespace normalization (including Unicode per JS semantics).

## 13) Open questions (with Default)

- **Q-01:** What is the canonical API error response format for validation errors?
  - **Default:** Return `HTTP 400` with `{ "error": "Invalid title" }` if no existing convention is found.
- **Q-02:** What is the exact created-task response schema (fields returned on 201)?
  - **Default:** Preserve existing schema; only ensure the `title` value is trimmed.
- **Q-03:** How should tests reset/clean DB state?
  - **Default:** Use existing test utilities/conventions; otherwise, clear tasks via API or test DB reset hooks.

## 14) Traceability table

| Artifact | Reference | Notes |
|---------|-----------|------|
| Jira sub-task | TP-4 | Server-side title validation + trimming for `POST /api/tasks`. |
| Epic/parent hardening | TP-1 | Centralized hardening workstream; TP-4 is scoped subset. |
| Endpoint | `POST /api/tasks` | Validation + normalization at write time. |
| Requirements | R-01…R-07 | Map to tests and implementation tasks. |
| Tasks | T-01…T-12 | Implementation + test checklist. |
