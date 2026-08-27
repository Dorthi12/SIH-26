import { cn } from "../../utils/cn";

// ---------------------------------------------------------------------------
// Button variants
// ---------------------------------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  as?: "button";
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-forest text-white",
    "hover:bg-forest-600 active:bg-forest-800",
    "shadow-sm hover:shadow-md",
    "border border-forest-600",
  ].join(" "),

  secondary: [
    "bg-white text-forest",
    "border border-forest/25",
    "hover:bg-forest-50 hover:border-forest/40",
    "shadow-sm",
  ].join(" "),

  ghost: [
    "bg-transparent text-charcoal-light",
    "hover:bg-forest/6 hover:text-forest",
    "border border-transparent",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 gap-2   rounded-xl",
  lg: "text-base px-6 py-3  gap-2.5 rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled ?? loading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center font-medium",
        "transition-all duration-200 ease-smooth",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2",
        "select-none whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <SpinnerIcon className="h-4 w-4 animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="shrink-0">{icon}</span>
          )}
          {children && <span>{children}</span>}
          {icon && iconPosition === "right" && (
            <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
