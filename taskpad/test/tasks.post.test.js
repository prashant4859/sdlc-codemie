const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const Database = require('better-sqlite3');

function createTempDbPath() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskpad-test-'));
  return path.join(dir, 'tasks.test.db');
}

describe('POST /api/tasks', () => {
  let dbPath;
  let app;
  let db;

  beforeEach(() => {
    jest.resetModules();

    dbPath = createTempDbPath();
    process.env.DB_PATH = dbPath;

    // Import after setting DB_PATH so the server uses the temp DB.
    app = require('../server');
    db = new Database(dbPath);
  });

  afterEach(() => {
    try {
      db.close();
    } catch (e) {
      // ignore
    }

    delete process.env.DB_PATH;
  });

  test('trims title and returns 201 with created task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send({ title: ' Buy milk ' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: expect.any(Number), title: 'Buy milk' });

    const rows = db.prepare('SELECT id, title FROM tasks WHERE id = ?').all(res.body.id);
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe('Buy milk');
  });

  test('returns 400 for missing title and does not insert', async () => {
    const beforeCount = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;

    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: { code: 'VALIDATION_ERROR', message: expect.any(String) },
    });

    const afterCount = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;
    expect(afterCount).toBe(beforeCount);
  });

  test.each([
    ['number', 123],
    ['object', {}],
    ['array', []],
  ])('returns 400 for non-string title (%s) and does not insert', async (_name, value) => {
    const beforeCount = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;

    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send({ title: value });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: { code: 'VALIDATION_ERROR', message: expect.any(String) },
    });

    const afterCount = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;
    expect(afterCount).toBe(beforeCount);
  });

  test.each([
    ['empty string', ''],
    ['whitespace-only', '   '],
  ])('returns 400 for blank title (%s) and does not insert', async (_name, value) => {
    const beforeCount = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;

    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send({ title: value });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: { code: 'VALIDATION_ERROR', message: expect.any(String) },
    });

    const afterCount = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;
    expect(afterCount).toBe(beforeCount);
  });
});
