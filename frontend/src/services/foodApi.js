import axios from "axios";

const API_URL = "http://localhost:5000/api/food";

export const analyzeFoodImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await axios.post(`${API_URL}/analyze`, formData);

    return response.data;
};