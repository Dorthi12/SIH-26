import { WeatherIcon } from "./WeatherIcon";
import type { ForecastDay } from "../../data/mockWeather";
import { cn } from "../../utils/cn";

interface WeatherTimelineProps {
  forecast: ForecastDay[];
}

export function WeatherTimeline({ forecast }: WeatherTimelineProps) {
  return (
    <>
      {/* Desktop — horizontal */}
      <div className="hidden sm:flex items-stretch gap-0 overflow-x-auto pb-1" aria-label="Weather timeline">
        {forecast.map((day, i) => (
          <div key={day.day} className="flex items-center shrink-0">
            {/* Node */}
            <div className="flex flex-col items-center gap-2 px-4 py-1 min-w-[96px]">
              <p className={cn(
                "text-xs font-bold",
                i === 0 ? "text-forest" : "text-charcoal-muted"
              )}>
                {day.day}
              </p>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-ivory-300 shadow-sm">
                <WeatherIcon icon={day.condition_icon} className="[&>svg]:h-5 [&>svg]:w-5" />
              </div>
              <p className="text-base font-bold text-charcoal tabular-nums">{day.high_c}°C</p>
              <p className="text-2xs text-charcoal-muted/60 text-center leading-tight">{day.condition}</p>
            </div>

            {/* Connector */}
            {i < forecast.length - 1 && (
              <div className="flex-1 h-px min-w-[24px] bg-forest/15 shrink-0" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      {/* Mobile — vertical */}
      <div className="sm:hidden space-y-0" aria-label="Weather timeline">
        {forecast.map((day, i) => (
          <div key={day.day} className="flex gap-4">
            {/* Left: dot + line */}
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-ivory-300 shadow-sm">
                <WeatherIcon icon={day.condition_icon} className="[&>svg]:h-4 [&>svg]:w-4" />
              </div>
              {i < forecast.length - 1 && (
                <div className="w-px flex-1 min-h-[24px] bg-forest/15 my-1" />
              )}
            </div>

            {/* Right: content */}
            <div className="pb-4 flex items-start gap-4">
              <div>
                <p className={cn(
                  "text-xs font-bold mb-0.5",
                  i === 0 ? "text-forest" : "text-charcoal-muted"
                )}>
                  {day.day}
                </p>
                <p className="text-base font-bold text-charcoal tabular-nums">{day.high_c}°C</p>
              </div>
              <p className="text-xs text-charcoal-muted mt-0.5">{day.condition}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
