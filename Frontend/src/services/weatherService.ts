/**
 * weatherService.ts
 *
 * Weather data abstraction layer.
 * The UI must import weather data through this service — NOT from mockWeather.ts directly.
 *
 * Current state: returns mock data synchronously.
 *
 * When the backend is connected, replace the implementation of getWeatherData()
 * to fetch from the FastAPI /weather endpoint. The interface (WeatherServiceResult)
 * and all component signatures remain unchanged.
 */

import { apiRequest } from "../utils/api";
import {
  MOCK_WEATHER_DATA,
  TEMP_SERIES,
  RAINFALL_SERIES,
  type WeatherDataset,
} from "../data/mockWeather";

// ── Types ─────────────────────────────────────────────────────────────────

export interface ChartPoint {
  label: string;
  value: number;
}

export interface WeatherServiceResult {
  data:           WeatherDataset & {
                    isPrecise?: boolean;
                    alert?: { title: string; description: string };
                  };
  tempSeries:     ChartPoint[];
  rainfallSeries: ChartPoint[];
  fetchedAt:      string;   // ISO timestamp — show "as of" to user
}

export type WeatherLoadState = "idle" | "loading" | "ready" | "error";

// ── Service implementation ─────────────────────────────────────────────────

/**
 * Retrieve weather data from the open backend endpoint.
 *
 * @param lat Optional precise latitude
 * @param lon Optional precise longitude
 */
export async function getWeatherData(
  lat?: number,
  lon?: number
): Promise<WeatherServiceResult> {
  try {
    const query = (lat !== undefined && lon !== undefined)
      ? `?lat=${lat}&lon=${lon}`
      : "";
    const res = await apiRequest<{ success: boolean; data: any }>(`/weather${query}`);

    if (res && res.success && res.data) {
      const apiData = res.data;
      const forecast = apiData.forecast || MOCK_WEATHER_DATA.forecast;

      const tempSeries: ChartPoint[] = forecast.map((d: any) => ({
        label: d.day,
        value: d.high_c,
      }));

      const rainfallSeries: ChartPoint[] = forecast.map((d: any) => ({
        label: d.day,
        value: d.rainfall_mm,
      }));

      return {
        data: apiData,
        tempSeries,
        rainfallSeries,
        fetchedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.warn("Failed to fetch live weather from backend endpoint, using fallback data:", error);
  }

  // Fallback to mock data if backend request fails
  return {
    data:           MOCK_WEATHER_DATA,
    tempSeries:     TEMP_SERIES,
    rainfallSeries: RAINFALL_SERIES,
    fetchedAt:      new Date().toISOString(),
  };
}

/**
 * Derive a human-readable "as of" string from an ISO timestamp.
 * Example: "09:14 AM"
 */
export function formatFetchedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour:   "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}
