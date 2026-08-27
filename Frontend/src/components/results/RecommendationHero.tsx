import { Wheat } from "lucide-react";
import { cn } from "../../utils/cn";

interface RecommendationHeroProps {
  cropName: string;
  rank: number;
  className?: string;
  id?: string;
}

export function RecommendationHero({ cropName, rank, className, id }: RecommendationHeroProps) {
  return (
    <div id={id} className={cn("flex flex-col sm:flex-row items-start sm:items-center gap-5 animate-slide-up", className)}>
      {/* Crop icon — with soft glow */}
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-forest text-white shadow-md shadow-forest/20 ai-glow">
        <Wheat className="h-8 w-8" strokeWidth={1.5} />
        {/* Subtle ambient ring */}
        <div className="absolute -inset-1 rounded-3xl border border-forest/15 pointer-events-none" />
      </div>

      {/* Crop info */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-forest/60">
            Top Recommendation
          </span>
          <span className="inline-flex items-center rounded-full bg-amber/12 border border-amber/25 px-2.5 py-0.5 text-2xs font-semibold text-amber-700 uppercase tracking-wide">
            #{rank} Ranked
          </span>
        </div>
        {/* Crop name with subtle underline accent */}
        <div className="relative inline-block">
          <h1 className="text-4xl sm:text-5xl font-bold text-charcoal tracking-tight leading-none">
            {cropName.toUpperCase()}
          </h1>
          <div className="mt-1.5 h-0.5 w-full bg-gradient-to-r from-forest via-forest/50 to-transparent rounded-full" />
        </div>
        <p className="text-sm text-charcoal-muted">
          Best suited among the evaluated crop options
        </p>
      </div>
    </div>
  );
}
