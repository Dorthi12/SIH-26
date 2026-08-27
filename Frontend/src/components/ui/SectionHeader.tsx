import { cn } from "../../utils/cn";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  align?: "left" | "center";
  id?: string;
}

export function SectionHeader({ // eslint-disable-line
  id,
  title,
  subtitle,
  action,
  className,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4",
        align === "center" && "flex-col items-center text-center",
        className
      )}
    >
      <div className="space-y-1">
        <h2 id={id} className="text-lg font-semibold text-charcoal leading-tight">{title}</h2>
        {subtitle && (
          <p className="text-sm text-charcoal-muted leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
