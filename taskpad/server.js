const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database(process.env.DB_PATH || 'tasks.db');

db.exec(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/tasks', (req, res) => {
  res.json(db.prepare('SELECT * FROM tasks ORDER BY id DESC').all());
});

app.post('/api/tasks', (req, res) => {
  const info = db.prepare('INSERT INTO tasks (title) VALUES (?)').run(req.body.title);
  res.status(201).json({ id: info.lastInsertRowid, title: req.body.title });
});

app.delete('/api/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TaskPad running on http://localhost:${PORT}`));