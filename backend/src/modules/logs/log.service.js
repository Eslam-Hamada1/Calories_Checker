import prisma from "../../config/prisma.js";

function toDateOnly(dateString) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

async function getOrCreateDailyLog(userId, dateString) {
  const date = toDateOnly(dateString);

  return prisma.dailyLog.upsert({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
    update: {},
    create: {
      userId,
      date,
    },
  });
}

export async function getDailyLog(userId, dateString) {
  const log = await getOrCreateDailyLog(userId, dateString);

  return prisma.dailyLog.findUnique({
    where: {
      id: log.id,
    },
    include: {
      entries: {
        include: {
          food: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

export async function addEntry(userId, dateString, data) {
  const log = await getOrCreateDailyLog(userId, dateString);

  if (data.foodId) {
    const food = await prisma.food.findUnique({
      where: {
        id: data.foodId,
      },
    });

    if (!food) {
      throw new Error("Food not found");
    }

    const servings = Number(data.servings || 1);

    return prisma.logEntry.create({
      data: {
        dailyLogId: log.id,
        foodId: food.id,
        mealType: data.mealType || "SNACK",
        servings,
        servingUnit: data.servingUnit || food.servingUnit,

        calories: food.calories * servings,
        proteinG: food.proteinG * servings,
        carbsG: food.carbsG * servings,
        fatG: food.fatG * servings,
        fiberG: food.fiberG * servings,
      },
      include: {
        food: true,
      },
    });
  }

  if (!data.customName) {
    throw new Error("customName is required if foodId is not provided");
  }

  return prisma.logEntry.create({
    data: {
      dailyLogId: log.id,
      customName: data.customName,
      mealType: data.mealType || "SNACK",
      servings: Number(data.servings || 1),
      servingUnit: data.servingUnit || "serving",

      calories: Number(data.calories || 0),
      proteinG: Number(data.proteinG || 0),
      carbsG: Number(data.carbsG || 0),
      fatG: Number(data.fatG || 0),
      fiberG: Number(data.fiberG || 0),
    },
  });
}

export async function updateEntry(userId, entryId, data) {
  const entry = await prisma.logEntry.findFirst({
    where: {
      id: entryId,
      dailyLog: {
        userId,
      },
    },
  });

  if (!entry) {
    throw new Error("Entry not found");
  }

  return prisma.logEntry.update({
    where: {
      id: entryId,
    },
    data: {
      customName: data.customName,
      mealType: data.mealType,
      servings: data.servings === undefined ? undefined : Number(data.servings),
      servingUnit: data.servingUnit,

      calories: data.calories === undefined ? undefined : Number(data.calories),
      proteinG: data.proteinG === undefined ? undefined : Number(data.proteinG),
      carbsG: data.carbsG === undefined ? undefined : Number(data.carbsG),
      fatG: data.fatG === undefined ? undefined : Number(data.fatG),
      fiberG: data.fiberG === undefined ? undefined : Number(data.fiberG),
    },
    include: {
      food: true,
    },
  });
}

export async function deleteEntry(userId, entryId) {
  const entry = await prisma.logEntry.findFirst({
    where: {
      id: entryId,
      dailyLog: {
        userId,
      },
    },
  });

  if (!entry) {
    throw new Error("Entry not found");
  }

  await prisma.logEntry.delete({
    where: {
      id: entryId,
    },
  });

  return { message: "Entry deleted successfully" };
}