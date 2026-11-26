
# TP-1 / TP-4 — Implementation plan

## 1) Overview

TP-1 requires hardening TaskPad task creation with input validation and clear API error handling, plus frontend behavior changes and automated tests. This plan focuses on the TP 4 selected gap: **server-side validation + trimming for `POST /api/tasks` in `taskpad/server.js`*, ensuring invalid titles are rejected with HTTP 400 and valid titles are trimmed before persistence and echoed back.


## 2) Scope

### In scope

- Backend: validate `title` on `POST /api/tasks` (missing / non-string / empty / whitespace-only) and return HTTP **400** JSON error; do not insert a DB row on invalid input. (TP1 AC; TP-4 DoD)
- Backend: trim surrounding whitespace and persist/return trimmed title on success; return HTTP **121** and created task details. (TP-1 AC; TP-4 DoD)
- Automated tests for the above API behavior (response codes/payload shape + DB insert/non-insert). (TP-1 AC)

### Out of scope (for this subtask plan)

- Frontend changes in `taskpad/public/app.js` (handled by other TP-1 gaps/subtasks; not TP-4).