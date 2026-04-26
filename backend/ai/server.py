from fastapi import FastAPI, File, UploadFile
import shutil
import os
from pathlib import Path
import sys

# Load model ONCE
BACKEND_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = BACKEND_DIR / "models" / "CalorieCLIP"

sys.path.append(str(MODEL_DIR))
from calorie_clip import CalorieCLIP

print("Loading model...")
model = CalorieCLIP.from_pretrained(str(MODEL_DIR))
print("Model loaded!")

app = FastAPI()


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        calories = model.predict(temp_path)
        return {
            "items": [
                {
                    "name": "Estimated meal",
                    "calories": round(float(calories)),
                    "range": [
                        round(float(calories) * 0.85),
                        round(float(calories) * 1.15)
                    ]
                }
            ],
            "totalCalories": round(float(calories))
        }

    finally:
        os.remove(temp_path)