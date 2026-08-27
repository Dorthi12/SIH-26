import { cn } from "../../utils/cn";

interface WeatherMetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  context?: string;
  className?: string;
}

export function WeatherMetricCard({
  icon,
  label,
  value,
  unit,
  context,
  className,
}: WeatherMetricCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-ivory-300 bg-white p-4 shadow-card",
        "hover:shadow-card-hover transition-shadow duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest/6 text-forest">
          {icon}
        </span>
        <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60 text-right leading-tight">
          {label}
        </p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-charcoal tabular-nums">{value}</span>
        {unit && <span className="text-sm text-charcoal-muted">{unit}</span>}
      </div>

      {context && (
        <p className="text-2xs text-charcoal-muted/70 leading-snug border-t border-ivory-200 pt-2.5">
          {context}
        </p>
      )}
    </div>
  );
}
