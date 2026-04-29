/**
 * api.js — Central API service for Frontend AI Builder
 *
 * All requests go through the Vite dev-server proxy → http://localhost:8000
 * JWT token is automatically attached from localStorage.
 */

// In development: BASE is "" — Vite proxy forwards /api/* to localhost:8000
// In production (Vercel): VITE_API_URL is set to "" because Vercel routes /api/* internally
const BASE = import.meta.env.VITE_API_URL ?? "";


// ── Token helpers ─────────────────────────────────────────────────────

export const getToken = () => sessionStorage.getItem("token");
export const setToken = (t) => sessionStorage.setItem("token", t);
export const clearToken = () => sessionStorage.removeItem("token");

export const getUser = () => {
  try { return JSON.parse(sessionStorage.getItem("user") || "null"); }
  catch { return null; }
};
export const setUser = (u) => sessionStorage.setItem("user", JSON.stringify(u));
export const clearUser = () => sessionStorage.removeItem("user");

// ── Core fetch wrapper ────────────────────────────────────────────────

async function request(method, path, body = null, auth = true) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const tok = getToken();
    if (tok) headers["Authorization"] = `Bearer ${tok}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    let msg = "Request failed";
    if (typeof err.detail === "string") {
      msg = err.detail;
    } else if (Array.isArray(err.detail)) {
      msg = err.detail.map((e) => e.msg || e.message || JSON.stringify(e)).join(", ");
    } else if (err.detail) {
      msg = JSON.stringify(err.detail);
    }
    throw new Error(msg);
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

const get = (path, auth) => request("GET", path, null, auth);
const post = (path, body, auth) => request("POST", path, body, auth);
const patch = (path, body) => request("PATCH", path, body);
const del = (path) => request("DELETE", path);

// ── Auth ──────────────────────────────────────────────────────────────

export const authAPI = {
  signup: (name, email, password) => post("/api/auth/signup", { name, email, password }, false),
  login: (email, password) => post("/api/auth/login", { email, password }, false),
  me: () => get("/api/auth/me"),
  updateMe: (fields) => patch("/api/auth/me", fields),
  changePassword: (current_password, new_password) =>
    post("/api/auth/change-password", { current_password, new_password }),
  forgotPassword: (email) => post("/api/auth/forgot-password", { email }, false),
  deleteAccount: () => del("/api/auth/me"),
};

// ── Projects ──────────────────────────────────────────────────────────

export const projectsAPI = {
  list: (skip = 0, limit = 20, status = undefined) => {
    const qs = new URLSearchParams({ skip, limit });
    if (status) qs.append("status", status);
    return get(`/api/projects?${qs}`);
  },
  create: (title, prompt, color_theme = "default", ollama_model = "qwen3-vl:8b", turbo_mode = false) =>
    post("/api/projects", { title, prompt, color_theme, ollama_model, turbo_mode }),
  get: (id) => get(`/api/projects/${id}`),
  status: (id) => get(`/api/projects/${id}/status`),
  update: (id, f) => patch(`/api/projects/${id}`, f),
  delete: (id) => del(`/api/projects/${id}`),
};

// ── Build ─────────────────────────────────────────────────────────────

export const buildAPI = {
  start: (id) => post(`/api/build/${id}/start`),
  cancel: (id) => post(`/api/build/${id}/cancel`),

  /** Returns a WebSocket that streams live build logs */
  connect: (projectId) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/build/${projectId}`);
    return ws;
  },
};

// ── Artifacts ─────────────────────────────────────────────────────────

export const artifactsAPI = {
  list: (projectId) => get(`/api/projects/${projectId}/artifacts`),
  get: (projectId, artifactId) => get(`/api/projects/${projectId}/artifacts/${artifactId}`),
  download: (projectId) => `${BASE}/api/projects/${projectId}/download`,
};


// ── Templates ─────────────────────────────────────────────────────────

export const templatesAPI = {
  list: () => get("/api/templates", false),
  get: (key) => get(`/api/templates/${key}`, false),
};

// ── Settings ──────────────────────────────────────────────────────────

export const settingsAPI = {
  getProfile: () => get("/api/settings/profile"),
  updateProfile: (fields) => patch("/api/settings/profile", fields),
  changePassword: (cur, nw) => post("/api/settings/password", { current_password: cur, new_password: nw }),
  getLLM: () => get("/api/settings/llm"),
  updateLLM: (cfg) => patch("/api/settings/llm", cfg),
  getThemes: () => get("/api/settings/themes", false),
  getModels: () => get("/api/settings/models", false),
  getNotifications: () => get("/api/settings/notifications"),
  updateNotifications: (prefs) => patch("/api/settings/notifications", prefs),
};

// ── Health ────────────────────────────────────────────────────────────

export const healthAPI = {
  check: () => get("/api/health", false),
};

// ── Chat ──────────────────────────────────────────────────────────────

export const chatAPI = {
  /** Send a message with optional full conversation history for memory */
  send: (message, history = []) => post("/api/chat", { message, messages: history }),
};

// ── Dashboard ─────────────────────────────────────────────────────────

export const dashboardAPI = {
  get: () => get("/api/dashboard"),
  stats: () => get("/api/dashboard/stats"),
};
