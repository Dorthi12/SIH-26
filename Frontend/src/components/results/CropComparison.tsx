import { cn } from "../../utils/cn";
import type { CropRecommendation } from "../../types/recommendation";
import { CropScoreBar } from "./CropScoreBar";
import { Badge } from "../ui/Badge";

interface CropComparisonProps {
  rankings: CropRecommendation[];
}

const LEVEL_VARIANT: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  High:      "success",
  Medium:    "warning",
  Low:       "danger",
  Improving: "success",
  Stable:    "neutral",
  Declining: "danger",
};

export function CropComparison({ rankings }: CropComparisonProps) {
  return (
    <div className="space-y-6">
      {/* Score bars */}
      <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60 mb-4">
          Suitability Scores
        </p>
        {rankings.map((crop) => (
          <CropScoreBar
            key={crop.crop}
            cropName={crop.crop}
            score={crop.suitability_score}
            isTop={crop.rank === 1}
            animate
          />
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-ivory-300 shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ivory-100 border-b border-ivory-300">
              {["Crop", "Suitability", "Predicted Yield", "Historical Stability", "Weather Compatibility", "Yield Trend"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-charcoal-muted/60 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rankings.map((crop) => {
              const isTop = crop.rank === 1;
              return (
                <tr
                  key={crop.crop}
                  className={cn(
                    "border-b border-ivory-200 last:border-0 transition-colors hover:bg-forest/[0.02]",
                    isTop && "bg-forest/[0.025]"
                  )}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-charcoal-muted/40 tabular-nums w-4">
                        #{crop.rank}
                      </span>
                      <span className={cn("font-semibold", isTop ? "text-forest" : "text-charcoal")}>
                        {crop.crop}
                      </span>
                      {isTop && (
                        <Badge variant="default" size="sm">Top Pick</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("font-bold tabular-nums", isTop ? "text-forest" : "text-charcoal")}>
                      {crop.suitability_score}
                    </span>
                    <span className="text-charcoal-muted text-xs"> /100</span>
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-charcoal">
                    {crop.predicted_yield_t_per_ha} t/ha
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={LEVEL_VARIANT[crop.historical_stability]} size="sm">
                      {crop.historical_stability}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={LEVEL_VARIANT[crop.weather_compatibility]} size="sm">
                      {crop.weather_compatibility}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={LEVEL_VARIANT[crop.yield_trend]} size="sm">
                      {crop.yield_trend}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {rankings.map((crop) => {
          const isTop = crop.rank === 1;
          return (
            <div
              key={crop.crop}
              className={cn(
                "rounded-2xl border p-4 space-y-3 bg-white shadow-card",
                isTop ? "border-forest/20" : "border-ivory-300"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-charcoal-muted/50 font-bold">#{crop.rank}</span>
                  <span className={cn("font-bold text-base", isTop ? "text-forest" : "text-charcoal")}>
                    {crop.crop}
                  </span>
                  {isTop && <Badge variant="default" size="sm">Top Pick</Badge>}
                </div>
                <span className={cn("text-lg font-bold tabular-nums", isTop ? "text-forest" : "text-charcoal")}>
                  {crop.suitability_score}<span className="text-xs font-normal text-charcoal-muted">/100</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-charcoal-muted/60 mb-0.5">Predicted Yield</p>
                  <p className="font-semibold text-charcoal">{crop.predicted_yield_t_per_ha} t/ha</p>
                </div>
                <div>
                  <p className="text-charcoal-muted/60 mb-0.5">Historical Stability</p>
                  <Badge variant={LEVEL_VARIANT[crop.historical_stability]} size="sm">{crop.historical_stability}</Badge>
                </div>
                <div>
                  <p className="text-charcoal-muted/60 mb-0.5">Weather Compatibility</p>
                  <Badge variant={LEVEL_VARIANT[crop.weather_compatibility]} size="sm">{crop.weather_compatibility}</Badge>
                </div>
                <div>
                  <p className="text-charcoal-muted/60 mb-0.5">Yield Trend</p>
                  <Badge variant={LEVEL_VARIANT[crop.yield_trend]} size="sm">{crop.yield_trend}</Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
