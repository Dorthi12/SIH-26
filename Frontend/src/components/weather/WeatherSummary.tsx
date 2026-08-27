import { Badge } from "../ui/Badge";
import type { WeatherDataset } from "../../data/mockWeather";
import { cn } from "../../utils/cn";

interface WeatherSummaryProps {
  data: WeatherDataset;
}

const SUMMARY_METRICS = [
  { label: "Temperature", value: "Stable" },
  { label: "Rainfall",    value: "Moderate" },
  { label: "Humidity",    value: "Elevated" },
] as const;

const VALUE_VARIANT: Record<string, "success" | "warning" | "neutral"> = {
  Stable:   "success",
  Moderate: "warning",
  Elevated: "neutral",
};

const COMPAT_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  High: "success", Medium: "warning", Low: "danger",
};

export function WeatherSummary({ data }: WeatherSummaryProps) {
  return (
    <div className="rounded-2xl border border-ivory-300 bg-white shadow-card overflow-hidden">
      <div className="px-6 py-4 bg-ivory-100 border-b border-ivory-200">
        <p className="text-xs font-bold uppercase tracking-widest text-charcoal-muted/60">
          Weather Summary
        </p>
      </div>

      <div className="p-6 space-y-5">
        <p className="text-sm text-charcoal-muted leading-relaxed">
          Current and forecast conditions are broadly favorable for the selected crop.
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SUMMARY_METRICS.map((m) => (
            <div
              key={m.label}
              className="flex items-center justify-between sm:flex-col sm:items-start gap-2 rounded-xl border border-ivory-200 px-4 py-3"
            >
              <p className="text-xs font-semibold text-charcoal-muted/70">{m.label}</p>
              <Badge variant={VALUE_VARIANT[m.value]} size="sm">{m.value}</Badge>
            </div>
          ))}
        </div>

        {/* Overall */}
        <div className={cn(
          "flex items-center justify-between gap-4 rounded-xl border border-forest/15",
          "bg-forest/[0.03] px-5 py-3"
        )}>
          <p className="text-sm font-semibold text-charcoal">Overall Compatibility</p>
          <Badge variant={COMPAT_VARIANT[data.weather_compatibility]} size="md" dot>
            {data.weather_compatibility}
          </Badge>
        </div>
      </div>
    </div>
  );
}
