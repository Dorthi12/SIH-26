import { Check, TrendingUp, Wheat } from "lucide-react";
import { cn } from "../../utils/cn";
import type { CropRecommendation } from "../../types/recommendation";

// ---------------------------------------------------------------------------
// RankingExplanation — why crop #1 is ranked first
// ---------------------------------------------------------------------------

interface RankingExplanationProps {
  rankings: CropRecommendation[];
}

export function RankingExplanation({ rankings }: RankingExplanationProps) {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  const top  = sorted[0];
  const next = sorted[1];

  const yieldDiff = (top.predicted_yield_t_per_ha - next.predicted_yield_t_per_ha).toFixed(1);

  const bullets: { icon: React.ReactNode; text: string; primary?: boolean }[] = [
    {
      icon: <Check className="h-3.5 w-3.5" />,
      text: `Historical stability: ${top.historical_stability}`,
    },
    {
      icon: <Check className="h-3.5 w-3.5" />,
      text: `Weather compatibility: ${top.weather_compatibility}`,
    },
    {
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      text: `Yield trend: ${top.yield_trend}`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main explanation card */}
      <div className="bg-white rounded-2xl border border-forest/15 shadow-card overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-forest/[0.04] border-b border-forest/10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white shrink-0">
            <Wheat className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-charcoal">
              Why is {top.crop} ranked #1?
            </h3>
            <p className="text-xs text-charcoal-muted">Primary ranking signal + supporting evidence</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Primary signal */}
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-forest/60 mb-2">
              Primary Ranking Signal
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {/* Top crop yield */}
              <div className={cn(
                "flex-1 min-w-[130px] rounded-xl border border-forest/15 bg-forest/[0.04] px-4 py-3 text-center"
              )}>
                <p className="text-xs font-semibold text-charcoal mb-0.5">{top.crop}</p>
                <p className="text-2xl font-bold text-forest tabular-nums">
                  {top.predicted_yield_t_per_ha}
                  <span className="text-sm font-normal text-charcoal-muted"> t/ha</span>
                </p>
              </div>

              {/* vs separator */}
              <div className="text-center">
                <p className="text-xs text-charcoal-muted font-semibold">vs next best</p>
                <p className="text-sm font-bold text-forest">+{yieldDiff} t/ha</p>
              </div>

              {/* Next best yield */}
              <div className="flex-1 min-w-[130px] rounded-xl border border-ivory-300 bg-white px-4 py-3 text-center opacity-70">
                <p className="text-xs font-semibold text-charcoal mb-0.5">{next.crop}</p>
                <p className="text-2xl font-bold text-charcoal tabular-nums">
                  {next.predicted_yield_t_per_ha}
                  <span className="text-sm font-normal text-charcoal-muted"> t/ha</span>
                </p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <p className="text-sm text-charcoal-muted leading-relaxed border-t border-ivory-200 pt-4">
            <strong className="text-charcoal">{top.crop}</strong> has the highest predicted yield
            among the evaluated candidate crops under the selected conditions.
            Predicted yield is the primary signal used to rank candidate crops.
          </p>

          {/* Supporting evidence */}
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted/50 mb-2">
              Supporting Evidence
            </p>
            <ul className="space-y-1.5">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-charcoal-light">
                  <span className="text-forest shrink-0">{b.icon}</span>
                  {b.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="rounded-xl border border-ivory-300 bg-white px-5 py-4 flex items-start gap-3 shadow-sm">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/8 mt-0.5">
          <span className="text-forest text-xs font-bold">!</span>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-charcoal">Key Insight</p>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            {top.crop} leads the evaluated options by predicted yield, while also showing
            favorable historical and weather indicators.
          </p>
        </div>
      </div>
    </div>
  );
}
