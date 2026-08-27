import { TrendingUp, ArrowUpRight } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { CropHistoricalData } from "../../data/mockHistoricalData";
import {
  calculateYieldChange,
  calculateYieldChangePct,
  getEarliestYield,
  getLatestYield,
} from "../../data/mockHistoricalData";
import { cn } from "../../utils/cn";

interface RecommendedCropHistoryProps {
  data: CropHistoricalData;
}

export function RecommendedCropHistory({ data }: RecommendedCropHistoryProps) {
  const earliest = data.yearlyYield[0];
  const latest   = data.yearlyYield[data.yearlyYield.length - 1];
  const change   = calculateYieldChange(data);
  const changePct = calculateYieldChangePct(data);
  const isPositive = change > 0;

  return (
    <div className="rounded-2xl border border-forest/15 bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-forest/[0.04] border-b border-forest/10 flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-forest/60">
            Recommended Crop
          </span>
          <p className="text-lg font-bold text-charcoal mt-0.5">{data.crop}</p>
        </div>
        <Badge variant="success" size="md" dot>{data.stability} Stability</Badge>
      </div>

      <div className="p-5 space-y-5">
        {/* Yield endpoints */}
        <div className="grid grid-cols-3 gap-3 items-center">
          <div className="text-center">
            <p className="text-2xs text-charcoal-muted/60 mb-1">{earliest.year}</p>
            <p className="text-xl font-bold text-charcoal tabular-nums">{getEarliestYield(data)}</p>
            <p className="text-xs text-charcoal-muted">t/ha</p>
          </div>

          {/* Arrow + change */}
          <div className="flex flex-col items-center gap-1">
            <ArrowUpRight className={cn("h-5 w-5", isPositive ? "text-forest" : "text-red-500")} />
            <p className={cn("text-sm font-bold tabular-nums", isPositive ? "text-forest" : "text-red-500")}>
              {isPositive ? "+" : ""}{change} t/ha
            </p>
            <p className={cn("text-2xs font-semibold", isPositive ? "text-forest/70" : "text-red-400")}>
              {isPositive ? "+" : ""}{changePct}%
            </p>
          </div>

          <div className="text-center">
            <p className="text-2xs text-charcoal-muted/60 mb-1">{latest.year}</p>
            <p className="text-xl font-bold text-forest tabular-nums">{getLatestYield(data)}</p>
            <p className="text-xs text-charcoal-muted">t/ha</p>
          </div>
        </div>

        {/* Trend + Stability */}
        <div className="grid grid-cols-2 gap-3 border-t border-ivory-200 pt-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-forest/60 shrink-0" />
            <div>
              <p className="text-2xs text-charcoal-muted/60">Yield Trend</p>
              <p className="text-sm font-semibold text-charcoal">{data.trend}</p>
            </div>
          </div>
          <div>
            <p className="text-2xs text-charcoal-muted/60">Stability</p>
            <Badge variant="success" size="sm">{data.stability}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
