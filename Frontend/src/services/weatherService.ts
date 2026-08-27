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
  data:           WeatherDataset;
  tempSeries:     ChartPoint[];
  rainfallSeries: ChartPoint[];
  fetchedAt:      string;   // ISO timestamp — show "as of" to user
}

export type WeatherLoadState = "idle" | "loading" | "ready" | "error";

// ── Service implementation ─────────────────────────────────────────────────

/**
 * Retrieve weather data for the current farm context.
 *
 * @param _location  Farm location — currently unused (mock data is fixed).
 *                   When backend is connected, this will become a query param.
 *
 * TODO: Replace the mock return with:
 *   const res = await fetch(`/api/v1/weather?location=${encodeURIComponent(_location)}`);
 *   const json = await res.json();
 *   return mapApiResponseToWeatherServiceResult(json);
 */
export async function getWeatherData(
  _location?: string
): Promise<WeatherServiceResult> {
  // Simulated minimal async boundary — preserves async contract for future API.
  // Do NOT add artificial delays; the async boundary itself is the contract.
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
