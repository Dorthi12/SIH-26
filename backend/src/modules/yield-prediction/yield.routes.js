import express from "express";
import {
  predictYield,
  predictYieldFromHistory,
  getYieldHealth,
  getYieldHistory,
} from "./yield.controller.js";

const router = express.Router();

// Inference
router.post("/predict", predictYield);
router.post("/predict/from-history", predictYieldFromHistory);

// Monitoring
router.get("/health", getYieldHealth);

// History
router.get("/history", getYieldHistory);

export default router;
