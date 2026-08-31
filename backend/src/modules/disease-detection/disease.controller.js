import prisma from "../../config/db.js";
import mlClient from "../../config/mlService.js";
import s3Client from "../../config/s3.js";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
import { diseasePredictSchema } from "./disease.validator.js";

// ── GET /disease-detection/presigned-url ──────────────────────────────────
export const getPresignedUrl = async (req, res, next) => {
  try {
    console.log("here")
    const { fileName, fileType } = req.query;
    if (!fileName || !fileType) {
      return res.status(400).json({
        success: false,
        message: "fileName and fileType query parameters are required",
      });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type. Only JPEG, PNG, and WebP are allowed.",
      });
    }

    const extension = path.extname(fileName) || ".jpg";
    const key = `diseases/${crypto.randomUUID()}${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    const imageUrl = `${process.env.AWS_S3_BASE_URL_DISEASES}${key.startsWith("diseases/") ? key.substring(9) : key}`;

    res.json({
      success: true,
      key,
      uploadUrl,
      imageUrl,
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /disease-detection/predict ───────────────────────────────────────
export const predictDisease = async (req, res, next) => {
  try {
    const parsed = diseasePredictSchema.parse(req.body);
    const userId = req.user.id;

    // Extract S3 key from the imageUrl
    const urlObj = new URL(parsed.imageUrl);
    const key = decodeURIComponent(urlObj.pathname.substring(1));

    // Generate presigned GET URL for S3 key (valid for 5 minutes)
    const getCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });
    const presignedDownloadUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 300,
    });

    // Call ML service with URL-based prediction (using presigned URL)
    const { data } = await mlClient.post("/api/v1/plant-disease/predict-url", {
      image_url: presignedDownloadUrl,
    });

    // Persist to database
    await prisma.diseasePrediction.create({
      data: {
        userId,
        imageUrl: parsed.imageUrl,
        status: data.status,
        crop: data.crop || null,
        disease: data.disease || null,
        isHealthy: data.is_healthy ?? null,
        confidence: data.confidence || null,
        responsePayload: data,
        modelName: data.model?.name || null,
        modelVersion: data.model?.version || null,
      },
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
    }
    // If FastAPI service returned an error response
    if (error.response && error.response.data) {
      return res.status(error.response.status).json(error.response.data);
    }
    next(error);
  }
};

// ── GET /disease-detection/health ─────────────────────────────────────────
export const getDiseaseHealth = async (req, res, next) => {
  try {
    const { data } = await mlClient.get("/api/v1/plant-disease/health");
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ── GET /disease-detection/history ────────────────────────────────────────
export const getDiseaseHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cursor } = req.query;
    const limit = Number(req.query.limit) || 10;

    const records = await prisma.diseasePrediction.findMany({
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
