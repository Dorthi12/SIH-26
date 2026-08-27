import { cn } from "../../utils/cn";
import { Badge } from "../ui/Badge";
import type { CropRecommendation } from "../../types/recommendation";

const LEVEL_ORDER: Record<string, number> = {
  High: 3, Medium: 2, Low: 1, Improving: 3, Stable: 2, Declining: 1,
};

interface CompRowProps {
  label: string;
  leftVal: string;
  rightVal: string;
  leftBetter: boolean;
  rightBetter: boolean;
}

function CompRow({ label, leftVal, rightVal, leftBetter, rightBetter }: CompRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2.5 border-b border-ivory-200 last:border-0">
      <div className="text-right">
        <span className={cn(
          "text-sm tabular-nums",
          leftBetter ? "font-bold text-forest" : "font-medium text-charcoal"
        )}>
          {leftVal}
        </span>
      </div>
      <div className="text-center min-w-[110px] px-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-charcoal-muted/60 whitespace-nowrap">
          {label}
        </span>
      </div>
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

interface HeadToHeadReasoningProps {
  left: CropRecommendation;
  right: CropRecommendation;
}

export function HeadToHeadReasoning({ left, right }: HeadToHeadReasoningProps) {
  const ly = left.predicted_yield_t_per_ha;
  const ry = right.predicted_yield_t_per_ha;
  const ls = left.suitability_score;
  const rs = right.suitability_score;

  const rows: CompRowProps[] = [
    {
      label: "Predicted Yield",
      leftVal: `${ly} t/ha`,
      rightVal: `${ry} t/ha`,
      leftBetter: ly > ry,
      rightBetter: ry > ly,
    },
    {
      label: "Suitability",
      leftVal: `${ls} / 100`,
      rightVal: `${rs} / 100`,
      leftBetter: ls > rs,
      rightBetter: rs > ls,
    },
    {
      label: "Historical",
      leftVal: left.historical_stability,
      rightVal: right.historical_stability,
      leftBetter: LEVEL_ORDER[left.historical_stability] > LEVEL_ORDER[right.historical_stability],
      rightBetter: LEVEL_ORDER[right.historical_stability] > LEVEL_ORDER[left.historical_stability],
    },
    {
      label: "Weather",
      leftVal: left.weather_compatibility,
      rightVal: right.weather_compatibility,
      leftBetter: LEVEL_ORDER[left.weather_compatibility] > LEVEL_ORDER[right.weather_compatibility],
      rightBetter: LEVEL_ORDER[right.weather_compatibility] > LEVEL_ORDER[left.weather_compatibility],
    },
    {
      label: "Trend",
      leftVal: left.yield_trend,
      rightVal: right.yield_trend,
      leftBetter: LEVEL_ORDER[left.yield_trend] > LEVEL_ORDER[right.yield_trend],
      rightBetter: LEVEL_ORDER[right.yield_trend] > LEVEL_ORDER[left.yield_trend],
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6 space-y-4">
      {/* Crop headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="text-right">
          <p className="text-lg font-bold text-forest">{left.crop}</p>
          <Badge variant="default" size="sm">Top Pick</Badge>
        </div>
        <p className="text-xs font-bold text-charcoal-muted/40 text-center px-2">vs</p>
        <div className="text-left">
          <p className="text-lg font-bold text-charcoal">{right.crop}</p>
        </div>
      </div>

      {/* Comparison rows */}
      <div className="divide-y-0">
        {rows.map((r) => <CompRow key={r.label} {...r} />)}
      </div>

      {/* Explanation */}
      <div className="rounded-xl border border-ivory-200 bg-ivory-100 px-4 py-3 text-sm text-charcoal-muted leading-relaxed">
        Both crops show favorable supporting indicators in this demo.{" "}
        <strong className="text-charcoal">{left.crop}</strong> ranks higher primarily because
        its predicted yield ({ly} t/ha) is higher than {right.crop} ({ry} t/ha).
      </div>
    </div>
  );
}
