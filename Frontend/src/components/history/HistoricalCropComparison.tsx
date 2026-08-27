import { TrendingUp, Minus, TrendingDown } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { CropHistoricalData } from "../../data/mockHistoricalData";
import {
  calculateAverageYield,
  getLatestYield,
} from "../../data/mockHistoricalData";
import { cn } from "../../utils/cn";

const STABILITY_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  High: "success", Medium: "warning", Low: "danger",
};

const TREND_VARIANT: Record<string, "success" | "neutral" | "danger"> = {
  Improving: "success", Stable: "neutral", Declining: "danger",
};

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "Improving") return <TrendingUp className="h-3.5 w-3.5 text-forest" />;
  if (trend === "Declining") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-charcoal-muted" />;
}

// ── Desktop table ────────────────────────────────────────────────────────

function DesktopTable({ crops }: { crops: CropHistoricalData[] }) {
  return (
    <div className="hidden md:block overflow-hidden rounded-2xl border border-ivory-300 shadow-card">
      <table className="w-full text-sm" aria-label="Historical crop comparison">
        <thead>
          <tr className="bg-ivory-100 border-b border-ivory-300">
            {["Crop", "Latest Yield", "Avg Yield", "Trend", "Stability"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-charcoal-muted/60">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {crops.map((c) => {
            const isTop = c.crop === crops[0].crop;
            const avg = calculateAverageYield(c);
            return (
              <tr
                key={c.crop}
                className={cn(
                  "border-b border-ivory-200 last:border-0 hover:bg-forest/[0.025] transition-colors",
                  isTop && "bg-forest/[0.03]"
                )}
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-charcoal">{c.crop}</span>
                    {isTop && <Badge variant="default" size="sm">Top Pick</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3.5 font-bold text-charcoal tabular-nums">
                  {getLatestYield(c)} t/ha
                </td>
                <td className="px-4 py-3.5 tabular-nums text-charcoal-muted">
                  {avg} t/ha
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <TrendIcon trend={c.trend} />
                    <Badge variant={TREND_VARIANT[c.trend]} size="sm">{c.trend}</Badge>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant={STABILITY_VARIANT[c.stability]} size="sm">{c.stability}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Mobile cards ─────────────────────────────────────────────────────────

function MobileCards({ crops }: { crops: CropHistoricalData[] }) {
  return (
    <div className="md:hidden space-y-3">
      {crops.map((c) => {
        const isTop = c.crop === crops[0].crop;
        const avg = calculateAverageYield(c);
        return (
          <div
            key={c.crop}
            className={cn(
              "rounded-2xl border bg-white shadow-card p-4 space-y-3",
              isTop ? "border-forest/20" : "border-ivory-300"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-charcoal">{c.crop}</span>
                {isTop && <Badge variant="default" size="sm">Top Pick</Badge>}
              </div>
              <span className="text-lg font-bold text-charcoal tabular-nums">{getLatestYield(c)} t/ha</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-ivory-200 pt-2">
              <div>
                <p className="text-charcoal-muted/60 mb-0.5">Avg Yield</p>
                <p className="font-semibold text-charcoal tabular-nums">{avg} t/ha</p>
              </div>
              <div>
                <p className="text-charcoal-muted/60 mb-0.5">Trend</p>
                <div className="flex items-center gap-1">
                  <TrendIcon trend={c.trend} />
                  <Badge variant={TREND_VARIANT[c.trend]} size="sm">{c.trend}</Badge>
                </div>
              </div>
              <div>
                <p className="text-charcoal-muted/60 mb-0.5">Stability</p>
                <Badge variant={STABILITY_VARIANT[c.stability]} size="sm">{c.stability}</Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── HistoricalCropComparison ─────────────────────────────────────────────

interface HistoricalCropComparisonProps {
  crops: CropHistoricalData[];
}

export function HistoricalCropComparison({ crops }: HistoricalCropComparisonProps) {
  return (
    <>
      <DesktopTable crops={crops} />
      <MobileCards crops={crops} />
    </>
  );
}
