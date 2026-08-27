import { cn } from "../../utils/cn";
import { Badge } from "../ui/Badge";
import type { CropRecommendation } from "../../types/recommendation";

interface YieldRankingProps {
  rankings: CropRecommendation[];
}

export function YieldRanking({ rankings }: YieldRankingProps) {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-2" role="list" aria-label="Crop ranking by predicted yield">
      {sorted.map((crop) => {
        const isTop = crop.rank === 1;

        return (
          <div
            key={crop.crop}
            role="listitem"
            className={cn(
              "flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-200",
              "hover:shadow-card-hover",
              isTop
                ? "border-forest/20 bg-white shadow-card"
                : "border-ivory-200 bg-white/60 shadow-sm hover:bg-white"
            )}
          >
            {/* Rank badge */}
            <div className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
              isTop ? "bg-forest text-white" : "bg-ivory-200 text-charcoal-muted"
            )}>
              {crop.rank}
            </div>

            {/* Crop name */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={cn("font-bold text-sm", isTop ? "text-forest" : "text-charcoal")}>
                  {crop.crop}
                </p>
                {isTop && <Badge variant="default" size="sm">Top Pick</Badge>}
                {!isTop && (
                  <span className="text-2xs text-charcoal-muted/50 font-medium">Ranked lower</span>
                )}
              </div>
            </div>

            {/* Yield + score */}
            <div className="text-right shrink-0">
              <p className={cn("text-sm font-bold tabular-nums", isTop ? "text-forest" : "text-charcoal")}>
                {crop.predicted_yield_t_per_ha} t/ha
              </p>
              <p className="text-xs text-charcoal-muted tabular-nums">{crop.suitability_score}/100</p>
            </div>
          </div>
        );
      })}

      <p className="text-2xs text-charcoal-muted/50 pt-1 px-1">
        "Ranked lower" indicates a lower predicted yield in this evaluation — not a determination that
        the crop is unsuitable for your farm.
      </p>
    </div>
  );
}
