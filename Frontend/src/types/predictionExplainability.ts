/**
 * Prediction Explainability — TypeScript Types
 *
 * Corresponds to the eventual GET /predictions/{prediction_id}/explain response.
 *
 * Backend endpoint (future):
 *   GET /predictions/{prediction_id}/explain
 *
 * Response:
 *   {
 *     feature_contributions: FeatureContribution[]
 *   }
 */

// ── Core types ────────────────────────────────────────────────────────────

/** Direction of a feature's influence on the recommendation. */
export type FeatureDirection = "positive" | "negative" | "neutral";

/** One model feature contribution from the backend. */
export interface FeatureContribution {
  /** Human-readable feature label, e.g. "Rainfall", "Historical Yield" */
  feature: string;
  /**
   * Relative importance — value from the backend, typically 0–1.
   * The frontend scales this for display width; no math is performed.
   */
  importance: number;
  /** Whether the feature pushes toward or against the recommendation. */
  direction: FeatureDirection;
}

/** Full explainability payload from the backend. */
export interface PredictionExplanation {
  prediction_id: string;
  /** Feature contributions in backend-provided order (preserve for display). */
  feature_contributions: FeatureContribution[];
}

// ── UI lifecycle ──────────────────────────────────────────────────────────

export type ExplainabilityStatus =
  | "idle"       // no data loaded, waiting for backend
  | "loading"    // fetching from backend
  | "ready"      // data available
  | "error";     // fetch failed
