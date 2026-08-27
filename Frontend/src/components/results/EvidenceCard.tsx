import { cn } from "../../utils/cn";
import type { StabilityLevel, CompatibilityLevel, YieldTrend } from "../../types/recommendation";

type EvidenceLevel = StabilityLevel | CompatibilityLevel | YieldTrend;

interface EvidenceCardProps {
  icon: React.ReactNode;
  label: string;
  value: EvidenceLevel;
  description: string;
  className?: string;
}

const LEVEL_STYLES: Record<string, { badge: string; dot: string; pulse: boolean }> = {
  High:      { badge: "bg-forest/8 text-forest border-forest/15",   dot: "bg-forest",   pulse: true },
  Medium:    { badge: "bg-amber/8 text-amber-700 border-amber/20",  dot: "bg-amber",    pulse: false },
  Low:       { badge: "bg-red-50 text-red-700 border-red-200",       dot: "bg-red-500",  pulse: false },
  Improving: { badge: "bg-forest/8 text-forest border-forest/15",   dot: "bg-forest",   pulse: true },
  Stable:    { badge: "bg-olive/8 text-olive border-olive/20",       dot: "bg-olive",    pulse: false },
  Declining: { badge: "bg-red-50 text-red-700 border-red-200",       dot: "bg-red-500",  pulse: false },
};

export function EvidenceCard({ icon, label, value, description, className }: EvidenceCardProps) {
  const styles = LEVEL_STYLES[value] ?? LEVEL_STYLES["Medium"];

  return (
    <div
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl border border-ivory-300 bg-white p-5 shadow-card",
        "hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200",
        className
      )}
    >
      {/* Icon */}
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/6 text-forest transition-all duration-200 hover:bg-forest/12">
        {icon}
      </div>

      {/* Label */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60">
          {label}
        </p>

        {/* Value badge — with animated dot for positive indicators */}
        <div className="flex items-center gap-2">
          {styles.pulse ? (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-50", styles.dot)} />
              <span className={cn("relative inline-flex h-2 w-2 rounded-full", styles.dot)} />
            </span>
          ) : (
            <span className={cn("h-2 w-2 rounded-full shrink-0", styles.dot)} />
          )}
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              styles.badge
            )}
          >
            {value}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-charcoal-muted leading-relaxed border-t border-ivory-200 pt-3">
        {description}
      </p>
    </div>
  );
}
