import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { Badge } from "../ui/Badge";
import type { CropRecommendation } from "../../types/recommendation";

interface PrimarySignalCardProps {
  rankings: CropRecommendation[];
  topCrop: string;
}

function AnimatedBar({ crop, maxYield, isTop, delay }: {
  crop: CropRecommendation; maxYield: number; isTop: boolean; delay: number;
}) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const target = (crop.predicted_yield_t_per_ha / maxYield) * 100;
    if (prefersReduced) { setWidth(target); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setWidth(target), delay); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [crop.predicted_yield_t_per_ha, maxYield, delay, prefersReduced]);

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className={cn("w-20 text-sm font-semibold shrink-0", isTop ? "text-forest" : "text-charcoal-light")}>
        {crop.crop}
      </span>
      <div className="flex-1 h-3 rounded-full bg-ivory-200 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-smooth", isTop ? "bg-forest" : "bg-olive/40")}
          style={{ width: `${width}%` }}
          role="progressbar"
          aria-valuenow={crop.predicted_yield_t_per_ha}
          aria-valuemin={0}
          aria-valuemax={maxYield}
          aria-label={`${crop.crop} predicted yield: ${crop.predicted_yield_t_per_ha} t/ha`}
        />
      </div>
      <span className={cn("w-20 text-right text-sm font-bold tabular-nums shrink-0", isTop ? "text-forest" : "text-charcoal-muted")}>
        {crop.predicted_yield_t_per_ha} t/ha
      </span>
    </div>
  );
}

export function PrimarySignalCard({ rankings, topCrop }: PrimarySignalCardProps) {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  const maxYield = Math.max(...sorted.map((c) => c.predicted_yield_t_per_ha));

  return (
    <div className="bg-white rounded-2xl border border-ivory-300 shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-ivory-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white text-xs font-bold shrink-0">1</span>
          <p className="text-sm font-bold text-charcoal">Predicted Yield</p>
        </div>
        <Badge variant="default" size="sm">Primary Ranking Signal</Badge>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-2.5">
          {sorted.map((c, i) => (
            <AnimatedBar
              key={c.crop}
              crop={c}
              maxYield={maxYield}
              isTop={c.crop === topCrop}
              delay={i * 100}
            />
          ))}
        </div>

        <div className="rounded-xl border border-forest/10 bg-forest/[0.04] px-4 py-3 text-sm text-charcoal-muted leading-relaxed">
          <strong className="text-charcoal">{topCrop}</strong> has the highest predicted yield
          among the evaluated candidates. This is the central reason for the ranking.
        </div>
      </div>
    </div>
  );
}
