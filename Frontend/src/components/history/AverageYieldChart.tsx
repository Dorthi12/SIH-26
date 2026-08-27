import { useEffect, useRef, useState } from "react";
import type { CropHistoricalData } from "../../data/mockHistoricalData";
import { calculateAverageYield } from "../../data/mockHistoricalData";
import { cn } from "../../utils/cn";

interface AverageYieldChartProps {
  crops: CropHistoricalData[];
}

interface AnimatedBarProps {
  crop: CropHistoricalData;
  avg: number;
  maxAvg: number;
  isTop: boolean;
  delay: number;
}

function AnimatedBar({ crop, avg, maxAvg, isTop, delay }: AnimatedBarProps) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const target = (avg / maxAvg) * 100;
    if (prefersReduced) { setWidth(target); return; }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setTimeout(() => setWidth(target), delay); obs.disconnect(); }
      },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [avg, maxAvg, delay, prefersReduced]);

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className={cn("w-20 text-sm font-semibold shrink-0", isTop ? "text-forest" : "text-charcoal-light")}>
        {crop.crop}
      </span>
      <div className="flex-1 h-3 rounded-full bg-ivory-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-smooth"
          style={{ width: `${width}%`, backgroundColor: crop.color }}
          role="progressbar"
          aria-valuenow={avg}
          aria-valuemin={0}
          aria-valuemax={maxAvg}
          aria-label={`${crop.crop} average historical yield: ${avg} t/ha`}
        />
      </div>
      <span className={cn("w-20 text-right text-sm font-bold tabular-nums shrink-0", isTop ? "text-forest" : "text-charcoal-muted")}>
        {avg} t/ha
      </span>
    </div>
  );
}

export function AverageYieldChart({ crops }: AverageYieldChartProps) {
  const avgs = crops.map((c) => ({ crop: c, avg: calculateAverageYield(c) }));
  const sorted = [...avgs].sort((a, b) => b.avg - a.avg);
  const maxAvg = sorted[0].avg * 1.1;

  return (
    <div className="space-y-2.5">
      {sorted.map((item, i) => (
        <AnimatedBar
          key={item.crop.crop}
          crop={item.crop}
          avg={item.avg}
          maxAvg={maxAvg}
          isTop={i === 0}
          delay={i * 100}
        />
      ))}
      <p className="text-2xs text-charcoal-muted/50 pt-1">Average yield (t/ha) over 2021–2025</p>
    </div>
  );
}
