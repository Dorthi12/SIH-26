import { Minus, Plus } from "lucide-react";
import type { RecommendationFormData, AreaUnit } from "../../types/recommendationForm";
import { convertArea } from "../../types/recommendationForm";
import { cn } from "../../utils/cn";

interface FarmAreaStepProps {
  form: RecommendationFormData;
  errors: Partial<Record<"area", string>>;
  onChange: (patch: Partial<RecommendationFormData>) => void;
}

const UNIT_OPTIONS: { value: AreaUnit; label: string }[] = [
  { value: "acres",    label: "Acres"    },
  { value: "hectares", label: "Hectares" },
];

export function FarmAreaStep({ form, errors, onChange }: FarmAreaStepProps) {
  const handleUnit = (newUnit: AreaUnit) => {
    if (newUnit === form.areaUnit) return;
    const converted = convertArea(form.area, form.areaUnit, newUnit);
    onChange({ areaUnit: newUnit, area: converted });
  };

  const nudge = (delta: number) => {
    const current = parseFloat(form.area) || 0;
    const next = Math.max(0.1, parseFloat((current + delta).toFixed(2)));
    onChange({ area: String(next) });
  };

  const handleChange = (raw: string) => {
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) onChange({ area: raw });
  };

  const displayArea = form.area
    ? `${form.area} ${form.areaUnit}`
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-forest/60 mb-1">Step 2</p>
        <h2 className="text-xl font-bold text-charcoal">How large is your farm?</h2>
        <p className="text-sm text-charcoal-muted mt-1">
          Enter the total area you plan to use for the recommended crop.
        </p>
      </div>

      {/* Input + unit selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-charcoal">
          Farm Area <span className="text-amber-600" aria-hidden>*</span>
        </label>

        <div className="flex items-stretch gap-2">
          {/* Minus */}
          <button
            type="button"
            onClick={() => nudge(-0.5)}
            aria-label="Decrease farm area by 0.5"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-ivory-300 bg-white text-charcoal-muted hover:border-forest/40 hover:text-forest hover:bg-forest/[0.03] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-1"
          >
            <Minus className="h-4 w-4" />
          </button>

          {/* Numeric input */}
          <div className="relative flex-1">
            <input
              id="farm-area"
              type="text"
              inputMode="decimal"
              value={form.area}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="e.g. 2.5"
              aria-required
              aria-invalid={errors.area ? "true" : undefined}
              aria-describedby={errors.area ? "area-error" : "area-hint"}
              className={cn(
                "w-full h-12 px-4 text-center text-xl font-bold text-charcoal rounded-xl border bg-white transition-all duration-150 outline-none",
                "focus:ring-2 focus:ring-forest/20 focus:border-forest",
                "placeholder:text-charcoal-muted/40 placeholder:font-normal placeholder:text-base",
                errors.area
                  ? "border-red-400 focus:ring-red-200"
                  : "border-ivory-300 hover:border-forest/40"
              )}
            />
          </div>

          {/* Plus */}
          <button
            type="button"
            onClick={() => nudge(0.5)}
            aria-label="Increase farm area by 0.5"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-ivory-300 bg-white text-charcoal-muted hover:border-forest/40 hover:text-forest hover:bg-forest/[0.03] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-1"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Unit selector */}
          <div className="shrink-0">
            <select
              value={form.areaUnit}
              onChange={(e) => handleUnit(e.target.value as AreaUnit)}
              aria-label="Area unit"
              className="h-12 rounded-xl border border-ivory-300 bg-white px-3 text-sm font-semibold text-charcoal hover:border-forest/40 transition-colors focus:outline-none focus:ring-2 focus:ring-forest/20 appearance-none pr-7 pl-3"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2.5'%3E%3Cpath d='m19 9-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center", backgroundSize: "14px" }}
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Hint / error */}
        {errors.area ? (
          <p id="area-error" role="alert" className="text-xs text-red-600 flex items-center gap-1">
            <span aria-hidden>⚠</span> {errors.area}
          </p>
        ) : (
          <p id="area-hint" className="text-xs text-charcoal-muted">
            Used to estimate total crop production from the predicted yield.
          </p>
        )}
      </div>

      {/* Live preview */}
      {displayArea && (
        <div className="rounded-xl border border-forest/10 bg-forest/[0.04] px-4 py-3 text-sm animate-fade-in">
          <span className="text-charcoal-muted">Selected area: </span>
          <strong className="text-charcoal">{displayArea}</strong>
          {form.areaUnit === "hectares" && form.area && (
            <span className="text-charcoal-muted ml-2">
              (≈ {parseFloat((parseFloat(form.area) * 2.471).toFixed(2))} acres)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
