/**
 * District Intelligence Service — Backend Integration Boundary & Mock Data Provider
 */

import { DISTRICTS } from "../types/recommendationForm";
import type {
  DistrictIntelligence,
  DistrictOption,
  CropIntelligence,
  WeatherRiskLevel,
} from "../types/districtIntelligence";

// District metadata with coordinates, soil types, and climate zones
export const DETAILED_DISTRICTS: (DistrictOption & {
  lat: number;
  lng: number;
  soil_type: string;
  climate_zone: string;
  arable_land_acres: number;
  best_crop: string;
  crops: { id: string; name: string; name_hi: string; suitability: number; yield: number; risk: WeatherRiskLevel }[];
})[] = [
  {
    value: "prayagraj",
    label: "Prayagraj",
    state: "Uttar Pradesh",
    lat: 25.4358,
    lng: 81.8463,
    soil_type: "Alluvial Clay & Silt",
    climate_zone: "Humid Subtropical (Ganga-Yamuna Doab)",
    arable_land_acres: 154000,
    best_crop: "maize",
    crops: [
      { id: "maize", name: "Maize", name_hi: "मक्का", suitability: 94, yield: 3.4, risk: "Low" },
      { id: "wheat", name: "Wheat", name_hi: "गेहूं", suitability: 90, yield: 3.8, risk: "Low" },
      { id: "rice", name: "Paddy Rice", name_hi: "धान / चावल", suitability: 86, yield: 3.1, risk: "Medium" },
      { id: "mustard", name: "Mustard", name_hi: "सरसों", suitability: 78, yield: 1.9, risk: "Low" },
      { id: "pulses", name: "Pulses / Gram", name_hi: "दालें / चना", suitability: 72, yield: 1.4, risk: "Low" },
    ],
  },
  {
    value: "varanasi",
    label: "Varanasi",
    state: "Uttar Pradesh",
    lat: 25.3176,
    lng: 82.9739,
    soil_type: "Deep Ganga Alluvial",
    climate_zone: "Humid Subtropical Lowland",
    arable_land_acres: 112000,
    best_crop: "rice",
    crops: [
      { id: "rice", name: "Paddy Rice", name_hi: "धान / चावल", suitability: 95, yield: 3.5, risk: "Low" },
      { id: "wheat", name: "Wheat", name_hi: "गेहूं", suitability: 88, yield: 3.6, risk: "Low" },
      { id: "vegetables", name: "Vegetables", name_hi: "सब्जियां", suitability: 85, yield: 8.2, risk: "Medium" },
      { id: "maize", name: "Maize", name_hi: "मक्का", suitability: 80, yield: 3.1, risk: "Low" },
      { id: "mustard", name: "Mustard", name_hi: "सरसों", suitability: 74, yield: 1.7, risk: "Medium" },
    ],
  },
  {
    value: "lucknow",
    label: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8467,
    lng: 80.9462,
    soil_type: "Gomti Alluvial Loam",
    climate_zone: "Central UP Subtropical",
    arable_land_acres: 135000,
    best_crop: "sugarcane",
    crops: [
      { id: "sugarcane", name: "Sugarcane", name_hi: "गन्ना", suitability: 92, yield: 68.0, risk: "Low" },
      { id: "wheat", name: "Wheat", name_hi: "गेहूं", suitability: 89, yield: 3.7, risk: "Low" },
      { id: "rice", name: "Paddy Rice", name_hi: "धान / चावल", suitability: 84, yield: 3.0, risk: "Medium" },
      { id: "mustard", name: "Mustard", name_hi: "सरसों", suitability: 81, yield: 1.8, risk: "Low" },
      { id: "maize", name: "Maize", name_hi: "मक्का", suitability: 76, yield: 2.9, risk: "Medium" },
    ],
  },
  {
    value: "kanpur",
    label: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4499,
    lng: 80.3319,
    soil_type: "Heavy Sandy Clay Loam",
    climate_zone: "Central Ganga Basin",
    arable_land_acres: 148000,
    best_crop: "wheat",
    crops: [
      { id: "wheat", name: "Wheat", name_hi: "गेहूं", suitability: 93, yield: 3.9, risk: "Low" },
      { id: "maize", name: "Maize", name_hi: "मक्का", suitability: 87, yield: 3.2, risk: "Low" },
      { id: "mustard", name: "Mustard", name_hi: "सरसों", suitability: 82, yield: 2.0, risk: "Medium" },
      { id: "rice", name: "Paddy Rice", name_hi: "धान / चावल", suitability: 79, yield: 2.8, risk: "High" },
      { id: "pulses", name: "Pulses", name_hi: "दालें", suitability: 75, yield: 1.3, risk: "Low" },
    ],
  },
  {
    value: "agra",
    label: "Agra",
    state: "Uttar Pradesh",
    lat: 27.1767,
    lng: 78.0081,
    soil_type: "Yamuna Alluvial & Calcareous",
    climate_zone: "Semi-Arid Western UP",
    arable_land_acres: 160000,
    best_crop: "mustard",
    crops: [
      { id: "mustard", name: "Mustard", name_hi: "सरसों", suitability: 96, yield: 2.2, risk: "Low" },
      { id: "potato", name: "Potato", name_hi: "आलू", suitability: 91, yield: 24.5, risk: "Low" },
      { id: "wheat", name: "Wheat", name_hi: "गेहूं", suitability: 88, yield: 3.5, risk: "Low" },
      { id: "millet", name: "Pearl Millet (Bajra)", name_hi: "बाजरा", suitability: 84, yield: 2.6, risk: "Low" },
      { id: "pulses", name: "Gram / Chickpea", name_hi: "चना", suitability: 77, yield: 1.5, risk: "Medium" },
    ],
  },
  {
    value: "gorakhpur",
    label: "Gorakhpur",
    state: "Uttar Pradesh",
    lat: 26.7606,
    lng: 83.3732,
    soil_type: "Terai Alluvial & Silt",
    climate_zone: "Subtropical High Rainfall",
    arable_land_acres: 172000,
    best_crop: "rice",
    crops: [
      { id: "rice", name: "Paddy Rice", name_hi: "धान / चावल", suitability: 97, yield: 3.8, risk: "Low" },
      { id: "sugarcane", name: "Sugarcane", name_hi: "गन्ना", suitability: 91, yield: 65.0, risk: "Low" },
      { id: "wheat", name: "Wheat", name_hi: "गेहूं", suitability: 86, yield: 3.4, risk: "Medium" },
      { id: "maize", name: "Maize", name_hi: "मक्का", suitability: 80, yield: 2.9, risk: "Medium" },
    ],
  },
  {
    value: "jhansi",
    label: "Jhansi",
    state: "Uttar Pradesh",
    lat: 25.4484,
    lng: 78.5685,
    soil_type: "Bundelkhand Black & Mixed Red",
    climate_zone: "Semi-Arid Plateau",
    arable_land_acres: 185000,
    best_crop: "pulses",
    crops: [
      { id: "pulses", name: "Pulses / Gram", name_hi: "दालें / चना", suitability: 93, yield: 1.6, risk: "Low" },
      { id: "soybean", name: "Soybean", name_hi: "सोयाबीन", suitability: 88, yield: 2.5, risk: "Medium" },
      { id: "mustard", name: "Mustard", name_hi: "सरसों", suitability: 83, yield: 1.8, risk: "Low" },
      { id: "wheat", name: "Wheat", name_hi: "गेहूं", suitability: 75, yield: 2.8, risk: "High" },
    ],
  },
  {
    value: "bareilly",
    label: "Bareilly",
    state: "Uttar Pradesh",
    lat: 28.3670,
    lng: 79.4304,
    soil_type: "Rohilkhand Sandy Loam",
    climate_zone: "Subtropical Foothill Plain",
    arable_land_acres: 142000,
    best_crop: "wheat",
    crops: [
      { id: "wheat", name: "Wheat", name_hi: "गेहूं", suitability: 94, yield: 4.1, risk: "Low" },
      { id: "sugarcane", name: "Sugarcane", name_hi: "गन्ना", suitability: 89, yield: 64.0, risk: "Low" },
      { id: "rice", name: "Paddy Rice", name_hi: "धान / चावल", suitability: 85, yield: 3.2, risk: "Medium" },
      { id: "mustard", name: "Mustard", name_hi: "सरसों", suitability: 81, yield: 1.9, risk: "Low" },
    ],
  },
];

