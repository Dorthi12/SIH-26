import { MapPin, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { cn } from "../../utils/cn";

interface FarmContextCardProps {
  district: string;
  season: string;
  acres: number;
  className?: string;
}

export function FarmContextCard({ district, season, acres, className }: FarmContextCardProps) {
  const navigate = useNavigate();

  return (
    <div className={cn(
      "flex items-center justify-between gap-4 rounded-2xl border border-ivory-300 bg-white shadow-card px-5 py-4",
      className
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/8 text-forest shrink-0">
          <MapPin className="h-4 w-4" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/50 mb-0.5">Your Farm</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm font-semibold text-charcoal truncate">{district}</p>
            <Badge variant="default" size="sm">{season}</Badge>
            <Badge variant="neutral" size="sm">{acres} acres</Badge>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate("/recommendation")}
        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-1 rounded"
        aria-label="Edit farm details"
      >
        <Pencil className="h-3 w-3" />
        Edit
      </button>
    </div>
  );
}
