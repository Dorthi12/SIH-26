import type { WeatherData, WeatherForecast } from "../types/weather";

// ---------------------------------------------------------------------------
// Weather API — placeholder signatures
// All implementations will be added when the FastAPI backend is connected.
// ---------------------------------------------------------------------------

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/**
 * Fetch current weather conditions for a given district.
 */
export async function getCurrentWeather(district: string): Promise<WeatherData> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/weather/current?district=${encodeURIComponent(district)}`
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  return response.json() as Promise<WeatherData>;
}

/**
 * Fetch a multi-day weather forecast for a given district.
 */
export async function getWeatherForecast(
  district: string,
  days = 7
): Promise<WeatherForecast> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/weather/forecast?district=${encodeURIComponent(district)}&days=${days}`
  );

  if (!response.ok) {
    throw new Error(`Forecast API error: ${response.status}`);
  }

  return response.json() as Promise<WeatherForecast>;
}
