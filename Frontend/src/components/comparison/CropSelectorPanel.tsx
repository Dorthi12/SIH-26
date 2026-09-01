import { useState } from "react";
import { Check, AlertCircle, Wheat, Sprout, Leaf, Sun } from "lucide-react";
import type { CropRecommendation } from "../../types/recommendation";
import { useLanguage } from "../../context/LanguageContext";
import { getCropName, getCropTheme } from "../../utils/cropTranslations";
import { cn } from "../../utils/cn";

function CropIcon({ crop, className }: { crop: string; className?: string }) {
  const cls = cn("h-4 w-4", className);
  if (crop === "Maize")   return <Wheat   className={cls} strokeWidth={2} />;
  if (crop === "Rice")    return <Sprout  className={cls} strokeWidth={2} />;
  if (crop === "Millet")  return <Sun     className={cls} strokeWidth={2} />;
  return <Leaf className={cls} strokeWidth={2} />;
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
  const { t } = useLanguage();
  const [warnMin, setWarnMin] = useState(false);

  const handleToggle = (crop: string) => {
    const isSelected = selected.includes(crop);
    if (isSelected && selected.length <= minCrops) {
      setWarnMin(true);
      setTimeout(() => setWarnMin(false), 2500);
      return;
    }
    setWarnMin(false);
    onToggle(crop);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        {allCrops.map((c) => {
          const isSelected = selected.includes(c.crop);
          const theme = getCropTheme(c.crop);
          const cropName = getCropName(c.crop, t);

          return (
            <button
              key={c.crop}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => handleToggle(c.crop)}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-2xl border-2 px-4 py-2.5 text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer select-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2",
                isSelected
                  ? cn(
                      "bg-gradient-to-r text-slate-900 dark:text-white shadow-md border-transparent",
                      theme.gradient,
                      "scale-[1.02]"
                    )
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              aria-label={`${isSelected ? "Remove" : "Add"} ${c.crop} from comparison`}
            >
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                isSelected ? "bg-black/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              )}>
                <CropIcon crop={c.crop} className={isSelected ? "text-white" : ""} />
              </div>
              
              <span className={isSelected ? "text-slate-950 font-black drop-shadow-sm" : ""}>
                {cropName}
              </span>

              {isSelected && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-white text-3xs font-black shadow-sm">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {warnMin && (
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800/40 animate-shake" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          {t(
            `Select at least ${minCrops} crops for side-by-side comparison.`,
            `तुलना के लिए कम से कम ${minCrops} फ़सलें चुनें।`
          )}
        </div>
      )}
    </div>
  );
}

