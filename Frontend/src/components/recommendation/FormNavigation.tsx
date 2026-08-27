import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

interface FormNavigationProps {
  step: number;
  totalSteps: number;
  canNext: boolean;
  isLastStep: boolean;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip?: () => void; // for optional step
  showSkip?: boolean;
}

export function FormNavigation({
  step,
  canNext,
  isLastStep,
  isLoading,
  onBack,
  onNext,
  onSkip,
  showSkip = false,
}: FormNavigationProps) {
  return (
    <div className="flex items-center gap-3 pt-2">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className={cn(
          "flex items-center gap-1.5 px-4 py-3 rounded-xl border border-ivory-300 bg-white text-sm font-semibold text-charcoal",
          "hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2",
          step === 1 && "invisible"
        )}
        aria-label="Go to previous step"
        tabIndex={step === 1 ? -1 : undefined}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Skip (optional step) */}
      {showSkip && onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="px-4 py-3 text-sm font-medium text-charcoal-muted hover:text-charcoal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20 rounded-xl"
        >
          Skip
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Next / Submit */}
      <button
        type="button"
        onClick={onNext}
        disabled={isLoading}
        className={cn(
          "group flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2",
          canNext
            ? "bg-forest text-white hover:bg-forest-600 hover:shadow-md"
            : "bg-forest/50 text-white/70 cursor-not-allowed",
        )}
        aria-disabled={!canNext}
        aria-label={isLastStep ? "Get crop recommendation" : "Continue to next step"}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing…
          </>
        ) : isLastStep ? (
          <>
            Get Crop Recommendation
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </button>
    </div>
  );
}
