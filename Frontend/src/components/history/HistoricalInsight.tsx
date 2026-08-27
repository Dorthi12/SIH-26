import { Lightbulb } from "lucide-react";

interface HistoricalInsightProps {
  topCrop: string;
}

export function HistoricalInsight({ topCrop }: HistoricalInsightProps) {
  return (
    <div className="rounded-2xl border border-forest/15 bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-forest/[0.04] border-b border-forest/10 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest/10 text-forest shrink-0">
          <Lightbulb className="h-4 w-4" />
        </div>
        <p className="text-sm font-bold text-charcoal">Historical Insight</p>
      </div>

      <div className="p-5 space-y-3">
        <p className="text-sm text-charcoal leading-relaxed">
          <strong>{topCrop}</strong> shows the strongest recent yield among the evaluated crops and a
          positive historical trajectory across the displayed period.
        </p>

        <div className="rounded-xl border border-ivory-200 bg-ivory-100 px-4 py-3">
          <p className="text-xs text-charcoal-muted leading-relaxed">
            <strong className="text-charcoal">Important:</strong> Historical performance is supporting
            evidence. The final crop ranking is based primarily on predicted yield — historical data
            provides additional context for the recommendation.
          </p>
        </div>
      </div>
    </div>
  );
}
