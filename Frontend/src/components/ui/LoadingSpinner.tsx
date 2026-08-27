import { cn } from "../../utils/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

const sizeMap: Record<string, { outer: string; inner: string }> = {
  sm: { outer: "h-5 w-5",   inner: "h-3 w-3" },
  md: { outer: "h-8 w-8",   inner: "h-4 w-4" },
  lg: { outer: "h-12 w-12", inner: "h-6 w-6" },
  xl: { outer: "h-16 w-16", inner: "h-8 w-8" },
};

export function LoadingSpinner({ size = "md", className, label }: LoadingSpinnerProps) {
  const { outer } = sizeMap[size];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      {/* Dual-ring loader */}
      <div
        className="relative flex items-center justify-center"
        role="status"
        aria-label={label ?? "Loading…"}
      >
        {/* Outer ring — slow spin */}
        <div
          className={cn(
            "absolute rounded-full border-2 border-forest/10 border-t-forest/30 animate-spin",
            outer
          )}
          style={{ animationDuration: "1.8s" }}
        />
        {/* Inner ring — faster spin, opposite direction */}
        <div
          className={cn(
            "rounded-full border-2 border-transparent border-t-forest animate-spin",
            sizeMap[size].inner
          )}
          style={{ animationDuration: "0.8s", animationDirection: "reverse" }}
        />
      </div>
      {label && (
        <p className="text-sm text-charcoal-muted font-medium animate-pulse">{label}</p>
      )}
    </div>
  );
}
