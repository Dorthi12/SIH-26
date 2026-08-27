import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../utils/cn";

export function ScoreExplanation() {
  const [open, setOpen] = useState(false);
  const [techOpen, setTechOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-ivory-300 bg-white shadow-card overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-4 px-5 py-4",
          "text-left transition-colors hover:bg-forest/[0.02]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-inset"
        )}
        aria-expanded={open}
        aria-controls="score-explanation-body"
      >
        <p className="text-sm font-semibold text-charcoal">
          How is the Suitability Score calculated?
        </p>
        {open ? (
          <ChevronUp className="h-4 w-4 text-charcoal-muted shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-charcoal-muted shrink-0" />
        )}
      </button>

      {/* Body */}
      {open && (
        <div id="score-explanation-body" className="px-5 pb-5 space-y-4 border-t border-ivory-200">
          <p className="text-sm text-charcoal-muted leading-relaxed pt-4">
            The Suitability Score represents the relative position of the predicted yield among the
            evaluated candidate crops. A score of <strong className="text-charcoal">92/100</strong> means
            Maize has one of the highest predicted yields among the evaluated options under the selected
            district, season and weather conditions.
          </p>

          {/* Technical formula */}
          <div className="rounded-xl bg-forest/[0.04] border border-forest/10 px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-forest/60 mb-3">
              Formula
            </p>
            <div className="font-mono text-sm text-charcoal space-y-1">
              <p>Score = 100 ×</p>
              <div className="pl-6 border-l-2 border-forest/20 space-y-0.5">
                <p className="text-charcoal">(yield − minimum candidate yield)</p>
                <p className="text-charcoal-muted text-xs">───────────────────────────────</p>
                <p className="text-charcoal">(maximum candidate yield − minimum candidate yield)</p>
              </div>
            </div>
          </div>

          {/* Technical sub-expandable */}
          <div>
            <button
              type="button"
              onClick={() => setTechOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-charcoal-muted hover:text-charcoal transition-colors"
              aria-expanded={techOpen}
            >
              {techOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Technical explanation
            </button>
            {techOpen && (
              <div className="mt-2 pl-4 border-l-2 border-ivory-300 space-y-1.5 text-xs text-charcoal-muted">
                <p>The score is a min-max normalisation of predicted yield values across candidate crops. It does not represent a probability, confidence, or guarantee of agricultural success.</p>
                <p>Historical stability, weather compatibility, and yield trend are supporting signals — they are not directly included in the Suitability Score formula above.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
