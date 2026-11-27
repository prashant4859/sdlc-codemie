const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Database = require('better-sqlite3');
const request = require('supertest');

function createTempDbPath() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskpad-'));
  return path.join(dir, 'tasks.test.db');
}

function createAppWithDb(dbPath) {
  process.env.DB_PATH = dbPath;
  process.env.NODE_ENV = 'test';

  delete require.cache[require.resolve('../server')];
  return require('../server');
}

function getTaskCount(dbPath) {
  const db = new Database(dbPath);
  const row = db.prepare('SELECT COUNT(*) as cnt FROM tasks').get();
  db.close();
  return row.cnt;
}

test('POST /api/tasks trims title and returns 201 with created task', async () => {
  const dbPath = createTempDbPath();
  const app = createAppWithDb(dbPath);

  const res = await request(app)
    .post('/api/tasks')
    .set('Content-Type', 'application/json')
    .send({ title: '  Buy milk  ' });

  assert.equal(res.status, 201);
  assert.equal(typeof res.body.id, 'number');
  assert.equal(res.body.title, 'Buy milk');

  const db = new Database(dbPath);
  const stored = db.prepare('SELECT title FROM tasks WHERE id = ?').get(res.body.id);
  db.close();

  assert.equal(stored.title, 'Buy milk');
});

test('POST /api/tasks rejects missing title with 400 and does not insert', async () => {
  const dbPath = createTempDbPath();
  const app = createAppWithDb(dbPath);

  const before = getTaskCount(dbPath);

  const res = await request(app)
    .post('/api/tasks')
    .set('Content-Type', 'application/json')
    .send({});

  assert.equal(res.status, 400);
  assert.deepEqual(res.body, {
    error: { code: 'VALIDATION_ERROR', message: 'Title is required' },
  });

  const after = getTaskCount(dbPath);
  assert.equal(after, before);
});

test('POST /api/tasks rejects non-string title with 400 and does not insert', async () => {
  const cases = [123, {}, []];

  for (const invalid of cases) {
    const dbPath = createTempDbPath();
    const app = createAppWithDb(dbPath);

    const before = getTaskCount(dbPath);

    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send({ title: invalid });

    assert.equal(res.status, 400);
    assert.deepEqual(res.body, {
      error: { code: 'VALIDATION_ERROR', message: 'Title must be a string' },
    });

    const after = getTaskCount(dbPath);
    assert.equal(after, before);
  }
});

test('POST /api/tasks rejects empty or whitespace-only title with 400 and does not insert', async () => {
  const cases = ['', '   '];

  for (const invalid of cases) {
    const dbPath = createTempDbPath();
    const app = createAppWithDb(dbPath);

    const before = getTaskCount(dbPath);

    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send({ title: invalid });

    assert.equal(res.status, 400);
    assert.deepEqual(res.body, {
      error: { code: 'VALIDATION_ERROR', message: 'Title cannot be blank' },
    });

    const after = getTaskCount(dbPath);
    assert.equal(after, before);
  }
});
