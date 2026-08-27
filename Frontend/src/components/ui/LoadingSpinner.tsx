import { cn } from "../../utils/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

const sizeMap: Record<string, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-7 w-7 border-2",
  lg: "h-10 w-10 border-[3px]",
  xl: "h-14 w-14 border-4",
};

export function LoadingSpinner({ size = "md", className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "rounded-full border-forest/20 border-t-forest animate-spin",
          sizeMap[size]
        )}
        role="status"
        aria-label={label ?? "Loading…"}
      />
      {label && (
        <p className="text-sm text-charcoal-muted font-medium animate-pulse">{label}</p>
      )}
    </div>
  );
}
