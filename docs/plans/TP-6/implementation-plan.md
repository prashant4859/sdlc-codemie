# TP-6 — Implementation plan

## 1) Overview

TP-6 implements client-side validation for TaskPad task creation: trim the user’s input, block empty/whitespace-only titles before calling `POST /api/tasks`, and display a user-visible validation message without clearing the input. This closes the UI validation gap identified for TP-1.

## 2) Scope

### In scope

- Frontend: trim task title before submit; if empty after trim, do not call `POST /api/tasks` (`taskpad/public/app.js`).
- Frontend: display a validation message for empty/whitespace-only input; keep the input value unchanged on validation failure.
- Frontend markup: add a minimal message container to support validation feedback (`taskpad/public/index.html`).
- Automated UI tests: update/strengthen Playwright tests to assert validation message and that no create request is sent (`taskpad/test/ui/taskpad.ui.spec.js`).

### Out of scope

- Backend validation behavior (already implemented in `taskpad/server.js`).
- General API error handling for failed list/create/delete beyond blank-title validation (tracked elsewhere; not specified in TP-6).
- CSS/styling work beyond adding minimal DOM elements needed for testable messaging.

## 3) Requirements table (Acceptance Criteria)

| AC ID | Requirement text (from Jira TP-6) | Planned verification |
|---|---|---|
| AC-1 | **Block empty/whitespace title**<br><br>- Given the TaskPad UI is open<br>- And the new task title input is empty or contains only whitespace<br>- When the user clicks Add<br>- Then the UI must not send a POST /api/tasks request<br>- And the UI displays a validation message indicating a title is required / cannot be blank<br>- And the input retains the user’s entered value | Playwright: intercept network; assert no `/api/tasks` POST; assert message element text; assert input value unchanged. |
| AC-2 | **Trim before send**<br><br>- Given the new task title input contains leading/trailing whitespace around non-whitespace characters<br>- When the user clicks Add<br>- Then the UI sends POST /api/tasks with the trimmed title value | Playwright: intercept POST body; assert `{title: "X"}` (trimmed). Also assert list shows trimmed title. |
| AC-3 | **Automated test coverage**<br><br>- Given Playwright UI tests exist for this behavior<br>- When the validation is implemented<br>- Then the previously expected-to-fail validation test is updated/enabled to pass and validates no request is sent (e.g., via request interception). | Update `taskpad/test/ui/taskpad.ui.spec.js` to remove “expected to fail” assumptions; enforce request-level assertion. |

## 4) Current-state findings

- **EXISTS:** UI creates tasks without trimming/validation; always calls POST and clears input (`taskpad/public/app.js`).
- **EXISTS:** No validation feedback container in HTML (`taskpad/public/index.html`).
- **EXISTS:** Backend already validates and trims titles; blank/whitespace returns 400 with `{error:{code:'VALIDATION_ERROR', message:'Title cannot be blank'}}` (`taskpad/server.js`).
- **EXISTS:** Playwright UI tests include “expected to fail until UI validation exists” cases that currently only assert body text + list count, not network requests (`taskpad/test/ui/taskpad.ui.spec.js`).
- **EXISTS:** Gherkin UI feature defines empty/whitespace scenarios with “validation message” and “no new task” expectations (`taskpad/test/gherkin/ui.feature`).

## 5) Proposal

Implement a small, explicit client-side validation flow in the click handler for `#add`:

1. Read raw input value `titleRaw`.
2. Compute `trimmedTitle = titleRaw.trim()`.
3. If `trimmedTitle.length === 0`:
   - Render a validation message into a dedicated message element (via `textContent`).
   - Return early (no network request).
   - Do not clear the input (so the user can edit/correct).
4. If valid:
   - Clear any existing validation message.
   - Send `POST /api/tasks` with JSON body `{ title: trimmedTitle }`.
   - On success, clear the input and reload list (existing behavior).

### Message element choice

Add a minimal element such as `<div id="message" role="status"></div>` near the input/button so tests have a stable selector and users see feedback.

### Alternatives considered

- **Rely on server-side validation only:** rejected because TP-6 explicitly requires UI to block blank titles and not send the request.
- **Use HTML5 `required` validation:** possible but does not cover whitespace-only without custom logic; also harder to assert “no request sent” without a JS guard.

