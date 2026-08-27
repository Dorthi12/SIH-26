import { cn } from "../../utils/cn";

interface WeatherInsightCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function WeatherInsightCard({ icon, title, description, className }: WeatherInsightCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl border border-ivory-300 bg-white p-5 shadow-card",
        "hover:shadow-card-hover transition-shadow duration-200",
        className
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/6 text-forest shrink-0">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60">{title}</p>
        <p className="text-sm font-medium text-charcoal leading-snug">{description}</p>
      </div>
    </div>
  );
}
