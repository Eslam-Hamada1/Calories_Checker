import express from "express";
import { getProfile, updateProfile, updateAvatar  } from "./profile.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", protect, getProfile);
router.put("/avatar", protect, upload.single("avatar"), updateAvatar);
router.put("/", protect, updateProfile);

export default router;