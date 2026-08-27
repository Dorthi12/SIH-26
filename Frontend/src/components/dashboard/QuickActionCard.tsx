import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

interface QuickActionCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  route: string;
  primary?: boolean;
}

export function QuickActionCard({ icon, label, description, route, primary = false }: QuickActionCardProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(route)}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border px-5 py-4 text-left w-full transition-all duration-200",
        "hover:shadow-card-hover hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2",
        primary
          ? "border-forest/20 bg-forest/[0.04] hover:bg-forest/[0.07]"
          : "border-ivory-300 bg-white shadow-card hover:border-forest/20"
      )}
      aria-label={`${label}: ${description}`}
    >
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
        primary
          ? "bg-forest text-white group-hover:shadow"
          : "bg-forest/8 text-forest group-hover:bg-forest group-hover:text-white"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-bold", primary ? "text-forest" : "text-charcoal")}>{label}</p>
        <p className="text-xs text-charcoal-muted truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-charcoal-muted/40 group-hover:text-forest group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  );
}
