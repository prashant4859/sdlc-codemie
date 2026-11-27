# TaskPad Testing

## Test types
- API tests: `node:test` + `supertest`
- UI tests: Playwright (`@playwright/test`)

## DB isolation
The app uses `process.env.DB_PATH || 'tasks.db'`.

All automated tests should set `DB_PATH` to a temporary file to avoid modifying `taskpad/tasks.db`.

API test suite (`test/api/tasks.api.test.js`) starts the server with:
- `DB_PATH=<temp-file>`
- `PORT=<unique-port>`

## Install test dependencies
From `taskpad/`:

```bash
npm i -D supertest @playwright/test
npx playwright install
```

## Run API tests (node --test)
From the repo root:

```bash
node --test taskpad/test/api/*.test.js
```

## Run UI tests (Playwright)
Start the app in a terminal (example):

```bash
cd taskpad
PORT=3000 DB_PATH=./tasks.db node server.js
```

Then in another terminal:

```bash
cd taskpad
npx playwright test
```

You can override base URL:

```bash
UI_BASE_URL=http://localhost:3000 npx playwright test
```

## Notes about requested validation/trimming
The current implementation in `taskpad/server.js` and `taskpad/public/app.js` does not perform:
- server-side validation (reject empty/missing titles)
- trimming titles before insert/return
- UI validation messaging

Tests marked "expected to fail" encode the requested behavior and will fail until the app adds those behaviors.
