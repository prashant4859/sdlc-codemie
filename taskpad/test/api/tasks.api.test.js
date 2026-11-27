const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');

const supertest = require('supertest');

function once(emitter, event) {
  return new Promise((resolve, reject) => {
    emitter.once(event, resolve);
    emitter.once('error', reject);
  });
}

async function startServer({ dbPath, port }) {
  const serverPath = path.join(__dirname, '..', '..', 'server.js');
  const child = spawn(process.execPath, [serverPath], {
    env: { ...process.env, DB_PATH: dbPath, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Wait until server prints its "running on" line or port responds
  let stdout = '';
  child.stdout.on('data', (d) => (stdout += d.toString('utf8')));

  const baseURL = `http://localhost:${port}`;
  const request = supertest(baseURL);

  // crude readiness loop
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    try {
      await request.get('/api/tasks');
      return { child, request, baseURL };
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  child.kill('SIGKILL');
  throw new Error(`Server did not become ready. stdout:\n${stdout}`);
}

test('POST /api/tasks creates a task and returns id + title', async (t) => {
  const dbPath = path.join(os.tmpdir(), `taskpad-${Date.now()}-${Math.random()}.db`);
  const port = 3101;

  const { child, request } = await startServer({ dbPath, port });
  t.after(() => child.kill('SIGKILL'));
  t.after(() => { try { fs.unlinkSync(dbPath); } catch {} });

  const res = await request.post('/api/tasks').send({ title: 'Buy milk' }).expect(201);
  assert.equal(typeof res.body.id === 'number' || typeof res.body.id === 'bigint', true);
  assert.equal(res.body.title, 'Buy milk');

  const list = await request.get('/api/tasks').expect(200);
  assert.equal(Array.isArray(list.body), true);
  assert.ok(list.body.find((x) => x.title === 'Buy milk'));
});

test('GET /api/tasks returns tasks ordered by id desc', async (t) => {
  const dbPath = path.join(os.tmpdir(), `taskpad-${Date.now()}-${Math.random()}.db`);
  const port = 3102;

  const { child, request } = await startServer({ dbPath, port });
  t.after(() => child.kill('SIGKILL'));
  t.after(() => { try { fs.unlinkSync(dbPath); } catch {} });

  await request.post('/api/tasks').send({ title: 'First' }).expect(201);
  await request.post('/api/tasks').send({ title: 'Second' }).expect(201);

  const list = await request.get('/api/tasks').expect(200);
  assert.equal(list.body[0].title, 'Second');
  assert.equal(list.body[1].title, 'First');
});

test('DELETE /api/tasks/:id deletes an existing task', async (t) => {
  const dbPath = path.join(os.tmpdir(), `taskpad-${Date.now()}-${Math.random()}.db`);
  const port = 3103;

  const { child, request } = await startServer({ dbPath, port });
  t.after(() => child.kill('SIGKILL'));
  t.after(() => { try { fs.unlinkSync(dbPath); } catch {} });

  const created = await request.post('/api/tasks').send({ title: 'Temp' }).expect(201);
  const id = created.body.id;

  await request.delete(`/api/tasks/${id}`).expect(204);

  const list = await request.get('/api/tasks').expect(200);
  assert.ok(!list.body.find((x) => x.id === id));
});

test('DELETE /api/tasks/:id for non-existent id is idempotent (204)', async (t) => {
  const dbPath = path.join(os.tmpdir(), `taskpad-${Date.now()}-${Math.random()}.db`);
  const port = 3104;

  const { child, request } = await startServer({ dbPath, port });
  t.after(() => child.kill('SIGKILL'));
  t.after(() => { try { fs.unlinkSync(dbPath); } catch {} });

  await request.delete('/api/tasks/999999').expect(204);
});

// Expected-failing tests for requested validation + trimming (not in current server.js)

test('POST /api/tasks should reject missing title (expected to fail until validation is implemented)', async (t) => {
  const dbPath = path.join(os.tmpdir(), `taskpad-${Date.now()}-${Math.random()}.db`);
  const port = 3105;

  const { child, request } = await startServer({ dbPath, port });
  t.after(() => child.kill('SIGKILL'));
  t.after(() => { try { fs.unlinkSync(dbPath); } catch {} });

  // Current behavior: inserts NULL? better-sqlite3 will insert undefined -> title becomes NULL? may violate NOT NULL
  // This test encodes the requested behavior: 400.
  await request.post('/api/tasks').send({}).expect(400);
});

test('POST /api/tasks should trim title before storing/returning (expected to fail until trimming is implemented)', async (t) => {
  const dbPath = path.join(os.tmpdir(), `taskpad-${Date.now()}-${Math.random()}.db`);
  const port = 3106;

  const { child, request } = await startServer({ dbPath, port });
  t.after(() => child.kill('SIGKILL'));
  t.after(() => { try { fs.unlinkSync(dbPath); } catch {} });

  const res = await request.post('/api/tasks').send({ title: '  Walk dog  ' }).expect(201);
  assert.equal(res.body.title, 'Walk dog');
});
