import { Check, Wheat } from "lucide-react";
import { Badge } from "../ui/Badge";
import { cn } from "../../utils/cn";
import type { WeatherDataset } from "../../data/mockWeather";

interface CropWeatherRelevanceProps {
  data: WeatherDataset;
}

const ASPECTS = [
  { label: "Temperature", value: "Favorable" },
  { label: "Rainfall",    value: "Favorable" },
  { label: "Humidity",    value: "Favorable" },
  { label: "Forecast",    value: "Favorable" },
] as const;

const COMPAT_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  High: "success", Medium: "warning", Low: "danger",
};

export function CropWeatherRelevance({ data }: CropWeatherRelevanceProps) {
  return (
    <div className="rounded-2xl border border-forest/15 bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-forest/[0.04] border-b border-forest/10 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white shrink-0">
          <Wheat className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-charcoal">
            Weather Relevance for {data.recommended_crop}
          </h3>
          <p className="text-xs text-charcoal-muted">Supporting evidence for the crop recommendation</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Overall compatibility */}
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-charcoal">Weather Compatibility:</p>
          <Badge variant={COMPAT_VARIANT[data.weather_compatibility]} size="md" dot>
            {data.weather_compatibility}
          </Badge>
        </div>

        {/* Aspect grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ASPECTS.map((a) => (
            <div
              key={a.label}
              className={cn(
                "flex flex-col items-center text-center gap-2 rounded-xl border border-forest/10",
                "bg-forest/[0.03] px-3 py-3"
              )}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-forest/10">
                <Check className="h-3.5 w-3.5 text-forest" strokeWidth={2.5} />
              </div>
              <p className="text-xs font-bold text-charcoal-light">{a.label}</p>
              <p className="text-xs font-semibold text-forest">{a.value}</p>
            </div>
          ))}
        </div>

        <p className="text-2xs text-charcoal-muted/50 border-t border-ivory-200 pt-3 leading-relaxed">
          These are illustrative values for the prototype. The backend model will provide actual crop-weather compatibility signals when connected.
        </p>
      </div>
    </div>
  );
}
