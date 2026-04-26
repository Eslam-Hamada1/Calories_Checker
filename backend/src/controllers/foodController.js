export const analyzeFood = (req, res) => {
    if (!req.file) {
        return res.status(400).json({message: "No image uploaded"});
    }

    const fakeResult = {
        imageName: req.file.originalname,
        items: [
            {
                name: "Rice",
                estimatedGrams: 150,
                calories: 195,
            },
            {
                name: "Chicken",
                estimatedGrams: 120,
                calories: 240,
            },
        ],
        totalCalories: 435,
    };

    res.json(fakeResult);
};