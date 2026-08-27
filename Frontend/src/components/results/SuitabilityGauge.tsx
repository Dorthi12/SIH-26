import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";

interface SuitabilityGaugeProps {
  score: number; // 0–100
  size?: number; // px
  className?: string;
}

export function SuitabilityGauge({ score, size = 180, className }: SuitabilityGaugeProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) { setDisplayed(score); return; }

    const start = performance.now();
    const duration = 1200;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [score, prefersReduced]);

  // SVG arc maths
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const strokeWidth = size * 0.07;
  const circumference = 2 * Math.PI * radius;
  // 270° arc (¾ of circle), gap at bottom
  const arcRatio = 0.75;
  const arcLength = circumference * arcRatio;
  const gap = circumference * (1 - arcRatio);
  const fillLength = arcLength * (displayed / 100);
  // Rotate so arc starts at bottom-left (-225°)
  const rotation = 135;

  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      role="img"
      aria-label={`Suitability score: ${score} out of 100`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="#e6ddd0"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${gap}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${cx} ${cy})`}
          />
          {/* Fill */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="#1a3d2e"
            strokeWidth={strokeWidth}
            strokeDasharray={`${fillLength} ${circumference - fillLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${cx} ${cy})`}
            style={{ transition: prefersReduced ? "none" : "stroke-dasharray 0.05s linear" }}
          />
          {/* Amber tip accent */}
          {displayed > 0 && (
            <circle
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke="#c8922a"
              strokeWidth={strokeWidth * 0.6}
              strokeDasharray={`${Math.min(strokeWidth * 0.8, fillLength)} ${circumference}`}
              strokeDashoffset={-(fillLength - Math.min(strokeWidth * 0.8, fillLength))}
              strokeLinecap="round"
              transform={`rotate(${rotation} ${cx} ${cy})`}
            />
          )}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-4xl font-bold text-charcoal tabular-nums leading-none">
            {displayed}
          </span>
          <span className="text-sm text-charcoal-muted font-medium">/100</span>
        </div>
      </div>

      <div className="text-center space-y-0.5">
        <p className="text-xs font-bold uppercase tracking-wider text-forest/70">
          Suitability Score
        </p>
        <p className="text-2xs text-charcoal-muted max-w-[150px] text-center leading-snug">
          Relative suitability among evaluated crops
        </p>
      </div>
    </div>
  );
}
