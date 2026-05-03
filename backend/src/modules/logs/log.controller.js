import { asyncHandler } from "../../utils/asyncHandler.js";
import * as logService from "./log.service.js";

export const getDailyLog = asyncHandler(async (req, res) => {
  const log = await logService.getDailyLog(req.user.id, req.params.date);
  res.json(log);
});

export const addEntry = asyncHandler(async (req, res) => {
  const entry = await logService.addEntry(
    req.user.id,
    req.params.date,
    req.body
  );

  res.status(201).json(entry);
});

export const updateEntry = asyncHandler(async (req, res) => {
  const entry = await logService.updateEntry(
    req.user.id,
    req.params.entryId,
    req.body
  );

  res.json(entry);
});

export const deleteEntry = asyncHandler(async (req, res) => {
  const result = await logService.deleteEntry(req.user.id, req.params.entryId);
  res.json(result);
});