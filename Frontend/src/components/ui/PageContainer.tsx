import { cn } from "../../utils/cn";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Constrain content to a max-width */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** Add vertical padding */
  padded?: boolean;
}

const maxWidthClasses: Record<string, string> = {
  sm:   "max-w-2xl",
  md:   "max-w-4xl",
  lg:   "max-w-5xl",
  xl:   "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-none",
};

export function PageContainer({
  maxWidth = "xl",
  padded = true,
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8",
        padded && "py-8 md:py-12",
        maxWidthClasses[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
