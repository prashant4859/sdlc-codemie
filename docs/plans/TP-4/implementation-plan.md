# Overview
Implement server-side validation and normalization for TaskPad `POST /api/tasks`: require `title` to be present, to be a string, and to be non-empty after trimming; persist the trimmed title; return a consistent `400` JSON error for invalid input; return `201` with the created task details when valid.

Jira scope: **TP-4** (Sub-task under **TP-1**). This plan covers *backend-only* validation + trimming for task creation.

## Success criteria
- Invalid `title` payloads are rejected with `400` and **no row inserted**.
- Valid titles are **trimmed**, inserted, and returned with `201`.
- Automated tests cover all invalid/valid cases required by TP-4.

# Scope

## In scope
- Update `taskpad/server.js` `POST /api/tasks` handler to validate:
  - missing `title`
  - non-string `title` (number/object/array/etc.)
  - empty string / whitespace-only after `trim()`
- Normalize title by trimming before insert.
- Return `HTTP 400` with a clear, consistent JSON error body for validation failures.
- Add/adjust backend automated tests for the above.

## Out of scope
- Frontend/UI request prevention, error display, or client-side validation.
- New validation rules not specified (e.g., max length, uniqueness).
- Changes to existing `GET /api/tasks` and `DELETE /api/tasks/:id` flows.

# Requirements table (Acceptance Criteria)

| AC ID | Acceptance Criteria (faithful) |
|---|---|
| AC-1 | Given the request body has no title, when client calls `POST /api/tasks`, then API responds `400` with a clear JSON error and does not insert a DB row. |
| AC-2 | Given title is not a string (number/object/array), when client calls `POST /api/tasks`, then API responds `400` with a clear JSON error and does not insert a DB row. |
| AC-3 | Given title is empty or whitespace-only, when client calls `POST /api/tasks`, then API responds `400` with a clear JSON error and does not insert a DB row. |
| AC-4 | Given a valid title with leading/trailing spaces, when client calls `POST /api/tasks`, then stored title is trimmed and API responds `201` with `{ id, title: trimmed }`. |

# Current-state findings

- EXISTS (per Jira TP-1 and TP-4 descriptions): `taskpad/server.js` contains `POST /api/tasks` which inserts `req.body.title` directly and returns `201` with `{ id: info.lastInsertRowid, title: req.body.title }` (no validation and no trimming).
- EXISTS (per TP-1 description): TaskPad is Node.js/Express + better-sqlite3.
- UNVERIFIED: Exact test harness and how server tests are currently structured in this repo (paths, runner, and DB isolation strategy).

# Proposal

## Design

### Validation rules (in order)
In `POST /api/tasks`:
1. Safely extract title: `const title = req?.body?.title`.
2. Missing title: `title === undefined` → `400`.
3. Type check: `typeof title !== 'string'` → `400`.
4. Trim check: `const trimmed = title.trim(); if (trimmed.length === 0)` → `400`.
5. Success: insert `trimmed` using parameterized SQL and return `201` with `{ id, title: trimmed }`.

### Error response schema
TP-4 requires “clear JSON error” but does not mandate a schema.

