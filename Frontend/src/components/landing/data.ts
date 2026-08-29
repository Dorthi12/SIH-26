/**
 * Landing page data — ported from agrisense-insights.
 */

export type Crop = {
  name: string;
  suitability: number;
  predictedYield: string;
  stability: "High" | "Medium" | "Low";
  trend: "Improving" | "Stable" | "Declining";
  production: string;
};

export const CROPS: Crop[] = [
  { name: "Maize",   suitability: 92, predictedYield: "3.4 t/ha", stability: "High",   trend: "Improving", production: "2.75 t" },
  { name: "Rice",    suitability: 84, predictedYield: "3.1 t/ha", stability: "High",   trend: "Stable",    production: "2.51 t" },
  { name: "Soybean", suitability: 71, predictedYield: "2.7 t/ha", stability: "Medium", trend: "Stable",    production: "2.18 t" },
  { name: "Millet",  suitability: 64, predictedYield: "2.3 t/ha", stability: "Medium", trend: "Stable",    production: "1.86 t" },
];

export const FORECAST = [
  { day: "Today",    temp: 28, rain: 18, kind: "rain"    as const },
  { day: "Tomorrow", temp: 29, rain: 12, kind: "showers" as const },
  { day: "+2 days",  temp: 30, rain: 6,  kind: "cloud"   as const },
  { day: "+3 days",  temp: 31, rain: 2,  kind: "sun"     as const },
  { day: "+4 days",  temp: 30, rain: 9,  kind: "showers" as const },
];

export const HISTORY = [
  { year: "2021", yieldValue: 2.6 },
  { year: "2022", yieldValue: 2.75 },
  { year: "2023", yieldValue: 2.9 },
  { year: "2024", yieldValue: 3.15 },
  { year: "2025", yieldValue: 3.3 },
];

export const DISTRICTS = [
  "Prayagraj, Uttar Pradesh",
  "Nashik, Maharashtra",
  "Ludhiana, Punjab",
  "Guntur, Andhra Pradesh",
  "Indore, Madhya Pradesh",
];

export const SEASONS = ["Kharif", "Rabi", "Zaid"];
