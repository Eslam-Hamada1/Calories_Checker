import { asyncHandler } from "../../utils/asyncHandler.js";
import * as foodService from "./food.service.js";

export const searchFoods = asyncHandler(async (req, res) => {
  const search = req.query.search || "";
  const foods = await foodService.searchFoods(search);
  res.json(foods);
});

export const createFood = asyncHandler(async (req, res) => {
  const food = await foodService.createFood(req.body);
  res.status(201).json(food);
});