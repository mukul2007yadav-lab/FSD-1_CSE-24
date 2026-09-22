const API_BASE = "/api/requests";

// ---------- State ----------
let allRequests = [];
let editingId = null;
let pendingDeleteId = null;

// ---------- DOM refs ----------
const form = document.getElementById("requestForm");
const requestIdInput = document.getElementById("requestId");
const studentNameInput = document.getElementById("studentName");
const emailInput = document.getElementById("email");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");
const priorityInput = document.getElementById("priority");
const priorityPicker = document.getElementById("priorityPicker");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const formError = document.getElementById("formError");

const ticketList = document.getElementById("ticketList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const filterStatus = document.getElementById("filterStatus");
const sortOrder = document.getElementById("sortOrder");

const toast = document.getElementById("toast");
const confirmOverlay = document.getElementById("confirmOverlay");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const confirmCancelBtn = document.getElementById("confirmCancel");

const statOpen = document.getElementById("statOpen");
const statProgress = document.getElementById("statProgress");
const statResolved = document.getElementById("statResolved");

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  fetchRequests();

  form.addEventListener("submit", handleSubmit);
  cancelEditBtn.addEventListener("click", resetForm);
  searchInput.addEventListener("input", debounce(renderTickets, 150));
  filterCategory.addEventListener("change", renderTickets);
  filterStatus.addEventListener("change", renderTickets);
  sortOrder.addEventListener("change", renderTickets);

  priorityPicker.addEventListener("click", (e) => {
    const chip = e.target.closest(".priority-chip");
    if (!chip) return;
    document.querySelectorAll(".priority-chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    priorityInput.value = chip.dataset.value;
  });

  confirmCancelBtn.addEventListener("click", closeConfirm);
  confirmDeleteBtn.addEventListener("click", async () => {
    if (pendingDeleteId) await deleteRequest(pendingDeleteId);
    closeConfirm();
  });
});

// ---------- API calls ----------
async function fetchRequests() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to load requests.");
    allRequests = await res.json();
    renderTickets();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function createRequest(payload) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not submit request.");
  return data;
}

async function updateRequest(id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not update request.");
  return data;
}

async function deleteRequest(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not delete request.");
    allRequests = allRequests.filter((r) => r.id !== id);
    renderTickets();
    showToast("Request deleted.");
  } catch (err) {
    showToast(err.message, true);
  }
}

