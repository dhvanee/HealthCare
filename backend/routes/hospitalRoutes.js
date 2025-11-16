import express from "express";
import { getPrediction } from "../services/mlService.js";

const router = express.Router();

router.post("/predict", async (req, res) => {
  try {
    const result = await getPrediction(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Prediction failed" });
  }
});

export default router;
