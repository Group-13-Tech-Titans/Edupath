import { apiRequest, setToken } from "./client.js";

export async function login(email, password) {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  setToken(data.token);
  return { success: true, user: data.user };
}

export async function register(payload) {
  await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name || payload.email?.split("@")[0],
      email: payload.email,
      password: payload.password,
      role: payload.role || "pending"
    })
  });
  return { success: true };
}

export async function getMe() {
  const data = await apiRequest("/api/auth/me");
  return data.user;
}

export async function updateProfile(body) {
  const data = await apiRequest("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(body)
  });
  return { success: true, user: data.user };
}

export async function changePassword(currentPassword, newPassword) {
  const data = await apiRequest("/api/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return data; // { message: "Password updated successfully" }
}
