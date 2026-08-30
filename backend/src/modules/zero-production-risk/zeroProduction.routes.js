import express from "express";
import {
  predictZeroProduction,
  predictZeroProductionBatch,
  getZeroProductionHealth,
  getZeroProductionHistory,
  getZeroProductionInfo,
  getZeroProductionReady,
} from "./zeroProduction.controller.js";

const router = express.Router();

// Inference
router.post("/predict", predictZeroProduction);
router.post("/predict/batch", predictZeroProductionBatch);

// Monitoring
router.get("/health", getZeroProductionHealth);
router.get("/ready", getZeroProductionReady);
router.get("/info", getZeroProductionInfo);

// History
router.get("/history", getZeroProductionHistory);

export default router;
