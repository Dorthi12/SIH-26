/**
 * Scenario Service — Backend Integration Boundary
 *
 * This module provides the clean integration point for the eventual
 * POST /scenario/simulate backend endpoint.
 *
 * To connect the real backend later:
 *   1. Remove the `simulateScenario` stub below.
 *   2. Uncomment (or implement) the real `simulateScenario` function.
 *   3. Update API_BASE to point at your backend.
 *   4. No changes needed in the ScenarioSimulator page component.
 */

import type {
  ScenarioSimulationRequest,
  ScenarioSimulation,
} from "../types/scenario";

// ─── Integration point ────────────────────────────────────────────────────

// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/**
 * Simulates a scenario by calling POST /scenario/simulate.
 *
 * CURRENTLY: Stub that does not call the backend.
 * Replace this implementation when the backend is ready.
 */
export async function simulateScenario(
  _request: ScenarioSimulationRequest
): Promise<ScenarioSimulation> {
  // ── BACKEND INTEGRATION POINT ──────────────────────────────────────────
  // When the backend is ready, replace this function body with:
  //
  //   const response = await fetch(`${API_BASE}/scenario/simulate`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(_request),
  //   });
  //   if (!response.ok) throw new Error(`Scenario simulation failed: ${response.status}`);
  //   return response.json() as Promise<ScenarioSimulation>;
  //
  // ──────────────────────────────────────────────────────────────────────

  // Stub: simulate network latency, return nothing meaningful.
  // The page component handles the "no result yet" state gracefully.
  await new Promise((resolve) => setTimeout(resolve, 1800));

  // Return a clearly-placeholder response — the UI's empty state handles this.
  // Do NOT invent fake ML prediction values here.
  throw new Error("STUB: Backend not connected yet. Results will appear here once POST /scenario/simulate is live.");
}
