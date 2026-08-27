import React from "react";
import { MapPin, CloudSun, BookOpen, TrendingUp, BarChart3, Gauge, ArrowDown } from "lucide-react";

const PIPELINE_STEPS = [
  {
    num: "01",
    icon: <MapPin className="h-4 w-4" />,
    title: "Farm Context",
    detail: "District · Season · Land Area",
  },
  {
    num: "02",
    icon: <CloudSun className="h-4 w-4" />,
    title: "Weather Conditions",
    detail: "Current + Forecast",
  },
  {
    num: "03",
    icon: <BookOpen className="h-4 w-4" />,
    title: "Historical Performance",
    detail: "Recent crop yields",
  },
  {
    num: "04",
    icon: <TrendingUp className="h-4 w-4" />,
    title: "Yield Prediction",
    detail: "Candidate crops evaluated",
  },
  {
    num: "05",
    icon: <BarChart3 className="h-4 w-4" />,
    title: "Crop Ranking",
    detail: "Best predicted yield",
  },
  {
    num: "06",
    icon: <Gauge className="h-4 w-4" />,
    title: "Suitability",
    detail: "Relative 0–100 score",
  },
];

export function DecisionPipeline() {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-0 overflow-x-auto pb-1">
      {PIPELINE_STEPS.map((step, idx) => (
        <React.Fragment key={step.num}>
          {/* Step */}
          <div className="flex flex-col items-center text-center gap-2 min-w-[110px] px-2 shrink-0">
            {/* Icon circle */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/8 text-forest border border-forest/12">
              {step.icon}
            </div>
            <div className="space-y-0.5">
              <p className="text-2xs font-bold text-forest/50 uppercase tracking-wider">{step.num}</p>
              <p className="text-xs font-semibold text-charcoal leading-tight">{step.title}</p>
              <p className="text-2xs text-charcoal-muted leading-tight">{step.detail}</p>
            </div>
          </div>

          {/* Connector */}
          {idx < PIPELINE_STEPS.length - 1 && (
            <div className="flex items-center justify-center px-1 py-3 sm:py-0 sm:pt-4 shrink-0">
              <div className="hidden sm:block h-px w-6 bg-forest/20" />
              <ArrowDown className="sm:hidden h-3 w-3 text-forest/30" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
