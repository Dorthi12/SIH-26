import { useNavigate } from "react-router-dom";
import {
  X, TrendingUp, Star, CloudLightning, History,
  Sprout, ArrowRight, Info,
} from "lucide-react";
import { Button } from "../ui/Button";
import { RiskBadge } from "./DistrictOverviewCards";
import { useLanguage } from "../../context/LanguageContext";
import { getCropName } from "../../utils/cropTranslations";
import { cn } from "../../utils/cn";
import type { CropIntelligence } from "../../types/districtIntelligence";

interface CropDetailPanelProps {
  crop: CropIntelligence;
  districtName: string;
  onClose: () => void;
}

export function CropDetailPanel({ crop, districtName, onClose }: CropDetailPanelProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const cropName = getCropName(crop.crop_name, t);

  const suitabilityColor =
    crop.avg_suitability >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : crop.avg_suitability >= 60
      ? "text-amber-600 dark:text-amber-400"
      : "text-rose-600 dark:text-rose-400";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-white dark:bg-slate-900 shadow-2xl p-6 backdrop-blur-xl",
        "animate-slide-up space-y-5"
      )}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close crop detail"
        className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3.5 pr-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/20">
          <Sprout className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xs font-extrabold uppercase tracking-widest text-slate-400">
            {t("Crop Detail", "फ़सल विवरण")}
          </p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{cropName}</h3>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{districtName}</p>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-3">
        <DetailMetric
          icon={<Star className="h-4 w-4 text-amber-500" />}
          label={t("Suitability", "उपयुक्तता")}
        >
          <span className={cn("text-lg font-black tabular-nums", suitabilityColor)}>
            {crop.avg_suitability}%
          </span>
          <SuitabilityMini value={crop.avg_suitability} />
        </DetailMetric>

        <DetailMetric
          icon={<TrendingUp className="h-4 w-4 text-teal-500" />}
          label={t("Avg. Yield", "औसत उपज")}
        >
          <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
            {crop.avg_yield.toFixed(1)}
          </span>
          <span className="text-xs font-semibold text-slate-400"> {t("t/ha", "टन/हेक्टेयर")}</span>
        </DetailMetric>

        <DetailMetric
          icon={<CloudLightning className="h-4 w-4 text-rose-500" />}
          label={t("Weather Risk", "मौसम जोखिम")}
        >
          <RiskBadge risk={crop.weather_risk} />
        </DetailMetric>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/30 p-3.5">
        <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
          {t(
            "Detailed crop-level insights including seasonal variation and soil risk factors are calculated for this district.",
            "मौसम भिन्नता और मिट्टी के जोखिम कारकों सहित विस्तृत फ़सल-स्तरीय अंतर्दृष्टि की गणना इस ज़िले के लिए की गई है।"
          )}
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          id={`crop-detail-history-${crop.crop_id}`}
          onClick={() => navigate("/history")}
          className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-3 text-xs font-black text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-500" />
            <span>{t("View Historical Performance", "ऐतिहासिक प्रदर्शन देखें")}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </button>

        <Button
          id={`crop-detail-recommend-${crop.crop_id}`}
          variant="primary"
          size="md"
          className="w-full group font-black rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20"
          icon={<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
          iconPosition="right"
          onClick={() => navigate("/recommendation")}
        >
          {t("Get Crop Recommendation", "फ़सल सिफारिश प्राप्त करें")}
        </Button>
      </div>
    </div>
  );
}

function DetailMetric({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 p-3">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}
        <span className="text-3xs font-extrabold uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function SuitabilityMini({ value }: { value: number }) {
  const color = value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-400" : "bg-rose-500";
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-1 p-0.5">
      <div
        className={cn("h-full rounded-full transition-all duration-700", color)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
