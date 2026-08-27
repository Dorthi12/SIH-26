import { MapPin, Check, Building2 } from "lucide-react";
import { DistrictSelect } from "../ui/DistrictSelect";
import { Badge } from "../ui/Badge";
import type { RecommendationFormData } from "../../types/recommendationForm";
import { DISTRICTS } from "../../types/recommendationForm";

interface LocationStepProps {
  form: RecommendationFormData;
  errors: Partial<Record<"district" | "state", string>>;
  onChange: (patch: Partial<RecommendationFormData>) => void;
}

export function LocationStep({ form, errors, onChange }: LocationStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-forest/60 mb-1">Step 1</p>
        <h2 className="text-xl font-bold text-charcoal">Where is your farm?</h2>
        <p className="text-sm text-charcoal-muted mt-1">
          Select the district and state where your farm is located.
        </p>
      </div>

      {/* District selector */}
      <DistrictSelect
        id="district"
        label="District"
        required
        options={DISTRICTS}
        value={form.district}
        onChange={(v) => {
          const found = DISTRICTS.find((d) => d.value === v);
          onChange({ district: v, state: found?.state ?? form.state });
        }}
        error={errors.district}
      />

      {/* State — auto-filled, non-editable for MVP */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-charcoal">
          State <span className="text-amber-600" aria-hidden>*</span>
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-ivory-300 bg-ivory-50 px-4 py-3">
          <Building2 className="h-4 w-4 text-charcoal-muted/60 shrink-0" />
          <span className="text-sm font-semibold text-charcoal flex-1">{form.state}</span>
          <Badge variant="neutral" size="sm">Auto-filled</Badge>
        </div>
        <p className="text-xs text-charcoal-muted">State is determined by the selected district.</p>
      </div>

      {/* Location confirmation */}
      {form.district && (
        <div className="flex items-center gap-3 rounded-xl border border-forest/15 bg-forest/[0.04] px-4 py-3 animate-fade-in">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white shrink-0">
            <MapPin className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-charcoal">{form.district}</p>
            <p className="text-xs text-charcoal-muted">{form.state}</p>
          </div>
          <Check className="h-4 w-4 text-forest shrink-0" />
        </div>
      )}
    </div>
  );
}
