import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// RainfallChart — animated horizontal bar chart
// ---------------------------------------------------------------------------

interface DataPoint { label: string; value: number; }

interface RainfallChartProps {
  series: DataPoint[];
}

function AnimatedBar({ value, max, label, delay }: { value: number; max: number; label: string; delay: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const target = (value / max) * 100;
    if (prefersReduced) { setWidth(target); return; }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setTimeout(() => setWidth(target), delay); obs.disconnect(); }
      },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, max, delay, prefersReduced]);

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs font-semibold text-charcoal-light truncate">{label}</span>
      <div className="flex-1 h-3 rounded-full bg-ivory-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-400/70 transition-all duration-700 ease-smooth"
          style={{ width: `${width}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${value} mm rainfall`}
        />
      </div>
      <span className="w-14 text-right text-xs font-semibold text-charcoal tabular-nums shrink-0">
        {value} mm
      </span>
    </div>
  );
}

export function RainfallChart({ series }: RainfallChartProps) {
  const max = Math.max(...series.map((d) => d.value)) * 1.15;

  return (
    <div className="space-y-2.5">
      {series.map((d, i) => (
        <AnimatedBar key={d.label} value={d.value} max={max} label={d.label} delay={i * 100} />
      ))}
      <p className="text-2xs text-charcoal-muted/50 pt-1">Rainfall (mm)</p>
    </div>
  );
}
