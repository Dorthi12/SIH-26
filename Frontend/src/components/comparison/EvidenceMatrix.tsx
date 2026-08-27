import { TrendingUp, Minus, TrendingDown, CheckCircle2 } from "lucide-react";
import { cn } from "../../utils/cn";
import type { CropRecommendation } from "../../types/recommendation";

// ---------------------------------------------------------------------------
// EvidenceMatrix
// ---------------------------------------------------------------------------

type EvidenceValue = "High" | "Medium" | "Low" | "Improving" | "Stable" | "Declining";

interface MatrixCellProps {
  value: EvidenceValue;
  isTrend?: boolean;
}

function MatrixCell({ value, isTrend = false }: MatrixCellProps) {
  if (isTrend) {
    if (value === "Improving") return (
      <div className="flex items-center justify-center gap-1">
        <TrendingUp className="h-3.5 w-3.5 text-forest" />
        <span className="text-xs font-semibold text-forest">↑</span>
      </div>
    );
    if (value === "Declining") return (
      <div className="flex items-center justify-center gap-1">
        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
        <span className="text-xs font-semibold text-red-500">↓</span>
      </div>
    );
    return (
      <div className="flex items-center justify-center gap-1">
        <Minus className="h-3.5 w-3.5 text-charcoal-muted/50" />
        <span className="text-xs font-medium text-charcoal-muted/60">→</span>
      </div>
    );
  }

  const colorMap: Record<string, string> = {
    High:   "text-forest font-semibold",
    Medium: "text-amber-700 font-medium",
    Low:    "text-red-600 font-medium",
  };

  return (
    <div className="flex items-center justify-center gap-1">
      {value === "High" && <CheckCircle2 className="h-3 w-3 text-forest/70" />}
      <span className={cn("text-xs", colorMap[value] ?? "text-charcoal-muted")}>{value}</span>
    </div>
  );
}

interface EvidenceMatrixProps {
  rankings: CropRecommendation[];
}

export function EvidenceMatrix({ rankings }: EvidenceMatrixProps) {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full min-w-[340px] text-sm" aria-label="Crop evidence matrix">
        <thead>
          <tr>
            <th className="text-left px-3 py-2 text-xs font-bold uppercase tracking-wide text-charcoal-muted/60 w-32">
              Indicator
            </th>
            {sorted.map((crop) => (
              <th key={crop.crop} className="text-center px-3 py-2">
                <div className="flex flex-col items-center gap-0.5">
                  <span className={cn(
                    "text-xs font-bold",
                    crop.rank === 1 ? "text-forest" : "text-charcoal"
                  )}>
                    {crop.crop}
                  </span>
                  {crop.rank === 1 && (
                    <span className="text-2xs text-forest/60 font-semibold">#1</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Historical Stability */}
          <tr className="border-t border-ivory-200">
            <td className="px-3 py-3 text-xs font-semibold text-charcoal-light whitespace-nowrap">
              Historical Stability
            </td>
            {sorted.map((crop) => (
              <td key={crop.crop} className={cn(
                "px-3 py-3 text-center",
                crop.rank === 1 && "bg-forest/[0.025]"
              )}>
                <MatrixCell value={crop.historical_stability} />
              </td>
            ))}
          </tr>

          {/* Weather Compatibility */}
          <tr className="border-t border-ivory-200">
            <td className="px-3 py-3 text-xs font-semibold text-charcoal-light whitespace-nowrap">
              Weather Compatibility
            </td>
            {sorted.map((crop) => (
              <td key={crop.crop} className={cn(
                "px-3 py-3 text-center",
                crop.rank === 1 && "bg-forest/[0.025]"
              )}>
                <MatrixCell value={crop.weather_compatibility} />
              </td>
            ))}
          </tr>

          {/* Yield Trend */}
          <tr className="border-t border-ivory-200">
            <td className="px-3 py-3 text-xs font-semibold text-charcoal-light whitespace-nowrap">
              Yield Trend
            </td>
            {sorted.map((crop) => (
              <td key={crop.crop} className={cn(
                "px-3 py-3 text-center",
                crop.rank === 1 && "bg-forest/[0.025]"
              )}>
                <MatrixCell value={crop.yield_trend} isTrend />
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <p className="text-2xs text-charcoal-muted/50 mt-2 px-1">
        These indicators are supporting evidence — they do not independently determine the ranking.
      </p>
    </div>
  );
}
