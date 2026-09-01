import { useState } from "react";
import { ChevronDown, Swords } from "lucide-react";
import { cn } from "../../utils/cn";
import { Badge } from "../ui/Badge";
import { useLanguage } from "../../context/LanguageContext";
import { getCropName, getMetricLevel } from "../../utils/cropTranslations";
import type { CropRecommendation } from "../../types/recommendation";

interface CropSelectorProps {
  id: string;
  label: string;
  options: CropRecommendation[];
  value: string;
  onChange: (crop: string) => void;
  disabledValue?: string;
}

function CropSelector({ id, label, options, value, onChange, disabledValue }: CropSelectorProps) {
  const { t } = useLanguage();
  return (
    <div className="flex-1 min-w-0 space-y-1.5">
      <label htmlFor={id} className="block text-2xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full appearance-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60",
            "px-4 py-3 pr-10 text-sm font-black text-slate-900 dark:text-white cursor-pointer",
            "transition-all duration-150 outline-none shadow-sm",
            "focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500",
            "hover:border-emerald-500/40"
          )}
          aria-label={`Select ${label}`}
        >
          {options.map((c) => (
            <option key={c.crop} value={c.crop} disabled={c.crop === disabledValue}>
              {getCropName(c.crop, t)} {c.crop === disabledValue ? `(${t("selected as other", "दूसरे स्थान पर चुना गया")})` : ""}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}

interface CompRowProps {
  label: string;
  leftVal: string | number;
  rightVal: string | number;
  leftBetter?: boolean;
  rightBetter?: boolean;
}

function CompRow({ label, leftVal, rightVal, leftBetter, rightBetter }: CompRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800/80 last:border-0">
      {/* Left */}
      <div className="text-right">
        <span className={cn(
          "inline-block px-3 py-1 rounded-xl text-xs sm:text-sm tabular-nums font-extrabold transition-all",
          leftBetter
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-black shadow-sm"
            : "text-slate-700 dark:text-slate-300"
        )}>
          {leftVal}
        </span>
      </div>

      {/* Label */}
      <div className="text-center min-w-[130px]">
        <span className="text-3xs sm:text-2xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>

      {/* Right */}
      <div className="text-left">
        <span className={cn(
          "inline-block px-3 py-1 rounded-xl text-xs sm:text-sm tabular-nums font-extrabold transition-all",
          rightBetter
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-black shadow-sm"
            : "text-slate-700 dark:text-slate-300"
        )}>
          {rightVal}
        </span>
      </div>
    </div>
  );
}

interface HeadToHeadProps {
  rankings: CropRecommendation[];
}

const LEVEL_ORDER: Record<string, number> = { High: 3, Medium: 2, Low: 1, Improving: 3, Stable: 2, Declining: 1 };

export function HeadToHeadComparison({ rankings }: HeadToHeadProps) {
  const { t } = useLanguage();
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  const [leftCrop, setLeftCrop] = useState(sorted[0].crop);
  const [rightCrop, setRightCrop] = useState(sorted[1]?.crop ?? sorted[0].crop);

  const left  = sorted.find((c) => c.crop === leftCrop)  ?? sorted[0];
  const right = sorted.find((c) => c.crop === rightCrop) ?? sorted[1] ?? sorted[0];

  const leftName = getCropName(left.crop, t);
  const rightName = getCropName(right.crop, t);

  const ly = left.predicted_yield_t_per_ha;
  const ry = right.predicted_yield_t_per_ha;
  const ls = left.suitability_score;
  const rs = right.suitability_score;

  const rows: CompRowProps[] = [
    {
      label: t("Suitability Score", "उपयुक्तता स्कोर"),
      leftVal: `${ls} / 100`,
      rightVal: `${rs} / 100`,
      leftBetter: ls > rs,
      rightBetter: rs > ls,
    },
    {
      label: t("Predicted Yield", "अनुमानित उपज"),
      leftVal: `${ly} ${t("t/ha", "टन/हेक्टेयर")}`,
      rightVal: `${ry} ${t("t/ha", "टन/हेक्टेयर")}`,
      leftBetter: ly > ry,
      rightBetter: ry > ly,
    },
    {
      label: t("Historical Stability", "ऐतिहासिक स्थिरता"),
      leftVal: getMetricLevel(left.historical_stability, t),
      rightVal: getMetricLevel(right.historical_stability, t),
      leftBetter: LEVEL_ORDER[left.historical_stability] > LEVEL_ORDER[right.historical_stability],
      rightBetter: LEVEL_ORDER[right.historical_stability] > LEVEL_ORDER[left.historical_stability],
    },
    {
      label: t("Weather Compatibility", "मौसम अनुकूलता"),
      leftVal: getMetricLevel(left.weather_compatibility, t),
      rightVal: getMetricLevel(right.weather_compatibility, t),
      leftBetter: LEVEL_ORDER[left.weather_compatibility] > LEVEL_ORDER[right.weather_compatibility],
      rightBetter: LEVEL_ORDER[right.weather_compatibility] > LEVEL_ORDER[left.weather_compatibility],
    },
    {
      label: t("Yield Trend", "उपज रुझान"),
      leftVal: getMetricLevel(left.yield_trend, t),
      rightVal: getMetricLevel(right.yield_trend, t),
      leftBetter: LEVEL_ORDER[left.yield_trend] > LEVEL_ORDER[right.yield_trend],
      rightBetter: LEVEL_ORDER[right.yield_trend] > LEVEL_ORDER[left.yield_trend],
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 md:p-8 space-y-6 backdrop-blur-md">
      {/* Selectors */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
        <CropSelector
          id="head-left"
          label={t("Crop A", "फ़सल ए")}
          options={sorted}
          value={leftCrop}
          onChange={setLeftCrop}
          disabledValue={rightCrop}
        />
        <div className="flex items-center justify-center py-1 sm:pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 border border-amber-300">
            <Swords className="h-5 w-5" />
          </div>
        </div>
        <CropSelector
          id="head-right"
          label={t("Crop B", "फ़सल बी")}
          options={sorted}
          value={rightCrop}
          onChange={setRightCrop}
          disabledValue={leftCrop}
        />
      </div>

      {/* Crop name headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2 border-y border-slate-100 dark:border-slate-800">
        <div className="text-right">
          <p className={cn("text-lg sm:text-xl font-black", left.rank === 1 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white")}>
            {leftName}
          </p>
          {left.rank === 1 && <Badge variant="amber" size="sm" className="font-extrabold">{t("Top Pick", "शीर्ष पसंद")}</Badge>}
        </div>
        <div className="text-center px-2">
          <span className="text-2xs font-extrabold uppercase text-slate-400">VS</span>
        </div>
        <div className="text-left">
          <p className={cn("text-lg sm:text-xl font-black", right.rank === 1 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white")}>
            {rightName}
          </p>
          {right.rank === 1 && <Badge variant="amber" size="sm" className="font-extrabold">{t("Top Pick", "शीर्ष पसंद")}</Badge>}
        </div>
      </div>

      {/* Comparison rows */}
      <div className="divide-y-0">
        {rows.map((r) => <CompRow key={r.label} {...r} />)}
      </div>

      {/* Yield difference callout */}
      {Math.abs(ly - ry) > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-500/20 px-5 py-3 text-center">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
            {t("Predicted yield difference:", "अनुमानित उपज अंतर:")}{" "}
            <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
              {Math.abs(ly - ry).toFixed(1)} {t("t/ha", "टन/हेक्टेयर")}
            </strong>
            {" "}
            {t("in favour of", "के पक्ष में")}{" "}
            <strong className={ly > ry ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-amber-600 dark:text-amber-400 font-black"}>
              {ly > ry ? leftName : rightName}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}