## 6) Milestones (relative)

- **M1:** Add message container to HTML + basic message rendering helper (if needed).
- **M2:** Implement trim + early-return validation in `app.js`; ensure normal flow still works.
- **M3:** Update Playwright UI tests to assert no POST request and trimmed payload behavior.
- **M4:** Run full test suite (API + UI) and confirm green for TP-6 scenarios.

## 7) Task checklist

T-01: Add a stable message container for validation feedback
- Description: Add a DOM element to `taskpad/public/index.html` for displaying validation feedback.
- Files: EXISTS `taskpad/public/index.html`
- AC: AC-1
- Depends on: none
- Definition of done: Message container exists with stable selector (e.g., `#message`) and is visible in DOM.

T-02: Implement client-side trimming + blank-title guard in create handler
- Description: Update click handler for `#add` to trim title; if blank after trim, render validation message and return before fetch; preserve input value. If valid, POST with trimmed title.
- Files: EXISTS `taskpad/public/app.js`
- AC: AC-1, AC-2
- Depends on: T-01
- Definition of done: Blank/whitespace inputs do not send network requests; valid inputs send trimmed payload.

T-03: Update Playwright tests to enforce request-level assertions
- Description: Modify existing “expected to fail” tests to (a) assert validation message via `#message` (or chosen selector), (b) assert no `POST /api/tasks` is issued for blank/whitespace, and (c) add/adjust test for trimmed request body for valid input with surrounding whitespace.
- Files: EXISTS `taskpad/test/ui/taskpad.ui.spec.js`
- AC: AC-1, AC-2, AC-3
- Depends on: T-02
- Definition of done: UI tests pass and explicitly validate “no request sent” and “trim before send”.

## 8) Testing and QA

- **UI tests (Playwright):** update `taskpad/test/ui/taskpad.ui.spec.js`.
  - AC-1: Use `page.route('**/api/tasks')` or `page.on('request')` filter to count POSTs; assert count == 0 for empty/whitespace titles. Assert `#message` contains required text. Assert `#title` retains original value.
  - AC-2: Intercept the POST and inspect `route.request().postDataJSON()` (or equivalent) to assert `title` equals trimmed string.
- **Regression:** re-run existing UI add/delete tests to ensure list rendering unaffected.
- **API tests:** no changes required for TP-6; run `npm test` to ensure nothing regresses.

## 9) Rollout

Not specified in story. This is a small UI-only change shipped with the normal deployment process for TaskPad.

## 10) Observability and operations

Not specified in story. No additional logging/metrics are planned for this UI validation change.

## 11) Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Validation message selector/copy changes break tests | Flaky UI tests / harder maintenance | Use a stable element ID (`#message`) and assert on a small regex (e.g., `/required|blank|title/i`) rather than exact copy unless copy is mandated. |
| Accidentally clearing input on validation failure | Violates AC-1 and worsens UX | Explicit early return before any input reset; add test assertion for retained value. |
| Request interception implemented incorrectly | Tests may give false confidence | Prefer explicit counters for POST requests and verify via both route and list count where feasible. |

## 12) Assumptions

- **ASSUMPTION:** It is acceptable for validation message copy to be flexible as long as it indicates title is required/cannot be blank (tests will use a regex).
- **ASSUMPTION:** Adding a simple `#message` element to `index.html` is acceptable without additional styling requirements.
- **ASSUMPTION:** Playwright can reliably intercept/observe fetch requests to `/api/tasks` in this project setup.

## 13) Open questions

1. What exact validation copy should the UI display (align with API “Title cannot be blank” vs “Title is required”)?
   - Default: Use “Title cannot be blank” for blank/whitespace-only input to align with server behavior.
2. Should the validation message clear automatically when the user starts typing again, or only on successful submit?
   - Default: Clear message when a valid submit occurs; optionally clear on input `oninput` as a follow-up improvement if desired.

## 14) Traceability

| AC | Covered by tasks | Status |
|---|---|---|
| AC-1 | T-01, T-02, T-03 | COVERED |
| AC-2 | T-02, T-03 | COVERED |
| AC-3 | T-03 | COVERED |
