import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, TrendingUp, ChevronRight } from "lucide-react";
import type { CropRecommendation } from "../../types/recommendation";
import { cn } from "../../utils/cn";

interface DecisionSummaryProps {
  top: CropRecommendation;
  evidenceSectionId?: string;
}

export function DecisionSummary({ top, evidenceSectionId = "evidence" }: DecisionSummaryProps) {
  const navigate = useNavigate();

  const handleExplore = () => {
    const el = document.getElementById(evidenceSectionId);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const bullets = [
    { icon: <Check className="h-3.5 w-3.5" />, text: "Strong predicted yield among evaluated options" },
    { icon: <Check className="h-3.5 w-3.5" />, text: "High historical stability" },
    { icon: <Check className="h-3.5 w-3.5" />, text: "Favorable weather compatibility" },
    { icon: <TrendingUp className="h-3.5 w-3.5" />, text: "Improving historical yield trend" },
  ];

  return (
    <div className="rounded-2xl border border-forest/20 bg-white shadow-card overflow-hidden">
      {/* Header stripe */}
      <div className="bg-forest px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-white/60">
          Your Farm Decision
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Crop + score row */}
        <div className="flex flex-wrap items-start gap-6">
          <div>
            <p className="text-2xs text-charcoal-muted/60 uppercase tracking-wide font-semibold mb-1">
              Recommended Crop
            </p>
            <p className="text-3xl font-bold text-charcoal tracking-tight">{top.crop.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-2xs text-charcoal-muted/60 uppercase tracking-wide font-semibold mb-1">
              Suitability
            </p>
            <p className="text-3xl font-bold text-forest tabular-nums">
              {top.suitability_score}
              <span className="text-base font-normal text-charcoal-muted"> /100</span>
            </p>
          </div>
          <div>
            <p className="text-2xs text-charcoal-muted/60 uppercase tracking-wide font-semibold mb-1">
              Predicted Yield
            </p>
            <p className="text-3xl font-bold text-charcoal tabular-nums">
              {top.predicted_yield_t_per_ha}
              <span className="text-base font-normal text-charcoal-muted"> t/ha</span>
            </p>
          </div>
          <div>
            <p className="text-2xs text-charcoal-muted/60 uppercase tracking-wide font-semibold mb-1">
              Estimated Production
            </p>
            <p className="text-3xl font-bold text-charcoal tabular-nums">
              {top.estimated_production_tonnes}
              <span className="text-base font-normal text-charcoal-muted"> tonnes</span>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-ivory-200" />

        {/* Why bullets */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60 mb-3">
            Why?
          </p>
          <ul className="space-y-2">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-charcoal-light">
                <span className="text-forest shrink-0">{b.icon}</span>
                {b.text}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={handleExplore}
            className={cn(
              "group flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl",
              "bg-forest text-white text-sm font-semibold border border-forest-600",
              "hover:bg-forest-600 shadow-sm hover:shadow-md transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
            )}
          >
            Explore Evidence
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/recommendation")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl",
              "bg-white text-charcoal text-sm font-semibold border border-ivory-300",
              "hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
            )}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Start New Recommendation
          </button>
        </div>
      </div>
    </div>
  );
}
