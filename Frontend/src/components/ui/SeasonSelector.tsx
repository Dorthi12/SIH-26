import { Check, CloudRain, Sun, Sprout } from "lucide-react";
import { cn } from "../../utils/cn";
import type { Season } from "../../types/farmer";

// ---------------------------------------------------------------------------
// Season metadata
// ---------------------------------------------------------------------------

interface SeasonMeta {
  value: Season;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const SEASONS: SeasonMeta[] = [
  {
    value: "Kharif",
    label: "Kharif",
    description: "Monsoon season crops",
    icon: <CloudRain className="h-5 w-5" />,
  },
  {
    value: "Rabi",
    label: "Rabi",
    description: "Winter season crops",
    icon: <Sun className="h-5 w-5" />,
  },
  {
    value: "Zaid",
    label: "Zaid",
    description: "Summer season crops",
    icon: <Sprout className="h-5 w-5" />,
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SeasonSelectorProps {
  value: Season | "";
  onChange: (season: Season) => void;
  error?: string;
  label?: string;
  required?: boolean;
  id?: string;
}

// ---------------------------------------------------------------------------
// SeasonSelector
// ---------------------------------------------------------------------------

export function SeasonSelector({
  value,
  onChange,
  error,
  label = "Growing Season",
  required,
  id = "season",
}: SeasonSelectorProps) {
  const errorId = `${id}-error`;

  return (
    <fieldset className="space-y-1.5" aria-describedby={error ? errorId : undefined}>
      {/* Legend as label */}
      <legend className="text-sm font-medium text-charcoal">
        {label}
        {required && (
          <span className="ml-1 text-amber-600" aria-hidden="true">
            *
          </span>
        )}
      </legend>

      {/* Cards */}
      <div
        className="grid grid-cols-3 gap-3"
        role="radiogroup"
        aria-label="Growing season"
      >
        {SEASONS.map((season) => {
          const isSelected = value === season.value;

          return (
            <button
              key={season.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(season.value)}
              className={cn(
                "relative flex flex-col items-start gap-2.5 p-3.5 rounded-xl border-2",
                "text-left transition-all duration-200 ease-smooth",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-1",
                isSelected
                  ? "border-forest bg-forest/5 shadow-sm shadow-forest/10"
                  : "border-ivory-300 bg-white hover:border-forest/30 hover:bg-forest/3"
              )}
            >
              {/* Check indicator */}
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-forest">
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </span>
              )}

              {/* Icon */}
              <span
                className={cn(
                  "transition-colors duration-200",
                  isSelected ? "text-forest" : "text-charcoal-muted/60"
                )}
              >
                {season.icon}
              </span>

              {/* Text */}
              <div>
                <p
                  className={cn(
                    "text-sm font-semibold leading-none mb-1 transition-colors duration-200",
                    isSelected ? "text-forest" : "text-charcoal"
                  )}
                >
                  {season.label}
                </p>
                <p className="text-xs text-charcoal-muted leading-snug">
                  {season.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600 flex items-center gap-1">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </fieldset>
  );
}
