import prisma from "../../config/db.js";
import mlClient from "../../config/mlService.js";
import { zeroProductionPredictSchema, batchZeroProductionPredictSchema } from "./zeroProduction.validator.js";

// ── POST /zero-production-risk/predict ───────────────────────────────────
export const predictZeroProduction = async (req, res, next) => {
  try {
    const parsed = zeroProductionPredictSchema.parse(req.body);
    const userId = req.user.id;

    // Call ML service
    const { data } = await mlClient.post("/api/v1/model-3-v3/predict", parsed);

    // Persist to database
    await prisma.zeroProductionRisk.create({
      data: {
        userId,
        state: parsed.state,
        district: parsed.district,
        crop: parsed.crop,
        season: parsed.season,
        area: parsed.area,
        rawProbability: data.raw_probability,
        calibratedProbability: data.calibrated_probability,
        zeroProductionFlag: data.zero_production_flag,
        riskLevel: data.risk_level,
        requestPayload: parsed,
        responsePayload: data,
        modelName: "Zero-Production Risk (Model 3 V3)",
        modelVersion: data.model_version || null,
      },
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
    }
    if (error.response && error.response.data) {
      return res.status(error.response.status).json(error.response.data);
    }
    next(error);
  }
};

// ── POST /zero-production-risk/predict/batch ─────────────────────────────
export const predictZeroProductionBatch = async (req, res, next) => {
  try {
    const parsed = batchZeroProductionPredictSchema.parse(req.body);
    const userId = req.user.id;

    // Call ML service batch endpoint
    const { data } = await mlClient.post("/api/v1/model-3-v3/predict/batch", {
      records: parsed.records,
    });

    // Bulk persist all batch predictions
    const dbPromises = data.results.map((result) => {
      const originalInput = parsed.records[result.index];
      return prisma.zeroProductionRisk.create({
        data: {
          userId,
          state: originalInput.state,
          district: originalInput.district,
          crop: originalInput.crop,
          season: originalInput.season,
          area: originalInput.area,
          rawProbability: result.raw_probability,
          calibratedProbability: result.calibrated_probability,
          zeroProductionFlag: result.zero_production_flag,
          riskLevel: result.risk_level,
          requestPayload: originalInput,
          responsePayload: result,
          modelName: "Zero-Production Risk (Model 3 V3) - Batch",
          modelVersion: result.model_version || null,
        },
      });
    });

    await Promise.all(dbPromises);

    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
    }
    if (error.response && error.response.data) {
      return res.status(error.response.status).json(error.response.data);
    }
    next(error);
  }
};

// ── GET /zero-production-risk/health ─────────────────────────────────────
export const getZeroProductionHealth = async (req, res, next) => {
  try {
    const { data } = await mlClient.get("/api/v1/model-3-v3/health");
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ── GET /zero-production-risk/history ────────────────────────────────────
export const getZeroProductionHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cursor } = req.query;
    const limit = Number(req.query.limit) || 10;

    const records = await prisma.zeroProductionRisk.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      take: limit,
    });

    const nextCursor = records.length === limit ? records[records.length - 1].id : null;

    res.status(200).json({ success: true, data: records, nextCursor });
  } catch (error) {
    next(error);
  }
};
export const getZeroProductionInfo = async (req, res, next) => {
  try {
    const { data } = await mlClient.get("/api/v1/model-3-v3/info");
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
export const getZeroProductionReady = async (req, res, next) => {
  try {
    const { data } = await mlClient.get("/api/v1/model-3-v3/ready");
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
