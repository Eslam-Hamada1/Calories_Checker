export function normalizeTextMealAnalysis(geminiData) {
  const rawItems = Array.isArray(geminiData?.items) ? geminiData.items : [];

  const items = rawItems.map((item) => {
    const calories = Number(item.calories || 0);

    return {
      name: item.name || "Food item",
      quantity: item.quantity || null,

      calories,
      calorieMin: Math.round(calories * 0.85),
      calorieMax: Math.round(calories * 1.15),

      proteinG: Number(item.proteinG || 0),
      carbsG: Number(item.carbsG || 0),
      fatG: Number(item.fatG || 0),
      fiberG: Number(item.fiberG || 0),
    };
  });

  const totals = items.reduce(
    (total, item) => {
      total.totalCalories += item.calories;
      total.proteinG += item.proteinG;
      total.carbsG += item.carbsG;
      total.fatG += item.fatG;
      total.fiberG += item.fiberG;
      return total;
    },
    {
      totalCalories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
    }
  );

  const totalCalories = Math.round(totals.totalCalories);

  return {
    mealName: geminiData?.mealName || "Text meal estimate",

    totalCalories,
    totalMin: Math.round(totalCalories * 0.85),
    totalMax: Math.round(totalCalories * 1.15),

    macros: {
      proteinG: Math.round(totals.proteinG),
      carbsG: Math.round(totals.carbsG),
      fatG: Math.round(totals.fatG),
      fiberG: Math.round(totals.fiberG),
    },

    items: items.map((item) => ({
      ...item,
      calories: Math.round(item.calories),
      proteinG: Math.round(item.proteinG),
      carbsG: Math.round(item.carbsG),
      fatG: Math.round(item.fatG),
      fiberG: Math.round(item.fiberG),
    })),
  };
}