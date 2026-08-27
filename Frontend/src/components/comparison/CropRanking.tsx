import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import type { CropRecommendation } from "../../types/recommendation";

// ---------------------------------------------------------------------------
// CropRankingBar — single animated yield bar
// ---------------------------------------------------------------------------

interface CropRankingBarProps {
  crop: CropRecommendation;
  maxYield: number;
  isTop: boolean;
  animate?: boolean;
}

function CropRankingBar({ crop, maxYield, isTop, animate = true }: CropRankingBarProps) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const target = (crop.predicted_yield_t_per_ha / maxYield) * 100;
    if (!animate || prefersReduced) { setWidth(target); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setWidth(target), 80 + crop.rank * 80); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [crop, maxYield, animate, prefersReduced]);

  return (
    <div
      ref={ref}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-200",
        "hover:shadow-card-hover",
        isTop
          ? "border-forest/20 bg-white shadow-card"
          : "border-ivory-200 bg-white/60 shadow-sm hover:bg-white"
      )}
    >
      {/* Rank */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          isTop
            ? "bg-forest text-white"
            : "bg-ivory-200 text-charcoal-muted"
        )}
      >
        {crop.rank}
      </div>

      {/* Crop + bar */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <span className={cn("text-sm font-bold", isTop ? "text-forest" : "text-charcoal")}>
            {crop.crop}
          </span>
          <span className={cn("text-sm font-semibold tabular-nums shrink-0", isTop ? "text-forest" : "text-charcoal")}>
            {crop.predicted_yield_t_per_ha} t/ha
          </span>
        </div>

        {/* Bar track */}
        <div className="h-2.5 w-full rounded-full bg-ivory-200 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-smooth",
              isTop ? "bg-forest" : "bg-olive/50"
            )}
            style={{ width: `${width}%` }}
            role="progressbar"
            aria-valuenow={crop.predicted_yield_t_per_ha}
            aria-valuemin={0}
            aria-valuemax={maxYield}
            aria-label={`${crop.crop} predicted yield: ${crop.predicted_yield_t_per_ha} t/ha`}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CropRanking — full ranking section
// ---------------------------------------------------------------------------

interface CropRankingProps {
  rankings: CropRecommendation[];
}

export function CropRanking({ rankings }: CropRankingProps) {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  const maxYield = Math.max(...sorted.map((c) => c.predicted_yield_t_per_ha));

  return (
    <div className="space-y-3">
      <p className="text-xs text-charcoal-muted">
        Predicted yield is the primary ranking signal.
        Historical stability, weather compatibility and yield trend provide supporting context.
      </p>
      <div className="space-y-2">
        {sorted.map((crop) => (
          <CropRankingBar
            key={crop.crop}
            crop={crop}
            maxYield={maxYield}
            isTop={crop.rank === 1}
            animate
          />
        ))}
      </div>
    </div>
  );
}
