import {
  recognizeFood as recognizeFoodService,
  addPredictionItemToLog as addPredictionItemToLogService,
  analyzeMealText,
} from "./ai.service.js";

export async function recognizeFood(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    const prediction = await recognizeFoodService(userId, req.file);

    res.json(prediction);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}

export async function analyzeMealTextController(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { mealText } = req.body;

    const prediction = await analyzeMealText(userId, mealText);

    res.json(prediction);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}

export async function addPredictionItemToLog(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { predictionId, itemId } = req.params;

    const logEntry = await addPredictionItemToLogService(
      userId,
      predictionId,
      itemId,
      req.body
    );

    res.json(logEntry);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Server error",
    });
  }
}