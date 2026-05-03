import { asyncHandler } from "../../utils/asyncHandler.js";
import * as dashboardService from "./dashboard.service.js";

export const getTodayDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getTodayDashboard(req.user.id);
  res.json(dashboard);
});

export const getHistory = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 7;

  const history = await dashboardService.getHistory(req.user.id, days);
  res.json(history);
});