import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { useLanguage } from "../../context/LanguageContext";
import { getCropName, getCropTheme } from "../../utils/cropTranslations";
import type { CropRecommendation } from "../../types/recommendation";

interface CropRankingBarProps {
  crop: CropRecommendation;
  maxYield: number;
  isTop: boolean;
  animate?: boolean;
}

function CropRankingBar({ crop, maxYield, isTop, animate = true }: CropRankingBarProps) {
  const { t } = useLanguage();
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const theme = getCropTheme(crop.crop);
  const cropName = getCropName(crop.crop, t);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const target = (crop.predicted_yield_t_per_ha / maxYield) * 100;
    if (!animate || prefersReduced) { setWidth(target); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setWidth(target), 80 + crop.rank * 80); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [crop, maxYield, animate, prefersReduced]);

  return (
    <div
      ref={ref}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-200 backdrop-blur-md",
        "hover:shadow-lg hover:scale-[1.01]",
        isTop
          ? "border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900/5 dark:from-amber-950/30 dark:to-slate-900/40 shadow-md shadow-amber-500/5"
          : "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm hover:bg-white dark:hover:bg-slate-900"
      )}
    >
      {/* Rank Badge */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-black shadow-md border",
          isTop
            ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 border-amber-300 shadow-amber-500/20"
            : crop.rank === 2
            ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-emerald-300 shadow-emerald-500/20"
            : crop.rank === 3
            ? "bg-gradient-to-br from-lime-400 to-green-500 text-slate-950 border-lime-300"
            : "bg-gradient-to-br from-indigo-400 to-purple-500 text-white border-indigo-300"
        )}
      >
        #{crop.rank}
      </div>

      {/* Crop + bar */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className={cn("text-base font-black tracking-tight", isTop ? "text-amber-800 dark:text-amber-300" : "text-slate-900 dark:text-white")}>
            {cropName}
          </span>
          <span className={cn("text-sm font-black tabular-nums shrink-0", isTop ? "text-amber-700 dark:text-amber-400" : "text-slate-700 dark:text-slate-300")}>
            {crop.predicted_yield_t_per_ha} {t("t/ha", "टन/हेक्टेयर")}
          </span>
        </div>

        {/* Bar track */}
        <div className="h-3 w-full rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden p-0.5 shadow-inner">
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out shadow-sm",
              theme.barGradient
            )}
            style={{ width: `${width}%` }}
            role="progressbar"
            aria-valuenow={crop.predicted_yield_t_per_ha}
            aria-valuemin={0}
            aria-valuemax={maxYield}
            aria-label={`${crop.crop} predicted yield: ${crop.predicted_yield_t_per_ha} t/ha`}
          />
        </div>
      </div>
    </div>
  );
}

interface CropRankingProps {
  rankings: CropRecommendation[];
}

export function CropRanking({ rankings }: CropRankingProps) {
  const { t } = useLanguage();
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  const maxYield = Math.max(...sorted.map((c) => c.predicted_yield_t_per_ha));

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {t(
          "Predicted yield is the primary ranking signal. Historical stability, weather compatibility and yield trend provide supporting context.",
          "अनुमानित उपज प्राथमिक रैंकिंग संकेत है। ऐतिहासिक स्थिरता, मौसम की अनुकूलता और उपज रुझान सहायक संदर्भ प्रदान करते हैं।"
        )}
      </p>
      <div className="space-y-3">
        {sorted.map((crop) => (
          <CropRankingBar
            key={crop.crop}
            crop={crop}
            maxYield={maxYield}
            isTop={crop.rank === 1}
            animate
          />
        ))}
      </div>
    </div>
  );
}

