import { Badge } from "../ui/Badge";
import type { SCORE_EXPLANATION } from "../../data/mockExplanation";

interface ScoreDerivedCardProps {
  scoreExplanation: typeof SCORE_EXPLANATION;
}

export function ScoreDerivedCard({ scoreExplanation }: ScoreDerivedCardProps) {
  const { illustrative, score, topYield, minYield, maxYield } = scoreExplanation;

  return (
    <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6 space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-bold text-charcoal">Suitability Score:</p>
        <span className="text-lg font-bold text-forest tabular-nums">{score} / 100</span>
        {illustrative && <Badge variant="neutral" size="sm">Illustrative MVP score</Badge>}
      </div>

      <div className="rounded-xl bg-forest/[0.03] border border-forest/8 p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-forest/60">
          Min-Max Normalisation Formula
        </p>
        <div className="font-mono text-sm text-charcoal space-y-1">
          <p>Score = 100 ×</p>
          <div className="pl-5 border-l-2 border-forest/20 space-y-0.5 text-xs">
            <p>(Yield − Minimum Yield)</p>
            <p className="text-charcoal-muted/60">────────────────────────────</p>
            <p>(Maximum Yield − Minimum Yield)</p>
          </div>
        </div>

        {/* Reference values */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-forest/10">
          {[
            { label: "Min Yield",        value: `${minYield} t/ha` },
            { label: `${topYield === maxYield ? "Max / Maize" : "Max"} Yield`, value: `${maxYield} t/ha` },
            { label: "Computed",         value: `${Math.round(((topYield - minYield) / (maxYield - minYield)) * 100)} / 100` },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-2xs text-charcoal-muted/60">{m.label}</p>
              <p className="text-sm font-bold text-charcoal tabular-nums">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {illustrative && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-charcoal-muted leading-relaxed">
          <strong className="text-charcoal">Note:</strong> The formula above produces a computed score
          of <strong>{Math.round(((topYield - minYield) / (maxYield - minYield)) * 100)}/100</strong>.
          The displayed score of <strong>{score}/100</strong> is an illustrative MVP value defined in
          the demo data. The backend scoring formula will provide the production value when connected.
          The UI never presents contradictory mathematics.
        </div>
      )}

      <p className="text-2xs text-charcoal-muted/50">
        The current prototype expresses suitability as the relative position of a crop's predicted yield
        among the evaluated candidates.
      </p>
    </div>
  );
}
