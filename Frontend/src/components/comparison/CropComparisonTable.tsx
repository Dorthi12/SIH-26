import { TrendingUp, Minus, TrendingDown } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { CropRecommendation } from "../../types/recommendation";
import { cn } from "../../utils/cn";

// ---------------------------------------------------------------------------
// Level + trend helpers
// ---------------------------------------------------------------------------

const LEVEL_VARIANT: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  High:      "success",
  Medium:    "warning",
  Low:       "danger",
  Improving: "success",
  Stable:    "neutral",
  Declining: "danger",
};

function TrendIcon({ trend }: { trend: CropRecommendation["yield_trend"] }) {
  if (trend === "Improving") return <TrendingUp className="h-3.5 w-3.5 text-forest" />;
  if (trend === "Declining") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-charcoal-muted" />;
}

// ---------------------------------------------------------------------------
// Desktop table
// ---------------------------------------------------------------------------

function DesktopTable({ rankings }: { rankings: CropRecommendation[] }) {
  const cols = ["Rank", "Crop", "Suitability", "Predicted Yield", "Historical Stability", "Weather Compatibility", "Yield Trend"];

  return (
    <div className="hidden md:block overflow-hidden rounded-2xl border border-ivory-300 shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-ivory-100 border-b border-ivory-300">
            {cols.map((c) => (
              <th key={c} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-charcoal-muted/60 whitespace-nowrap">
                {c}
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
                  "border-b border-ivory-200 last:border-0 hover:bg-forest/[0.025] transition-colors",
                  isTop && "bg-forest/[0.03]"
                )}
              >
                {/* Rank */}
                <td className="px-4 py-3.5">
                  <div className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    isTop ? "bg-forest text-white" : "bg-ivory-200 text-charcoal-muted"
                  )}>
                    {crop.rank}
                  </div>
                </td>
                {/* Crop */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-semibold", isTop ? "text-forest" : "text-charcoal")}>
                      {crop.crop}
                    </span>
                    {isTop && <Badge variant="default" size="sm">Top Pick</Badge>}
                  </div>
                </td>
                {/* Suitability */}
                <td className="px-4 py-3.5">
                  <span className={cn("font-bold tabular-nums", isTop ? "text-forest" : "text-charcoal")}>
                    {crop.suitability_score}
                  </span>
                  <span className="text-xs text-charcoal-muted"> /100</span>
                </td>
                {/* Yield */}
                <td className="px-4 py-3.5 font-semibold tabular-nums text-charcoal">
                  {crop.predicted_yield_t_per_ha} t/ha
                </td>
                {/* Historical */}
                <td className="px-4 py-3.5">
                  <Badge variant={LEVEL_VARIANT[crop.historical_stability]} size="sm">{crop.historical_stability}</Badge>
                </td>
                {/* Weather */}
                <td className="px-4 py-3.5">
                  <Badge variant={LEVEL_VARIANT[crop.weather_compatibility]} size="sm">{crop.weather_compatibility}</Badge>
                </td>
                {/* Trend */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <TrendIcon trend={crop.yield_trend} />
                    <Badge variant={LEVEL_VARIANT[crop.yield_trend]} size="sm">{crop.yield_trend}</Badge>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile cards
// ---------------------------------------------------------------------------

function MobileCards({ rankings }: { rankings: CropRecommendation[] }) {
  return (
    <div className="md:hidden space-y-3">
      {rankings.map((crop) => {
        const isTop = crop.rank === 1;
        return (
          <div
            key={crop.crop}
            className={cn(
              "rounded-2xl border bg-white shadow-card p-4 space-y-3",
              isTop ? "border-forest/20" : "border-ivory-300"
            )}
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0",
                  isTop ? "bg-forest text-white" : "bg-ivory-200 text-charcoal-muted"
                )}>
                  {crop.rank}
                </div>
                <span className={cn("text-base font-bold", isTop ? "text-forest" : "text-charcoal")}>
                  {crop.crop}
                </span>
                {isTop && <Badge variant="default" size="sm">Top Pick</Badge>}
              </div>
              <span className={cn("text-lg font-bold tabular-nums", isTop ? "text-forest" : "text-charcoal")}>
                {crop.suitability_score}<span className="text-xs font-normal text-charcoal-muted">/100</span>
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs border-t border-ivory-200 pt-3">
              <div>
                <p className="text-charcoal-muted/60 mb-0.5">Predicted Yield</p>
                <p className="font-semibold text-charcoal tabular-nums">{crop.predicted_yield_t_per_ha} t/ha</p>
              </div>
              <div>
                <p className="text-charcoal-muted/60 mb-0.5">Yield Trend</p>
                <div className="flex items-center gap-1">
                  <TrendIcon trend={crop.yield_trend} />
                  <Badge variant={LEVEL_VARIANT[crop.yield_trend]} size="sm">{crop.yield_trend}</Badge>
                </div>
              </div>
              <div>
                <p className="text-charcoal-muted/60 mb-0.5">Historical Stability</p>
                <Badge variant={LEVEL_VARIANT[crop.historical_stability]} size="sm">{crop.historical_stability}</Badge>
              </div>
              <div>
                <p className="text-charcoal-muted/60 mb-0.5">Weather Compatibility</p>
                <Badge variant={LEVEL_VARIANT[crop.weather_compatibility]} size="sm">{crop.weather_compatibility}</Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CropComparisonTable — full exported component
// ---------------------------------------------------------------------------

interface CropComparisonTableProps {
  rankings: CropRecommendation[];
}

export function CropComparisonTable({ rankings }: CropComparisonTableProps) {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  return (
    <>
      <DesktopTable rankings={sorted} />
      <MobileCards rankings={sorted} />
    </>
  );
}
