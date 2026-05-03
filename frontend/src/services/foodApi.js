import api from "./api";

export async function searchFoods(search = "") {
  const response = await api.get(`/foods?search=${search}`);
  return response.data;
}

export async function createFood(foodData) {
  const response = await api.post("/foods", foodData);
  return response.data;
}