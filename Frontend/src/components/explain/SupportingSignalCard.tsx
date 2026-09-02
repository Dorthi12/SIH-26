import { TrendingUp, Check } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { CropHistoricalData } from "../../data/mockHistoricalData";
import type { WeatherDataset } from "../../data/mockWeather";
import { cn } from "../../utils/cn";

// ── Single supporting signal card ─────────────────────────────────────────

interface SupportingSignalCardProps {
  number: number;
  title: string;
  level: string;
  levelVariant: "success" | "warning" | "neutral";
  description: string;
  children: React.ReactNode;
}

export function SupportingSignalCard({
  number,
  title,
  level,
  levelVariant,
  description,
  children,
}: SupportingSignalCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-ivory-300 bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-ivory-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ivory-200 text-charcoal-muted text-xs font-bold shrink-0">
            {number}
          </span>
          <p className="text-sm font-bold text-charcoal">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={levelVariant} size="sm" dot>{level}</Badge>
          <span className="text-2xs font-semibold uppercase tracking-wide text-charcoal-muted/50">
            Supporting Evidence
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4 flex-1">
        <p className="text-sm text-charcoal-muted leading-relaxed">{description}</p>
        {children}
      </div>
    </div>
  );
}

// ── Historical signal ─────────────────────────────────────────────────────

export function HistoricalSignalCard({ data }: { data: CropHistoricalData }) {
  const first = data.yearlyYield[0];
  const last  = data.yearlyYield[data.yearlyYield.length - 1];

  return (
    <SupportingSignalCard
      number={2}
      title="Historical Performance"
      level={data.stability}
      levelVariant="success"
      description={`${data.crop} shows a positive historical yield trajectory across the displayed period.`}
    >
      {/* Year endpoints */}
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-2xs text-charcoal-muted/60">{first.year}</p>
          <p className="text-base font-bold text-charcoal tabular-nums">{first.yield_t_per_ha} t/ha</p>
        </div>
        <div className="flex-1 h-px bg-forest/20 relative">
          <TrendingUp className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-5 text-forest" />
        </div>
        <div className="text-center">
          <p className="text-2xs text-charcoal-muted/60">{last.year}</p>
          <p className="text-base font-bold text-forest tabular-nums">{last.yield_t_per_ha} t/ha</p>
        </div>
      </div>

      {/* Trend + stability row */}
      <div className="flex gap-4 pt-1">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-forest" />
          <Badge variant="success" size="sm">{data.trend}</Badge>
        </div>
      </div>
    </SupportingSignalCard>
  );
}

// ── Weather signal ────────────────────────────────────────────────────────

export function WeatherSignalCard({ data }: { data: WeatherDataset }) {
  const aspects = ["Temperature", "Rainfall", "Forecast"] as const;

  return (
    <SupportingSignalCard
      number={3}
      title="Weather Compatibility"
      level={data.weather_compatibility}
      levelVariant="success"
      description="Current and forecast conditions are broadly favorable in the current context."
    >
      <div className="grid grid-cols-3 gap-2">
        {aspects.map((a) => (
          <div
            key={a}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-forest/[0.04] border border-forest/8 px-2 py-2.5 text-center"
          >
            <Check className="h-3.5 w-3.5 text-forest" strokeWidth={2.5} />
            <p className="text-2xs font-semibold text-charcoal">{a}</p>
            <p className="text-2xs text-forest font-bold">Favorable</p>
          </div>
        ))}
      </div>
    </SupportingSignalCard>
  );
}

// ── Yield trend signal ────────────────────────────────────────────────────

export function YieldTrendSignalCard({ data }: { data: CropHistoricalData }) {
  return (
    <SupportingSignalCard
      number={4}
      title="Yield Trend"
      level={data.trend}
      levelVariant="success"
      description="Recent historical yield values show an upward trajectory."
    >
      {/* Sparkline-style values */}
      <div className="flex items-end gap-1.5 flex-wrap">
        {data.yearlyYield.map((d, i) => {
          const isLast = i === data.yearlyYield.length - 1;
          return (
            <span key={d.year} className={cn(
              "text-sm tabular-nums font-semibold",
              isLast ? "text-forest" : "text-charcoal-muted"
            )}>
              {d.yield_t_per_ha}
              {!isLast && <span className="text-charcoal-muted/40 ml-1">→</span>}
            </span>
          );
        })}
        <span className="text-xs text-charcoal-muted">t/ha</span>
      </div>
    </SupportingSignalCard>
  );
}
