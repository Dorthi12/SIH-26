/**
 * explainService.ts
 *
 * Explainability data abstraction layer.
 * The /explain page consumes data through this service — NOT from mockExplanation directly.
 *
 * Current state: returns derived mock data synchronously.
 *
 * When the backend is connected, replace the implementation of getRecommendationExplanation()
 * to fetch from the FastAPI /explain or /recommend endpoint.
 * The ExplanationResult interface and all component signatures remain unchanged.
 *
 * TODO: Replace the mock return with:
 *   const res = await fetch(`/api/v1/explain?district=${district}&season=${season}`);
 *   const json = await res.json();
 *   return mapApiResponseToExplanationResult(json);
 */

import { MOCK_RANKINGS } from "../data/mockRecommendation";
import { MOCK_HISTORICAL_DATA }         from "../data/mockHistoricalData";
import { MOCK_WEATHER_DATA }            from "../data/mockWeather";
import type { CropRecommendation }      from "../types/recommendation";
import type { CropHistoricalData }      from "../data/mockHistoricalData";
import type { WeatherDataset }          from "../data/mockWeather";

// ── Types ─────────────────────────────────────────────────────────────────

export interface FarmContext {
  district: string;
  season:   string;
  acres:    number;
}

export interface ScoreExplanation {
  illustrative: true;   // literal — always true in MVP (score is illustrative, not backend-derived)
  score:        number;
  topYield:     number;
  minYield:     number;
  maxYield:     number;
}

export interface ExplanationResult {
  farm:            FarmContext;
  topCrop:         CropRecommendation;
  secondCrop:      CropRecommendation;
  sortedRankings:  CropRecommendation[];
  topCropHistory:  CropHistoricalData;
  weather:         WeatherDataset;
  scoreExplanation: ScoreExplanation;
  fetchedAt:       string;
}

export type ExplainLoadState = "idle" | "loading" | "ready" | "error";

// ── Default farm context ───────────────────────────────────────────────────

const DEFAULT_FARM: FarmContext = {
  district: "Prayagraj, Uttar Pradesh",
  season:   "Kharif",
  acres:    2.5,
};

// ── Service implementation ─────────────────────────────────────────────────

export async function getRecommendationExplanation(
  farm?: Partial<FarmContext>,
  recommendations?: CropRecommendation[]
): Promise<ExplanationResult> {
  const resolvedFarm: FarmContext = {
    district: farm?.district ?? DEFAULT_FARM.district,
    season:   farm?.season   ?? DEFAULT_FARM.season,
    acres:    farm?.acres    ?? DEFAULT_FARM.acres,
  };

  const rankings = recommendations && recommendations.length > 0 ? recommendations : MOCK_RANKINGS;

  const sorted      = [...rankings].sort((a, b) => a.rank - b.rank);
  const topCrop     = sorted[0];
  const secondCrop  = sorted[1] ?? sorted[0];

  // Try to match mock historical data or construct dynamic list
  let topHistory  = MOCK_HISTORICAL_DATA.find(
    (c) => c.crop.toLowerCase() === topCrop.crop.toLowerCase()
  );

  if (!topHistory) {
    const baseYield = topCrop.predicted_yield_t_per_ha;
    topHistory = {
      crop: topCrop.crop,
      stability: topCrop.historical_stability,
      trend: topCrop.yield_trend,
      color: "#1a3d2e",
      colorLight: "rgba(26,61,46,0.12)",
      yearlyYield: [
        { year: 2021, yield_t_per_ha: Math.round(baseYield * 0.85 * 10) / 10 },
        { year: 2022, yield_t_per_ha: Math.round(baseYield * 0.90 * 10) / 10 },
        { year: 2023, yield_t_per_ha: Math.round(baseYield * 0.95 * 10) / 10 },
        { year: 2024, yield_t_per_ha: Math.round(baseYield * 0.98 * 10) / 10 },
        { year: 2025, yield_t_per_ha: baseYield },
      ],
    };
  }

  const scoreExplanation: ScoreExplanation = {
    illustrative: true as const,
    score:        topCrop.suitability_score,
    topYield:     topCrop.predicted_yield_t_per_ha,
    minYield:     Math.min(...rankings.map((c) => c.predicted_yield_t_per_ha)),
    maxYield:     Math.max(...rankings.map((c) => c.predicted_yield_t_per_ha)),
  };

  return {
    farm:             resolvedFarm,
    topCrop,
    secondCrop,
    sortedRankings:   sorted,
    topCropHistory:   topHistory,
    weather:          MOCK_WEATHER_DATA,
    scoreExplanation,
    fetchedAt:        new Date().toISOString(),
  };
}

// ── Derived helper ─────────────────────────────────────────────────────────

/** Human-readable key takeaway — derived from data, no fabrication */
export function getKeyTakeaway(result: ExplanationResult): string {
  const { topCrop, secondCrop } = result;
  const diff = (topCrop.suitability_score - secondCrop.suitability_score).toFixed(0);
  return (
    `${topCrop.crop} is currently ranked highest among the evaluated crops, ` +
    `with a suitability score of ${topCrop.suitability_score}/100 — ` +
    `${diff} points above the next-ranked option (${secondCrop.crop}).`
  );
}
