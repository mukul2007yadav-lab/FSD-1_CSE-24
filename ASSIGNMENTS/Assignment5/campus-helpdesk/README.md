# Campus Help Desk

A full-stack mini project: students file campus-related requests (Wi-Fi, facilities, academics, hostel, etc.), and the board below the form shows every request with live search, filtering, sorting, inline status changes, editing, and deletion.

## Tech stack
- **Backend:** Node.js + Express, `fs` module for storage (`requests.json`) — no database
- **Frontend:** Plain HTML/CSS/JavaScript using the `fetch()` API — no framework, no build step

## Run it in VS Code

1. Open this folder (`campus-helpdesk`) in VS Code.
2. Open a terminal (``Ctrl+` `` / `` Cmd+` ``) and install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   (or `npm run dev` if you want auto-restart on save, via `nodemon`)
4. Open your browser at **http://localhost:3000**

That's it — one server serves both the API and the frontend, so there's no separate frontend server or CORS setup needed.

## Project structure
```
campus-helpdesk/
├── server.js          # Express server + all CRUD routes
├── requests.json       # Data store (auto-created/updated by the server)
├── package.json
└── public/
    ├── index.html      # Form + ticket board markup
    ├── style.css        # Ticket-stub visual design
    └── script.js        # fetch() calls, rendering, filters, editing
```

## API

| Method | Route                | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/api/requests`        | List all requests (supports `?category=`, `?priority=`, `?status=`, `?q=` query filters) |
| GET    | `/api/requests/:id`    | Get a single request                 |
| POST   | `/api/requests`        | Create a request                     |
| PUT    | `/api/requests/:id`    | Update a request (partial fields OK) |
| DELETE | `/api/requests/:id`    | Delete a request                     |

All data lives in `requests.json`, read/written with Node's `fs` module — no database required.

## Features beyond the base spec
- **Live search** across student name, email, and description
- **Filter** by category and status, **sort** by newest/oldest/priority
- **Status workflow**: Open → In Progress → Resolved, changeable right from each ticket
- **Inline editing**: click Edit to load a ticket back into the form and save changes via `PUT`
- **Delete confirmation** modal so requests aren't removed by accident
- **Toast notifications** for every action (submitted, updated, deleted, or errors)
- **Live stats bar** in the header counting Open / In Progress / Resolved requests
- Fully responsive layout (stacks to a single column on mobile)

## Notes
- `requests.json` ships with 3 sample tickets so the board isn't empty on first run. Delete its contents (`[]`) if you want to start fresh.
- IDs are generated with `Date.now().toString()`, so they're guaranteed unique for this use case.
