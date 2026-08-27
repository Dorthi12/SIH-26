/**
 * Form state for the multi-step recommendation wizard.
 * Extends FarmerInput with optional context fields.
 * Optional fields are clearly labeled and are NOT yet consumed by the backend.
 */

export type AreaUnit = "acres" | "hectares";

export interface RecommendationFormData {
  // Step 1
  district: string;
  state: string;
  // Step 2
  area: string;           // raw string input
  areaUnit: AreaUnit;
  // Step 3
  season: "Kharif" | "Rabi" | "Zaid" | "";
  // Step 4 — optional context
  irrigation: "Rain-fed" | "Irrigated" | "Mixed" | "";
  previousCrop: "Rice" | "Wheat" | "Maize" | "Other" | "";
}

export const EMPTY_FORM: RecommendationFormData = {
  district: "",
  state: "Uttar Pradesh",
  area: "",
  areaUnit: "acres",
  season: "",
  irrigation: "",
  previousCrop: "",
};

/** 1 hectare = 2.471 acres */
export function toAcres(value: string, unit: AreaUnit): number {
  const n = parseFloat(value);
  if (!n || n <= 0) return 0;
  return unit === "hectares" ? n * 2.471 : n;
}

export function convertArea(value: string, from: AreaUnit, to: AreaUnit): string {
  const n = parseFloat(value);
  if (!n || n <= 0) return value;
  if (from === to) return value;
  const result = from === "acres" ? n / 2.471 : n * 2.471;
  return parseFloat(result.toFixed(2)).toString();
}

/** Step completion — required fields only */
export function getCompletionFlags(form: RecommendationFormData) {
  return {
    location: form.district !== "" && form.state !== "",
    area:     form.area !== "" && parseFloat(form.area) > 0,
    season:   form.season !== "",
    optional: form.irrigation !== "" || form.previousCrop !== "",
  };
}

export function countCompleted(form: RecommendationFormData): number {
  const { location, area, season } = getCompletionFlags(form);
  return [location, area, season].filter(Boolean).length;
}

export const REQUIRED_TOTAL = 3;

export const DISTRICTS = [
  { value: "Prayagraj",    label: "Prayagraj",    state: "Uttar Pradesh" },
  { value: "Varanasi",     label: "Varanasi",     state: "Uttar Pradesh" },
  { value: "Lucknow",      label: "Lucknow",      state: "Uttar Pradesh" },
  { value: "Kanpur Nagar", label: "Kanpur Nagar", state: "Uttar Pradesh" },
  { value: "Gorakhpur",    label: "Gorakhpur",    state: "Uttar Pradesh" },
  { value: "Agra",         label: "Agra",         state: "Uttar Pradesh" },
  { value: "Meerut",       label: "Meerut",       state: "Uttar Pradesh" },
  { value: "Allahabad",    label: "Allahabad",    state: "Uttar Pradesh" },
  { value: "Mathura",      label: "Mathura",      state: "Uttar Pradesh" },
  { value: "Aligarh",      label: "Aligarh",      state: "Uttar Pradesh" },
  { value: "Azamgarh",     label: "Azamgarh",     state: "Uttar Pradesh" },
  { value: "Bareilly",     label: "Bareilly",     state: "Uttar Pradesh" },
];
