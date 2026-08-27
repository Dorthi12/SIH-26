/**
 * Scenario Simulator — Frontend Type Definitions
 *
 * These types correspond to the eventual POST /scenario/simulate API.
 * No fields are invented beyond what is needed for the UI.
 *
 * Request shape:
 *   POST /scenario/simulate
 *   { base_prediction_id, rainfall_delta_pct?, temperature_delta_c? }
 *
 * Response shape:
 *   ScenarioSimulation
 */

// ── Request ───────────────────────────────────────────────────────────────

export interface ScenarioSimulationRequest {
  /** ID of the base crop prediction being explored */
  base_prediction_id: string;
  /** Rainfall change as a percentage (e.g. -10 = −10%) */
  rainfall_delta_pct?: number;
  /** Temperature change in degrees Celsius (e.g. +2 = +2 °C) */
  temperature_delta_c?: number;
}

// ── Response ──────────────────────────────────────────────────────────────

export interface ScenarioSimulation {
  /** The original (baseline) prediction data */
  base: ScenarioSnapshot;
  /** The simulated prediction under the adjusted conditions */
  scenario: ScenarioSnapshot;
  /** Derived deltas for display */
  deltas: ScenarioDeltas;
}

export interface ScenarioSnapshot {
  predicted_yield_t_per_ha: number;
  suitability_score: number; // 0–100
  risk_level: "Low" | "Medium" | "High";
}

export interface ScenarioDeltas {
  yield_delta_t_per_ha: number;
  yield_delta_pct: number;
  suitability_delta: number;      // points, e.g. -6
  risk_changed: boolean;
}

// ── Base prediction that seeds the simulator ──────────────────────────────

/** Represents the crop prediction the user is currently exploring. */
export interface BasePrediction {
  id: string;
  crop: string;
  district: string;
  season: string;
  predicted_yield_t_per_ha: number;
  suitability_score: number; // 0–100
}

// ── UI-only state ─────────────────────────────────────────────────────────

export type SimulatorStatus = "idle" | "loading" | "result";

export interface ScenarioControls {
  rainfall_delta_pct: number;    // –20 … +20
  temperature_delta_c: number;   // –5 … +5
}
