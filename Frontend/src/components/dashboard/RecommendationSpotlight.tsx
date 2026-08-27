import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wheat, ArrowRight, CheckCircle2, TrendingUp, CloudSun } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { CropRecommendation } from "../../types/recommendation";

// ── Circular suitability mini-gauge ─────────────────────────────────────

interface SuitabilityGaugeProps {
  score: number;
  size?: number;
}

export function SuitabilityMiniGauge({ score, size = 96 }: SuitabilityGaugeProps) {
  const [displayed, setDisplayed] = useState(0);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) { setDisplayed(score); return; }
    let raf: number;
    const start = performance.now();
    const dur = 1200;
    const animate = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * score));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    const delay = setTimeout(() => { raf = requestAnimationFrame(animate); }, 400);
    return () => { clearTimeout(delay); cancelAnimationFrame(raf); };
  }, [score, prefersReduced]);

  const r = (size / 2) - 8;
  const circumference = 2 * Math.PI * r;
  const filled = (displayed / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e6ddd0" strokeWidth="7" />
        {/* Progress */}
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke="#1a3d2e" strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          className="transition-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-charcoal tabular-nums leading-none">{displayed}</span>
        <span className="text-2xs text-charcoal-muted leading-none mt-0.5">/100</span>
      </div>
    </div>
  );
}

// ── Recommendation Spotlight card ─────────────────────────────────────────

interface RecommendationSpotlightProps {
  top: CropRecommendation;
}

export function RecommendationSpotlight({ top }: RecommendationSpotlightProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-forest/12 bg-white shadow-card overflow-hidden">
      {/* Forest top stripe */}
      <div className="h-1 w-full bg-forest" />

      <div className="p-5 md:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-charcoal-muted/60 mb-1">
              Current Recommendation
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-white shadow-sm">
                <Wheat className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-charcoal">{top.crop}</h2>
              <Badge variant="default" size="sm">Ranked #1</Badge>
            </div>
          </div>
        </div>

        {/* Main content — gauge + metrics */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Gauge */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <SuitabilityMiniGauge score={top.suitability_score} size={108} />
            <p className="text-2xs font-semibold uppercase tracking-wider text-charcoal-muted/60">
              Suitability
            </p>
          </div>

          {/* Vertical divider */}
          <div className="hidden sm:block w-px self-stretch bg-ivory-200" />

          {/* Metrics grid */}
          <div className="flex-1 grid grid-cols-2 gap-3 w-full">
            <div className="rounded-xl bg-ivory-50 border border-ivory-200 px-3 py-2.5">
              <p className="text-2xs text-charcoal-muted/60 mb-0.5">Predicted Yield</p>
              <p className="text-lg font-bold text-charcoal tabular-nums">{top.predicted_yield_t_per_ha} t/ha</p>
            </div>
            <div className="rounded-xl bg-ivory-50 border border-ivory-200 px-3 py-2.5">
              <p className="text-2xs text-charcoal-muted/60 mb-0.5">Est. Production</p>
              <p className="text-lg font-bold text-charcoal tabular-nums">{top.estimated_production_tonnes} t</p>
            </div>
            <div className="rounded-xl bg-ivory-50 border border-ivory-200 px-3 py-2.5">
              <p className="text-2xs text-charcoal-muted/60 mb-0.5">Historical Stability</p>
              <Badge variant="success" size="sm" dot>{top.historical_stability}</Badge>
            </div>
            <div className="rounded-xl bg-ivory-50 border border-ivory-200 px-3 py-2.5">
              <p className="text-2xs text-charcoal-muted/60 mb-0.5">Yield Trend</p>
              <div className="flex items-center gap-1 mt-0.5">
                <TrendingUp className="h-3.5 w-3.5 text-forest" />
                <Badge variant="success" size="sm">{top.yield_trend}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence bar */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-ivory-200">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-forest" />
            <span className="text-xs text-charcoal-muted">High historical stability</span>
          </div>
          <span className="text-charcoal-muted/30 text-xs">·</span>
          <div className="flex items-center gap-1.5">
            <CloudSun className="h-3.5 w-3.5 text-forest/70" />
            <span className="text-xs text-charcoal-muted">High weather compatibility</span>
          </div>
          <span className="text-charcoal-muted/30 text-xs">·</span>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-forest/70" />
            <span className="text-xs text-charcoal-muted">Improving yield trend</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate("/results")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 group"
          >
            View Recommendation
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/explain")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-ivory-300 text-xs font-semibold text-charcoal hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
          >
            Why this crop?
          </button>
        </div>
      </div>
    </div>
  );
}
