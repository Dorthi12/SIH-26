/**
 * Centralized explanation data structure for /explain.
 * Reuses existing mock data — does NOT duplicate crop values.
 */

import { MOCK_RANKINGS, MOCK_TOP_CROP } from "./mockRecommendation";
import { MOCK_HISTORICAL_DATA } from "./mockHistoricalData";
import { MOCK_WEATHER_DATA } from "./mockWeather";

// ── Re-export for convenience ─────────────────────────────────────────────

export { MOCK_RANKINGS, MOCK_TOP_CROP, MOCK_HISTORICAL_DATA, MOCK_WEATHER_DATA };

// ── Explanation structure ─────────────────────────────────────────────────

export const EXPLANATION_CONTEXT = {
  district:   "Prayagraj, Uttar Pradesh",
  season:     "Kharif",
  acres:      2.5,
  recommended: MOCK_TOP_CROP.crop,        // "Maize"
} as const;

/**
 * The suitability score in MOCK_TOP_CROP is set to 92 — an illustrative
 * MVP value defined in the mock data. The min-max normalisation formula
 * (100 × (3.4 − 2.4) / (3.4 − 2.4) = 100) produces a different result,
 * so we display 92 as the illustrative demo score and note that the
 * backend scoring formula will provide the production value.
 */
export const SCORE_EXPLANATION = {
  illustrative: true,
  score: MOCK_TOP_CROP.suitability_score,
  topYield: MOCK_TOP_CROP.predicted_yield_t_per_ha,
  minYield: Math.min(...MOCK_RANKINGS.map((c) => c.predicted_yield_t_per_ha)),
  maxYield: Math.max(...MOCK_RANKINGS.map((c) => c.predicted_yield_t_per_ha)),
} as const;

// Sorted candidate crops for ranking visualization
export const SORTED_RANKINGS = [...MOCK_RANKINGS].sort((a, b) => a.rank - b.rank);

// Historical data for the recommended crop
export const TOP_CROP_HISTORY = MOCK_HISTORICAL_DATA.find(
  (c) => c.crop === MOCK_TOP_CROP.crop
)!;

// Second-best crop for head-to-head
export const SECOND_CROP = SORTED_RANKINGS[1];
export const SECOND_CROP_HISTORY = MOCK_HISTORICAL_DATA.find(
  (c) => c.crop === SECOND_CROP.crop
)!;
