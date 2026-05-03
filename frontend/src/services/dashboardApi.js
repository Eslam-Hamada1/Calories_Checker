import api from "./api";

export async function getTodayDashboard() {
  const response = await api.get("/dashboard/today");
  return response.data;
}

export async function getHistory(days = 7) {
  const response = await api.get(`/dashboard/history?days=${days}`);
  return response.data;
}