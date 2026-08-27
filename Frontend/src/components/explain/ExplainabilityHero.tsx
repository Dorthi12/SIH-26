import { useState, useEffect, useRef } from "react";
import { Wheat, CheckCircle2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { CropRecommendation } from "../../types/recommendation";
import { cn } from "../../utils/cn";

interface ExplainabilityHeroProps {
  top: CropRecommendation;
}

export function ExplainabilityHero({ top }: ExplainabilityHeroProps) {
  const [scoreVisible, setScoreVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) { setScoreVisible(true); return; }
    const t = setTimeout(() => setScoreVisible(true), 300);
    return () => clearTimeout(t);
  }, [prefersReduced]);

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-forest/15 bg-white shadow-card overflow-hidden"
    >
      {/* Top stripe */}
      <div className="h-1.5 w-full bg-forest" />

      <div className="px-6 md:px-10 py-8 md:py-10 flex flex-col md:flex-row items-center md:items-start gap-8">

        {/* Crop icon + name */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-forest text-white shadow-lg shadow-forest/20">
            <Wheat className="h-10 w-10" strokeWidth={1.5} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-forest/60">
            Recommended
          </p>
          <p className="text-2xl font-bold text-charcoal">{top.crop}</p>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px self-stretch bg-ivory-200" />
        <div className="md:hidden w-full h-px bg-ivory-200" />

        {/* Score + reasoning */}
        <div className="flex-1 space-y-5 text-center md:text-left">
          {/* Score */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-charcoal-muted/60 mb-2">
              Suitability Score
            </p>
            <div className={cn(
              "flex items-baseline gap-1.5 justify-center md:justify-start transition-all duration-700",
              scoreVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )}>
              <span className="text-6xl font-bold text-forest tabular-nums">{top.suitability_score}</span>
              <span className="text-2xl font-normal text-charcoal-muted">/100</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start mt-2">
              <Badge variant="default" size="sm">Illustrative MVP score</Badge>
            </div>
          </div>

          {/* Rank statement */}
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <CheckCircle2 className="h-5 w-5 text-forest shrink-0" />
            <p className="text-sm font-semibold text-charcoal">
              Ranked <strong className="text-forest">#1</strong> among the evaluated crop options.
            </p>
          </div>

          {/* Yield */}
          <div className="inline-flex flex-col items-center md:items-start gap-1 rounded-xl border border-forest/10 bg-forest/[0.04] px-5 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-forest/60">Predicted Yield</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-charcoal tabular-nums">{top.predicted_yield_t_per_ha}</span>
              <span className="text-base text-charcoal-muted">t/ha</span>
            </div>
            <p className="text-xs text-charcoal-muted">Highest predicted yield among the evaluated candidates.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
