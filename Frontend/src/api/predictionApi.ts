import type { FarmerInput } from "../types/farmer";
import type { CropRecommendation } from "../types/recommendation";

// ---------------------------------------------------------------------------
// Prediction API — placeholder signatures
// All implementations will be added when the FastAPI backend is connected.
// ---------------------------------------------------------------------------

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/**
 * Submit farmer input and retrieve ranked crop recommendations from the backend.
 */
export async function getPrediction(
  input: FarmerInput
): Promise<CropRecommendation[]> {
  // TODO: replace with real fetch when FastAPI backend is ready
  const response = await fetch(`${API_BASE_URL}/api/v1/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Prediction API error: ${response.status}`);
  }

  return response.json() as Promise<CropRecommendation[]>;
}
