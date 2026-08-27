import { MapPin, Ruler, CloudRain, Sprout, Pencil, Check } from "lucide-react";
import type { RecommendationFormData } from "../../types/recommendationForm";
import { cn } from "../../utils/cn";

interface ReviewStepProps {
  form: RecommendationFormData;
  onEdit: (step: number) => void;
}

interface ReviewRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  onEdit: () => void;
  complete: boolean;
}

function ReviewRow({ icon, label, value, sub, onEdit, complete }: ReviewRowProps) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-ivory-200 last:border-0">
      <div className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
        complete ? "bg-forest/8 text-forest" : "bg-ivory-200 text-charcoal-muted"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60 mb-0.5">{label}</p>
        <p className="text-base font-bold text-charcoal">{value}</p>
        {sub && <p className="text-sm text-charcoal-muted">{sub}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {complete && <Check className="h-4 w-4 text-forest" />}
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 rounded px-1.5 py-1"
          aria-label={`Edit ${label}`}
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>
    </div>
  );
}

const CANDIDATE_CROPS = ["Maize", "Rice", "Soybean", "Millet"];

export function ReviewStep({ form, onEdit }: ReviewStepProps) {
  const areaDisplay = form.area
    ? `${form.area} ${form.areaUnit}`
    : "—";

  const hasOptional = form.irrigation !== "" || form.previousCrop !== "";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-forest/60 mb-1">Review</p>
        <h2 className="text-xl font-bold text-charcoal">Review your farm context</h2>
        <p className="text-sm text-charcoal-muted mt-1">
          Confirm these details before requesting your crop recommendation.
        </p>
      </div>

      {/* Review rows */}
      <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-1">
        <ReviewRow
          icon={<MapPin className="h-4 w-4" />}
          label="Location"
          value={form.district || "—"}
          sub={form.state}
          onEdit={() => onEdit(1)}
          complete={form.district !== ""}
        />
        <ReviewRow
          icon={<Ruler className="h-4 w-4" />}
          label="Farm Area"
          value={areaDisplay}
          onEdit={() => onEdit(2)}
          complete={form.area !== "" && parseFloat(form.area) > 0}
        />
        <ReviewRow
          icon={<CloudRain className="h-4 w-4" />}
          label="Season"
          value={form.season || "—"}
          onEdit={() => onEdit(3)}
          complete={form.season !== ""}
        />
        <ReviewRow
          icon={<Sprout className="h-4 w-4" />}
          label="Optional Context"
          value={hasOptional ? "Provided" : "Not provided (optional)"}
          sub={[form.irrigation, form.previousCrop ? `Prev: ${form.previousCrop}` : ""].filter(Boolean).join(" · ")}
          onEdit={() => onEdit(4)}
          complete={hasOptional}
        />
      </div>

      {/* Ready for analysis */}
      <div className="rounded-2xl border border-forest/15 bg-forest/[0.04] px-5 py-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-forest/70">Ready to Analyze</p>
        <p className="text-sm text-charcoal-muted leading-relaxed">
          AgriSense will evaluate the available crop options using your farm context.
        </p>
        {/* Candidate crops */}
        <div>
          <p className="text-2xs text-charcoal-muted/60 mb-2">4 candidate crops</p>
          <div className="flex flex-wrap gap-1.5">
            {CANDIDATE_CROPS.map((c) => (
              <span key={c} className="rounded-lg border border-ivory-300 bg-white px-2.5 py-1 text-xs font-semibold text-charcoal">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
