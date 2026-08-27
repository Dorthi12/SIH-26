import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Step {
  number: string;
  label: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number; // 1-indexed
  className?: string;
}

// ---------------------------------------------------------------------------
// StepProgress — desktop (full) + mobile (compact) variants
// ---------------------------------------------------------------------------

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <>
      {/* ── Desktop ── */}
      <nav
        aria-label="Progress"
        className={cn("hidden sm:flex items-center justify-center gap-0", className)}
      >
        {steps.map((step, idx) => {
          const num = idx + 1;
          const isCompleted = num < currentStep;
          const isActive = num === currentStep;
          const isUpcoming = num > currentStep;

          return (
            <React.Fragment key={step.number}>
              {/* Step node */}
              <div className="flex flex-col items-center gap-2">
                {/* Circle */}
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isCompleted &&
                      "border-forest bg-forest text-white",
                    isActive &&
                      "border-forest bg-white text-forest shadow-sm shadow-forest/20",
                    isUpcoming &&
                      "border-charcoal/15 bg-white text-charcoal-muted"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <span
                      className={cn(
                        "text-xs font-semibold tabular-nums",
                        isActive ? "text-forest" : "text-charcoal-muted"
                      )}
                    >
                      {step.number}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isActive ? "text-charcoal" : "text-charcoal-muted/60"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (not after last step) */}
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px w-16 lg:w-24 mb-5 mx-1 transition-colors duration-300",
                    isCompleted ? "bg-forest/60" : "bg-charcoal/10"
                  )}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* ── Mobile compact ── */}
      <div className="sm:hidden flex items-center gap-2" aria-label="Progress">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-forest bg-white shrink-0">
          <span className="text-xs font-semibold text-forest">
            {steps[currentStep - 1]?.number}
          </span>
        </div>
        <div>
          <p className="text-xs text-charcoal-muted leading-none mb-0.5">
            Step {currentStep} of {steps.length}
          </p>
          <p className="text-sm font-semibold text-charcoal leading-tight">
            {steps[currentStep - 1]?.label}
          </p>
        </div>
      </div>
    </>
  );
}
