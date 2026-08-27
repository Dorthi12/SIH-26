import { Thermometer, Droplets, Wind, CloudRain, CheckCircle2 } from "lucide-react";
import { WeatherIcon } from "./WeatherIcon";
import { Badge } from "../ui/Badge";
import type { WeatherDataset } from "../../data/mockWeather";

interface CurrentWeatherCardProps {
  data: WeatherDataset;
}

export function CurrentWeatherCard({ data }: CurrentWeatherCardProps) {
  const { current, location, recommended_crop, weather_compatibility } = data;

  const compatVariant: Record<string, "success" | "warning" | "danger"> = {
    High: "success", Medium: "warning", Low: "danger",
  };

  return (
    <div className="rounded-2xl border border-ivory-300 bg-white shadow-card overflow-hidden">
      <div className="grid lg:grid-cols-[1fr_auto] divide-y lg:divide-y-0 lg:divide-x divide-ivory-200">

        {/* ── Left: main weather info ── */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Location */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-charcoal-muted/60 mb-1">
              Current Conditions
            </p>
            <p className="text-sm font-semibold text-charcoal-light">{location}</p>
          </div>

          {/* Temp + icon row */}
          <div className="flex items-end gap-6">
            <div>
              <p className="text-6xl sm:text-7xl font-bold text-charcoal tabular-nums leading-none">
                {current.temperature_c}°
              </p>
              <p className="text-base font-medium text-charcoal-muted mt-1">{current.condition}</p>
            </div>
            <div className="mb-2">
              <WeatherIcon icon={current.condition_icon} className="[&>svg]:h-16 [&>svg]:w-16 opacity-80" />
            </div>
          </div>

          {/* Metric strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-ivory-200">
            {[
              { icon: <Thermometer className="h-4 w-4" />, label: "Feels like", value: `${current.feels_like_c}°C` },
              { icon: <Droplets className="h-4 w-4" />,    label: "Humidity",   value: `${current.humidity_percent}%` },
              { icon: <CloudRain className="h-4 w-4" />,   label: "Rainfall",   value: `${current.rainfall_mm} mm` },
              { icon: <Wind className="h-4 w-4" />,        label: "Wind",       value: `${current.wind_kmh} km/h` },
            ].map((m) => (
              <div key={m.label} className="flex items-start gap-2">
                <span className="text-forest/50 mt-0.5 shrink-0">{m.icon}</span>
                <div>
                  <p className="text-2xs text-charcoal-muted/60 uppercase tracking-wide font-semibold">{m.label}</p>
                  <p className="text-sm font-bold text-charcoal tabular-nums">{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: compatibility panel ── */}
        <div className="p-6 lg:w-60 xl:w-72 flex flex-col justify-between gap-4 bg-forest/[0.02]">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-forest/60">
              Weather Compatibility
            </p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-forest" />
              <Badge variant={compatVariant[weather_compatibility]} size="md" dot>
                {weather_compatibility}
              </Badge>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Current conditions are broadly favorable for{" "}
              <strong className="text-charcoal">{recommended_crop}</strong>.
            </p>
            <p className="text-2xs text-charcoal-muted/50 leading-snug">
              Weather compatibility is supporting evidence for the crop recommendation — not a standalone signal.
            </p>
          </div>

          {/* Season badge */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral" size="sm">{data.season}</Badge>
            <Badge variant="default" size="sm">{recommended_crop}</Badge>
          </div>
        </div>

      </div>
    </div>
  );
}
