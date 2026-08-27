import { TrendingUp, BarChart3, Shield } from "lucide-react";
import type { CropRecommendation } from "../../types/recommendation";

interface ComparisonInsightsProps {
  crops: CropRecommendation[];
}

export function ComparisonInsights({ crops }: ComparisonInsightsProps) {
  if (crops.length === 0) return null;

  // Highest predicted yield
  const maxYield = Math.max(...crops.map((c) => c.predicted_yield_t_per_ha));
  const topYieldCrops = crops.filter((c) => c.predicted_yield_t_per_ha === maxYield);

  // Strongest trend (Improving > Stable) — multiple crops may tie
  const improvingCrops = crops.filter((c) => c.yield_trend === "Improving");
  const trendCrops = improvingCrops.length > 0 ? improvingCrops : crops.filter((c) => c.yield_trend === "Stable");

  // Most stable (High > Medium)
  const highStabilityCrops = crops.filter((c) => c.historical_stability === "High");
  const stableCrops = highStabilityCrops.length > 0 ? highStabilityCrops : crops;

  const cropNames = (list: CropRecommendation[]) =>
    list.map((c) => c.crop).join(" / ");

  const cards = [
    {
      icon: <TrendingUp className="h-5 w-5" strokeWidth={1.5} />,
      label: "Highest Predicted Yield",
      crop: cropNames(topYieldCrops),
      value: `${maxYield} t/ha`,
      color: "bg-forest/8 text-forest",
    },
    {
      icon: <BarChart3 className="h-5 w-5" strokeWidth={1.5} />,
      label: "Strongest Trend",
      crop: cropNames(trendCrops),
      value: trendCrops[0]?.yield_trend ?? "—",
      color: "bg-olive/10 text-olive",
    },
    {
      icon: <Shield className="h-5 w-5" strokeWidth={1.5} />,
      label: "Most Stable",
      crop: cropNames(stableCrops),
      value: stableCrops[0]?.historical_stability ?? "—",
      color: "bg-amber/10 text-amber-600",
    },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-2xl border border-ivory-300 shadow-card px-5 py-4 space-y-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.color}`}>
            {card.icon}
          </div>
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted/60">{card.label}</p>
            <p className="text-base font-bold text-charcoal mt-0.5">{card.crop}</p>
            <p className="text-sm text-charcoal-muted">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
