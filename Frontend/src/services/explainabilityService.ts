/**
 * Prediction Explainability Service — Backend Integration Boundary
 *
 * This module is the single integration point for:
 *   GET /predictions/{prediction_id}/explain
 *
 * To connect the real backend:
 *   1. Remove the stub below.
 *   2. Uncomment the real fetch implementation.
 *   3. Set VITE_API_BASE_URL in your .env.
 *   4. No changes needed in PredictionExplainability component.
 */

import type { PredictionExplanation } from "../types/predictionExplainability";

// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/**
 * Fetches the model explanation for a given prediction.
 *
 * CURRENTLY: Stub — returns a rejected promise so the component shows its
 * "idle/unavailable" state cleanly, with no fake ML data displayed.
 *
 * FUTURE: Replace the throw with:
 *   const res = await fetch(`${API_BASE}/predictions/${predictionId}/explain`);
 *   if (!res.ok) throw new Error(`Explain API error: ${res.status}`);
 *   return res.json() as Promise<PredictionExplanation>;
 */
export async function fetchPredictionExplanation(
  _predictionId: string
): Promise<PredictionExplanation> {
  // ── BACKEND INTEGRATION POINT ──────────────────────────────────────────
  // Simulate network delay so loading state is visible during development.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Stub: throw so the component shows the clean "not yet available" state.
  // Replace with real fetch call above when backend is live.
  throw new Error(
    "STUB: Connect GET /predictions/{prediction_id}/explain to populate this section."
  );
}
