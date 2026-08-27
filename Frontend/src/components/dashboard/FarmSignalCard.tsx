import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

interface FarmSignalCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  subLabel: string;
  subValue: string;
  statusColor?: "forest" | "amber" | "charcoal";
  route: string;
  children?: React.ReactNode; // for mini-visual
  className?: string;
}

export function FarmSignalCard({
  icon,
  label,
  value,
  unit,
  subLabel,
  subValue,
  statusColor = "forest",
  route,
  children,
  className,
}: FarmSignalCardProps) {
  const navigate = useNavigate();

  const statusColors = {
    forest: "text-forest",
    amber: "text-amber-600",
    charcoal: "text-charcoal-muted",
  };

  return (
    <button
      type="button"
      onClick={() => navigate(route)}
      className={cn(
        "group flex flex-col justify-between gap-3 rounded-2xl border border-ivory-300 bg-white shadow-card p-5",
        "hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-left w-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2",
        className
      )}
      aria-label={`${label}: ${value}${unit ?? ""}. ${subLabel}: ${subValue}. Navigate to details.`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/8 text-forest shrink-0">
          {icon}
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-charcoal-muted/40 group-hover:text-forest group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
      </div>

      {/* Value */}
      <div>
        <p className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted/60 mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-charcoal tabular-nums">{value}</span>
          {unit && <span className="text-sm text-charcoal-muted">{unit}</span>}
        </div>
      </div>

      {/* Mini visual slot */}
      {children && <div className="min-h-[32px]">{children}</div>}

      {/* Sub-label + status */}
      <div className="pt-2 border-t border-ivory-200 flex items-center gap-1.5">
        <p className="text-2xs text-charcoal-muted/60">{subLabel}:</p>
        <p className={cn("text-2xs font-bold", statusColors[statusColor])}>{subValue}</p>
      </div>
    </button>
  );
}
