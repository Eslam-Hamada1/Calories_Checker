import express from "express";
import {
  getTodayDashboard,
  getHistory,
} from "./dashboard.controller.js";

import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/today", protect, getTodayDashboard);
router.get("/history", protect, getHistory);

export default router;