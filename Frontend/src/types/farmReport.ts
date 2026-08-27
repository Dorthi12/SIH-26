/**
 * Farm Decision Report — Frontend Types
 *
 * Corresponds to the eventual POST /reports/generate and GET /reports/{report_id} endpoints.
 *
 * Backend endpoints (future):
 *   POST /reports/generate  → { prediction_id, format }
 *   GET  /reports/{report_id}
 */

// ── Format ───────────────────────────────────────────────────────────────

export type ReportFormat = "pdf" | "html" | "json";

// ── Request / Response shapes ─────────────────────────────────────────────

/** Body for POST /reports/generate */
export interface ReportGenerationRequest {
  prediction_id: string;
  format: ReportFormat;
}

/** Response from POST /reports/generate */
export interface ReportGenerationResponse {
  report_id: string;
  status: "queued" | "processing" | "ready" | "failed";
  /** Available once status === "ready" */
  download_url?: string;
  created_at: string;
}

// ── UI lifecycle ──────────────────────────────────────────────────────────

export type ReportModalStep =
  | "preview"    // previewing what will be generated, choosing format
  | "generating" // POST in progress (simulated)
  | "ready"      // success state showing report details
  | "error";     // generation failed

// ── Report data used for the preview ─────────────────────────────────────
/**
 * All fields come from the existing Results page data.
 * Nothing is invented — only data the frontend already has.
 */
export interface ReportPreviewData {
  // Farm context
  district: string;
  season: string;
  land_area_acres: number;
  // Top recommendation
  crop: string;
  suitability_score: number;
  predicted_yield_t_per_ha: number;
  estimated_production_tonnes: number;
  weather_compatibility: string;
  historical_stability: string;
  yield_trend: string;
  // Generation metadata
  generated_at: string;   // ISO string
}
