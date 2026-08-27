import { cn } from "../../utils/cn";
import { Card } from "./Card";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;
  };
  className?: string;
  /** Subtle accent colour strip on the left border */
  accent?: "forest" | "olive" | "amber";
}

const accentClasses: Record<string, string> = {
  forest: "border-l-4 border-l-forest",
  olive:  "border-l-4 border-l-olive",
  amber:  "border-l-4 border-l-amber",
};

const trendIcon = {
  up:      { symbol: "↑", color: "text-forest-600" },
  down:    { symbol: "↓", color: "text-red-600" },
  neutral: { symbol: "→", color: "text-charcoal-muted" },
};

export function MetricCard({
  label,
  value,
  unit,
  icon,
  trend,
  accent,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-3",
        accent && accentClasses[accent],
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-charcoal-muted uppercase tracking-wide leading-none">
          {label}
        </p>
        {icon && (
          <span className="text-forest/50 shrink-0">{icon}</span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold text-charcoal leading-none tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-charcoal-muted font-normal">{unit}</span>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1">
          <span className={cn("text-xs font-medium", trendIcon[trend.direction].color)}>
            {trendIcon[trend.direction].symbol}
          </span>
          <span className="text-2xs text-charcoal-muted">{trend.label}</span>
        </div>
      )}
    </Card>
  );
}
