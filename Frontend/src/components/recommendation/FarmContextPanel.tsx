import { MapPin, Ruler, CloudRain, Check, Circle } from "lucide-react";
import type { RecommendationFormData } from "../../types/recommendationForm";
import { countCompleted, REQUIRED_TOTAL, getCompletionFlags } from "../../types/recommendationForm";
import { cn } from "../../utils/cn";

interface FarmContextPanelProps {
  form: RecommendationFormData;
}

export function FarmContextPanel({ form }: FarmContextPanelProps) {
  const completed  = countCompleted(form);
  const pct        = Math.round((completed / REQUIRED_TOTAL) * 100);
  const isReady    = completed === REQUIRED_TOTAL;
  const flags      = getCompletionFlags(form);

  const rows = [
    {
      icon: <MapPin className="h-3.5 w-3.5" />,
      label: "Location",
      value: form.district ? `${form.district}, ${form.state}` : null,
      done: flags.location,
    },
    {
      icon: <Ruler className="h-3.5 w-3.5" />,
      label: "Area",
      value: form.area ? `${form.area} ${form.areaUnit}` : null,
      done: flags.area,
    },
    {
      icon: <CloudRain className="h-3.5 w-3.5" />,
      label: "Season",
      value: form.season || null,
      done: flags.season,
    },
  ] as const;

  return (
    <aside
      className="bg-white rounded-2xl border border-ivory-300 shadow-card overflow-hidden"
      aria-label="Your farm context"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-ivory-200 bg-forest/[0.02]">
        <p className="text-2xs font-bold uppercase tracking-widest text-forest/60">Your Farm Context</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Context rows */}
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start gap-3">
              <div className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5",
                row.done ? "bg-forest/8 text-forest" : "bg-ivory-200 text-charcoal-muted/40"
              )}>
                {row.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xs text-charcoal-muted/60 font-medium">{row.label}</p>
                {row.done && row.value ? (
                  <p className="text-sm font-semibold text-charcoal truncate">{row.value}</p>
                ) : (
                  <p className="text-sm text-charcoal-muted/40 italic">Not yet entered</p>
                )}
              </div>
              {row.done ? (
                <Check className="h-3.5 w-3.5 text-forest shrink-0 mt-1.5" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-charcoal-muted/20 shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>

        {/* Optional context */}
        {(form.irrigation || form.previousCrop) && (
          <div className="rounded-xl border border-ivory-200 bg-ivory-50 px-3 py-2.5 space-y-0.5">
            <p className="text-2xs text-charcoal-muted/60 font-bold uppercase tracking-wider">Optional</p>
            {form.irrigation && <p className="text-xs text-charcoal-light">{form.irrigation}</p>}
            {form.previousCrop && <p className="text-xs text-charcoal-light">Prev: {form.previousCrop}</p>}
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-ivory-200" />

        {/* Farm profile completion */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-charcoal">Farm Profile</p>
            <p className="text-xs font-bold tabular-nums text-forest">{pct}%</p>
          </div>
          <div className="h-2 rounded-full bg-ivory-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-forest transition-all duration-500 ease-smooth"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Farm profile completion"
            />
          </div>
          <p className={cn(
            "text-xs font-semibold",
            isReady ? "text-forest" : "text-charcoal-muted"
          )}>
            {isReady ? "✓ Ready for recommendation" : `${REQUIRED_TOTAL - completed} required field${REQUIRED_TOTAL - completed !== 1 ? "s" : ""} remaining`}
          </p>
        </div>

        {/* What we'll analyze */}
        <div className="rounded-xl border border-ivory-200 bg-white px-3 py-3 space-y-2">
          <p className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted/60">What we'll evaluate</p>
          {["Local Conditions", "Weather Context", "Historical Performance", "Yield Prediction"].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-forest/40 shrink-0" />
              <p className="text-xs text-charcoal-light">{s}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
