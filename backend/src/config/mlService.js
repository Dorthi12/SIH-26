/**
 * mlService.js — Centralized axios client for the ML FastAPI microservice.
 *
 * All ML proxy modules share this single client instance.
 * The X-API-Key header is attached to every request automatically.
 */
import axios from "axios";

const ML_BASE_URL = process.env.AI_URL || "http://localhost:8000";
const ML_API_KEY = process.env.ML_API_KEY || "";

const mlClient = axios.create({
  baseURL: ML_BASE_URL,
  timeout: 30000, // 30s — disease model inference can be slow
  headers: {
    ...(ML_API_KEY && { "X-API-Key": ML_API_KEY }),
  },
});

export default mlClient;
