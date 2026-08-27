import { cn } from "../../utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "neutral" | "amber";
type BadgeSize = "sm" | "md";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-forest/10 text-forest border-forest/20",
  success: "bg-forest/10 text-forest-700 border-forest/20",
  warning: "bg-amber/10 text-amber-600 border-amber/25",
  danger:  "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-charcoal/6 text-charcoal-light border-charcoal/10",
  amber:   "bg-amber/10 text-amber-700 border-amber/25",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-2xs px-2 py-0.5 gap-1",
  md: "text-xs  px-2.5 py-1 gap-1.5",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-forest",
  success: "bg-forest-600",
  warning: "bg-amber-500",
  danger:  "bg-red-500",
  neutral: "bg-charcoal-muted",
  amber:   "bg-amber-500",
};

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("shrink-0 rounded-full", dotColors[variant],
            size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"
          )}
        />
      )}
      {children}
    </span>
  );
}
