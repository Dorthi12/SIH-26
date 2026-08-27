import { ArrowRight, Wheat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/Badge";
import type { CropRecommendation } from "../../types/recommendation";

interface TopOptionBannerProps {
  top: CropRecommendation;
}

export function TopOptionBanner({ top }: TopOptionBannerProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-forest/12 bg-white shadow-card overflow-hidden">
      {/* Thin top stripe */}
      <div className="h-1 w-full bg-forest" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-5 py-4">
        {/* Icon + title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest text-white shadow-sm">
            <Wheat className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-2xs font-bold uppercase tracking-widest text-forest/60 mb-0.5">Current Top Option</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-charcoal">{top.crop}</p>
              <Badge variant="default" size="sm">Ranked #1</Badge>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-center">
            <p className="text-xl font-bold text-charcoal tabular-nums">{top.predicted_yield_t_per_ha}</p>
            <p className="text-2xs text-charcoal-muted">t/ha</p>
          </div>
          <div className="h-8 w-px bg-ivory-200" />
          <div className="text-center">
            <p className="text-xl font-bold text-charcoal tabular-nums">{top.suitability_score}</p>
            <p className="text-2xs text-charcoal-muted">/ 100</p>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => navigate("/explain")}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-forest/20 bg-forest/[0.04] text-xs font-bold text-forest hover:bg-forest/[0.08] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2 group"
        >
          Why this crop?
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
      <div className="px-5 py-2 bg-ivory-50 border-t border-ivory-200">
        <p className="text-2xs text-charcoal-muted/60">Currently ranked #1 among evaluated crop options. Based on predicted yield and supporting signals.</p>
      </div>
    </div>
  );
}
