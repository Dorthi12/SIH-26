import { Sun, CloudSnow, Leaf } from "lucide-react";
import { SeasonSelector } from "../ui/SeasonSelector";
import type { RecommendationFormData } from "../../types/recommendationForm";
import type { Season } from "../../types/farmer";
import { cn } from "../../utils/cn";

interface SeasonStepProps {
  form: RecommendationFormData;
  errors: Partial<Record<"season", string>>;
  onChange: (patch: Partial<RecommendationFormData>) => void;
}

// ── Season context cards ──────────────────────────────────────────────────

const SEASON_INFO: {
  value: Season;
  label: string;
  months: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value:       "Kharif",
    label:       "Kharif",
    months:      "June – October",
    description: "Sown at the onset of monsoon. Rain-fed crops — maize, rice, soybean, millet.",
    icon:        <Sun className="h-5 w-5" />,
  },
  {
    value:       "Rabi",
    label:       "Rabi",
    months:      "November – March",
    description: "Winter-sown crops. Harvested in spring — wheat, barley, mustard.",
    icon:        <CloudSnow className="h-5 w-5" />,
  },
  {
    value:       "Zaid",
    label:       "Zaid",
    months:      "March – June",
    description: "Short-duration summer crops between Rabi and Kharif seasons.",
    icon:        <Leaf className="h-5 w-5" />,
  },
];

export function SeasonStep({ form, errors, onChange }: SeasonStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-forest/60 mb-1">Step 3</p>
        <h2 className="text-xl font-bold text-charcoal">Which growing season?</h2>
        <p className="text-sm text-charcoal-muted mt-1">
          Select the cropping season that matches your planned planting cycle.
        </p>
      </div>

      {/* Season selector (existing component — accessible, keyboard-safe) */}
      <SeasonSelector
        id="season"
        label="Growing Season"
        required
        value={form.season}
        onChange={(s: Season) => onChange({ season: s })}
        error={errors.season}
      />

      {/* Season context cards */}
      <div className="space-y-2.5">
        <p className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted/60">
          Season Overview
        </p>
        <div className="space-y-2">
          {SEASON_INFO.map((s) => {
            const isSelected = form.season === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onChange({ season: s.value })}
                className={cn(
                  "w-full flex items-start gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2",
                  isSelected
                    ? "border-forest/25 bg-forest/[0.04] shadow-sm"
                    : "border-ivory-200 bg-white hover:border-forest/15 hover:bg-ivory-50"
                )}
                aria-pressed={isSelected}
                aria-label={`Select ${s.label} season (${s.months})`}
              >
                <span className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                  isSelected
                    ? "bg-forest text-white"
                    : "bg-ivory-100 text-charcoal-muted"
                )}>
                  {s.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={cn(
                      "text-sm font-bold",
                      isSelected ? "text-charcoal" : "text-charcoal-muted"
                    )}>
                      {s.label}
                    </p>
                    <span className="text-2xs text-charcoal-muted/60 shrink-0">{s.months}</span>
                  </div>
                  <p className="text-xs text-charcoal-muted mt-0.5 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
