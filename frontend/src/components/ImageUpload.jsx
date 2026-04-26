import { useState } from "react";
import { analyzeFoodImage } from "../services/foodApi";

function ImageUpload({ setResult }) {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        setImage(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            alert("Please upload an image first");
            return;
        }

        try {
            setLoading(true);
            const data = await analyzeFoodImage(image);
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Failed to analyze image");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-100/60">
            <h2 className="text-2xl font-bold">Upload Meal</h2>
            <p className="mt-2 text-sm text-slate-500">Choose a clear image of your food plate.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 p-6 text-center transition hover:bg-emerald-50">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden"/>
                    {preview ? (
                        <img src={preview} alt="Food preview" className="max-h-64 rounded-2xl object-cover shadow-md"/>
                    ) : (
                        <div>
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">🍽️</div>
                            <p className="font-semibold text-slate-700">Click to upload food image</p>
                            <p className="mt-1 text-sm text-slate-500">PNG, JPG, JPEG supported</p>
                        </div>
                    )}
                </label>
                {image && (
                    <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Selected: <span className="font-medium">{image.name}</span></p>
                )}

                <button type="submit" disabled={loading} className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Analyzing..." : "Analyze Food"}
                </button>
            </form>
        </div>
    );
}

export default ImageUpload;