import { Inbox } from "lucide-react";
import { cn } from "../../utils/cn";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Nothing here yet",
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 px-6 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest/6 text-forest/50">
        {icon ?? <Inbox className="h-7 w-7" />}
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-semibold text-charcoal">{title}</h3>
        {description && (
          <p className="text-sm text-charcoal-muted leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
