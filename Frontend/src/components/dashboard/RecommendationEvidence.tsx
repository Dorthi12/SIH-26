import { ArrowRight, TrendingUp, BarChart3, CloudSun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/Badge";
import type { CropRecommendation } from "../../types/recommendation";

interface RecommendationEvidenceProps {
  top: CropRecommendation;
}

export function RecommendationEvidence({ top }: RecommendationEvidenceProps) {
  const navigate = useNavigate();

  const pills = [
    {
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      label: "Predicted Yield",
      value: `${top.predicted_yield_t_per_ha} t/ha`,
      variant: "default" as const,
    },
    {
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      label: "Historical Stability",
      value: top.historical_stability,
      variant: "success" as const,
    },
    {
      icon: <CloudSun className="h-3.5 w-3.5" />,
      label: "Weather Compatibility",
      value: top.weather_compatibility,
      variant: "success" as const,
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-ivory-300 bg-white shadow-card px-5 py-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60">
          Why <span className="text-forest">{top.crop}</span>?
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {pills.map((p) => (
            <div key={p.label} className="flex items-center gap-1.5 rounded-xl border border-ivory-200 bg-ivory-50 px-3 py-1.5">
              <span className="text-forest/60">{p.icon}</span>
              <span className="text-2xs text-charcoal-muted">{p.label}</span>
              <Badge variant={p.variant} size="sm">{p.value}</Badge>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate("/explain")}
        className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-1 rounded group"
      >
        See how the recommendation was formed
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
