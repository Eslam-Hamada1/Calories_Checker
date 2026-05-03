import prisma from "../../config/prisma.js";

export async function searchFoods(search = "") {
  return prisma.food.findMany({
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
    orderBy: {
      name: "asc",
    },
    take: 20,
  });
}

export async function createFood(data) {
  if (!data.name || data.calories == null) {
    throw new Error("Food name and calories are required");
  }

  const food = await prisma.food.create({
    data: {
      name: data.name,
      brand: data.brand || null,
      source: data.source || "MANUAL",

      servingSize: data.servingSize || 1,
      servingUnit: data.servingUnit || "serving",

      calories: Number(data.calories),
      proteinG: Number(data.proteinG || 0),
      carbsG: Number(data.carbsG || 0),
      fatG: Number(data.fatG || 0),
      fiberG: Number(data.fiberG || 0),
    },
  });

  return food;
}