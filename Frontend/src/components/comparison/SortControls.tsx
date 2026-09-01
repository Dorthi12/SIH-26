import { useLanguage } from "../../context/LanguageContext";
import { cn } from "../../utils/cn";

export type SortKey = "yield" | "suitability" | "name";

interface SortControlsProps {
  value: SortKey;
  onChange: (key: SortKey) => void;
}

export function SortControls({ value, onChange }: SortControlsProps) {
  const { t } = useLanguage();

  const options: { value: SortKey; label: string }[] = [
    { value: "yield",       label: t("Predicted Yield", "अनुमानित उपज") },
    { value: "suitability", label: t("Suitability", "उपयुक्तता")         },
    { value: "name",        label: t("Crop Name", "फ़सल का नाम")          },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
        {t("Sort by:", "क्रमानुसार:")}
      </span>
      <div className="inline-flex p-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/70 backdrop-blur-md gap-1">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer select-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                active
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              )}
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function sortCrops(
  crops: import("../../types/recommendation").CropRecommendation[],
  key: SortKey
) {
  return [...crops].sort((a, b) => {
    if (key === "yield")       return b.predicted_yield_t_per_ha - a.predicted_yield_t_per_ha;
    if (key === "suitability") return b.suitability_score - a.suitability_score;
    return a.crop.localeCompare(b.crop);
  });
}

