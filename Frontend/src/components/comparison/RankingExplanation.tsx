import { Check, TrendingUp, Wheat, Award, Zap } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getCropName, getMetricLevel } from "../../utils/cropTranslations";
import type { CropRecommendation } from "../../types/recommendation";

interface RankingExplanationProps {
  rankings: CropRecommendation[];
}

export function RankingExplanation({ rankings }: RankingExplanationProps) {
  const { t } = useLanguage();
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  const top  = sorted[0];
  const next = sorted[1] ?? sorted[0];

  const yieldDiff = (top.predicted_yield_t_per_ha - next.predicted_yield_t_per_ha).toFixed(1);
  const topCropName = getCropName(top.crop, t);
  const nextCropName = getCropName(next.crop, t);

  const bullets: { icon: React.ReactNode; text: string }[] = [
    {
      icon: <Check className="h-4 w-4 text-emerald-500" />,
      text: `${t("Historical stability", "ऐतिहासिक स्थिरता")}: ${getMetricLevel(top.historical_stability, t)}`,
    },
    {
      icon: <Check className="h-4 w-4 text-emerald-500" />,
      text: `${t("Weather compatibility", "मौसम अनुकूलता")}: ${getMetricLevel(top.weather_compatibility, t)}`,
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-amber-500" />,
      text: `${t("Yield trend", "उपज रुझान")}: ${getMetricLevel(top.yield_trend, t)}`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main explanation card */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-emerald-500/20 shadow-xl overflow-hidden backdrop-blur-md">
        {/* Colorful Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-amber-500/10 border-b border-emerald-500/15 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shrink-0 shadow-md">
            <Wheat className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {t(`Why is ${top.crop} ranked #1?`, `${topCropName} नंबर 1 पर क्यों है?`)}
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t("Primary ranking signal + supporting evidence", "प्राथमिक संकेत + सहायक साक्ष्य")}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Primary signal */}
          <div>
            <p className="text-2xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
              {t("Primary Ranking Signal", "प्राथमिक रैंकिंग संकेत")}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {/* Top crop yield */}
              <div className="flex-1 min-w-[140px] rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 px-5 py-3.5 text-center shadow-sm">
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">{topCropName}</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {top.predicted_yield_t_per_ha}
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1"> {t("t/ha", "टन/हेक्टेयर")}</span>
                </p>
              </div>

              {/* vs separator */}
              <div className="text-center px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-3xs font-extrabold uppercase tracking-wider text-slate-400">{t("vs next best", "बनाम अगला सर्वश्रेष्ठ")}</p>
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">+{yieldDiff} {t("t/ha", "टन/हेक्टेयर")}</p>
              </div>

              {/* Next best yield */}
              <div className="flex-1 min-w-[140px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-5 py-3.5 text-center opacity-85">
                <p className="text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-1">{nextCropName}</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-200 tabular-nums">
                  {next.predicted_yield_t_per_ha}
                  <span className="text-xs font-semibold text-slate-400 ml-1"> {t("t/ha", "टन/हेक्टेयर")}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4 font-medium">
            <strong className="text-slate-900 dark:text-white font-bold">{topCropName}</strong>{" "}
            {t(
              "has the highest predicted yield among the evaluated candidate crops under the selected conditions.",
              "चयनित परिस्थितियों में मूल्यांकन की गई फ़सलों में सबसे अधिक अनुमानित उपज देता है।"
            )}
          </p>

          {/* Supporting evidence */}
          <div className="space-y-2">
            <p className="text-2xs font-extrabold uppercase tracking-widest text-slate-400">
              {t("Supporting Evidence", "सहायक साक्ष्य")}
            </p>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {bullets.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <span className="shrink-0">{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent dark:from-amber-950/30 px-5 py-4 flex items-start gap-3.5 shadow-sm">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md mt-0.5">
          <Zap className="h-4 w-4" />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-black text-slate-900 dark:text-white">{t("Key Insight", "मुख्य अंतर्दृष्टि")}</p>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            {t(
              `${topCropName} leads the evaluated options by predicted yield, while also showing favorable historical and weather indicators.`,
              `${topCropName} अनुमानित उपज के आधार पर मूल्यांकन किए गए विकल्पों का नेतृत्व करता है, जबकि अनुकूल ऐतिहासिक और मौसम संकेतकों को भी दर्शाता है।`
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