// ---------- Form handling ----------
async function handleSubmit(e) {
  e.preventDefault();
  hideError();

  const payload = {
    studentName: studentNameInput.value.trim(),
    email: emailInput.value.trim(),
    category: categoryInput.value,
    description: descriptionInput.value.trim(),
    priority: priorityInput.value,
  };

  const missing = Object.entries(payload).filter(([, v]) => !v);
  if (missing.length) {
    showError("Please fill in every field, including priority.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = editingId ? "Saving..." : "Submitting...";

  try {
    if (editingId) {
      const updated = await updateRequest(editingId, payload);
      const idx = allRequests.findIndex((r) => r.id === editingId);
      if (idx !== -1) allRequests[idx] = updated;
      showToast("Request updated.");
    } else {
      const created = await createRequest(payload);
      allRequests.unshift(created);
      showToast("Request submitted.");
    }
    resetForm();
    renderTickets();
  } catch (err) {
    showError(err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = editingId ? "Save changes" : "Submit request";
  }
}

function resetForm() {
  form.reset();
  editingId = null;
  requestIdInput.value = "";
  priorityInput.value = "";
  document.querySelectorAll(".priority-chip").forEach((c) => c.classList.remove("is-active"));
  submitBtn.textContent = "Submit request";
  cancelEditBtn.hidden = true;
  hideError();
}

function showError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
}
function hideError() {
  formError.hidden = true;
}

function startEdit(id) {
  const item = allRequests.find((r) => r.id === id);
  if (!item) return;
  editingId = id;
  requestIdInput.value = id;
  studentNameInput.value = item.studentName;
  emailInput.value = item.email;
  categoryInput.value = item.category;
  descriptionInput.value = item.description;
  priorityInput.value = item.priority;
  document.querySelectorAll(".priority-chip").forEach((c) => {
    c.classList.toggle("is-active", c.dataset.value === item.priority);
  });
  submitBtn.textContent = "Save changes";
  cancelEditBtn.hidden = false;
  hideError();
  document.querySelector(".ticket-form__card").scrollIntoView({ behavior: "smooth", block: "start" });
  studentNameInput.focus();
}

function askDelete(id) {
  pendingDeleteId = id;
  confirmOverlay.hidden = false;
}
function closeConfirm() {
  pendingDeleteId = null;
  confirmOverlay.hidden = true;
}

async function changeStatus(id, status) {
  try {
    const updated = await updateRequest(id, { status });
    const idx = allRequests.findIndex((r) => r.id === id);
    if (idx !== -1) allRequests[idx] = updated;
    renderTickets();
    showToast(`Marked as ${status}.`);
  } catch (err) {
    showToast(err.message, true);
  }
}

// ---------- Rendering ----------
function renderTickets() {
  const term = searchInput.value.trim().toLowerCase();
  const cat = filterCategory.value;
  const status = filterStatus.value;
  const sort = sortOrder.value;

  let list = allRequests.filter((r) => {
    const matchesTerm =
      !term ||
      r.studentName.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term);
    const matchesCat = !cat || r.category === cat;
    const matchesStatus = !status || r.status === status;
    return matchesTerm && matchesCat && matchesStatus;
  });

  const priorityRank = { High: 3, Medium: 2, Low: 1 };
  if (sort === "newest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sort === "oldest") list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sort === "priority") list.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]);

  ticketList.innerHTML = "";
  emptyState.hidden = list.length !== 0;

  list.forEach((item) => ticketList.appendChild(renderTicketCard(item)));
  updateStats();
}

function renderTicketCard(item) {
  const el = document.createElement("article");
  el.className = "ticket";
  el.dataset.priority = item.priority;

  el.innerHTML = `
    <div class="ticket__spine"></div>
    <div class="ticket__body">
      <div class="ticket__top">
        <span class="ticket__id">#${escapeHtml(item.id.slice(-6))}</span>
        <span class="ticket__category">${escapeHtml(item.category)}</span>
      </div>
      <h3 class="ticket__name">${escapeHtml(item.studentName)}</h3>
      <p class="ticket__email">${escapeHtml(item.email)}</p>
      <p class="ticket__desc">${escapeHtml(item.description)}</p>
      <div class="ticket__meta">
        <span>Priority: ${escapeHtml(item.priority)}</span>
        <span>Filed ${formatDate(item.createdAt)}</span>
      </div>
    </div>
    <div class="ticket__actions">
      <select class="status-select" data-status="${escapeHtml(item.status)}" aria-label="Change status">
        <option ${item.status === "Open" ? "selected" : ""}>Open</option>
        <option ${item.status === "In Progress" ? "selected" : ""}>In Progress</option>
        <option ${item.status === "Resolved" ? "selected" : ""}>Resolved</option>
      </select>
      <div class="ticket__buttons">
        <button class="icon-btn" data-action="edit">Edit</button>
        <button class="icon-btn icon-btn--danger" data-action="delete">Delete</button>
      </div>
    </div>
  `;

  el.querySelector(".status-select").addEventListener("change", (e) => {
    e.target.dataset.status = e.target.value;
    changeStatus(item.id, e.target.value);
  });
  el.querySelector('[data-action="edit"]').addEventListener("click", () => startEdit(item.id));
  el.querySelector('[data-action="delete"]').addEventListener("click", () => askDelete(item.id));

  return el;
}

function updateStats() {
  statOpen.textContent = allRequests.filter((r) => r.status === "Open").length;
  statProgress.textContent = allRequests.filter((r) => r.status === "In Progress").length;
  statResolved.textContent = allRequests.filter((r) => r.status === "Resolved").length;
}

// ---------- Utilities ----------
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle("is-error", isError);
  toast.classList.add("is-visible");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
