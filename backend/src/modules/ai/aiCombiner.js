export function combineCalorieClipAndGemini(calorieClipData, geminiData) {
  const totalCalories = Number(
    calorieClipData.totalCalories ||
      calorieClipData.calories ||
      calorieClipData.total ||
      0
  );

  const safeTotal = totalCalories > 0 ? totalCalories : 0;

  const geminiItems = Array.isArray(geminiData?.items)
    ? geminiData.items
    : [];

  const fallbackItems = [
    {
      name: geminiData?.mealName || "Estimated meal",
      percentage: 100,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
    },
  ];

  const rawItems = geminiItems.length > 0 ? geminiItems : fallbackItems;

  const percentageSum = rawItems.reduce(
    (sum, item) => sum + Number(item.percentage || 0),
    0
  );

  const items = rawItems.map((item) => {
    const rawPercentage = Number(item.percentage || 0);

    const percentage =
      percentageSum > 0
        ? (rawPercentage / percentageSum) * 100
        : 100 / rawItems.length;

    const calories = Math.round(safeTotal * (percentage / 100));

    return {
      name: item.name || "Food item",
      percentage: Math.round(percentage),
      calories,
      calorieMin: Math.round(calories * 0.85),
      calorieMax: Math.round(calories * 1.15),
      proteinG: Number(item.proteinG || 0),
      carbsG: Number(item.carbsG || 0),
      fatG: Number(item.fatG || 0),
      fiberG: Number(item.fiberG || 0),
    };
  });

  const macros = items.reduce(
    (total, item) => {
      total.proteinG += item.proteinG;
      total.carbsG += item.carbsG;
      total.fatG += item.fatG;
      total.fiberG += item.fiberG;
      return total;
    },
    {
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
    }
  );

  return {
    mealName: geminiData?.mealName || "Estimated meal",
    totalCalories: safeTotal,
    totalMin: Math.round(safeTotal * 0.85),
    totalMax: Math.round(safeTotal * 1.15),
    macros,
    items,
  };
}