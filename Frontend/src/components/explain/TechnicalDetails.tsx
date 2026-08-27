import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CropRecommendation } from "../../types/recommendation";

interface TechnicalDetailsProps {
  context: { district: string; season: string; acres: number };
  rankings: CropRecommendation[];
}

export function TechnicalDetails({ context, rankings }: TechnicalDetailsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-ivory-200 bg-white/70 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-ivory-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-inset"
        aria-expanded={open}
        aria-controls="tech-details-body"
      >
        <p className="text-sm font-semibold text-charcoal-muted">Technical Details</p>
        {open ? (
          <ChevronUp className="h-4 w-4 text-charcoal-muted shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-charcoal-muted shrink-0" />
        )}
      </button>

      {open && (
        <div
          id="tech-details-body"
          className="border-t border-ivory-200 px-5 pb-5 pt-4 space-y-4 text-xs text-charcoal-muted"
        >
          {/* Input context */}
          <div className="space-y-2">
            <p className="font-bold uppercase tracking-wider text-charcoal-muted/60">Input Context</p>
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-charcoal-muted/50">District</p><p className="font-semibold text-charcoal">{context.district}</p></div>
              <div><p className="text-charcoal-muted/50">Season</p><p className="font-semibold text-charcoal">{context.season}</p></div>
              <div><p className="text-charcoal-muted/50">Land Area</p><p className="font-semibold text-charcoal">{context.acres} acres</p></div>
            </div>
          </div>

          {/* Candidate crops */}
          <div className="space-y-2">
            <p className="font-bold uppercase tracking-wider text-charcoal-muted/60">Candidate Crops</p>
            <div className="flex flex-wrap gap-2">
              {rankings.map((c) => (
                <span key={c.crop} className="rounded-md border border-ivory-300 bg-white px-2 py-1 font-semibold text-charcoal">
                  {c.crop}
                </span>
              ))}
            </div>
          </div>

          {/* Model output */}
          <div className="space-y-2">
            <p className="font-bold uppercase tracking-wider text-charcoal-muted/60">Model Output</p>
            <p className="text-charcoal-muted">Predicted Yield (t/ha) per candidate crop</p>
            <div className="space-y-1">
              {[...rankings].sort((a, b) => a.rank - b.rank).map((c) => (
                <div key={c.crop} className="flex items-center gap-2">
                  <span className="w-20 font-semibold text-charcoal">{c.crop}</span>
                  <span className="tabular-nums">{c.predicted_yield_t_per_ha} t/ha</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supporting context */}
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-wider text-charcoal-muted/60">Supporting Context</p>
            <p className="text-charcoal-muted">Weather (current + forecast) + Historical agricultural performance</p>
          </div>
        </div>
      )}
    </div>
  );
}
