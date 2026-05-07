import prisma from "../../config/prisma.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

import {
  analyzeFoodImageWithGemini,
  analyzeMealTextWithGemini,
} from "./gemini.service.js";

function round(value) {
  return Math.round(Number(value || 0));
}

function hasDetectedFood(geminiData) {
  if (geminiData?.isFoodImage === false) {
    return false;
  }

  if (!Array.isArray(geminiData?.items) || geminiData.items.length === 0) {
    return false;
  }

  const hasRealItem = geminiData.items.some((item) => {
    const name = String(item.name || "").toLowerCase();

    return (
      name &&
      !name.includes("no food") &&
      !name.includes("unknown") &&
      !name.includes("not detected")
    );
  });

  return hasRealItem;
}

function hasDetectedFoodText(geminiData) {
  if (geminiData?.isFoodText === false) {
    return false;
  }

  if (!Array.isArray(geminiData?.items) || geminiData.items.length === 0) {
    return false;
  }

  const hasRealItem = geminiData.items.some((item) => {
    const name = String(item.name || "").toLowerCase();

    return (
      name &&
      !name.includes("no food") &&
      !name.includes("unknown") &&
      !name.includes("not detected")
    );
  });

  return hasRealItem;
}

async function analyzeWithCalorieClip(filePath) {
  const formData = new FormData();

  formData.append("file", fs.createReadStream(filePath));

  const response = await axios.post(
    process.env.AI_API_URL || "http://127.0.0.1:8000/predict",
    formData,
    {
      headers: formData.getHeaders(),
    }
  );

  return response.data;
}

function normalizeCalorieClipResult(calorieClipData) {
  const totalCalories = round(
    calorieClipData?.totalCalories ||
      calorieClipData?.total_calories ||
      calorieClipData?.items?.[0]?.calories ||
      0
  );

  const firstItem = calorieClipData?.items?.[0];

  const totalMin = round(
    firstItem?.range?.[0] ||
      calorieClipData?.totalMin ||
      totalCalories * 0.85
  );

  const totalMax = round(
    firstItem?.range?.[1] ||
      calorieClipData?.totalMax ||
      totalCalories * 1.15
  );

  return {
    totalCalories,
    totalMin,
    totalMax,
  };
}

function combineCalorieClipAndGemini(calorieClipData, geminiData) {
  const calorieClip = normalizeCalorieClipResult(calorieClipData);

  const rawItems = Array.isArray(geminiData?.items) ? geminiData.items : [];

  const totalPercentage =
    rawItems.reduce((sum, item) => sum + Number(item.percentage || 0), 0) || 100;

  const items = rawItems.map((item) => {
    const percentage =
      totalPercentage > 0
        ? (Number(item.percentage || 0) / totalPercentage) * 100
        : 0;

    const calories = round((calorieClip.totalCalories * percentage) / 100);

    return {
      name: item.name || "Food item",
      percentage: round(percentage),

      calories,
      calorieMin: round(calories * 0.85),
      calorieMax: round(calories * 1.15),

      proteinG: round(item.proteinG),
      carbsG: round(item.carbsG),
      fatG: round(item.fatG),
      fiberG: round(item.fiberG),
    };
  });

  const macros = items.reduce(
    (total, item) => {
      total.proteinG += Number(item.proteinG || 0);
      total.carbsG += Number(item.carbsG || 0);
      total.fatG += Number(item.fatG || 0);
      total.fiberG += Number(item.fiberG || 0);
      return total;
    },
    {
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
    }
  );

  return {
    mealName: geminiData?.mealName || "Estimated meal",

    totalCalories: calorieClip.totalCalories,
    totalMin: calorieClip.totalMin,
    totalMax: calorieClip.totalMax,

    macros: {
      proteinG: round(macros.proteinG),
      carbsG: round(macros.carbsG),
      fatG: round(macros.fatG),
      fiberG: round(macros.fiberG),
    },

    items,
  };
}

function normalizeTextMealAnalysis(geminiData) {
  const rawItems = Array.isArray(geminiData?.items) ? geminiData.items : [];

  const items = rawItems.map((item) => {
    const calories = Number(item.calories || 0);

    return {
      name: item.name || "Food item",
      quantity: item.quantity || null,

      calories: round(calories),
      calorieMin: round(calories * 0.85),
      calorieMax: round(calories * 1.15),

      proteinG: round(item.proteinG),
      carbsG: round(item.carbsG),
      fatG: round(item.fatG),
      fiberG: round(item.fiberG),
    };
  });

  const totals = items.reduce(
    (total, item) => {
      total.totalCalories += Number(item.calories || 0);
      total.proteinG += Number(item.proteinG || 0);
      total.carbsG += Number(item.carbsG || 0);
      total.fatG += Number(item.fatG || 0);
      total.fiberG += Number(item.fiberG || 0);
      return total;
    },
    {
      totalCalories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
    }
  );

  const totalCalories = round(totals.totalCalories);

  return {
    mealName: geminiData?.mealName || "Text meal estimate",

    totalCalories,
    totalMin: round(totalCalories * 0.85),
    totalMax: round(totalCalories * 1.15),

    macros: {
      proteinG: round(totals.proteinG),
      carbsG: round(totals.carbsG),
      fatG: round(totals.fatG),
      fiberG: round(totals.fiberG),
    },

    items,
  };
}

