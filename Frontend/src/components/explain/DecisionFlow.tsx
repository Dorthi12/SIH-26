import { MapPin, CloudSun, BarChart3, TrendingUp, Layers, Star } from "lucide-react";
import { cn } from "../../utils/cn";

interface DecisionFlowProps {
  district: string;
  season: string;
  acres: number;
  recommendedCrop: string;
}

const STEPS = [
  {
    icon: MapPin,
    label: "Farm Context",
    key: "farm",
  },
  {
    icon: CloudSun,
    label: "Weather Context",
    sublabel: "Current + Forecast",
    key: "weather",
  },
  {
    icon: BarChart3,
    label: "Historical Performance",
    sublabel: "Recent crop yields",
    key: "history",
  },
  {
    icon: TrendingUp,
    label: "Yield Prediction",
    sublabel: "Candidate crop estimates",
    key: "prediction",
  },
  {
    icon: Layers,
    label: "Crop Ranking",
    sublabel: "Compare candidates",
    key: "ranking",
  },
  {
    icon: Star,
    label: "Recommendation",
    key: "result",
    isResult: true,
  },
];

export function DecisionFlow({ district, season, acres, recommendedCrop }: DecisionFlowProps) {
  return (
    <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6">
      {/* Desktop: horizontal */}
      <div className="hidden lg:flex items-stretch gap-0 overflow-x-auto">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-center shrink-0">
              <div className={cn(
                "flex flex-col items-center text-center gap-2 px-4 py-1 min-w-[100px]",
              )}>
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border shadow-sm",
                  step.isResult
                    ? "bg-forest text-white border-forest"
                    : "bg-white text-forest border-ivory-300"
                )}>
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <p className={cn(
                    "text-xs font-bold leading-tight",
                    step.isResult ? "text-forest" : "text-charcoal"
                  )}>
                    {step.isResult ? recommendedCrop : step.label}
                  </p>
                  {step.sublabel && (
                    <p className="text-2xs text-charcoal-muted/60 mt-0.5">{step.sublabel}</p>
                  )}
                  {i === 0 && (
                    <p className="text-2xs text-charcoal-muted/70 mt-0.5 leading-tight">
                      {district.split(",")[0]}<br />{season} · {acres} ac
                    </p>
                  )}
                </div>
              </div>
              {!isLast && (
                <div className="flex-1 min-w-[20px] flex items-center justify-center" aria-hidden>
                  <div className="h-px w-full bg-forest/15" />
                  <svg className="h-3 w-3 text-forest/30 shrink-0 -ml-1" fill="currentColor" viewBox="0 0 8 8"><path d="M0 0l8 4-8 4z"/></svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="lg:hidden space-y-0">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-sm",
                  step.isResult
                    ? "bg-forest text-white border-forest"
                    : "bg-white text-forest border-ivory-300"
                )}>
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
                {!isLast && (
                  <div className="w-px flex-1 min-h-[24px] bg-forest/15 my-1" />
                )}
              </div>
              <div className="pb-4 pt-1">
                <p className={cn(
                  "text-sm font-bold",
                  step.isResult ? "text-forest" : "text-charcoal"
                )}>
                  {step.isResult ? recommendedCrop : step.label}
                </p>
                {step.sublabel && (
                  <p className="text-xs text-charcoal-muted">{step.sublabel}</p>
                )}
                {i === 0 && (
                  <p className="text-xs text-charcoal-muted">{district} · {season} · {acres} ac</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
