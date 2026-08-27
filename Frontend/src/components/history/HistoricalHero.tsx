import { TrendingUp, BarChart3, ArrowUpRight } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { CropHistoricalData } from "../../data/mockHistoricalData";
import { getLatestYield } from "../../data/mockHistoricalData";

interface HistoricalHeroProps {
  topCrop: CropHistoricalData;
}

export function HistoricalHero({ topCrop }: HistoricalHeroProps) {
  const latest = getLatestYield(topCrop);

  return (
    <div className="rounded-2xl border border-ivory-300 bg-white shadow-card overflow-hidden">
      {/* Top bar */}
      <div className="px-6 pt-6 pb-0">
        <p className="text-xs font-bold uppercase tracking-widest text-charcoal-muted/60 mb-1">
          Historical Performance
        </p>
        <p className="text-sm text-charcoal-muted max-w-md">
          Summarising crop performance across the historical period for the selected context.
        </p>
      </div>

      {/* Metric strip */}
      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-ivory-200 mt-5">
        {/* Best recent yield */}
        <div className="flex flex-col gap-2 px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest/8 text-forest">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60">
              Best Recent Yield
            </p>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-charcoal tabular-nums">{latest}</span>
            <span className="text-sm text-charcoal-muted font-medium">t/ha</span>
          </div>
          <p className="text-xs text-forest font-semibold">{topCrop.crop}</p>
        </div>

        {/* Stability */}
        <div className="flex flex-col gap-2 px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest/8 text-forest">
              <BarChart3 className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60">
              Historical Stability
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="success" size="md" dot>{topCrop.stability}</Badge>
          </div>
          <p className="text-xs text-charcoal-muted">
            For {topCrop.crop} over the displayed period
          </p>
        </div>

        {/* Trend */}
        <div className="flex flex-col gap-2 px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest/8 text-forest">
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60">
              Yield Trend
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="success" size="md">{topCrop.trend}</Badge>
          </div>
          <p className="text-xs text-charcoal-muted">
            Historical direction for {topCrop.crop}
          </p>
        </div>
      </div>
    </div>
  );
}
