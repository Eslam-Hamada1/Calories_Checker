import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import foodRoutes from "./routes/foodRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
    res.json({ message: "Backend working" });
});

app.use("/api/food", foodRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});