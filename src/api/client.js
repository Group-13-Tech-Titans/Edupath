const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  return window.localStorage.getItem("edupath_token");
}

function setToken(token) {
  if (token) window.localStorage.setItem("edupath_token", token);
  else window.localStorage.removeItem("edupath_token");
}

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || res.statusText || "Request failed");
  }
  return data;
}

export { getToken, setToken, API_BASE };
