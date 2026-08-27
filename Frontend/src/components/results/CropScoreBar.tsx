import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";

interface CropScoreBarProps {
  cropName: string;
  score: number;
  maxScore?: number;
  isTop?: boolean;
  animate?: boolean;
}

export function CropScoreBar({
  cropName,
  score,
  maxScore = 100,
  isTop = false,
  animate = true,
}: CropScoreBarProps) {
  const [width, setWidth] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!animate || prefersReduced) {
      setWidth((score / maxScore) * 100);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setWidth((score / maxScore) * 100), 150);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (barRef.current) observer.observe(barRef.current);
    return () => observer.disconnect();
  }, [score, maxScore, animate, prefersReduced]);

  return (
    <div ref={barRef} className="flex items-center gap-3">
      {/* Name */}
      <span
        className={cn(
          "w-20 shrink-0 text-sm font-medium truncate",
          isTop ? "text-forest font-semibold" : "text-charcoal-light"
        )}
      >
        {cropName}
      </span>

      {/* Bar track */}
      <div className="flex-1 h-2 rounded-full bg-ivory-200 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-smooth",
            isTop ? "bg-forest" : "bg-olive/50"
          )}
          style={{ width: `${width}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={maxScore}
          aria-label={`${cropName} suitability: ${score}`}
        />
      </div>

      {/* Score */}
      <span
        className={cn(
          "w-8 text-right text-sm tabular-nums shrink-0",
          isTop ? "font-bold text-forest" : "font-medium text-charcoal-muted"
        )}
      >
        {score}
      </span>
    </div>
  );
}
