import { TrendingUp, Minus, TrendingDown, Info } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { CropHistoricalData } from "../../data/mockHistoricalData";
import { cn } from "../../utils/cn";

// ── Shared tooltip component ────────────────────────────────────────────────

interface InfoTooltipProps {
  text: string;
}

function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <div className="relative group inline-flex">
      <button
        type="button"
        aria-label={`Information: ${text}`}
        className="flex h-4 w-4 items-center justify-center rounded-full text-charcoal-muted/50 hover:text-charcoal-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-1"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <div
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50",
          "w-52 rounded-lg bg-charcoal px-3 py-2 text-xs text-white shadow-lg",
          "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity",
          "leading-relaxed"
        )}
      >
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-charcoal" />
      </div>
    </div>
  );
}

const STABILITY_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  High: "success", Medium: "warning", Low: "danger",
};

export function StabilitySection({ crops }: { crops: CropHistoricalData[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <p className="text-xs text-charcoal-muted leading-relaxed">
          Stability describes how consistently a crop has performed across the historical period shown.
        </p>
        <InfoTooltip text="Historical stability summarises how consistently crop yield has behaved across the displayed period." />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {crops.map((c) => (
          <div
            key={c.crop}
            className={cn(
              "rounded-xl border bg-white px-4 py-3.5 text-center space-y-2 shadow-sm hover:shadow-card transition-shadow",
              c.crop === crops[0].crop ? "border-forest/20" : "border-ivory-300"
            )}
          >
            <p className="text-xs font-bold text-charcoal">{c.crop}</p>
            <Badge variant={STABILITY_VARIANT[c.stability]} size="sm" dot>{c.stability}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TrendSection ────────────────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "Improving") return <TrendingUp className="h-4 w-4 text-forest" />;
  if (trend === "Declining") return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-charcoal-muted" />;
}

const TREND_VARIANT: Record<string, "success" | "neutral" | "danger"> = {
  Improving: "success", Stable: "neutral", Declining: "danger",
};

export function TrendSection({ crops }: { crops: CropHistoricalData[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <p className="text-xs text-charcoal-muted leading-relaxed">
          Yield trend describes the direction of historical yield movement across the displayed period.
        </p>
        <InfoTooltip text="Yield trend describes the direction of historical yield movement across the displayed period." />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {crops.map((c) => (
          <div
            key={c.crop}
            className={cn(
              "rounded-xl border bg-white px-4 py-3.5 text-center space-y-2 shadow-sm hover:shadow-card transition-shadow",
              c.crop === crops[0].crop ? "border-forest/20" : "border-ivory-300"
            )}
          >
            <p className="text-xs font-bold text-charcoal">{c.crop}</p>
            <div className="flex items-center justify-center gap-1.5">
              <TrendIcon trend={c.trend} />
              <Badge variant={TREND_VARIANT[c.trend]} size="sm">{c.trend}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
