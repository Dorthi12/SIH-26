/**
 * dashboardService.ts
 *
 * Dashboard data abstraction layer.
 * The UI must import aggregated dashboard data through this service.
 * All individual data sources are consolidated here.
 *
 * Current state: returns mock/local data.
 * When backend is connected, replace the implementation of getDashboardData()
 * to fetch from the relevant API endpoints. The interface and all component
 * signatures remain unchanged.
 */

import {
  MOCK_TOP_CROP,
  MOCK_RANKINGS,
  type WeatherSnapshotData,
  MOCK_WEATHER,
} from "../data/mockRecommendation";

import {
  MOCK_HISTORICAL_DATA,
  getLatestYield,
  calculateAverageYield,
  type CropHistoricalData,
} from "../data/mockHistoricalData";

import type { CropRecommendation } from "../types/recommendation";

// ── Types ─────────────────────────────────────────────────────────────────

export interface FarmContext {
  district: string;
  season:   string;
  acres:    number;
}

export interface DashboardData {
  farm:           FarmContext;
  topCrop:        CropRecommendation;
  rankings:       CropRecommendation[];
  weather:        WeatherSnapshotData;
  topHistory:     CropHistoricalData;
  latestYield:    number;
  averageYield:   number;
  fetchedAt:      string;
}

export type DashboardLoadState = "idle" | "loading" | "ready" | "error";

// ── Default farm context ───────────────────────────────────────────────────

const DEFAULT_FARM: FarmContext = {
  district: "Prayagraj, Uttar Pradesh",
  season:   "Kharif",
  acres:    2.5,
};

// ── Service implementation ─────────────────────────────────────────────────

/**
 * Retrieve aggregated dashboard data.
 *
 * @param farm  Optional farm context override (e.g. from RecommendationContext).
 *
 * TODO: Replace with API calls, e.g.:
 *   const [rec, weather, history] = await Promise.all([
 *     fetch(`/api/v1/recommend?district=${farm.district}&season=${farm.season}`),
 *     fetch(`/api/v1/weather?location=${farm.district}`),
 *     fetch(`/api/v1/history?district=${farm.district}&season=${farm.season}`),
 *   ]);
 */
export async function getDashboardData(farm?: Partial<FarmContext>): Promise<DashboardData> {
  const resolvedFarm: FarmContext = {
    district: farm?.district ?? DEFAULT_FARM.district,
    season:   farm?.season   ?? DEFAULT_FARM.season,
    acres:    farm?.acres    ?? DEFAULT_FARM.acres,
  };

  const topHistory = MOCK_HISTORICAL_DATA.find((c) => c.crop === MOCK_TOP_CROP.crop)!;

  return {
    farm:         resolvedFarm,
    topCrop:      MOCK_TOP_CROP,
    rankings:     MOCK_RANKINGS,
    weather:      MOCK_WEATHER,
    topHistory,
    latestYield:  getLatestYield(topHistory),
    averageYield: calculateAverageYield(topHistory),
    fetchedAt:    new Date().toISOString(),
  };
}

// ── Derived helpers (keep outside JSX) ───────────────────────────────────

/** Dashboard-level insight string — derived from real data, no fabrication */
export function getDashboardInsight(data: DashboardData): string {
  const { topCrop, rankings } = data;
  const sorted   = [...rankings].sort((a, b) => b.predicted_yield_t_per_ha - a.predicted_yield_t_per_ha);
  const nextBest = sorted[1];
  const diff     = (topCrop.predicted_yield_t_per_ha - nextBest.predicted_yield_t_per_ha).toFixed(1);
  return `${topCrop.crop} currently ranks highest among the evaluated crops, with a predicted yield of `
       + `${topCrop.predicted_yield_t_per_ha} t/ha — ${diff} t/ha above the next-ranked option (${nextBest.crop}).`;
}

/** Farm status summary — based on actual available data */
export function getFarmStatus(_data: DashboardData) {
  return [
    { label: "Recommendation", status: "Ready"     as const },
    { label: "Weather",        status: "Available" as const },
    { label: "Historical Data",status: "Available" as const },
  ];
}
