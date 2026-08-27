import { AlertTriangle } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an unexpected error. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 px-6 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-semibold text-charcoal">{title}</h3>
        <p className="text-sm text-charcoal-muted leading-relaxed">{description}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