export async function fetchDistricts(): Promise<DistrictOption[]> {
  return DETAILED_DISTRICTS.map((d) => ({
    value: d.value,
    label: d.label,
    state: d.state,
    lat: d.lat,
    lng: d.lng,
    soil_type: d.soil_type,
    climate_zone: d.climate_zone,
  }));
}

export async function fetchDistrictIntelligence(
  districtId: string
): Promise<DistrictIntelligence> {
  // Simulate network fetch delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const found = DETAILED_DISTRICTS.find(
    (d) => d.value.toLowerCase() === districtId.toLowerCase()
  );

  const meta = found ?? {
    value: districtId,
    label: districtId.charAt(0).toUpperCase() + districtId.slice(1),
    state: "Uttar Pradesh",
    lat: 26.5000,
    lng: 81.0000,
    soil_type: "Alluvial Loam",
    climate_zone: "Subtropical Basin",
    arable_land_acres: 130000,
    best_crop: "wheat",
    crops: [
      { id: "wheat", name: "Wheat", name_hi: "गेहूं", suitability: 90, yield: 3.5, risk: "Low" as WeatherRiskLevel },
      { id: "rice", name: "Paddy Rice", name_hi: "धान / चावल", suitability: 84, yield: 3.0, risk: "Medium" as WeatherRiskLevel },
      { id: "maize", name: "Maize", name_hi: "मक्का", suitability: 81, yield: 3.1, risk: "Low" as WeatherRiskLevel },
      { id: "mustard", name: "Mustard", name_hi: "सरसों", suitability: 75, yield: 1.8, risk: "Low" as WeatherRiskLevel },
    ],
  };

  const cropIntell: CropIntelligence[] = meta.crops.map((c) => ({
    crop_id: c.id,
    crop_name: c.name,
    avg_suitability: c.suitability,
    avg_yield: c.yield,
    weather_risk: c.risk,
  }));

  const avgSuitability = Math.round(
    cropIntell.reduce((acc, c) => acc + c.avg_suitability, 0) / cropIntell.length
  );
  const avgYield = Number(
    (cropIntell.reduce((acc, c) => acc + c.avg_yield, 0) / cropIntell.length).toFixed(1)
  );

  const hasHighRisk = cropIntell.some((c) => c.weather_risk === "High");
  const hasMedRisk = cropIntell.some((c) => c.weather_risk === "Medium");
  const overallRisk: WeatherRiskLevel = hasHighRisk ? "High" : hasMedRisk ? "Medium" : "Low";

  return {
    district_id: meta.value,
    district_name: meta.label,
    state: meta.state,
    lat: meta.lat,
    lng: meta.lng,
    soil_type: meta.soil_type,
    climate_zone: meta.climate_zone,
    arable_land_acres: meta.arable_land_acres,
    sub_zones: [
      { name: "North Plain Zone", crop: meta.crops[0]?.name ?? "Wheat", suitability: meta.crops[0]?.suitability ?? 90, lat: meta.lat + 0.12, lng: meta.lng - 0.08 },
      { name: "Central Riverine Basin", crop: meta.crops[1]?.name ?? "Rice", suitability: meta.crops[1]?.suitability ?? 85, lat: meta.lat - 0.05, lng: meta.lng + 0.10 },
      { name: "Southern Belt", crop: meta.crops[2]?.name ?? "Maize", suitability: meta.crops[2]?.suitability ?? 80, lat: meta.lat - 0.14, lng: meta.lng - 0.12 },
    ],
    crops: cropIntell,
    best_crop_id: meta.best_crop,
    avg_district_suitability: avgSuitability,
    avg_district_yield: avgYield,
    overall_risk: overallRisk,
  };
}
