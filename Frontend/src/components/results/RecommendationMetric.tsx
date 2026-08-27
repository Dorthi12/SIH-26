
import { cn } from "../../utils/cn";

interface RecommendationMetricProps {
  label: string;
  value: string;
  unit?: string;
  supportingLabel?: string;
  accent?: boolean;
  className?: string;
}

export function RecommendationMetric({
  label,
  value,
  unit,
  supportingLabel,
  accent = false,
  className,
}: RecommendationMetricProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl border bg-white p-5 shadow-card",
        accent ? "border-forest/20" : "border-ivory-300",
        className
      )}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/70">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-charcoal leading-none tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-charcoal-muted">{unit}</span>
        )}
      </div>
      {supportingLabel && (
        <p className="text-xs text-charcoal-muted">{supportingLabel}</p>
      )}
    </div>
  );
}
