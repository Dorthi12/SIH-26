import { cn } from "../../utils/cn";

export type SignalStatus = "idle" | "analyzing" | "ready";

interface AnalysisSignalCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: SignalStatus;
}

const STATUS_CONFIG: Record<SignalStatus, { label: string; dot: string; text: string }> = {
  idle:      { label: "Waiting",   dot: "bg-charcoal/15",      text: "text-charcoal-muted/50" },
  analyzing: { label: "Analyzing", dot: "bg-amber animate-pulse", text: "text-amber-600" },
  ready:     { label: "Ready",     dot: "bg-forest",            text: "text-forest" },
};

export function AnalysisSignalCard({ icon, title, subtitle, status }: AnalysisSignalCardProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-card",
        "transition-all duration-500",
        status === "ready"   && "border-forest/20",
        status === "analyzing" && "border-amber/30",
        status === "idle"    && "border-ivory-300 opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-500",
            status === "ready"     && "bg-forest/8 text-forest",
            status === "analyzing" && "bg-amber/8 text-amber-600",
            status === "idle"      && "bg-ivory-200 text-charcoal-muted/40"
          )}
        >
          {icon}
        </span>

        {/* Status dot + label */}
        <div className="flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
          <span className={cn("text-2xs font-semibold uppercase tracking-wide", cfg.text)}>
            {cfg.label}
          </span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-charcoal leading-snug">{title}</p>
        <p className="text-2xs text-charcoal-muted mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
