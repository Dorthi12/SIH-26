import {
  FileText,
  MapPin,
  CloudSun,
  CloudRain,
  BookOpen,
  TrendingUp,
  BarChart3,
  Sparkles,
  Check,
  Loader,
} from "lucide-react";
import { cn } from "../../utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StageStatus = "pending" | "active" | "completed";

export interface AnalysisStageConfig {
  id: string;
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  /** Duration in ms this stage stays "active" before completing */
  duration: number;
}

// ---------------------------------------------------------------------------
// Pipeline stage configuration — single source of truth
// ---------------------------------------------------------------------------

export const ANALYSIS_STAGES: AnalysisStageConfig[] = [
  {
    id: "farm",
    number: "01",
    icon: <FileText className="h-4 w-4" />,
    title: "Farm Profile",
    description: "Reading your farm details",
    duration: 500,
  },
  {
    id: "location",
    number: "02",
    icon: <MapPin className="h-4 w-4" />,
    title: "Location Context",
    description: "Understanding district conditions",
    duration: 650,
  },
  {
    id: "weather",
    number: "03",
    icon: <CloudSun className="h-4 w-4" />,
    title: "Weather Intelligence",
    description: "Analyzing current conditions",
    duration: 800,
  },
  {
    id: "forecast",
    number: "04",
    icon: <CloudRain className="h-4 w-4" />,
    title: "Forecast Analysis",
    description: "Evaluating upcoming weather",
    duration: 750,
  },
  {
    id: "history",
    number: "05",
    icon: <BookOpen className="h-4 w-4" />,
    title: "Historical Agriculture",
    description: "Studying recent crop performance",
    duration: 900,
  },
  {
    id: "yield",
    number: "06",
    icon: <TrendingUp className="h-4 w-4" />,
    title: "Yield Prediction",
    description: "Estimating candidate crop yields",
    duration: 900,
  },
  {
    id: "ranking",
    number: "07",
    icon: <BarChart3 className="h-4 w-4" />,
    title: "Crop Ranking",
    description: "Comparing suitable options",
    duration: 700,
  },
  {
    id: "recommendation",
    number: "08",
    icon: <Sparkles className="h-4 w-4" />,
    title: "Recommendation",
    description: "Preparing your crop recommendation",
    duration: 600,
  },
];

// ---------------------------------------------------------------------------
// AnalysisStage — individual stage row
// ---------------------------------------------------------------------------

interface AnalysisStageProps {
  config: AnalysisStageConfig;
  status: StageStatus;
  isLast: boolean;
  connectorFilled: boolean;
}

export function AnalysisStage({
  config,
  status,
  isLast,
  connectorFilled,
}: AnalysisStageProps) {
  const isPending   = status === "pending";
  const isActive    = status === "active";
  const isCompleted = status === "completed";

  return (
    <div className="flex gap-3.5 md:gap-4">
      {/* Left: icon + connector */}
      <div className="flex flex-col items-center">
        {/* Icon circle */}
        <div
          className={cn(
            "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500",
            isPending   && "border-charcoal/10 bg-ivory-100 text-charcoal-muted/30",
            isActive    && "border-forest bg-white text-forest shadow-sm shadow-forest/20",
            isCompleted && "border-forest bg-forest text-white"
          )}
          aria-label={`Stage ${config.number}: ${config.title} — ${status}`}
        >
          {isCompleted ? (
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          ) : isActive ? (
            <Loader className="h-3.5 w-3.5 animate-spin" />
          ) : (
            config.icon
          )}

          {/* Active pulse ring */}
          {isActive && (
            <span className="absolute inset-0 rounded-full border-2 border-forest/30 animate-ping" />
          )}
        </div>

        {/* Connector line */}
        {!isLast && (
          <div className="mt-1 w-px flex-1 min-h-[20px] bg-charcoal/8 relative overflow-hidden">
            <div
              className={cn(
                "absolute inset-x-0 top-0 bg-forest transition-all duration-700 ease-smooth",
                connectorFilled ? "h-full" : "h-0"
              )}
            />
          </div>
        )}
      </div>

      {/* Right: text */}
      <div
        className={cn(
          "flex-1 min-w-0 pb-4 md:pb-5 transition-all duration-400",
          isPending && "opacity-35"
        )}
      >
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-2xs font-bold tabular-nums transition-colors duration-300",
              isActive || isCompleted ? "text-forest/60" : "text-charcoal-muted/30"
            )}
          >
            {config.number}
          </span>
          <p
            className={cn(
              "text-sm font-semibold leading-snug transition-colors duration-300",
              isPending   && "text-charcoal-muted/50",
              isActive    && "text-charcoal",
              isCompleted && "text-charcoal"
            )}
          >
            {config.title}
          </p>
          {isActive && (
            <span className="text-2xs font-medium text-amber-600 animate-pulse ml-auto pr-1">
              Analyzing…
            </span>
          )}
          {isCompleted && (
            <span className="text-2xs font-medium text-forest/70 ml-auto pr-1">
              Complete
            </span>
          )}
        </div>
        <p
          className={cn(
            "text-xs mt-0.5 transition-colors duration-300",
            isPending   && "text-charcoal-muted/35",
            isActive    && "text-charcoal-muted",
            isCompleted && "text-charcoal-muted/70"
          )}
        >
          {config.description}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AnalysisPipeline — the full vertical pipeline
// ---------------------------------------------------------------------------

interface AnalysisPipelineProps {
  /** 0 = nothing started, 1 = stage 1 active, 8 = all complete */
  currentStage: number;
  stages: AnalysisStageConfig[];
}

export function AnalysisPipeline({ currentStage, stages }: AnalysisPipelineProps) {
  return (
    <div role="list" aria-label="Analysis pipeline stages">
      {stages.map((stage, idx) => {
        const stageNum = idx + 1;
        let status: StageStatus = "pending";
        if (stageNum < currentStage) status = "completed";
        else if (stageNum === currentStage) status = "active";

        return (
          <div key={stage.id} role="listitem">
            <AnalysisStage
              config={stage}
              status={status}
              isLast={idx === stages.length - 1}
              connectorFilled={stageNum < currentStage}
            />
          </div>
        );
      })}
    </div>
  );
}
