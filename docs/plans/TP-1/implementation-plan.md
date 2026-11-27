
# TP-4 — Implementation plan (TP-1 hardening)

## 1) Purpose / goal

Implement server-side validation and trimming for `POST /api/tasks` so TaskPad rejects invalid task titles and persists/returns normalized titles. This plan is scoped specifically to Jira sub-task **TP-4** (TP-1 hardening).

## 2) Background / context

Task creation currently accepts unvalidated input, which can result in empty/whitespace-only titles being stored and inconsistent behavior between client and server. TP-4 closes the server-side gap by enforcing title requirements centrally in the API.

## 3) In scope

- Validate the request body `title` for `POST /api/tasks`:
  - `title` missing → **400**
  - `title` not a string → **400**
  - `title` is empty or whitespace-only → **400**
- Trim surrounding whitespace from a valid `title` before:
  - inserting into the database
  - returning the created task payload
- Ensure **no DB row is inserted** on invalid input.
- Add automated tests covering:
  - status codes and response payload shape for valid/invalid inputs
  - trimming behavior
  - insert vs. non-insert behavior (as observable through API/listing)

## 4) Out of scope

- Any frontend/UI changes (e.g., `taskpad/public/app.js`)
- Validation for fields other than `title`
- Changes to API routes other than `POST /api/tasks`
- Database schema changes / migrations
- Authorization/authentication changes

## 5) Requirements (acceptance criteria)

- `POST /api/tasks` with missing `title` returns **HTTP 400** with JSON error payload.
- `POST /api/tasks` with non-string `title` returns **HTTP 400** with JSON error payload.
- `POST /api/tasks` with `title` that is `""` or whitespace-only returns **HTTP 400** with JSON error payload.
- `POST /api/tasks` with `title` containing leading/trailing whitespace:
  - returns success with the **trimmed title**
  - persists the **trimmed title**
- Invalid requests do not create a task (no insert).
- Automated tests exist and pass for all of the above.

## 6) API / contract

### Endpoint
- `POST /api/tasks`

### Request body (relevant fields)
```json
{ "title": "string" }
```

### Success response
- HTTP **201** (created)
- JSON includes created task fields and echoes the trimmed title (exact field set per existing API)

### Error response
- HTTP **400**
- JSON error payload (consistent with existing API error format; if none exists, use):
```json
{ "error": "Invalid title" }
```

## 7) Validation rules (detailed)

- Read `title` from request body.
- If `title === undefined || title === null` → 400
- If `typeof title !== "string"` → 400
- `const trimmed = title.trim()`
- If `trimmed.length === 0` → 400
- Otherwise, use `trimmed` for persistence and response.

## 8) Implementation approach

- Update `taskpad/server.js` route handler for `POST /api/tasks`:
  - validate and trim as described
  - on validation failure, short-circuit with 400 and do not call insert logic
  - on success, pass trimmed title into existing insert flow and ensure response uses trimmed title
- Keep behavior consistent with existing route patterns and error handling conventions in the codebase.

## 9) Data / persistence considerations

- No schema changes.
- Only normalize `title` at write time (trim) to prevent invalid/dirty data from being stored.
- Confirm existing list/read endpoints return stored values unchanged (now guaranteed trimmed).

## 10) Test plan

Add/extend API tests to cover:

- **Missing title**
  - `POST /api/tasks` with `{}` → 400
- **Non-string title**
  - `{ "title": 123 }` → 400
  - `{ "title": true }` → 400
  - `{ "title": {} }` → 400
- **Empty/whitespace-only**
  - `{ "title": "" }` → 400
  - `{ "title": "   " }` → 400
- **Trimming**
  - `{ "title": "  Buy milk  " }` → 201, response contains `"Buy milk"`
  - Verify subsequent `GET /api/tasks` (or equivalent) includes the created task with trimmed title
- **No insert on invalid**
  - Capture task count before/after invalid POST via listing endpoint and assert unchanged

## 11) Edge cases

- Very long strings: preserve existing limits/behavior (do not introduce new limits in TP-4 unless already specified).
- Unicode whitespace: rely on JavaScript `String.prototype.trim()` semantics.
- Ensure error responses do not leak stack traces.

## 12) Rollout / deployment

- Change is backward compatible for valid clients.
- Deployment steps:
  - merge to main
  - run test suite in CI
  - deploy server as per existing pipeline

## 13) Observability / logging

- Keep logs minimal; do not log request bodies.
- If existing server logging exists, optionally log validation failures at debug level without including raw title content.

## 14) Deliverables

- Updated Markdown plan (this document) scoped to TP-4.
- Backend implementation in `taskpad/server.js` for validation + trimming.
- Automated tests verifying 400/201 behaviors and trimming + non-insert.