export async function recognizeFood(userId, file) {
  if (!file) {
    const error = new Error("Image is required");
    error.statusCode = 400;
    throw error;
  }

  let calorieClipData;
  let geminiData;

  try {
    calorieClipData = await analyzeWithCalorieClip(file.path);
  } catch (error) {
    console.log("CalorieCLIP failed:", error.response?.data || error.message);
    throw new Error("Failed to analyze image with CalorieCLIP");
  }

  try {
    geminiData = await analyzeFoodImageWithGemini(file.path);
  } catch (error) {
    console.log("Gemini image analysis failed:", error.response?.data || error.message);
    throw new Error("Failed to analyze image with Gemini");
  }

  if (!hasDetectedFood(geminiData)) {
    const error = new Error("No food detected in this image");
    error.statusCode = 422;
    throw error;
  }

  const finalResult = combineCalorieClipAndGemini(calorieClipData, geminiData);

  const prediction = await prisma.aiPrediction.create({
    data: {
      userId,
      imagePath: file.path,

      mealName: finalResult.mealName,

      totalCalories: finalResult.totalCalories,
      totalMin: finalResult.totalMin,
      totalMax: finalResult.totalMax,

      proteinG: finalResult.macros.proteinG,
      carbsG: finalResult.macros.carbsG,
      fatG: finalResult.macros.fatG,
      fiberG: finalResult.macros.fiberG,

      rawResponse: {
        type: "image",
        calorieClip: calorieClipData,
        gemini: geminiData,
        final: finalResult,
      },

      items: {
        create: finalResult.items.map((item) => ({
          name: item.name,
          percentage: item.percentage,

          calories: item.calories,
          calorieMin: item.calorieMin,
          calorieMax: item.calorieMax,

          proteinG: item.proteinG,
          carbsG: item.carbsG,
          fatG: item.fatG,
          fiberG: item.fiberG,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  return prediction;
}

export async function analyzeMealText(userId, mealText) {
  if (!mealText || !mealText.trim()) {
    const error = new Error("Meal text is required");
    error.statusCode = 400;
    throw error;
  }

  let geminiData;

  try {
    geminiData = await analyzeMealTextWithGemini(mealText.trim());
  } catch (error) {
    console.log("Gemini text analysis failed:", error.response?.data || error.message);
    throw new Error("Failed to analyze meal text");
  }

  if (!hasDetectedFoodText(geminiData)) {
    const error = new Error("No food detected in this meal description");
    error.statusCode = 422;
    throw error;
  }

  const finalResult = normalizeTextMealAnalysis(geminiData);

  const prediction = await prisma.aiPrediction.create({
    data: {
      userId,
      imagePath: null,

      mealName: finalResult.mealName,

      totalCalories: finalResult.totalCalories,
      totalMin: finalResult.totalMin,
      totalMax: finalResult.totalMax,

      proteinG: finalResult.macros.proteinG,
      carbsG: finalResult.macros.carbsG,
      fatG: finalResult.macros.fatG,
      fiberG: finalResult.macros.fiberG,

      rawResponse: {
        type: "text",
        input: mealText,
        gemini: geminiData,
        final: finalResult,
      },

      items: {
        create: finalResult.items.map((item) => ({
          name: item.quantity ? `${item.name} (${item.quantity})` : item.name,

          percentage:
            finalResult.totalCalories > 0
              ? round((item.calories / finalResult.totalCalories) * 100)
              : null,

          calories: item.calories,
          calorieMin: item.calorieMin,
          calorieMax: item.calorieMax,

          proteinG: item.proteinG,
          carbsG: item.carbsG,
          fatG: item.fatG,
          fiberG: item.fiberG,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  return prediction;
}

export async function addPredictionItemToLog(
  userId,
  predictionId,
  itemId,
  logData
) {
  const predictionItem = await prisma.aiPredictionItem.findFirst({
    where: {
      id: itemId,
      prediction: {
        id: predictionId,
        userId,
      },
    },
  });

  if (!predictionItem) {
    const error = new Error("Prediction item not found");
    error.statusCode = 404;
    throw error;
  }

  const date = new Date(logData.date);
  date.setHours(0, 0, 0, 0);

  const dailyLog = await prisma.dailyLog.upsert({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
    update: {},
    create: {
      userId,
      date,
    },
  });

  const servings = Number(logData.servings || 1);

  const logEntry = await prisma.logEntry.create({
    data: {
      dailyLogId: dailyLog.id,

      customName: predictionItem.name,
      mealType: logData.mealType || "SNACK",

      servings,
      servingUnit: "serving",

      calories: Number(predictionItem.calories || 0) * servings,
      proteinG: Number(predictionItem.proteinG || 0) * servings,
      carbsG: Number(predictionItem.carbsG || 0) * servings,
      fatG: Number(predictionItem.fatG || 0) * servings,
      fiberG: Number(predictionItem.fiberG || 0) * servings,
    },
  });

  return logEntry;
}