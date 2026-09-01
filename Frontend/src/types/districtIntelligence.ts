/**
 * District Intelligence — Frontend Type Definitions
 *
 * These types correspond to the eventual GET /districts/{district_id}/intelligence API.
 * No fields are invented beyond what is needed for the UI.
 *
 * Backend endpoint (future):
 *   GET /districts/{district_id}/intelligence
 *
 * Response shape:
 *   DistrictIntelligence
 */

// ── Risk levels ───────────────────────────────────────────────────────────

export type WeatherRiskLevel = "Low" | "Medium" | "High";

// ── Crop-level intelligence ───────────────────────────────────────────────

/**
 * Corresponds to one element of the crops[] array in the backend response.
 */
export interface CropIntelligence {
  crop_id: string;        // stable identifier (e.g. "wheat")
  crop_name: string;      // display name (e.g. "Wheat")
  avg_suitability: number;   // 0–100
  avg_yield: number;          // t/ha
  weather_risk: WeatherRiskLevel;
}

// ── District-level intelligence ───────────────────────────────────────────

/**
 * Full intelligence payload for a district.
 * Top-level fields are derived/provided by the backend.
 */
export interface DistrictSubZone {
  name: string;
  crop: string;
  suitability: number;
  lat: number;
  lng: number;
}

export interface DistrictIntelligence {
  district_id: string;
  district_name: string;
  state?: string;
  lat?: number;
  lng?: number;
  soil_type?: string;
  climate_zone?: string;
  arable_land_acres?: number;
  sub_zones?: DistrictSubZone[];
  crops: CropIntelligence[];
  best_crop_id: string;
  avg_district_suitability: number;
  avg_district_yield: number;
  overall_risk: WeatherRiskLevel;
}

// ── District option (for the selector) ───────────────────────────────────

export interface DistrictOption {
  value: string;   // district_id
  label: string;   // district_name
  state?: string;
}

// ── UI lifecycle ──────────────────────────────────────────────────────────

export type DistrictIntelligenceStatus =
  | "idle"        // no district selected
  | "loading"     // fetching intelligence
  | "ready"       // intelligence loaded
  | "error";      // fetch failed
