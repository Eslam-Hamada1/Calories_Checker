import express from "express";

import { recognizeFood, addPredictionItemToLog, analyzeMealTextController} from "./ai.controller.js";

import { protect } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = express.Router();

router.post("/recognize", protect, upload.single("image"), recognizeFood);

router.post(
  "/predictions/:predictionId/items/:itemId/add-to-log",
  protect,
  addPredictionItemToLog
);

router.post("/analyze-text", protect, analyzeMealTextController);

export default router;