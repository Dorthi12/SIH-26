import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import type { CropRecommendation } from "../../types/recommendation";

// ---------------------------------------------------------------------------
// Generic animated horizontal bar row
// ---------------------------------------------------------------------------

interface CompBarProps {
  label: string;
  value: number;
  maxValue: number;
  displayValue: string;
  isTop: boolean;
  delayMs?: number;
  color?: string;
}

function CompBar({ label, value, maxValue, displayValue, isTop, delayMs = 0, color }: CompBarProps) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const target = (value / maxValue) * 100;
    if (prefersReduced) { setWidth(target); return; }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setWidth(target), delayMs);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, maxValue, delayMs, prefersReduced]);

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className={cn("w-20 shrink-0 text-sm truncate", isTop ? "text-forest font-semibold" : "text-charcoal-light font-medium")}>
        {label}
      </span>
      <div className="flex-1 h-2.5 rounded-full bg-ivory-200 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-smooth", color ?? (isTop ? "bg-forest" : "bg-olive/50"))}
          style={{ width: `${width}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={maxValue}
          aria-label={`${label}: ${displayValue}`}
        />
      </div>
      <span className={cn("w-20 text-right shrink-0 text-sm tabular-nums", isTop ? "font-bold text-forest" : "font-medium text-charcoal-muted")}>
        {displayValue}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// YieldComparisonChart
// ---------------------------------------------------------------------------

export function YieldComparisonChart({ rankings }: { rankings: CropRecommendation[] }) {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  const max = Math.max(...sorted.map((c) => c.predicted_yield_t_per_ha));

  return (
    <div className="space-y-2.5">
      {sorted.map((crop, i) => (
        <CompBar
          key={crop.crop}
          label={crop.crop}
          value={crop.predicted_yield_t_per_ha}
          maxValue={max}
          displayValue={`${crop.predicted_yield_t_per_ha} t/ha`}
          isTop={crop.rank === 1}
          delayMs={i * 100}
        />
      ))}
      <p className="text-2xs text-charcoal-muted/50 pt-1">Predicted yield (t/ha)</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SuitabilityComparison
// ---------------------------------------------------------------------------

export function SuitabilityComparison({ rankings }: { rankings: CropRecommendation[] }) {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-2.5">
      {sorted.map((crop, i) => (
        <CompBar
          key={crop.crop}
          label={crop.crop}
          value={crop.suitability_score}
          maxValue={100}
          displayValue={`${crop.suitability_score}`}
          isTop={crop.rank === 1}
          delayMs={i * 100}
        />
      ))}
      <p className="text-2xs text-charcoal-muted/50 pt-1">
        Relative suitability among evaluated candidates — not a probability or confidence score.
      </p>
    </div>
  );
}
