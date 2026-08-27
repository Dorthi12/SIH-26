import { Trophy } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { CropRecommendation } from "../../types/recommendation";

interface CurrentLeaderProps {
  crops: CropRecommendation[];
}

export function CurrentLeader({ crops }: CurrentLeaderProps) {
  if (crops.length === 0) return null;

  const leader = [...crops].sort((a, b) => b.predicted_yield_t_per_ha - a.predicted_yield_t_per_ha)[0];

  return (
    <div className="flex items-center gap-5 rounded-2xl border border-ivory-300 bg-white shadow-card px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber/10 text-amber-600">
        <Trophy className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/60 mb-0.5">Current Leader</p>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-bold text-charcoal">{leader.crop}</p>
          <Badge variant="amber" size="sm">TOP OPTION</Badge>
        </div>
        <p className="text-sm text-charcoal-muted">{leader.predicted_yield_t_per_ha} t/ha predicted yield</p>
      </div>
      <p className="text-xs text-charcoal-muted/60 text-right max-w-[140px] leading-relaxed hidden sm:block">
        Based on predicted yield among the currently selected candidates.
      </p>
    </div>
  );
}
