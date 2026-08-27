/**
 * District Intelligence Service — Backend Integration Boundary
 *
 * This module is the single integration point for the eventual
 * GET /districts/{district_id}/intelligence backend endpoint.
 *
 * To connect the real backend later:
 *   1. Remove the stub below.
 *   2. Uncomment the real `fetchDistrictIntelligence` implementation.
 *   3. Set API_BASE from your environment config.
 *   4. No changes needed in the DistrictIntelligence page component.
 *
 * District selector data:
 *   Also provides `fetchDistricts()` which will eventually call GET /districts.
 *   Currently returns the existing frontend DISTRICTS constant.
 */

import { DISTRICTS } from "../types/recommendationForm";
import type {
  DistrictIntelligence,
  DistrictOption,
} from "../types/districtIntelligence";

// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// ── District list ─────────────────────────────────────────────────────────

/**
 * Returns the list of selectable districts.
 *
 * CURRENTLY: Returns the frontend's existing district constant.
 * FUTURE: Replace with GET /districts
 */
export async function fetchDistricts(): Promise<DistrictOption[]> {
  // ── BACKEND INTEGRATION POINT ──────────────────────────────────────────
  // When the backend is ready, replace with:
  //   const res = await fetch(`${API_BASE}/districts`);
  //   if (!res.ok) throw new Error("Failed to load districts");
  //   return res.json() as Promise<DistrictOption[]>;
  // ──────────────────────────────────────────────────────────────────────
  return DISTRICTS.map((d) => ({
    value: d.value,
    label: d.label,
    state: d.state,
  }));
}

// ── District intelligence ─────────────────────────────────────────────────

/**
 * Fetches intelligence for a given district.
 *
 * CURRENTLY: Stub — does not call the backend.
 * FUTURE: GET /districts/{district_id}/intelligence
 */
export async function fetchDistrictIntelligence(
  _districtId: string
): Promise<DistrictIntelligence> {
  // ── BACKEND INTEGRATION POINT ──────────────────────────────────────────
  // When the backend is ready, replace with:
  //   const res = await fetch(`${API_BASE}/districts/${_districtId}/intelligence`);
  //   if (!res.ok) throw new Error(`District intelligence unavailable (${res.status})`);
  //   return res.json() as Promise<DistrictIntelligence>;
  // ──────────────────────────────────────────────────────────────────────

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1400));

  // Stub throws so the page shows its placeholder state cleanly.
  // Replace this throw with the real fetch call above when the backend is live.
  throw new Error(
    "STUB: Backend not connected yet. Connect GET /districts/{district_id}/intelligence to populate this view."
  );
}
