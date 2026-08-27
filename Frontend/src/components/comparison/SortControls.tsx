import { cn } from "../../utils/cn";

export type SortKey = "yield" | "suitability" | "name";

interface SortControlsProps {
  value: SortKey;
  onChange: (key: SortKey) => void;
}

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: "yield",       label: "Predicted Yield" },
  { value: "suitability", label: "Suitability"     },
  { value: "name",        label: "Crop Name"       },
];

export function SortControls({ value, onChange }: SortControlsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-charcoal-muted/60 shrink-0">Sort by:</span>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-1",
            value === opt.value
              ? "border-forest bg-forest/[0.06] text-forest"
              : "border-ivory-300 bg-white text-charcoal-light hover:border-forest/25 hover:text-charcoal"
          )}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function sortCrops(
  crops: import("../../types/recommendation").CropRecommendation[],
  key: SortKey
) {
  return [...crops].sort((a, b) => {
    if (key === "yield")       return b.predicted_yield_t_per_ha - a.predicted_yield_t_per_ha;
    if (key === "suitability") return b.suitability_score - a.suitability_score;
    return a.crop.localeCompare(b.crop);
  });
}
