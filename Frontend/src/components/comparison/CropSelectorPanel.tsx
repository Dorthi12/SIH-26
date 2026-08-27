import { useState } from "react";
import { Check, AlertCircle, Wheat, Sprout, Leaf, Sun } from "lucide-react";
import type { CropRecommendation } from "../../types/recommendation";
import { cn } from "../../utils/cn";

// Lucide icon per crop name (fallback to Sprout)
function CropIcon({ crop, className }: { crop: string; className?: string }) {
  const cls = cn("h-3.5 w-3.5", className);
  if (crop === "Maize")   return <Wheat   className={cls} strokeWidth={1.5} />;
  if (crop === "Rice")    return <Sprout  className={cls} strokeWidth={1.5} />;
  if (crop === "Millet")  return <Sun     className={cls} strokeWidth={1.5} />;
  return <Leaf className={cls} strokeWidth={1.5} />;
}

interface CropSelectorPanelProps {
  allCrops: CropRecommendation[];
  selected: string[];       // list of crop names
  onToggle: (crop: string) => void;
  minCrops?: number;
}

export function CropSelectorPanel({
  allCrops,
  selected,
  onToggle,
  minCrops = 2,
}: CropSelectorPanelProps) {
  const [warnMin, setWarnMin] = useState(false);

  const handleToggle = (crop: string) => {
    const isSelected = selected.includes(crop);
    if (isSelected && selected.length <= minCrops) {
      setWarnMin(true);
      setTimeout(() => setWarnMin(false), 2000);
      return;
    }
    setWarnMin(false);
    onToggle(crop);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {allCrops.map((c) => {
          const isSelected = selected.includes(c.crop);
          return (
            <button
              key={c.crop}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => handleToggle(c.crop)}
              className={cn(
                "flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-sm font-semibold transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-1",
                isSelected
                  ? "border-forest bg-forest/[0.05] text-forest shadow-sm"
                  : "border-ivory-300 bg-white text-charcoal-light hover:border-forest/30 hover:text-charcoal"
              )}
              aria-label={`${isSelected ? "Remove" : "Add"} ${c.crop} from comparison`}
            >
              <CropIcon crop={c.crop} className={isSelected ? "text-forest" : "text-charcoal-muted/60"} />
              {c.crop}
              {isSelected && <Check className="h-3 w-3" strokeWidth={2.5} />}
            </button>
          );
        })}
      </div>
      {warnMin && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 animate-fade-in" role="alert">
          <AlertCircle className="h-3.5 w-3.5" />
          Select at least {minCrops} crops to compare.
        </div>
      )}
    </div>
  );
}
