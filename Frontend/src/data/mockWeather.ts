/**
 * Centralized mock weather data.
 * Replace with a real weather API / FastAPI response later.
 * All components should import from this file — do NOT hardcode values in JSX.
 */

export interface CurrentWeather {
  temperature_c: number;
  feels_like_c: number;
  humidity_percent: number;
  rainfall_mm: number;
  wind_kmh: number;
  condition: string;
  condition_icon: "sun" | "partly" | "cloud" | "rain" | "storm";
}

export interface ForecastDay {
  day: string;          // "Today", "Tomorrow", "+2 Days", …
  high_c: number;
  low_c: number;
  rainfall_mm: number;
  condition: string;
  condition_icon: "sun" | "partly" | "cloud" | "rain" | "storm";
}

export interface WeatherDataset {
  location: string;
  season: string;
  recommended_crop: string;
  weather_compatibility: "High" | "Medium" | "Low";
  current: CurrentWeather;
  forecast: ForecastDay[];
}

// ── Mock values ───────────────────────────────────────────────────────────

export const MOCK_WEATHER_DATA: WeatherDataset = {
  location: "Prayagraj, Uttar Pradesh",
  season: "Kharif",
  recommended_crop: "Maize",
  weather_compatibility: "High",

  current: {
    temperature_c: 28,
    feels_like_c: 30,
    humidity_percent: 72,
    rainfall_mm: 18,
    wind_kmh: 14,
    condition: "Partly Cloudy",
    condition_icon: "partly",
  },

  forecast: [
    { day: "Today",    high_c: 28, low_c: 22, rainfall_mm: 18, condition: "Partly Cloudy", condition_icon: "partly" },
    { day: "Tomorrow", high_c: 29, low_c: 23, rainfall_mm: 12, condition: "Cloudy",        condition_icon: "cloud"  },
    { day: "+2 Days",  high_c: 30, low_c: 24, rainfall_mm:  8, condition: "Partly Cloudy", condition_icon: "partly" },
    { day: "+3 Days",  high_c: 29, low_c: 23, rainfall_mm:  5, condition: "Sunny",         condition_icon: "sun"    },
    { day: "+4 Days",  high_c: 28, low_c: 22, rainfall_mm: 10, condition: "Cloudy",        condition_icon: "cloud"  },
  ],
};

// Convenience derived arrays for charts
export const TEMP_SERIES = MOCK_WEATHER_DATA.forecast.map((d) => ({
  label: d.day,
  value: d.high_c,
}));

export const RAINFALL_SERIES = MOCK_WEATHER_DATA.forecast.map((d) => ({
  label: d.day,
  value: d.rainfall_mm,
}));