Default to:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required"
  }
}
```
- Keep `code` constant.
- Customize `message` for non-string vs blank-after-trim (while remaining human-readable).

### Alternatives considered
- DB constraints (`CHECK`, `NOT NULL`): would likely produce `500` or DB-specific errors rather than consistent `400` JSON.
- Coercing non-string inputs to string: conflicts with AC-2 requiring rejection.

# Milestones (relative)
- M1: Confirm existing `POST /api/tasks` code path and where validation fits.
- M2: Implement validation + trimming behavior and consistent `400` payloads.
- M3: Implement/adjust automated tests for valid + invalid cases, including “no row inserted”.
- M4: Verify locally; ensure no regressions to list/delete.

# Task checklist

T-01: Confirm current `POST /api/tasks` behavior and insertion/response structure
- Description: Inspect `taskpad/server.js` and identify precise location to implement validation + trimming.
- Files: EXISTS `taskpad/server.js`
- AC: AC-1, AC-2, AC-3, AC-4
- Depends on: none
- Definition of done: Baseline matches assumptions; any discrepancies captured as updated findings + open questions.

T-02: Implement validation + trimming in `POST /api/tasks`
- Description:
  - Add validation for missing/non-string/blank-after-trim title.
  - Return `400` with consistent JSON error payload.
  - Insert trimmed title and return it in `201` response.
- Files: EXISTS `taskpad/server.js`
- AC: AC-1, AC-2, AC-3, AC-4
- Depends on: T-01
- Definition of done: Manual `curl` verification shows expected 201/400 behaviors; SQL remains parameterized.

T-03: Add automated tests for `POST /api/tasks` validation and trimming
- Description:
  - Add tests asserting:
    - 201 on valid title; returned title is trimmed.
    - 400 on missing title.
    - 400 on non-string titles (at least: number, object, array).
    - 400 on `""` and whitespace-only.
    - No DB row inserted on 400 (verify via DB query, task list count, or GET endpoint).
- Files: UNVERIFIED existing framework; likely NEW under `taskpad/test/` or similar.
- AC: AC-1, AC-2, AC-3, AC-4
- Depends on: T-02
- Definition of done: Tests pass via repo’s standard command; assertions cover all AC cases.

T-04: Regression check list/delete flows
- Description: Ensure `GET /api/tasks` and `DELETE /api/tasks/:id` continue to behave as before.
- Files: EXISTS `taskpad/server.js`; UNVERIFIED tests
- AC: (TP-4 does not include this explicitly; sanity check only)
- Depends on: T-02
- Definition of done: Existing tests (if present) still pass; quick manual verification confirms no behavior change for list/delete.

# Testing and QA

## Automated
- Preferred: HTTP-level integration tests (e.g., supertest) that start the Express app, issue requests, and assert:
  - status codes (201 vs 400)
  - response JSON shape/content
  - DB insert count unchanged for invalid cases

## Manual
- Missing title:
  ```bash
  curl -i -X POST http://localhost:<port>/api/tasks \
    -H 'content-type: application/json' \
    -d '{}'
  ```
- Non-string:
  ```bash
  curl -i -X POST http://localhost:<port>/api/tasks \
    -H 'content-type: application/json' \
    -d '{"title": 123}'
  ```
- Whitespace-only:
  ```bash
  curl -i -X POST http://localhost:<port>/api/tasks \
    -H 'content-type: application/json' \
    -d '{"title": "   "}'
  ```
- Trim success:
  ```bash
  curl -i -X POST http://localhost:<port>/api/tasks \
    -H 'content-type: application/json' \
    -d '{"title": " Buy milk "}'
  ```

# Rollout
Not specified in the story. This is a behavior change (previously accepted invalid inputs); coordinate with frontend work so `400` errors are handled gracefully.

# Observability and operations
Not specified in story/repo. Ensure errors are returned as readable JSON with an error `code` and `message`.

# Risks and mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---:|---:|---|
| UI or clients rely on previous always-201 behavior | UX regressions / silent failures | Medium | Communicate change; ensure UI work in TP-1 handles non-201 responses |
| No/limited existing server test harness | Reduced confidence | Medium | Implement tests using existing tooling if available; otherwise document limitation and add minimal runner only if already supported |
| Error schema expectations differ | Rework | Low/Medium | Centralize error response helper so schema changes are localized |

# Assumptions
- ASSUMPTION: `express.json()` (or equivalent) is enabled so `req.body` exists.
- ASSUMPTION: DB table `tasks` contains `id` and `title`, and `lastInsertRowid` is used for returning created id.
- ASSUMPTION: No title max length requirement.

# Open questions
1. What exact JSON schema should validation errors follow?
   - Default: `{ "error": { "code": "VALIDATION_ERROR", "message": "Title is required" } }`
2. Should any max title length be enforced?
   - Default: no max length enforcement (not specified).

# Traceability table

| AC ID | Tasks | Status |
|---|---|---|
| AC-1 | T-02, T-03 | Covered |
| AC-2 | T-02, T-03 | Covered |
| AC-3 | T-02, T-03 | Covered |
| AC-4 | T-02, T-03 | Covered |
