const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export function saveTokensFromHash() {
  const hash = window.location.hash?.slice(1) || "";
  const qs = new URLSearchParams(hash);
  const access = qs.get("access");
  const refresh = qs.get("refresh");
  const username = qs.get("username");
  if (access && refresh) {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    if (username) localStorage.setItem("username", username);
    history.replaceState(null, "", window.location.pathname);
  }
}

export const tokens = {
  get access()  { return localStorage.getItem("access"); },
  get refresh() { return localStorage.getItem("refresh"); },
  clear() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
  },
};

export function decodeJwt(t) {
  if (!t) return null;
  try {
    const payload = t.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch { return null; }
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (tokens.access) headers.set("Authorization", `Bearer ${tokens.access}`);
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

export async function getAuthorizeUrl() {
  const r = await fetch(`${API_BASE}/api/auth/42/login/`);
  if (!r.ok) throw new Error("Failed to get authorize URL");
  const { authorize_url } = await r.json();
  return authorize_url;
}
