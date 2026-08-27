/**
 * Mock recommendation data.
 * Replace this with the FastAPI backend response when the backend is connected.
 * The structure should match the CropRecommendation type from src/types/recommendation.ts
 */

import type { CropRecommendation } from "../types/recommendation";

export interface WeatherSnapshotData {
  temperature_c: number;
  humidity_percent: number;
  rainfall_mm: number;
  condition: string;
  forecast: { day: string; temp_c: number; rainfall_mm: number; icon: "sun" | "cloud" | "rain" | "partly" }[];
}

export interface HistoricalYieldPoint {
  year: number;
  yield_t_per_ha: number;
}

export interface MockRecommendationResult {
  rankings: CropRecommendation[];
  weather: WeatherSnapshotData;
  historicalYield: HistoricalYieldPoint[];
  generatedAt: string;
}

// ── Rankings ──────────────────────────────────────────────────────────────

export const MOCK_RANKINGS: CropRecommendation[] = [
  {
    crop: "Maize",
    rank: 1,
    suitability_score: 92,
    predicted_yield_t_per_ha: 3.4,
    estimated_production_tonnes: 3.44,
    historical_stability: "High",
    weather_compatibility: "High",
    yield_trend: "Improving",
  },
  {
    crop: "Rice",
    rank: 2,
    suitability_score: 84,
    predicted_yield_t_per_ha: 3.1,
    estimated_production_tonnes: 3.14,
    historical_stability: "High",
    weather_compatibility: "High",
    yield_trend: "Stable",
  },
  {
    crop: "Soybean",
    rank: 3,
    suitability_score: 71,
    predicted_yield_t_per_ha: 2.7,
    estimated_production_tonnes: 2.73,
    historical_stability: "Medium",
    weather_compatibility: "Medium",
    yield_trend: "Stable",
  },
  {
    crop: "Millet",
    rank: 4,
    suitability_score: 64,
    predicted_yield_t_per_ha: 2.4,
    estimated_production_tonnes: 2.43,
    historical_stability: "High",
    weather_compatibility: "Medium",
    yield_trend: "Improving",
  },
];

// ── Weather ───────────────────────────────────────────────────────────────

export const MOCK_WEATHER: WeatherSnapshotData = {
  temperature_c: 28,
  humidity_percent: 72,
  rainfall_mm: 18,
  condition: "Partly Cloudy",
  forecast: [
    { day: "Today",    temp_c: 28, rainfall_mm: 18, icon: "partly" },
    { day: "Tomorrow", temp_c: 29, rainfall_mm: 12, icon: "cloud"  },
    { day: "+2 days",  temp_c: 30, rainfall_mm: 8,  icon: "sun"    },
    { day: "+3 days",  temp_c: 29, rainfall_mm: 5,  icon: "sun"    },
    { day: "+4 days",  temp_c: 28, rainfall_mm: 10, icon: "partly" },
  ],
};

// ── Historical yield (Maize) ──────────────────────────────────────────────

export const MOCK_HISTORICAL_YIELD: HistoricalYieldPoint[] = [
  { year: 2021, yield_t_per_ha: 2.8 },
  { year: 2022, yield_t_per_ha: 2.9 },
  { year: 2023, yield_t_per_ha: 3.0 },
  { year: 2024, yield_t_per_ha: 3.2 },
  { year: 2025, yield_t_per_ha: 3.4 },
];

// ── Convenience re-exports ────────────────────────────────────────────────

export const MOCK_TOP_CROP = MOCK_RANKINGS[0];

export const MOCK_RECOMMENDATION: MockRecommendationResult = {
  rankings: MOCK_RANKINGS,
  weather: MOCK_WEATHER,
  historicalYield: MOCK_HISTORICAL_YIELD,
  generatedAt: new Date().toISOString(),
};
