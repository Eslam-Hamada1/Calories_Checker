import prisma from "../../config/prisma.js";

function getTodayDateOnly() {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

function sumEntries(entries) {
  return entries.reduce(
    (total, entry) => {
      total.calories += entry.calories;
      total.proteinG += entry.proteinG;
      total.carbsG += entry.carbsG;
      total.fatG += entry.fatG;
      total.fiberG += entry.fiberG;

      return total;
    },
    {
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
    }
  );
}

export async function getTodayDashboard(userId) {
  const today = getTodayDateOnly();

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  const log = await prisma.dailyLog.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    include: {
      entries: true,
    },
  });

  const consumed = log ? sumEntries(log.entries) : sumEntries([]);

  const calorieGoal = profile?.dailyCalorieGoal || 2000;

  return {
    date: today,
    goal: {
      calories: calorieGoal,
      proteinG: profile?.dailyProteinGoal || null,
      carbsG: profile?.dailyCarbGoal || null,
      fatG: profile?.dailyFatGoal || null,
    },
    consumed,
    remainingCalories: calorieGoal - consumed.calories,
    caloriePercentage: Math.round((consumed.calories / calorieGoal) * 100),
  };
}

export async function getHistory(userId, days = 7) {
  const endDate = getTodayDateOnly();

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days + 1);

  const logs = await prisma.dailyLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      entries: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  return logs.map((log) => ({
    date: log.date,
    totals: sumEntries(log.entries),
  }));
}