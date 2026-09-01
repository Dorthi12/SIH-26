import { ArrowRight, Wheat, Sparkles, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { useLanguage } from "../../context/LanguageContext";
import { getCropName, getCropTheme } from "../../utils/cropTranslations";
import type { CropRecommendation } from "../../types/recommendation";

interface TopOptionBannerProps {
  top: CropRecommendation;
}

export function TopOptionBanner({ top }: TopOptionBannerProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const theme = getCropTheme(top.crop);
  const cropName = getCropName(top.crop, t);

  return (
    <div className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900/90 via-teal-900/95 to-slate-900 text-white shadow-xl shadow-emerald-900/10 overflow-hidden backdrop-blur-xl transition-all duration-300 hover:shadow-emerald-900/20 hover:border-emerald-500/30">
      {/* Top rainbow gradient stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 animate-gradient-x" />
      
      {/* Subtle background glow */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-6 py-5">
        {/* Icon + title */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-900/40 border border-white/20">
            <Wheat className="h-7 w-7 animate-bounce-subtle" strokeWidth={1.75} />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-3xs shadow-md">
              #1
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-2xs font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                <Sparkles className="h-3 w-3 text-amber-400 animate-spin-slow" />
                {t("Current Top Option", "वर्तमान शीर्ष विकल्प")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                {cropName}
              </h3>
              <Badge variant="amber" size="md" className="shadow-md font-bold">
                <Award className="h-3.5 w-3.5 mr-1 text-amber-600" />
                {t("Ranked #1", "रैंक #1")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-6 bg-white/10 dark:bg-black/30 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md shrink-0 w-full md:w-auto justify-around md:justify-start">
          <div className="text-center">
            <p className="text-2xs font-bold uppercase tracking-wider text-emerald-200/80">
              {t("Predicted Yield", "अनुमानित उपज")}
            </p>
            <p className="text-2xl font-black text-amber-300 tabular-nums drop-shadow-sm">
              {top.predicted_yield_t_per_ha}
              <span className="text-xs font-semibold text-emerald-100/70 ml-1">{t("t/ha", "टन/हेक्टेयर")}</span>
            </p>
          </div>
          <div className="h-9 w-px bg-white/15" />
          <div className="text-center">
            <p className="text-2xs font-bold uppercase tracking-wider text-emerald-200/80">
              {t("Suitability", "उपयुक्तता")}
            </p>
            <p className="text-2xl font-black text-emerald-300 tabular-nums drop-shadow-sm">
              {top.suitability_score}
              <span className="text-xs font-semibold text-emerald-100/70 ml-0.5">/100</span>
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={() => navigate("/explain")}
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group w-full md:w-auto"
        >
          {t("Why this crop?", "यह फ़सल क्यों?")}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="px-6 py-2.5 bg-black/30 border-t border-white/10 flex items-center justify-between text-2xs text-emerald-200/70 font-medium">
        <span>
          {t(
            "Currently ranked #1 among evaluated crop options based on predicted yield and soil-weather compatibility.",
            "अनुमानित उपज और मिट्टी-मौसम अनुकूलता के आधार पर मूल्यांकन किए गए विकल्पों में वर्तमान में नंबर 1 पर।"
          )}
        </span>
      </div>
    </div>
  );
}

