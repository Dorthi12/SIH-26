import prisma from "../../config/db.js";
import mlClient from "../../config/mlService.js";
import { recommendSchema, scoreCropSchema } from "./crop.validator.js";

// ── POST /crop-recommendation/recommend ──────────────────────────────────
export const recommendCrops = async (req, res, next) => {
  try {
    const parsed = recommendSchema.parse(req.body);
    const userId = req.user.id;

    const { data } = await mlClient.post("/api/v1/crop/recommend", parsed);

    // Persist to database
    await prisma.cropRecommendation.create({
      data: {
        userId,
        state: parsed.state,
        district: parsed.district,
        season: parsed.season,
        topK: parsed.top_k,
        recommendations: data,
        modelName: data.model_name || null,
        modelVersion: data.model_version || null,
      },
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
    }
    next(error);
  }
};

// ── POST /crop-recommendation/score ──────────────────────────────────────
export const scoreCrop = async (req, res, next) => {
  try {
    const parsed = scoreCropSchema.parse(req.body);
    const { data } = await mlClient.post("/api/v1/crop/recommend/score", parsed);
    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
    }
    next(error);
  }
};

// ── POST /crop-recommendation/explain ────────────────────────────────────
export const explainCrop = async (req, res, next) => {
  try {
    const parsed = scoreCropSchema.parse(req.body);
    const { data } = await mlClient.post("/api/v1/crop/recommend/explain", parsed);
    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
    }
    next(error);
  }
};

// ── GET /crop-recommendation/options/states ──────────────────────────────
export const getStates = async (req, res, next) => {
  try {
    const { data } = await mlClient.get("/api/v1/crop/options/states");
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ── GET /crop-recommendation/options/districts?state= ────────────────────
export const getDistricts = async (req, res, next) => {
  try {
    const { state } = req.query;
    if (!state) {
      return res.status(400).json({ success: false, message: "state query param is required" });
    }
    const { data } = await mlClient.get("/api/v1/crop/options/districts", { params: { state } });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ── GET /crop-recommendation/options/seasons ─────────────────────────────
export const getSeasons = async (req, res, next) => {
  try {
    const { data } = await mlClient.get("/api/v1/crop/options/seasons");
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ── GET /crop-recommendation/options/crops ───────────────────────────────
export const getCrops = async (req, res, next) => {
  try {
    const { state, district, season } = req.query;
    const { data } = await mlClient.get("/api/v1/crop/options/crops", {
      params: { state, district, season },
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ── GET /crop-recommendation/history ─────────────────────────────────────
export const getRecommendationHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cursor } = req.query;
    const limit = Number(req.query.limit) || 10;

    const records = await prisma.cropRecommendation.findMany({
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
