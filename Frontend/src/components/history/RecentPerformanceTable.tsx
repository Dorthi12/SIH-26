import { TrendingUp, Minus } from "lucide-react";
import type { CropHistoricalData } from "../../data/mockHistoricalData";
import { calculateYieldChangePct } from "../../data/mockHistoricalData";
import { cn } from "../../utils/cn";

interface RecentPerformanceTableProps {
  data: CropHistoricalData;
}

export function RecentPerformanceTable({ data }: RecentPerformanceTableProps) {
  const changePct = calculateYieldChangePct(data);
  const isPositive = changePct > 0;

  return (
    <div className="bg-white rounded-2xl border border-ivory-300 shadow-card overflow-hidden">
      {/* Table */}
      <table className="w-full text-sm" aria-label={`Recent performance data for ${data.crop}`}>
        <thead>
          <tr className="bg-ivory-100 border-b border-ivory-200">
            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-charcoal-muted/60">Year</th>
            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-charcoal-muted/60">Yield</th>
            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-charcoal-muted/60">vs Previous</th>
          </tr>
        </thead>
        <tbody>
          {data.yearlyYield.map((d, i) => {
            const prev = i > 0 ? data.yearlyYield[i - 1].yield_t_per_ha : null;
            const diff = prev !== null ? Math.round((d.yield_t_per_ha - prev) * 100) / 100 : null;
            const isFirst = i === 0;
            const isLast  = i === data.yearlyYield.length - 1;

            return (
              <tr
                key={d.year}
                className={cn(
                  "border-b border-ivory-200 last:border-0 hover:bg-forest/[0.02] transition-colors",
                  isLast && "bg-forest/[0.025]"
                )}
              >
                <td className="px-5 py-3 font-semibold tabular-nums text-charcoal">
                  {d.year}
                  {isLast && <span className="ml-2 text-2xs text-forest font-bold">(latest)</span>}
                </td>
                <td className="px-5 py-3 font-bold tabular-nums text-charcoal">
                  {d.yield_t_per_ha} t/ha
                </td>
                <td className="px-5 py-3">
                  {isFirst ? (
                    <span className="text-xs text-charcoal-muted/50">—</span>
                  ) : diff !== null ? (
                    <span className={cn(
                      "text-xs font-semibold tabular-nums flex items-center gap-1",
                      diff > 0 ? "text-forest" : diff < 0 ? "text-red-500" : "text-charcoal-muted"
                    )}>
                      {diff > 0 ? <TrendingUp className="h-3 w-3" /> : diff < 0 ? <Minus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      {diff > 0 ? "+" : ""}{diff} t/ha
                    </span>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary row */}
      <div className={cn(
        "px-5 py-3 border-t border-ivory-200 flex items-center justify-between gap-4",
        "bg-forest/[0.02]"
      )}>
        <span className="text-xs font-semibold text-charcoal-muted">
          {data.yearlyYield[0].year} → {data.yearlyYield[data.yearlyYield.length - 1].year} change
        </span>
        <span className={cn(
          "text-sm font-bold tabular-nums",
          isPositive ? "text-forest" : "text-red-500"
        )}>
          {isPositive ? "+" : ""}{changePct}%
        </span>
      </div>
    </div>
  );
}
