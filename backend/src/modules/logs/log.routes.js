import express from "express";
import {
  getDailyLog,
  addEntry,
  updateEntry,
  deleteEntry,
} from "./log.controller.js";

import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:date", protect, getDailyLog);
router.post("/:date/entries", protect, addEntry);
router.put("/entries/:entryId", protect, updateEntry);
router.delete("/entries/:entryId", protect, deleteEntry);

export default router;