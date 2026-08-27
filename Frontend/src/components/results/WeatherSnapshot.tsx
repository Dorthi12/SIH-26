import { Droplets, CloudRain, Cloud, Sun, CloudSun } from "lucide-react";

import type { WeatherSnapshotData } from "../../data/mockRecommendation";
import { Badge } from "../ui/Badge";

interface WeatherSnapshotProps {
  data: WeatherSnapshotData;
}

const ICON_MAP = {
  sun:    <Sun className="h-5 w-5 text-amber" />,
  cloud:  <Cloud className="h-5 w-5 text-charcoal-muted" />,
  rain:   <CloudRain className="h-5 w-5 text-blue-400" />,
  partly: <CloudSun className="h-5 w-5 text-amber/80" />,
};

export function WeatherSnapshot({ data }: WeatherSnapshotProps) {
  return (
    <div className="space-y-4">
      {/* Current conditions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Main weather card */}
        <div className="flex-1 bg-white rounded-2xl border border-ivory-300 shadow-card p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60 mb-1">
                Current Conditions
              </p>
              <p className="text-2xl font-bold text-charcoal">{data.temperature_c}°C</p>
              <p className="text-sm text-charcoal-muted">{data.condition}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber/8">
              <CloudSun className="h-6 w-6 text-amber-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-ivory-200">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400 shrink-0" />
              <div>
                <p className="text-2xs text-charcoal-muted/60">Humidity</p>
                <p className="text-sm font-semibold text-charcoal">{data.humidity_percent}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-blue-400 shrink-0" />
              <div>
                <p className="text-2xs text-charcoal-muted/60">Rainfall</p>
                <p className="text-sm font-semibold text-charcoal">{data.rainfall_mm} mm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compatibility badge */}
        <div className="flex sm:flex-col items-center sm:items-stretch justify-center gap-3 sm:w-40">
          <div className="bg-white rounded-2xl border border-forest/15 shadow-card p-4 text-center space-y-2 flex-1">
            <p className="text-2xs font-bold uppercase tracking-wider text-forest/60">
              Weather Compatibility
            </p>
            <Badge variant="success" size="md" dot>High</Badge>
            <p className="text-xs text-charcoal-muted leading-snug">
              Conditions are favorable for the selected crop.
            </p>
          </div>
        </div>
      </div>

      {/* 5-day forecast strip */}
      <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60 mb-3">
          5-Day Forecast
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {data.forecast.map((day) => (
            <div
              key={day.day}
              className="flex flex-col items-center gap-2 min-w-[72px] px-2 py-3 rounded-xl border border-ivory-200 hover:border-forest/20 hover:bg-forest/[0.02] transition-colors"
            >
              <p className="text-2xs font-semibold text-charcoal-muted/70 whitespace-nowrap">{day.day}</p>
              {ICON_MAP[day.icon]}
              <p className="text-sm font-bold text-charcoal tabular-nums">{day.temp_c}°</p>
              <div className="flex items-center gap-0.5">
                <Droplets className="h-2.5 w-2.5 text-blue-400" />
                <p className="text-2xs text-charcoal-muted tabular-nums">{day.rainfall_mm}mm</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-2xs text-charcoal-muted/50 text-center">
        Weather is supporting evidence. It does not independently determine the recommendation.
      </p>
    </div>
  );
}
