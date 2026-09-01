import { TrendingUp, Minus, TrendingDown, Award } from "lucide-react";
import { Badge } from "../ui/Badge";
import { useLanguage } from "../../context/LanguageContext";
import { getCropName, getMetricLevel, getCropTheme } from "../../utils/cropTranslations";
import type { CropRecommendation } from "../../types/recommendation";
import { cn } from "../../utils/cn";

// ---------------------------------------------------------------------------
// Level + trend helpers
// ---------------------------------------------------------------------------

const LEVEL_VARIANT: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  High:      "success",
  Medium:    "warning",
  Low:       "danger",
  Improving: "success",
  Stable:    "neutral",
  Declining: "danger",
};

function TrendIcon({ trend }: { trend: CropRecommendation["yield_trend"] }) {
  if (trend === "Improving") return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (trend === "Declining") return <TrendingDown className="h-3.5 w-3.5 text-rose-500" />;
  return <Minus className="h-3.5 w-3.5 text-slate-400" />;
}

// ---------------------------------------------------------------------------
// Desktop table
// ---------------------------------------------------------------------------

function DesktopTable({ rankings }: { rankings: CropRecommendation[] }) {
  const { t } = useLanguage();

  const cols = [
    t("Rank", "रैंक"),
    t("Crop", "फ़सल"),
    t("Suitability", "उपयुक्तता"),
    t("Predicted Yield", "अनुमानित उपज"),
    t("Historical Stability", "ऐतिहासिक स्थिरता"),
    t("Weather Compatibility", "मौसम अनुकूलता"),
    t("Yield Trend", "उपज रुझान"),
  ];

  return (
    <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 backdrop-blur-md">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
            {cols.map((c) => (
              <th key={c} className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rankings.map((crop) => {
            const isTop = crop.rank === 1;
            const cropName = getCropName(crop.crop, t);

            return (
              <tr
                key={crop.crop}
                className={cn(
                  "hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors",
                  isTop && "bg-gradient-to-r from-amber-500/5 via-emerald-500/5 to-transparent"
                )}
              >
                {/* Rank */}
                <td className="px-5 py-4">
                  <div className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black shadow-sm",
                    isTop
                      ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-amber-500/30"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  )}>
                    #{crop.rank}
                  </div>
                </td>
                {/* Crop */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className={cn("font-black text-base", isTop ? "text-amber-900 dark:text-amber-300" : "text-slate-900 dark:text-white")}>
                      {cropName}
                    </span>
                    {isTop && (
                      <Badge variant="amber" size="sm" className="font-extrabold shadow-sm">
                        <Award className="h-3 w-3 mr-1" />
                        {t("Top Pick", "शीर्ष पसंद")}
                      </Badge>
                    )}
                  </div>
                </td>
                {/* Suitability */}
                <td className="px-5 py-4">
                  <span className={cn("font-black text-base tabular-nums", isTop ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200")}>
                    {crop.suitability_score}
                  </span>
                  <span className="text-xs font-medium text-slate-400"> /100</span>
                </td>
                {/* Yield */}
                <td className="px-5 py-4 font-black tabular-nums text-slate-900 dark:text-white">
                  {crop.predicted_yield_t_per_ha} <span className="text-xs font-semibold text-slate-500">{t("t/ha", "टन/हेक्टेयर")}</span>
                </td>
                {/* Historical */}
                <td className="px-5 py-4">
                  <Badge variant={LEVEL_VARIANT[crop.historical_stability]} size="sm">
                    {getMetricLevel(crop.historical_stability, t)}
                  </Badge>
                </td>
                {/* Weather */}
                <td className="px-5 py-4">
                  <Badge variant={LEVEL_VARIANT[crop.weather_compatibility]} size="sm">
                    {getMetricLevel(crop.weather_compatibility, t)}
                  </Badge>
                </td>
                {/* Trend */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <TrendIcon trend={crop.yield_trend} />
                    <Badge variant={LEVEL_VARIANT[crop.yield_trend]} size="sm">
                      {getMetricLevel(crop.yield_trend, t)}
                    </Badge>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile cards
// ---------------------------------------------------------------------------

function MobileCards({ rankings }: { rankings: CropRecommendation[] }) {
  const { t } = useLanguage();

  return (
    <div className="md:hidden space-y-3">
      {rankings.map((crop) => {
        const isTop = crop.rank === 1;
        const cropName = getCropName(crop.crop, t);

        return (
          <div
            key={crop.crop}
            className={cn(
              "rounded-3xl border bg-white dark:bg-slate-900 shadow-xl p-5 space-y-4 backdrop-blur-md",
              isTop ? "border-amber-500/40 bg-gradient-to-br from-amber-500/5 to-emerald-500/5" : "border-slate-200 dark:border-slate-800"
            )}
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black shrink-0 shadow-sm",
                  isTop ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                )}>
                  #{crop.rank}
                </div>
                <span className={cn("text-lg font-black", isTop ? "text-amber-900 dark:text-amber-300" : "text-slate-900 dark:text-white")}>
                  {cropName}
                </span>
                {isTop && <Badge variant="amber" size="sm" className="font-extrabold">{t("Top Pick", "शीर्ष पसंद")}</Badge>}
              </div>
              <span className={cn("text-xl font-black tabular-nums", isTop ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200")}>
                {crop.suitability_score}<span className="text-xs font-normal text-slate-400">/100</span>
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
              <div>
                <p className="text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">{t("Predicted Yield", "अनुमानित उपज")}</p>
                <p className="font-black text-slate-900 dark:text-white text-sm tabular-nums">{crop.predicted_yield_t_per_ha} {t("t/ha", "टन/हेक्टेयर")}</p>
              </div>
              <div>
                <p className="text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">{t("Yield Trend", "उपज रुझान")}</p>
                <div className="flex items-center gap-1">
                  <TrendIcon trend={crop.yield_trend} />
                  <Badge variant={LEVEL_VARIANT[crop.yield_trend]} size="sm">
                    {getMetricLevel(crop.yield_trend, t)}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">{t("Historical Stability", "ऐतिहासिक स्थिरता")}</p>
                <Badge variant={LEVEL_VARIANT[crop.historical_stability]} size="sm">
                  {getMetricLevel(crop.historical_stability, t)}
                </Badge>
              </div>
              <div>
                <p className="text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">{t("Weather Compatibility", "मौसम अनुकूलता")}</p>
                <Badge variant={LEVEL_VARIANT[crop.weather_compatibility]} size="sm">
                  {getMetricLevel(crop.weather_compatibility, t)}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface CropComparisonTableProps {
  rankings: CropRecommendation[];
}

export function CropComparisonTable({ rankings }: CropComparisonTableProps) {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  return (
    <>
      <DesktopTable rankings={sorted} />
      <MobileCards rankings={sorted} />
    </>
  );
}

