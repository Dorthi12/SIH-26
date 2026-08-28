/**
 * ScenarioSlider — a polished, accessible slider for scenario controls.
 *
 * Features:
 * - Custom styled range input (thumb + track)
 * - Visible value display with sign formatting
 * - Accessible keyboard navigation (native <input type="range">)
 * - Smooth CSS transitions on fill track
 * - Touch-friendly sizing
 * - Respects prefers-reduced-motion (CSS transition only, no JS animation)
 */

import { cn } from "../../utils/cn";

interface ScenarioSliderProps {
  id: string;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  icon?: React.ReactNode;
  positiveColor?: string; // Tailwind text color class for positive values
  negativeColor?: string;
}

const defaultFormat = (v: number, unit: string) =>
  `${v > 0 ? "+" : ""}${v}${unit}`;

export function ScenarioSlider({
  id,
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  icon,
  positiveColor = "text-forest-600",
  negativeColor = "text-red-600",
}: ScenarioSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;
  const displayValue = formatValue
    ? formatValue(value)
    : defaultFormat(value, unit);


  // Tick marks
  const ticks = Array.from(
    { length: Math.round((max - min) / step) + 1 },
    (_, i) => min + i * step
  ).filter((v) => v % (step * 2) === 0 || v === 0);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-forest/60 shrink-0">{icon}</span>
          )}
          <label
            htmlFor={id}
            className="text-sm font-semibold text-charcoal cursor-pointer"
          >
            {label}
          </label>
        </div>

        {/* Value badge */}
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-[4.5rem] rounded-xl px-3 py-1.5",
            "text-sm font-bold tabular-nums tracking-tight",
            "border transition-colors duration-200",
            isNegative
              ? "bg-red-50 border-red-200 " + negativeColor
              : isPositive
              ? "bg-forest-50 border-forest-200/60 " + positiveColor
              : "bg-ivory-200 border-ivory-300 text-charcoal-muted"
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {displayValue}
        </span>
      </div>

      {/* Slider track container */}
      <div className="relative px-0.5">
        {/* Track background */}
        <div className="relative h-2 w-full rounded-full bg-ivory-300">
          {/* Centre marker */}
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-0.5 rounded-full bg-charcoal-muted/25"
          />
          {/* Filled section */}
          <div
            aria-hidden
            className={cn(
              "absolute top-0 h-full rounded-full transition-all duration-150 ease-out",
              isNegative
                ? "bg-red-400/70"
                : isNeutral
                ? "bg-charcoal/20"
                : "bg-forest-400/80"
            )}
            style={
              isNegative
                ? {
                    left: `${pct}%`,
                    right: `${100 - 50}%`,
                  }
                : {
                    left: "50%",
                    width: `${Math.abs(pct - 50)}%`,
                  }
            }
          />
        </div>

        {/* Range input — native, accessible, styled via CSS */}
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={displayValue}
          className={cn(
            "scenario-slider absolute inset-0 w-full opacity-0 cursor-pointer",
            "h-full"
          )}
          style={{ margin: 0 }}
        />

        {/* Visible thumb (purely decorative, input handles a11y) */}
        <div
          aria-hidden
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 border-white shadow-md",
            "transition-all duration-150 ease-out pointer-events-none",
            isNegative
              ? "bg-red-500"
              : isNeutral
              ? "bg-charcoal-muted"
              : "bg-forest"
          )}
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>

      {/* Min / Zero / Max labels + ticks */}
      <div className="relative flex justify-between text-2xs text-charcoal-muted/60 font-medium px-0.5">
        {ticks.map((tick) => {
          const tickPct = ((tick - min) / (max - min)) * 100;
          const isZero = tick === 0;
          return (
            <span
              key={tick}
              aria-hidden
              className={cn(
                "absolute -translate-x-1/2 select-none",
                isZero && "font-bold text-charcoal-muted/80"
              )}
              style={{ left: `${tickPct}%` }}
            >
              {tick > 0 ? "+" : ""}
              {tick}
              {unit}
            </span>
          );
        })}
        {/* Spacer to give the relative container a height */}
        <span className="invisible">0</span>
      </div>
    </div>
  );
}
