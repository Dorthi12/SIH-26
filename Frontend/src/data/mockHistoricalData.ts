/**
 * Centralized mock historical agricultural data.
 * Replace with backend API response when available.
 * All components must import from here — do NOT hardcode values in JSX.
 */

export interface YearlyYield {
  year: number;
  yield_t_per_ha: number;
}

export interface CropHistoricalData {
  crop: string;
  yearlyYield: YearlyYield[];
  /** Provided by backend when connected; derived from data for prototype */
  stability: "High" | "Medium" | "Low";
  trend: "Improving" | "Stable" | "Declining";
  color: string;     // chart line color
  colorLight: string; // chart fill / area color
}

// ── Mock data ──────────────────────────────────────────────────────────────

export const MOCK_HISTORICAL_DATA: CropHistoricalData[] = [
  {
    crop: "Maize",
    stability: "High",
    trend: "Improving",
    color: "#1a3d2e",
    colorLight: "rgba(26,61,46,0.12)",
    yearlyYield: [
      { year: 2021, yield_t_per_ha: 2.7 },
      { year: 2022, yield_t_per_ha: 2.9 },
      { year: 2023, yield_t_per_ha: 3.0 },
      { year: 2024, yield_t_per_ha: 3.2 },
      { year: 2025, yield_t_per_ha: 3.4 },
    ],
  },
  {
    crop: "Rice",
    stability: "High",
    trend: "Stable",
    color: "#6b8e6e",
    colorLight: "rgba(107,142,110,0.10)",
    yearlyYield: [
      { year: 2021, yield_t_per_ha: 2.8 },
      { year: 2022, yield_t_per_ha: 2.9 },
      { year: 2023, yield_t_per_ha: 3.0 },
      { year: 2024, yield_t_per_ha: 3.0 },
      { year: 2025, yield_t_per_ha: 3.1 },
    ],
  },
  {
    crop: "Soybean",
    stability: "Medium",
    trend: "Stable",
    color: "#c8922a",
    colorLight: "rgba(200,146,42,0.10)",
    yearlyYield: [
      { year: 2021, yield_t_per_ha: 2.5 },
      { year: 2022, yield_t_per_ha: 2.6 },
      { year: 2023, yield_t_per_ha: 2.7 },
      { year: 2024, yield_t_per_ha: 2.6 },
      { year: 2025, yield_t_per_ha: 2.7 },
    ],
  },
  {
    crop: "Millet",
    stability: "High",
    trend: "Improving",
    color: "#8b6b3d",
    colorLight: "rgba(139,107,61,0.10)",
    yearlyYield: [
      { year: 2021, yield_t_per_ha: 2.1 },
      { year: 2022, yield_t_per_ha: 2.2 },
      { year: 2023, yield_t_per_ha: 2.3 },
      { year: 2024, yield_t_per_ha: 2.3 },
      { year: 2025, yield_t_per_ha: 2.4 },
    ],
  },
];

// ── Utility functions (keep calculations OUT of JSX) ──────────────────────

/** Arithmetic mean of yearly yields */
export function calculateAverageYield(data: CropHistoricalData): number {
  const sum = data.yearlyYield.reduce((acc, d) => acc + d.yield_t_per_ha, 0);
  return Math.round((sum / data.yearlyYield.length) * 100) / 100;
}

/** Absolute change: latest - earliest */
export function calculateYieldChange(data: CropHistoricalData): number {
  const first = data.yearlyYield[0].yield_t_per_ha;
  const last  = data.yearlyYield[data.yearlyYield.length - 1].yield_t_per_ha;
  return Math.round((last - first) * 100) / 100;
}

/** Percentage change: ((latest - earliest) / earliest) × 100 */
export function calculateYieldChangePct(data: CropHistoricalData): number {
  const first = data.yearlyYield[0].yield_t_per_ha;
  const last  = data.yearlyYield[data.yearlyYield.length - 1].yield_t_per_ha;
  return Math.round(((last - first) / first) * 100 * 10) / 10;
}

/** Latest (most recent year) yield */
export function getLatestYield(data: CropHistoricalData): number {
  return data.yearlyYield[data.yearlyYield.length - 1].yield_t_per_ha;
}

/** Earliest (oldest year) yield */
export function getEarliestYield(data: CropHistoricalData): number {
  return data.yearlyYield[0].yield_t_per_ha;
}
