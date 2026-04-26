function ResultCard({ result }) {
  if (!result) {
    return (
      <div className="flex min-h-105 items-center justify-center rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
            📊
          </div>
          <h2 className="text-2xl font-bold">No result yet</h2>
          <p className="mt-2 max-w-sm text-slate-500">
            Upload a food image and the calorie estimate will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
      
      {/* 🔥 Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analysis Result</h2>
          <p className="mt-1 text-sm text-slate-500">{result.imageName}</p>
        </div>

        <div className="rounded-2xl bg-emerald-100 px-4 py-2 text-center">
          <p className="text-xs font-semibold text-emerald-700">Total</p>
          <p className="text-xl font-bold text-emerald-800">
            {result.totalCalories} kcal
          </p>

          {/* 🔥 Total range */}
          {result.range && (
            <p className="text-xs text-emerald-700">
              {result.range[0]} – {result.range[1]} kcal
            </p>
          )}

          <p className="text-xs text-slate-500">±15% estimation</p>
        </div>
      </div>

    {/* 🔥 Non-food message */}
    {result?.isFood === false ? (
      <div className="rounded-2xl bg-yellow-100 p-6 text-center text-yellow-800">
        <p className="text-lg font-semibold">
          {result.message || "This doesn't look like food 👀"}
        </p>
      </div>
    ) : (
      /* 🔥 Food items */
      <div className="space-y-3">
        {result.items.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 capitalize">
                {item.name}
              </h3>
    
              <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-emerald-700">
                {item.calories} kcal
              </span>
            </div>
    
            {item.percentage && (
              <p className="mt-2 text-sm text-slate-500">
                Estimated share: {item.percentage}%
              </p>
            )}
    
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{
                  width: `${Math.min(item.percentage || 0, 100)}%`,
                }}
              ></div>
            </div>
    
            {item.range && (
              <p className="mt-2 text-sm text-slate-500">
                Range: {item.range[0]} – {item.range[1]} kcal
              </p>
            )}
          </div>
        ))}
      </div>
    )}

      {/* 🔥 Footer note */}
      <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
        ⚠️ Calories are AI-estimated based on image analysis and may vary due to
        portion size and food composition.
      </p>
    </div>
  );
}

export default ResultCard;
