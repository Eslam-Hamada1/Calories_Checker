import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const analyzeFoodImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await axios.post(`${API_URL}/api/food/analyze`, formData);

    return response.data;
};