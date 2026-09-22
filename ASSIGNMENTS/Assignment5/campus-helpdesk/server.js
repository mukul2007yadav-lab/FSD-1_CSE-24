const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "requests.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------- Helpers ----------

function readRequests() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error("Failed to parse requests.json, resetting to empty array.", err);
    return [];
  }
}

function writeRequests(requests) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(requests, null, 2), "utf-8");
}

function generateId() {
  return Date.now().toString();
}

const REQUIRED_FIELDS = ["studentName", "email", "category", "description", "priority"];

function validatePayload(body) {
  const missing = REQUIRED_FIELDS.filter((field) => !body[field] || !String(body[field]).trim());
  return missing;
}

// ---------- Routes ----------

// GET /api/requests - all requests (supports optional ?category= & ?priority= & ?status= & ?q= filters)
app.get("/api/requests", (req, res) => {
  let requests = readRequests();
  const { category, priority, status, q } = req.query;

  if (category) requests = requests.filter((r) => r.category === category);
  if (priority) requests = requests.filter((r) => r.priority === priority);
  if (status) requests = requests.filter((r) => r.status === status);
  if (q) {
    const term = q.toLowerCase();
    requests = requests.filter(
      (r) =>
        r.studentName.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term)
    );
  }

  // newest first
  requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(requests);
});

// GET /api/requests/:id - single request
app.get("/api/requests/:id", (req, res) => {
  const requests = readRequests();
  const item = requests.find((r) => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Request not found." });
  res.json(item);
});

// POST /api/requests - create new request
app.post("/api/requests", (req, res) => {
  const missing = validatePayload(req.body);
  if (missing.length) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.join(", ")}` });
  }

  const requests = readRequests();
  const now = new Date().toISOString();
  const newRequest = {
    id: generateId(),
    studentName: String(req.body.studentName).trim(),
    email: String(req.body.email).trim(),
    category: String(req.body.category).trim(),
    description: String(req.body.description).trim(),
    priority: String(req.body.priority).trim(),
    status: "Open",
    createdAt: now,
    updatedAt: now,
  };

  requests.push(newRequest);
  writeRequests(requests);
  res.status(201).json(newRequest);
});

// PUT /api/requests/:id - update an existing request (full or partial fields)
app.put("/api/requests/:id", (req, res) => {
  const requests = readRequests();
  const index = requests.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Request not found." });

  const allowedFields = ["studentName", "email", "category", "description", "priority", "status"];
  const updated = { ...requests[index] };

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined && String(req.body[field]).trim() !== "") {
      updated[field] = String(req.body[field]).trim();
    }
  });
  updated.updatedAt = new Date().toISOString();

  requests[index] = updated;
  writeRequests(requests);
  res.json(updated);
});

// DELETE /api/requests/:id - remove a request
app.delete("/api/requests/:id", (req, res) => {
  const requests = readRequests();
  const index = requests.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Request not found." });

  const [removed] = requests.splice(index, 1);
  writeRequests(requests);
  res.json({ message: "Request deleted.", removed });
});

// Fallback to index.html for the root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Campus Help Desk running at http://localhost:${PORT}`);
});
