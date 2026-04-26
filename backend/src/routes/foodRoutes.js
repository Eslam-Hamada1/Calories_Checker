import express from "express";
import multer from "multer";

import { analyzeFood } from "../controllers/foodController.js";

const router = express.Router();

const upload = multer({
    dest: "uploads/",
});

router.post("/analyze", upload.single("image"), analyzeFood);

export default router;