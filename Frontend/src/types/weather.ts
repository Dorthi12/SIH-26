export interface WeatherCondition {
  main: string;        // e.g. "Sunny", "Cloudy", "Rainy"
  description: string;
  icon: string;
}

export interface WeatherData {
  district: string;
  temperature_c: number;
  feels_like_c: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  rainfall_mm: number;
  condition: WeatherCondition;
  recorded_at: string; // ISO datetime
}

export interface ForecastDay {
  date: string;        // ISO date
  temp_max_c: number;
  temp_min_c: number;
  humidity_percent: number;
  rainfall_mm: number;
  condition: WeatherCondition;
}

export interface WeatherForecast {
  district: string;
  days: ForecastDay[];
}
