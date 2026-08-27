import { MapPin, Leaf, Ruler } from "lucide-react";
import type { FarmerInput } from "../../types/farmer";
import { cn } from "../../utils/cn";

interface FarmContextCardProps {
  input: FarmerInput;
  className?: string;
}

const SEASON_LABELS: Record<string, string> = {
  Kharif: "Kharif · Monsoon",
  Rabi: "Rabi · Winter",
  Zaid: "Zaid · Summer",
};

export function FarmContextCard({ input, className }: FarmContextCardProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-px overflow-hidden rounded-xl border border-forest/12 bg-white shadow-card",
        className
      )}
      aria-label="Farm details submitted"
    >
      {/* District */}
      <div className="flex flex-1 min-w-[110px] items-center gap-2.5 px-4 py-3 border-r border-forest/8 last:border-r-0">
        <MapPin className="h-3.5 w-3.5 text-forest/50 shrink-0" />
        <div className="min-w-0">
          <p className="text-2xs font-semibold uppercase tracking-wider text-charcoal-muted/60 leading-none mb-0.5">
            District
          </p>
          <p className="text-sm font-semibold text-charcoal truncate leading-snug">
            {input.district}
          </p>
        </div>
      </div>

      {/* Season */}
      <div className="flex flex-1 min-w-[110px] items-center gap-2.5 px-4 py-3 border-r border-forest/8 last:border-r-0">
        <Leaf className="h-3.5 w-3.5 text-forest/50 shrink-0" />
        <div className="min-w-0">
          <p className="text-2xs font-semibold uppercase tracking-wider text-charcoal-muted/60 leading-none mb-0.5">
            Season
          </p>
          <p className="text-sm font-semibold text-charcoal truncate leading-snug">
            {SEASON_LABELS[input.season] ?? input.season}
          </p>
        </div>
      </div>

      {/* Land Area */}
      <div className="flex flex-1 min-w-[110px] items-center gap-2.5 px-4 py-3">
        <Ruler className="h-3.5 w-3.5 text-forest/50 shrink-0" />
        <div className="min-w-0">
          <p className="text-2xs font-semibold uppercase tracking-wider text-charcoal-muted/60 leading-none mb-0.5">
            Land Area
          </p>
          <p className="text-sm font-semibold text-charcoal truncate leading-snug">
            {input.land_area_acres} acres
          </p>
        </div>
      </div>
    </div>
  );
}
