import { TrendingUp, BarChart3, Shield } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getCropName, getMetricLevel } from "../../utils/cropTranslations";
import type { CropRecommendation } from "../../types/recommendation";

interface ComparisonInsightsProps {
  crops: CropRecommendation[];
}

export function ComparisonInsights({ crops }: ComparisonInsightsProps) {
  const { t } = useLanguage();
  if (crops.length === 0) return null;

  // Highest predicted yield
  const maxYield = Math.max(...crops.map((c) => c.predicted_yield_t_per_ha));
  const topYieldCrops = crops.filter((c) => c.predicted_yield_t_per_ha === maxYield);

  // Strongest trend (Improving > Stable)
  const improvingCrops = crops.filter((c) => c.yield_trend === "Improving");
  const trendCrops = improvingCrops.length > 0 ? improvingCrops : crops.filter((c) => c.yield_trend === "Stable");

  // Most stable (High > Medium)
  const highStabilityCrops = crops.filter((c) => c.historical_stability === "High");
  const stableCrops = highStabilityCrops.length > 0 ? highStabilityCrops : crops;

  const cropNames = (list: CropRecommendation[]) =>
    list.map((c) => getCropName(c.crop, t)).join(" / ");

  const cards = [
    {
      icon: <TrendingUp className="h-6 w-6" strokeWidth={2} />,
      label: t("Highest Predicted Yield", "उच्चतम अनुमानित उपज"),
      crop: cropNames(topYieldCrops),
      value: `${maxYield} ${t("t/ha", "टन/हेक्टेयर")}`,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      accent: "from-emerald-500/10 to-teal-500/5",
    },
    {
      icon: <BarChart3 className="h-6 w-6" strokeWidth={2} />,
      label: t("Strongest Trend", "सबसे मजबूत रुझान"),
      crop: cropNames(trendCrops),
      value: trendCrops[0] ? getMetricLevel(trendCrops[0].yield_trend, t) : "—",
      color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
      accent: "from-teal-500/10 to-cyan-500/5",
    },
    {
      icon: <Shield className="h-6 w-6" strokeWidth={2} />,
      label: t("Most Stable", "सबसे अधिक स्थिर"),
      crop: cropNames(stableCrops),
      value: stableCrops[0] ? getMetricLevel(stableCrops[0].historical_stability, t) : "—",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      accent: "from-amber-500/10 to-yellow-500/5",
    },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-3 backdrop-blur-md bg-gradient-to-br ${card.accent}`}>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm ${card.color}`}>
            {card.icon}
          </div>
          <div>
            <p className="text-2xs font-extrabold uppercase tracking-widest text-slate-400">{card.label}</p>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{card.crop}</p>
            <p className="text-sm font-extrabold text-slate-600 dark:text-slate-300">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

