import { cn } from "../../utils/cn";
import { RiskBadge } from "./DistrictOverviewCards";
import { useLanguage } from "../../context/LanguageContext";
import { getCropName, getCropTheme } from "../../utils/cropTranslations";
import type { CropIntelligence } from "../../types/districtIntelligence";

interface CropComparisonChartProps {
  crops: CropIntelligence[];
  selectedCropId: string | null;
}

export function CropComparisonChart({ crops, selectedCropId }: CropComparisonChartProps) {
  const { t } = useLanguage();
  const maxYield = Math.max(...crops.map((c) => c.avg_yield));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 md:p-8 space-y-6 backdrop-blur-md">
      <div className="space-y-1">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          {t("Crop Performance Comparison", "फ़सल प्रदर्शन तुलना")}
        </h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {t("Relative suitability and expected yield across evaluated crops.", "मूल्यांकन की गई फ़सलों में सापेक्ष उपयुक्तता और अनुमानित उपज।")}
        </p>
      </div>

      <div className="space-y-4">
        {crops.map((crop) => {
          const isSelected = crop.crop_id === selectedCropId;
          const cropName = getCropName(crop.crop_name, t);
          const theme = getCropTheme(crop.crop_name);

          return (
            <div
              key={crop.crop_id}
              className={cn(
                "rounded-2xl border p-4 transition-all duration-200 shadow-sm",
                isSelected
                  ? "border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent shadow-emerald-500/10"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60"
              )}
            >
              {/* Crop name + risk */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  )}
                  <p className={cn("text-base font-black", isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white")}>
                    {cropName}
                  </p>
                </div>
                <RiskBadge risk={crop.weather_risk} />
              </div>

              {/* Suitability bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-2xs">
                  <span className="font-extrabold uppercase tracking-widest text-slate-400">
                    {t("Suitability", "उपयुक्तता")}
                  </span>
                  <span className="font-black text-slate-900 dark:text-white tabular-nums">{crop.avg_suitability}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5 shadow-inner">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out shadow-sm",
                      theme.barGradient
                    )}
                    style={{ width: `${crop.avg_suitability}%` }}
                  />
                </div>
              </div>

              {/* Yield bar */}
              <div className="space-y-1.5 mt-3">
                <div className="flex items-center justify-between text-2xs">
                  <span className="font-extrabold uppercase tracking-widest text-slate-400">
                    {t("Avg. Yield", "औसत उपज")}
                  </span>
                  <span className="font-black text-slate-900 dark:text-white tabular-nums">
                    {crop.avg_yield.toFixed(1)} {t("t/ha", "टन/हेक्टेयर")}
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${(crop.avg_yield / maxYield) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
