# TaskFlow — Collaborative Project & Task Board (MERN)

A Trello/Asana-style collaborative tool. Create projects, invite teammates, organize work
on a Kanban board, assign tasks, discuss them in comments, and see everything update
live across everyone's screen via WebSockets.

## Features

- **Auth** — JWT-based register/login, passwords hashed with bcrypt
- **Projects** — create projects, invite members by email, per-project Kanban columns
- **Tasks** — create, edit, assign to one or more members, set priority + due date,
  drag-and-drop between columns (To Do / In Progress / Done, customizable)
- **Comments** — threaded discussion on every task
- **Notifications** — in-app notification bell for assignments, comments, status
  changes, and project invites
- **Real-time** — Socket.io pushes task moves, new comments, and notifications to every
  connected teammate instantly, no refresh needed

## Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose), JSON Web Tokens, bcrypt, Socket.io
- **Frontend**: React (Vite), React Router, Tailwind CSS, Axios, socket.io-client

## Project Structure

```
taskflow/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── models/                 # User, Project, Task, Comment, Notification
│   ├── middleware/              # JWT auth guard, project-membership guard
│   ├── controllers/            # Business logic per resource
│   ├── routes/                 # Express routers (nested: projects → tasks → comments)
│   ├── socket/socket.js        # Socket.io auth + room management
│   ├── server.js               # App entry point
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js         # Pre-configured API client
    │   ├── context/             # AuthContext, SocketContext
    │   ├── components/          # Navbar, Kanban Column, TaskCard, TaskModal, etc.
    │   ├── pages/                # Login, Register, Dashboard, ProjectBoard
    │   └── App.jsx
    └── .env.example
```

## Prerequisites

- Node.js 18+ and npm
- A MongoDB database — either:
  - Local MongoDB running at `mongodb://127.0.0.1:27017`, or
  - A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (recommended if you
    don't want to install MongoDB locally)

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskflow      # or your Atlas connection string
JWT_SECRET=some_long_random_string_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start the API:

```bash
npm run dev
```

You should see `MongoDB connected...` and `TaskFlow API running on port 5000`.

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit **http://localhost:5173**, create an account, and you're in.

### 3. Try real-time features

Open the app in two browser windows (or one normal + one incognito), log in as two
different users on the same project, and:
- Drag a task to a new column in one window — it moves instantly in the other
- Add a comment — it appears live for the other user
- Assign a task to the other user — they get a notification in the bell icon immediately

## API Overview

All routes are prefixed with `/api`. Except `/auth/register` and `/auth/login`, every
route requires an `Authorization: Bearer <token>` header.

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Log in |
| GET | `/auth/me` | Current user profile |
| GET | `/auth/search?q=` | Search users by name/email |
| POST | `/projects` | Create a project |
| GET | `/projects` | List my projects |
| GET | `/projects/:id` | Project detail |
| PUT | `/projects/:id` | Update project (owner only) |
| DELETE | `/projects/:id` | Delete project (owner only) |
| POST | `/projects/:id/members` | Add a member by email (owner only) |
| DELETE | `/projects/:id/members/:userId` | Remove a member (owner only) |
| GET | `/projects/:id/tasks` | List tasks in a project |
| POST | `/projects/:id/tasks` | Create a task |
| PUT | `/projects/:id/tasks/:taskId` | Update a task |
| PUT | `/projects/:id/tasks/reorder` | Bulk-update task status/order (drag-drop) |
| DELETE | `/projects/:id/tasks/:taskId` | Delete a task |
| GET | `/projects/:id/tasks/:taskId/comments` | List comments |
| POST | `/projects/:id/tasks/:taskId/comments` | Add a comment |
| DELETE | `/projects/:id/tasks/:taskId/comments/:commentId` | Delete own comment |
| GET | `/notifications` | List my notifications |
| PUT | `/notifications/:id/read` | Mark one as read |
| PUT | `/notifications/read-all` | Mark all as read |

## WebSocket Events

The client connects to the Socket.io server with the JWT passed as `auth.token`.

**Client emits**
- `joinProject` (projectId) — subscribe to a project's live updates
- `leaveProject` (projectId) — unsubscribe

**Server emits**
- `task:created`, `task:updated`, `task:deleted`, `task:reordered`
- `comment:created`, `comment:deleted`
- `project:updated`, `project:memberAdded`, `project:memberRemoved`, `project:deleted`
- `notification:new` — sent to the specific recipient's personal room

## Notes on scaling this further

- Add role-based permissions beyond owner/member (e.g. admin, viewer)
- Add file attachments to tasks (e.g. via S3 or Cloudinary)
- Add activity/audit log per project
- Paginate tasks/comments for very large projects
- Add automated tests (Jest + Supertest for the API, React Testing Library for the UI)
# Taskflow
