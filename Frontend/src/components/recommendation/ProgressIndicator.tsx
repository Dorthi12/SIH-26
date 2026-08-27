import { cn } from "../../utils/cn";
import { Check } from "lucide-react";

interface Step {
  number: number;
  label: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number; // 1-indexed
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="w-full">
      {/* Desktop — horizontal dots + labels */}
      <div className="hidden sm:flex items-center justify-center gap-0">
        {steps.map((step, i) => {
          const isDone   = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isLast   = i === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center">
              {/* Node */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300",
                    isDone   ? "bg-forest border-forest text-white" :
                    isActive ? "bg-white border-forest text-forest shadow-sm shadow-forest/20" :
                               "bg-white border-ivory-300 text-charcoal-muted"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={2.5} /> : step.number}
                </div>
                <p className={cn(
                  "text-2xs font-semibold whitespace-nowrap leading-none",
                  isActive ? "text-forest" : isDone ? "text-forest/60" : "text-charcoal-muted/50"
                )}>
                  {step.label}
                </p>
              </div>
              {/* Connector */}
              {!isLast && (
                <div className={cn(
                  "w-16 md:w-24 h-px mx-1 mb-5 transition-colors duration-300",
                  isDone ? "bg-forest" : "bg-ivory-300"
                )} aria-hidden />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile — compact label */}
      <div className="sm:hidden flex items-center gap-2">
        <div className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold bg-forest text-white"
        )}>
          {currentStep}
        </div>
        <div>
          <p className="text-xs text-charcoal-muted/60 font-medium">Step {currentStep} of {steps.length}</p>
          <p className="text-sm font-semibold text-charcoal">{steps[currentStep - 1]?.label}</p>
        </div>
        {/* Mini progress bar */}
        <div className="flex-1 h-1.5 rounded-full bg-ivory-200 overflow-hidden ml-2">
          <div
            className="h-full rounded-full bg-forest transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
