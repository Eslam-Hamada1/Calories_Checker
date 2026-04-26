import { useState } from "react";
import ImageUpload from "./components/ImageUpload";
import ResultCard from "./components/ResultCard";

function App() {
  const [result, setResult] = useState(null);

  return (
    <main className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-lime-50 px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-3 inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700">
            AI Food Calorie Estimator
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Calorie Vision
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Upload a meal image and get an estimated calorie breakdown in seconds.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ImageUpload setResult={setResult} />
          <ResultCard result={result} />
        </div>
      </section>
    </main>
  );
}

export default App;