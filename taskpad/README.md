# TaskPad

TaskPad is a lightweight task manager built with Node.js, Express, and SQLite. It provides a simple browser interface for adding, listing, and deleting tasks.

## Features

- Add tasks from the web interface
- View tasks in reverse creation order
- Delete existing tasks
- Persist tasks in a SQLite database
- Configure the HTTP port and database location with environment variables

## Tech Stack

- **Frontend:** HTML, CSS-free vanilla JavaScript
- **Backend:** Node.js and Express
- **Database:** SQLite via `better-sqlite3`

## Prerequisites

- Node.js 18 or newer
- npm

## Installation

From the `taskpad` directory:

```powershell
npm install
```

## Running the Application

```powershell
npm start
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

The server creates `tasks.db` and the `tasks` table automatically when they do not already exist.

## Configuration

You can configure TaskPad with environment variables:

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | Port used by the HTTP server |
| `DB_PATH` | `tasks.db` | Path to the SQLite database file |

PowerShell example:

```powershell
$env:PORT=8080
$env:DB_PATH="C:\data\taskpad.db"
npm start
```

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/tasks` | Returns all tasks, newest first |
| `POST` | `/api/tasks` | Creates a task |
| `DELETE` | `/api/tasks/:id` | Deletes a task |

Create a task:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:3000/api/tasks `
  -ContentType "application/json" `
  -Body '{"title":"Buy groceries"}'
```

List tasks:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/api/tasks
```

Delete a task:

```powershell
Invoke-RestMethod -Method Delete -Uri http://localhost:3000/api/tasks/1
```

## Project Structure

```text
taskpad/
├── public/
│   ├── app.js       # Browser-side task interactions
│   └── index.html   # Main application page
├── package.json     # npm scripts and dependencies
├── server.js        # Express server and REST API
└── tasks.db         # SQLite database, created as needed
```
