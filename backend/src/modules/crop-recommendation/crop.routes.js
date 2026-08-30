import express from "express";
import {
  recommendCrops,
  scoreCrop,
  explainCrop,
  getStates,
  getDistricts,
  getSeasons,
  getCrops,
  getRecommendationHistory,
} from "./crop.controller.js";

const router = express.Router();

// Inference
router.post("/recommend", recommendCrops);
router.post("/score", scoreCrop);
router.post("/explain", explainCrop);

// Discovery (dropdown options)
router.get("/options/states", getStates);
router.get("/options/districts", getDistricts);
router.get("/options/seasons", getSeasons);
router.get("/options/crops", getCrops);

// History
router.get("/history", getRecommendationHistory);

export default router;
