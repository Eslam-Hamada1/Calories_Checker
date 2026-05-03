import api from "./api";

export async function getDailyLog(date) {
  const response = await api.get(`/logs/${date}`);
  return response.data;
}

export async function addLogEntry(date, entryData) {
  const response = await api.post(`/logs/${date}/entries`, entryData);
  return response.data;
}

export async function updateLogEntry(entryId, entryData) {
  const response = await api.put(`/logs/entries/${entryId}`, entryData);
  return response.data;
}

export async function deleteLogEntry(entryId) {
  const response = await api.delete(`/logs/entries/${entryId}`);
  return response.data;
}