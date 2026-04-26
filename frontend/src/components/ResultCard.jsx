function ResultCard({ result }) {
    if (!result) {
        return (
            <div className="flex min-h-105 items-center justify-center rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">📊</div>
                    <h2 className="text-2xl font-bold">No result yet</h2>
                    <p className="mt-2 max-w-sm text-slate-500">Upload a food image and the calorie estimate will appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Analysis Result</h2>
                    <p className="mt-1 text-sm text-slate-500">{result.imageName}</p>
                </div>

                <div className="rounded-2xl bg-emerald-100 px-4 py-2 text-center">
                    <p className="text-xs font-semibold text-emerald-700">Total</p>
                    <p className="text-xl font-bold text-emerald-800">{result.totalCalories} kcal</p>
                </div>
            </div>

            <div className="space-y-3">
                {result.items.map((item, index) => (
                    <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">{item.name}</h3>
                            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-emerald-700">{item.calories} kcal</span>
                        </div>

                        <div className="mt-3 h-2 rounded-full bg-slate-200">
                            <div className="h-2 rounded-full bg-emerald-500" style={{width: `${Math.min((item.calories / result.totalCalories) * 100,100)}%`,}}></div>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">Estimated portion: {item.estimatedGrams}g</p>
                    </div>
                ))}
            </div>

        <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">Note: Calories are estimated. Final accuracy depends on image quality and portion size.</p>
        </div>
    );
}

export default ResultCard;