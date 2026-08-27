import { Droplets } from "lucide-react";
import { WeatherIcon } from "./WeatherIcon";
import type { ForecastDay } from "../../data/mockWeather";
import { cn } from "../../utils/cn";

// ── Single forecast card ──────────────────────────────────────────────────

interface ForecastCardProps {
  day: ForecastDay;
  isToday?: boolean;
}

export function ForecastCard({ day, isToday = false }: ForecastCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2.5 rounded-2xl border px-4 py-4 min-w-[100px]",
        "hover:shadow-card-hover transition-all duration-200 cursor-default",
        isToday
          ? "border-forest/20 bg-white shadow-card"
          : "border-ivory-200 bg-white/70 hover:bg-white shadow-sm"
      )}
    >
      <p className={cn(
        "text-xs font-bold whitespace-nowrap",
        isToday ? "text-forest" : "text-charcoal-muted"
      )}>
        {day.day}
      </p>

      <WeatherIcon icon={day.condition_icon} className="[&>svg]:h-7 [&>svg]:w-7" />

      <p className={cn("text-xl font-bold tabular-nums", isToday ? "text-charcoal" : "text-charcoal")}>
        {day.high_c}°
      </p>
      <p className="text-xs text-charcoal-muted/60 tabular-nums">{day.low_c}°</p>

      <div className="flex items-center gap-1">
        <Droplets className="h-3 w-3 text-blue-400 shrink-0" />
        <p className="text-xs text-charcoal-muted tabular-nums">{day.rainfall_mm} mm</p>
      </div>

      <p className="text-2xs text-charcoal-muted/50 text-center leading-tight">{day.condition}</p>
    </div>
  );
}

// ── ForecastStrip — horizontal scrollable row ─────────────────────────────

interface ForecastStripProps {
  forecast: ForecastDay[];
}

export function ForecastStrip({ forecast }: ForecastStripProps) {
  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1"
      role="list"
      aria-label="5-day weather forecast"
    >
      {forecast.map((day, i) => (
        <div key={day.day} role="listitem" className="shrink-0">
          <ForecastCard day={day} isToday={i === 0} />
        </div>
      ))}
    </div>
  );
}
