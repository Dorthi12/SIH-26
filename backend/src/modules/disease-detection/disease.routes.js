import express from "express";
import {
  getPresignedUrl,
  predictDisease,
  getDiseaseHealth,
  getDiseaseHistory,
} from "./disease.controller.js";

const router = express.Router();

// Upload flow
router.get("/presigned-url", getPresignedUrl);

// Inference
router.post("/predict", predictDisease);

// Monitoring
router.get("/health", getDiseaseHealth);

// History
router.get("/history", getDiseaseHistory);

export default router;
