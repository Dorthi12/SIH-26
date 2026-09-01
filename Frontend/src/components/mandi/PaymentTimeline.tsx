import type { PaymentMilestone } from "../../types/mandi";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface PaymentTimelineProps {
  milestones: PaymentMilestone[];
}

export function PaymentTimeline({ milestones }: PaymentTimelineProps) {
  return (
    <div className="py-2">
      <h4 className="text-2xs font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 mb-4">
        🔒 Payment Protection Milestone Timeline
      </h4>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-ivory-300 dark:before:bg-charcoal-light">
        {milestones.map((item, idx) => {
          const isCompleted = item.status === "COMPLETED";
          const isCurrent = item.status === "CURRENT";

          return (
            <div key={idx} className="relative flex items-start gap-4 group">
              {/* Timeline Node Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-emerald-500 text-white shadow-xs ring-4 ring-emerald-100 dark:ring-emerald-950"
                    : isCurrent
                    ? "bg-amber text-charcoal shadow-md ring-4 ring-amber-100 dark:ring-amber-950/60 animate-bounce"
                    : "bg-ivory-200 dark:bg-charcoal-light text-charcoal-muted border border-ivory-300 dark:border-charcoal-light"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <Circle className="w-2.5 h-2.5 text-charcoal-muted" />
                )}
              </div>

              {/* Content Card */}
              <div
                className={`flex-1 p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 shadow-xs"
                    : isCompleted
                    ? "bg-white dark:bg-charcoal-dark border-ivory-300 dark:border-charcoal-light opacity-95"
                    : "bg-ivory-50/50 dark:bg-charcoal/50 border-ivory-200 dark:border-charcoal-light opacity-60"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-extrabold text-xs ${
                      isCurrent
                        ? "text-amber-900 dark:text-amber-200"
                        : isCompleted
                        ? "text-charcoal dark:text-ivory-100"
                        : "text-charcoal-muted dark:text-ivory-400"
                    }`}
                  >
                    {isCompleted ? "✓ " : isCurrent ? "● " : "○ "}
                    {item.title}
                  </span>
                  {item.timestamp && (
                    <span className="text-3xs font-mono text-charcoal-muted dark:text-ivory-400 shrink-0">
                      {item.timestamp}
                    </span>
                  )}
                </div>
                <p className="text-3xs text-charcoal-muted dark:text-ivory-400 mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
