import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const detectFoodItems = async (imagePath, mimeType) => {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    const prompt = `
        Analyze this image carefully.
        
        Return JSON only in this exact shape:
        
        If the image does NOT contain edible food:
        {
          "isFood": false,
          "foods": []
        }
        
        If the image contains edible food:
        {
          "isFood": true,
          "foods": [
            {
              "name": "food name",
              "percentage": number
            }
          ]
        }
        
        Rules:
        - First decide if the image contains edible food.
        - Do not count clothes, objects, plates, tables, utensils, packages, or random items as food.
        - If no clear edible food is visible, return isFood false.
        - If food is visible, identify visible edible food items only.
        - Percentages must sum to 100.
        - No markdown.
        - No explanation.
        `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                inlineData: {
                mimeType,
                data: base64Image,
                },
            },
            prompt,
        ],
    });

    const text = response.text;
    const cleaned = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleaned);
};

export const analyzeFood = async (req, res) => {
    console.log("Analyze endpoint hit");

    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }

    try {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(req.file.path));

        const calorieResponse = await axios.post(
            process.env.AI_SERVER_URL + "/predict",
            formData,
            { headers: formData.getHeaders() }
        );

        const totalCalories = calorieResponse.data.totalCalories;

        let detectedFoods;

        try {
            detectedFoods = await detectFoodItems(req.file.path, req.file.mimetype);
            if (!detectedFoods.isFood) {
              return res.json({
                imageName: req.file.originalname,
                isFood: false,
                message: "This doesn't look like food 👀",
                items: [],
                totalCalories: 0,
                range: [0, 0],
              });
            }
        } catch (error) {
            console.error("Gemini error:", error.message);

            detectedFoods = {
                foods: [
                    {
                        name: "Estimated meal",
                        percentage: 100,
                    },
                ],
            };
        }

        const items = detectedFoods.foods.map((food) => ({
            name: food.name,
            percentage: food.percentage,
            calories: Math.round((totalCalories * food.percentage) / 100),
            range: [
                Math.round((totalCalories * food.percentage * 0.85) / 100),
                Math.round((totalCalories * food.percentage * 1.15) / 100),
            ],
        }));

        res.json({
            imageName: req.file.originalname,
            isFood: true,
            items,
            totalCalories,
            range: [
                Math.round(totalCalories * 0.85),
                Math.round(totalCalories * 1.15),
            ],
        });
    } catch (error) {
        console.error("AI ERROR:", error.message);

        res.status(500).json({
            message: "AI server error",
        });
    }
};
