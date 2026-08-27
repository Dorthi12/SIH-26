import { cn } from "../../utils/cn";
import type { RecommendationFormData } from "../../types/recommendationForm";

type Irrigation  = RecommendationFormData["irrigation"];
type PrevCrop    = RecommendationFormData["previousCrop"];

const IRRIGATION_OPTIONS: { value: Irrigation; label: string; desc: string }[] = [
  { value: "Rain-fed",  label: "Rain-fed",  desc: "Dependent on monsoon rainfall" },
  { value: "Irrigated", label: "Irrigated", desc: "Access to canal or bore-well"  },
  { value: "Mixed",     label: "Mixed",     desc: "Partial irrigation available"  },
];

const PREV_CROPS: { value: PrevCrop; label: string }[] = [
  { value: "Rice",  label: "Rice"  },
  { value: "Wheat", label: "Wheat" },
  { value: "Maize", label: "Maize" },
  { value: "Other", label: "Other" },
];

interface OptionalContextStepProps {
  form: RecommendationFormData;
  onChange: (patch: Partial<RecommendationFormData>) => void;
}

function OptionCard<T extends string>({
  value,
  selected,
  label,
  desc,
  onSelect,
}: {
  value: T;
  selected: boolean;
  label: string;
  desc?: string;
  onSelect: (v: T) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(selected ? ("" as T) : value)}
      className={cn(
        "flex flex-col gap-1 rounded-xl border-2 px-4 py-3 text-left transition-all duration-150 w-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-1",
        selected
          ? "border-forest bg-forest/[0.05] shadow-sm"
          : "border-ivory-300 bg-white hover:border-forest/30 hover:bg-forest/[0.02]"
      )}
    >
      <p className={cn("text-sm font-semibold", selected ? "text-forest" : "text-charcoal")}>
        {label}
      </p>
      {desc && <p className="text-xs text-charcoal-muted">{desc}</p>}
    </button>
  );
}

export function OptionalContextStep({ form, onChange }: OptionalContextStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-forest/60 mb-1">Step 4 — Optional</p>
        <h2 className="text-xl font-bold text-charcoal">Anything else we should know?</h2>
        <p className="text-sm text-charcoal-muted mt-1">
          These fields are optional. You can skip this step if you prefer.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-charcoal-muted leading-relaxed">
        <strong className="text-charcoal">Optional context.</strong> These fields can be used by future
        recommendation models. They do not currently affect the recommendation.
      </div>

      {/* Irrigation */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-charcoal">Irrigation Availability</p>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Irrigation availability">
          {IRRIGATION_OPTIONS.map((o) => (
            <OptionCard
              key={o.value}
              value={o.value}
              selected={form.irrigation === o.value}
              label={o.label}
              desc={o.desc}
              onSelect={(v) => onChange({ irrigation: v })}
            />
          ))}
        </div>
      </div>

      {/* Previous crop */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-charcoal">Previous Crop</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Previous crop">
          {PREV_CROPS.map((c) => (
            <OptionCard
              key={c.value}
              value={c.value}
              selected={form.previousCrop === c.value}
              label={c.label}
              onSelect={(v) => onChange({ previousCrop: v })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
