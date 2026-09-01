import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { useLanguage } from "../../context/LanguageContext";
import { getCropName, getCropTheme } from "../../utils/cropTranslations";
import type { CropRecommendation } from "../../types/recommendation";

interface CompBarProps {
  label: string;
  cropKey: string;
  value: number;
  maxValue: number;
  displayValue: string;
  isTop: boolean;
  delayMs?: number;
}

function CompBar({ label, cropKey, value, maxValue, displayValue, isTop, delayMs = 0 }: CompBarProps) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const theme = getCropTheme(cropKey);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const target = (value / maxValue) * 100;
    if (prefersReduced) { setWidth(target); return; }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setWidth(target), delayMs);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, maxValue, delayMs, prefersReduced]);

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className={cn("w-28 shrink-0 text-xs sm:text-sm truncate font-black", isTop ? "text-amber-800 dark:text-amber-300" : "text-slate-700 dark:text-slate-300")}>
        {label}
      </span>
      <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 shadow-inner">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out shadow-sm", theme.barGradient)}
          style={{ width: `${width}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={maxValue}
          aria-label={`${label}: ${displayValue}`}
        />
      </div>
      <span className={cn("w-24 text-right shrink-0 text-xs sm:text-sm font-black tabular-nums", isTop ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300")}>
        {displayValue}
      </span>
    </div>
  );
}

export function YieldComparisonChart({ rankings }: { rankings: CropRecommendation[] }) {
  const { t } = useLanguage();
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  const max = Math.max(...sorted.map((c) => c.predicted_yield_t_per_ha));

  return (
    <div className="space-y-3">
      {sorted.map((crop, i) => (
        <CompBar
          key={crop.crop}
          label={getCropName(crop.crop, t)}
          cropKey={crop.crop}
          value={crop.predicted_yield_t_per_ha}
          maxValue={max}
          displayValue={`${crop.predicted_yield_t_per_ha} ${t("t/ha", "टन/हेक्टेयर")}`}
          isTop={crop.rank === 1}
          delayMs={i * 100}
        />
      ))}
      <p className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 pt-1">
        {t("Predicted yield (t/ha)", "अनुमानित उपज (टन/हेक्टेयर)")}
      </p>
    </div>
  );
}

export function SuitabilityComparison({ rankings }: { rankings: CropRecommendation[] }) {
  const { t } = useLanguage();
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-3">
      {sorted.map((crop, i) => (
        <CompBar
          key={crop.crop}
          label={getCropName(crop.crop, t)}
          cropKey={crop.crop}
          value={crop.suitability_score}
          maxValue={100}
          displayValue={`${crop.suitability_score}`}
          isTop={crop.rank === 1}
          delayMs={i * 100}
        />
      ))}
      <p className="text-2xs font-medium text-slate-400 pt-1 leading-relaxed">
        {t(
          "Relative suitability among evaluated candidates — not a probability or confidence score.",
          "मूल्यांकन किए गए उम्मीदवारों में सापेक्ष उपयुक्तता - संभावना या विश्वास स्कोर नहीं।"
        )}
      </p>
    </div>
  );
}

