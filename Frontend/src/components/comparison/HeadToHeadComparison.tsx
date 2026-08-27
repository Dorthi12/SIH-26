import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";
import { Badge } from "../ui/Badge";
import type { CropRecommendation } from "../../types/recommendation";

// ---------------------------------------------------------------------------
// CropSelector
// ---------------------------------------------------------------------------

interface CropSelectorProps {
  id: string;
  label: string;
  options: CropRecommendation[];
  value: string;
  onChange: (crop: string) => void;
  disabledValue?: string;
}

function CropSelector({ id, label, options, value, onChange, disabledValue }: CropSelectorProps) {
  return (
    <div className="flex-1 min-w-0 space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-charcoal-muted/60">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full appearance-none rounded-xl border border-ivory-300 bg-white",
            "px-4 py-2.5 pr-9 text-sm font-semibold text-charcoal",
            "transition-all duration-150 outline-none",
            "focus:ring-2 focus:ring-forest/20 focus:border-forest",
            "hover:border-forest/40"
          )}
          aria-label={`Select ${label}`}
        >
          {options.map((c) => (
            <option key={c.crop} value={c.crop} disabled={c.crop === disabledValue}>
              {c.crop} {c.crop === disabledValue ? "(selected as other)" : ""}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted/50" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Comparison row
// ---------------------------------------------------------------------------

interface CompRowProps {
  label: string;
  leftVal: string | number;
  rightVal: string | number;
  leftBetter?: boolean; // if true, left is numerically stronger
  rightBetter?: boolean;
  isNumeric?: boolean;
}

function CompRow({ label, leftVal, rightVal, leftBetter, rightBetter }: CompRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-3 border-b border-ivory-200 last:border-0">
      {/* Left */}
      <div className="text-right">
        <span className={cn(
          "text-sm tabular-nums",
          leftBetter ? "font-bold text-forest" : "font-medium text-charcoal"
        )}>
          {leftVal}
        </span>
      </div>

      {/* Label */}
      <div className="text-center min-w-[120px]">
        <span className="text-xs font-semibold uppercase tracking-wide text-charcoal-muted/60 whitespace-nowrap">
          {label}
        </span>
      </div>

      {/* Right */}
      <div className="text-left">
        <span className={cn(
          "text-sm tabular-nums",
          rightBetter ? "font-bold text-forest" : "font-medium text-charcoal"
        )}>
          {rightVal}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HeadToHeadComparison
// ---------------------------------------------------------------------------

interface HeadToHeadProps {
  rankings: CropRecommendation[];
}

const LEVEL_ORDER: Record<string, number> = { High: 3, Medium: 2, Low: 1, Improving: 3, Stable: 2, Declining: 1 };

export function HeadToHeadComparison({ rankings }: HeadToHeadProps) {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  const [leftCrop, setLeftCrop] = useState(sorted[0].crop);
  const [rightCrop, setRightCrop] = useState(sorted[1].crop);

  const left  = sorted.find((c) => c.crop === leftCrop)  ?? sorted[0];
  const right = sorted.find((c) => c.crop === rightCrop) ?? sorted[1];

  const ly = left.predicted_yield_t_per_ha;
  const ry = right.predicted_yield_t_per_ha;
  const ls = left.suitability_score;
  const rs = right.suitability_score;

  const rows: CompRowProps[] = [
    {
      label: "Suitability Score",
      leftVal: `${ls} / 100`,
      rightVal: `${rs} / 100`,
      leftBetter: ls > rs,
      rightBetter: rs > ls,
    },
    {
      label: "Predicted Yield",
      leftVal: `${ly} t/ha`,
      rightVal: `${ry} t/ha`,
      leftBetter: ly > ry,
      rightBetter: ry > ly,
      isNumeric: true,
    },
    {
      label: "Historical Stability",
      leftVal: left.historical_stability,
      rightVal: right.historical_stability,
      leftBetter: LEVEL_ORDER[left.historical_stability] > LEVEL_ORDER[right.historical_stability],
      rightBetter: LEVEL_ORDER[right.historical_stability] > LEVEL_ORDER[left.historical_stability],
    },
    {
      label: "Weather Compatibility",
      leftVal: left.weather_compatibility,
      rightVal: right.weather_compatibility,
      leftBetter: LEVEL_ORDER[left.weather_compatibility] > LEVEL_ORDER[right.weather_compatibility],
      rightBetter: LEVEL_ORDER[right.weather_compatibility] > LEVEL_ORDER[left.weather_compatibility],
    },
    {
      label: "Yield Trend",
      leftVal: left.yield_trend,
      rightVal: right.yield_trend,
      leftBetter: LEVEL_ORDER[left.yield_trend] > LEVEL_ORDER[right.yield_trend],
      rightBetter: LEVEL_ORDER[right.yield_trend] > LEVEL_ORDER[left.yield_trend],
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6 space-y-5">
      {/* Selectors */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        <CropSelector
          id="head-left"
          label="Crop A"
          options={sorted}
          value={leftCrop}
          onChange={setLeftCrop}
          disabledValue={rightCrop}
        />
        <div className="flex items-center justify-center py-1 sm:pb-2.5">
          <span className="text-sm font-bold text-charcoal-muted/50 px-2">vs</span>
        </div>
        <CropSelector
          id="head-right"
          label="Crop B"
          options={sorted}
          value={rightCrop}
          onChange={setRightCrop}
          disabledValue={leftCrop}
        />
      </div>

      {/* Crop name headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-right">
          <p className={cn("text-lg font-bold", left.rank === 1 ? "text-forest" : "text-charcoal")}>
            {left.crop}
          </p>
          {left.rank === 1 && <Badge variant="default" size="sm">Top Pick</Badge>}
        </div>
        <div className="text-center">
          <span className="text-xs font-semibold text-charcoal-muted/40">—</span>
        </div>
        <div className="text-left">
          <p className={cn("text-lg font-bold", right.rank === 1 ? "text-forest" : "text-charcoal")}>
            {right.crop}
          </p>
          {right.rank === 1 && <Badge variant="default" size="sm">Top Pick</Badge>}
        </div>
      </div>

      {/* Comparison rows */}
      <div className="divide-y-0">
        {rows.map((r) => <CompRow key={r.label} {...r} />)}
      </div>

      {/* Yield difference callout */}
      {Math.abs(ly - ry) > 0 && (
        <div className="rounded-xl bg-forest/[0.04] border border-forest/10 px-4 py-2.5 text-center">
          <p className="text-xs text-charcoal-muted">
            Predicted yield difference:{" "}
            <strong className="text-charcoal">
              {Math.abs(ly - ry).toFixed(1)} t/ha
            </strong>
            {" "}in favour of{" "}
            <strong className={ly > ry ? "text-forest" : "text-charcoal"}>
              {ly > ry ? left.crop : right.crop}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}
