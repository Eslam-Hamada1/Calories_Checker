import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function extractJson(text) {
  if (!text) {
    throw new Error("Empty Gemini response");
  }

  let cleaned = text.trim();

  cleaned = cleaned.replace(/^```json/i, "");
  cleaned = cleaned.replace(/^```/i, "");
  cleaned = cleaned.replace(/```$/i, "");
  cleaned = cleaned.trim();

  return JSON.parse(cleaned);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(payload, retries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await ai.models.generateContent(payload);
    } catch (error) {
      lastError = error;

      const status = error?.status || error?.response?.status;
      const message =
        error?.message ||
        error?.response?.data?.error?.message ||
        "";

      const isTemporary =
        status === 503 ||
        message.toLowerCase().includes("high demand") ||
        message.toLowerCase().includes("unavailable");

      if (!isTemporary || attempt === retries) {
        throw error;
      }

      console.log(`Gemini busy, retrying attempt ${attempt + 1}/${retries}...`);
      await sleep(1200 * attempt);
    }
  }

  throw lastError;
}

export async function analyzeFoodImageWithGemini(imagePath) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");

  const prompt = `
You are a nutrition and food image analysis assistant.

Analyze the image and return JSON only.

Very important:
- First decide if the image clearly contains food.
- If the image does NOT clearly contain food, do NOT estimate calories, macros, or food items.
- If no food is detected, return exactly:
{
  "isFoodImage": false,
  "mealName": "No food detected",
  "items": []
}

If the image contains food:
- Return "isFoodImage": true.
- Identify visible food items.
- Estimate each item's percentage share of the full meal calories.
- Estimate macros for each item: proteinG, carbsG, fatG, fiberG.
- Give the whole meal a natural meal name.
- Percentages should add up to about 100.
- Do not include markdown.
- Return JSON only.

Return this exact shape:
{
  "isFoodImage": true,
  "mealName": "Grilled Chicken with Rice",
  "items": [
    {
      "name": "Chicken Breast",
      "percentage": 50,
      "proteinG": 35,
      "carbsG": 0,
      "fatG": 6,
      "fiberG": 0
    },
    {
      "name": "White Rice",
      "percentage": 40,
      "proteinG": 4,
      "carbsG": 45,
      "fatG": 1,
      "fiberG": 1
    }
  ]
}
`;

  const response = await generateWithRetry({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  console.log("Gemini image raw response:", response.text);

  return extractJson(response.text);
}

export async function analyzeMealTextWithGemini(mealText) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const prompt = `
You are a nutrition analysis assistant.

Analyze this meal text and return JSON only.

Meal:
"${mealText}"

Important:
- Estimate calories and macros based on the quantities provided.
- If quantity is missing, make a reasonable estimate.
- Return calories, protein, carbs, fat, and fiber for each item.
- Give the whole meal a natural meal name.
- Do not include markdown.
- Return JSON only.

Return exactly this JSON shape:
{
  "mealName": "Chicken with rice",
  "items": [
    {
      "name": "White Rice",
      "quantity": "200 grams",
      "calories": 260,
      "proteinG": 5,
      "carbsG": 56,
      "fatG": 1,
      "fiberG": 1
    },
    {
      "name": "Chicken Breast",
      "quantity": "250 grams",
      "calories": 412,
      "proteinG": 77,
      "carbsG": 0,
      "fatG": 9,
      "fiberG": 0
    }
  ]
}
`;

  const response = await generateWithRetry({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  console.log("Gemini text raw response:", response.text);

  return extractJson(response.text);
}