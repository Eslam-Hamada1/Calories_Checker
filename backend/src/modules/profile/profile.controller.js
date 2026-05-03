import { asyncHandler } from "../../utils/asyncHandler.js";
import * as profileService from "./profile.service.js";

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user.id);
  res.json(profile);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfile(req.user.id, req.body);
  res.json(profile);
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfileAvatar(req.user.id, req.file);
  res.json(profile);
});