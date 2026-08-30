import prisma from "../../config/db.js";
import mlClient from "../../config/mlService.js";
import { yieldPredictSchema, fromHistorySchema } from "./yield.validator.js";

/**
 * Helper: persist a yield prediction result to the database.
 */
async function persistYieldPrediction(userId, requestPayload, mlResponse) {
  const prediction = mlResponse.prediction;
  const context = mlResponse.context || {};

  await prisma.yieldPrediction.create({
    data: {
      userId,
      state: context.state || requestPayload.state || "",
      district: context.district || requestPayload.district || "",
      crop: context.crop || requestPayload.crop || "",
      season: context.season || requestPayload.season || "",
      cropYear: context.crop_year || requestPayload.crop_year || 0,
      area: context.area || requestPayload.area || 0,
      predictedYield: prediction?.value ?? 0,
      requestPayload,
      responsePayload: mlResponse,
      modelName: mlResponse.model?.name || null,
      modelVersion: mlResponse.model?.version || null,
      warnings: mlResponse.warnings || [],
    },
  });
}

// ── POST /yield-prediction/predict ───────────────────────────────────────
export const predictYield = async (req, res, next) => {
  try {
    const parsed = yieldPredictSchema.parse(req.body);
    const userId = req.user.id;

    const { data } = await mlClient.post("/api/v1/predict-yield", parsed);

    await persistYieldPrediction(userId, parsed, data);

    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
    }
    next(error);
  }
};

// ── POST /yield-prediction/predict/from-history ──────────────────────────
export const predictYieldFromHistory = async (req, res, next) => {
  try {
    const parsed = fromHistorySchema.parse(req.body);
    const userId = req.user.id;

    const { data } = await mlClient.post("/api/v1/predict-yield/from-history", parsed);

    await persistYieldPrediction(userId, parsed, data);

    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
    }
    next(error);
  }
};

// ── GET /yield-prediction/health ─────────────────────────────────────────
export const getYieldHealth = async (req, res, next) => {
  try {
    const { data } = await mlClient.get("/api/v1/yield/health");
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ── GET /yield-prediction/history ────────────────────────────────────────
export const getYieldHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cursor } = req.query;
    const limit = Number(req.query.limit) || 10;

    const records = await prisma.yieldPrediction.findMany({
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
