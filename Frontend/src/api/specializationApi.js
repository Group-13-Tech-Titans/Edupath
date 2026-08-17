import { apiRequest } from "./client.js";

export async function getSpecializations() {
  const data = await apiRequest("/api/specializations");
  return data.specializations;
}
