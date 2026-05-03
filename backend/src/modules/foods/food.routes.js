import express from "express";
import { searchFoods, createFood } from "./food.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, searchFoods);
router.post("/", protect, createFood);

export default router;