import { TrendingUp, Minus, TrendingDown, CheckCircle2 } from "lucide-react";
import { cn } from "../../utils/cn";
import { useLanguage } from "../../context/LanguageContext";
import { getCropName, getMetricLevel } from "../../utils/cropTranslations";
import type { CropRecommendation } from "../../types/recommendation";

type EvidenceValue = "High" | "Medium" | "Low" | "Improving" | "Stable" | "Declining";

interface MatrixCellProps {
  value: EvidenceValue;
  isTrend?: boolean;
}

function MatrixCell({ value, isTrend = false }: MatrixCellProps) {
  const { t } = useLanguage();

  if (isTrend) {
    if (value === "Improving") return (
      <div className="flex items-center justify-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-xl text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20">
        <TrendingUp className="h-3.5 w-3.5" />
        <span className="text-xs">{getMetricLevel(value, t)}</span>
      </div>
    );
    if (value === "Declining") return (
      <div className="flex items-center justify-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-xl text-rose-600 dark:text-rose-400 font-extrabold border border-rose-500/20">
        <TrendingDown className="h-3.5 w-3.5" />
        <span className="text-xs">{getMetricLevel(value, t)}</span>
      </div>
    );
    return (
      <div className="flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
        <Minus className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-xs">{getMetricLevel(value, t)}</span>
      </div>
    );
  }

  const styleMap: Record<string, string> = {
    High:   "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-black",
    Medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-extrabold",
    Low:    "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 font-extrabold",
  };

  return (
    <div className={cn("inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-xl text-xs border shadow-2xs", styleMap[value] ?? "text-slate-500")}>
      {value === "High" && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
      <span>{getMetricLevel(value, t)}</span>
    </div>
  );
}

interface EvidenceMatrixProps {
  rankings: CropRecommendation[];
}

export function EvidenceMatrix({ rankings }: EvidenceMatrixProps) {
  const { t } = useLanguage();
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full min-w-[400px] text-sm" aria-label="Crop evidence matrix">
        <thead>
          <tr className="bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl">
            <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 w-40 rounded-l-2xl">
              {t("Indicator", "संकेतक")}
            </th>
            {sorted.map((crop, idx) => (
              <th key={crop.crop} className={cn("text-center px-4 py-3", idx === sorted.length - 1 && "rounded-r-2xl")}>
                <div className="flex flex-col items-center gap-0.5">
                  <span className={cn(
                    "text-xs font-black",
                    crop.rank === 1 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"
                  )}>
                    {getCropName(crop.crop, t)}
                  </span>
                  {crop.rank === 1 && (
                    <span className="text-3xs bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">#1</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* Historical Stability */}
          <tr>
            <td className="px-4 py-4 text-xs font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {t("Historical Stability", "ऐतिहासिक स्थिरता")}
            </td>
            {sorted.map((crop) => (
              <td key={crop.crop} className={cn(
                "px-4 py-4 text-center",
                crop.rank === 1 && "bg-amber-500/5"
              )}>
                <MatrixCell value={crop.historical_stability} />
              </td>
            ))}
          </tr>

          {/* Weather Compatibility */}
          <tr>
            <td className="px-4 py-4 text-xs font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {t("Weather Compatibility", "मौसम अनुकूलता")}
            </td>
            {sorted.map((crop) => (
              <td key={crop.crop} className={cn(
                "px-4 py-4 text-center",
                crop.rank === 1 && "bg-amber-500/5"
              )}>
                <MatrixCell value={crop.weather_compatibility} />
              </td>
            ))}
          </tr>

          {/* Yield Trend */}
          <tr>
            <td className="px-4 py-4 text-xs font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {t("Yield Trend", "उपज रुझान")}
            </td>
            {sorted.map((crop) => (
              <td key={crop.crop} className={cn(
                "px-4 py-4 text-center",
                crop.rank === 1 && "bg-amber-500/5"
              )}>
                <MatrixCell value={crop.yield_trend} isTrend />
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <p className="text-2xs font-medium text-slate-400 mt-3 px-1">
        {t(
          "These indicators are supporting evidence — they do not independently determine the ranking.",
          "ये सूचक सहायक साक्ष्य हैं — ये स्वतंत्र रूप से रैंकिंग निर्धारित नहीं करते हैं।"
        )}
      </p>
    </div>
  );
}

