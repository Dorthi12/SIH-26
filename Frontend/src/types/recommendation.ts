export type StabilityLevel = "High" | "Medium" | "Low";
export type CompatibilityLevel = "High" | "Medium" | "Low";
export type YieldTrend = "Improving" | "Stable" | "Declining";

export interface CropRecommendation {
  crop: string;
  rank: number;
  suitability_score: number; // 0–100
  predicted_yield_t_per_ha: number;
  estimated_production_tonnes: number;
  historical_stability: StabilityLevel;
  weather_compatibility: CompatibilityLevel;
  yield_trend: YieldTrend;
}

export type RecommendationStatus = "idle" | "loading" | "success" | "error";

export interface RecommendationSession {
  farmerInput: import("./farmer").FarmerInput | null;
  recommendations: CropRecommendation[];
  status: RecommendationStatus;
  error: string | null;
  requestedAt: string | null;
}
