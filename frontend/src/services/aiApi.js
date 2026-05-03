import api from "./api";

export async function recognizeFoodImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post("/ai/recognize", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function addPredictionItemToLog(predictionId, itemId, data) {
  const response = await api.post(
    `/ai/predictions/${predictionId}/items/${itemId}/add-to-log`,
    data
  );

  return response.data;
}

export async function analyzeMealText(mealText) {
  const response = await api.post("/ai/analyze-text", {
    mealText,
  });

  return response.data;
}