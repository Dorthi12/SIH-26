import { ChevronRight } from "lucide-react";
import { Badge } from "../ui/Badge";
import { RiskBadge } from "./DistrictOverviewCards";
import { useLanguage } from "../../context/LanguageContext";
import { getCropName } from "../../utils/cropTranslations";
import { cn } from "../../utils/cn";
import type { CropIntelligence } from "../../types/districtIntelligence";

interface CropIntelligenceTableProps {
  crops: CropIntelligence[];
  selectedCropId: string | null;
  onSelectCrop: (crop: CropIntelligence) => void;
}

export function CropIntelligenceTable({
  crops,
  selectedCropId,
  onSelectCrop,
}: CropIntelligenceTableProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70">
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("Crop Name", "फ़सल का नाम")}
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("Suitability Rating", "उपयुक्तता रेटिंग")}
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("Avg. Expected Yield", "औसत अनुमानित उपज")}
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("Weather Risk", "मौसम जोखिम")}
              </th>
              <th className="px-2 py-3.5 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {crops.map((crop, idx) => {
              const isSelected = crop.crop_id === selectedCropId;
              const cropName = getCropName(crop.crop_name, t);

              return (
                <tr
                  key={crop.crop_id}
                  onClick={() => onSelectCrop(crop)}
                  className={cn(
                    "group cursor-pointer transition-colors duration-150",
                    isSelected
                      ? "bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent"
                      : "hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                  )}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectCrop(crop);
                    }
                  }}
                  aria-selected={isSelected}
                  role="row"
                >
                  {/* Rank + Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-sm",
                        idx === 0
                          ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-amber-500/20"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      )}>
                        #{idx + 1}
                      </span>
                      <span className="font-black text-base text-slate-900 dark:text-white">{cropName}</span>
                      {isSelected && (
                        <Badge variant="amber" size="sm" className="font-extrabold shadow-2xs">
                          {t("Selected", "चयनित")}
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Suitability bar */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden max-w-[100px] shadow-inner p-0.5">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500 shadow-sm",
                            crop.avg_suitability >= 80
                              ? "bg-emerald-500"
                              : crop.avg_suitability >= 60
                              ? "bg-amber-400"
                              : "bg-rose-500"
                          )}
                          style={{ width: `${crop.avg_suitability}%` }}
                        />
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                        {crop.avg_suitability}%
                      </span>
                    </div>
                  </td>

                  {/* Avg Yield */}
                  <td className="px-5 py-4">
                    <span className="font-black text-slate-900 dark:text-white tabular-nums">
                      {crop.avg_yield.toFixed(1)}
                    </span>
                    <span className="text-xs font-medium text-slate-400"> {t("t/ha", "टन/हेक्टेयर")}</span>
                  </td>

                  {/* Risk */}
                  <td className="px-5 py-4">
                    <RiskBadge risk={crop.weather_risk} />
                  </td>

                  {/* Arrow */}
                  <td className="px-2 py-4">
                    <ChevronRight
                      className={cn(
                        "h-5 w-5 transition-all duration-150",
                        isSelected
                          ? "text-emerald-500 translate-x-1"
                          : "text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1"
                      )}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {crops.map((crop, idx) => {
          const isSelected = crop.crop_id === selectedCropId;
          const cropName = getCropName(crop.crop_name, t);

          return (
            <button
              key={crop.crop_id}
              type="button"
              onClick={() => onSelectCrop(crop)}
              className={cn(
                "w-full text-left rounded-3xl border p-5 transition-all duration-200 shadow-xl backdrop-blur-md",
                isSelected
                  ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 shadow-emerald-500/10"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/30"
              )}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-sm",
                    idx === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  )}>
                    #{idx + 1}
                  </span>
                  <p className="font-black text-lg text-slate-900 dark:text-white">{cropName}</p>
                </div>
                <RiskBadge risk={crop.weather_risk} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <p className="text-2xs text-slate-400 uppercase tracking-widest font-extrabold mb-0.5">{t("Suitability", "उपयुक्तता")}</p>
                  <p className="font-black text-emerald-600 dark:text-emerald-400">{crop.avg_suitability}%</p>
                </div>
                <div>
                  <p className="text-2xs text-slate-400 uppercase tracking-widest font-extrabold mb-0.5">{t("Avg. Yield", "औसत उपज")}</p>
                  <p className="font-black text-slate-900 dark:text-white">{crop.avg_yield.toFixed(1)} {t("t/ha", "टन/हेक्टेयर")}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
