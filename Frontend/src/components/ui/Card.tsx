import { cn } from "../../utils/cn";

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds hover shadow lift effect */
  hoverable?: boolean;
  /** Removes padding for custom layouts */
  noPadding?: boolean;
}

export function Card({ hoverable, noPadding, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl border border-ivory-300 shadow-card",
        "transition-shadow duration-200 ease-smooth",
        hoverable && "hover:shadow-card-hover cursor-pointer",
        !noPadding && "p-5 md:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CardHeader / CardTitle / CardContent — optional subcomponents
// ---------------------------------------------------------------------------

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-charcoal leading-snug", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-sm text-charcoal-muted", className)} {...props}>
      {children}
    </div>
  );
}
