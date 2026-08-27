import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  CloudSun,
  BookOpen,
  TrendingUp,
  X,
} from "lucide-react";

import { useRecommendation } from "../context/RecommendationContext";
import { FarmContextCard } from "../components/analyzing/FarmContextCard";
import { AnalysisPipeline, ANALYSIS_STAGES } from "../components/analyzing/AnalysisPipeline";
import { AnalysisVisualization } from "../components/analyzing/AnalysisVisualization";
import { AnalysisMessage } from "../components/analyzing/AnalysisMessage";
import { AnalysisSignalCard, type SignalStatus } from "../components/analyzing/AnalysisSignalCard";
import { cn } from "../utils/cn";

// ---------------------------------------------------------------------------
// Rotating contextual messages (one per stage, roughly)
// ---------------------------------------------------------------------------

const STAGE_MESSAGES: Record<number, string> = {
  1: "Reading your submitted farm details…",
  2: "Checking district-level agricultural conditions…",
  3: "Analyzing current weather conditions…",
  4: "Evaluating upcoming weather forecast…",
  5: "Studying historical crop performance for your district…",
  6: "Estimating yield for candidate crops…",
  7: "Ranking crop options by suitability…",
  8: "Preparing your crop recommendation…",
};

// ---------------------------------------------------------------------------
// Signal card status helpers
// ---------------------------------------------------------------------------

function weatherStatus(stage: number): SignalStatus {
  if (stage >= 4) return "ready";
  if (stage >= 3) return "analyzing";
  return "idle";
}

function historyStatus(stage: number): SignalStatus {
  if (stage >= 6) return "ready";
  if (stage >= 5) return "analyzing";
  return "idle";
}

function mlStatus(stage: number): SignalStatus {
  if (stage >= 8) return "ready";
  if (stage >= 6) return "analyzing";
  return "idle";
}

// ---------------------------------------------------------------------------
// Analyzing page
// ---------------------------------------------------------------------------

export function Analyzing() {
  const navigate = useNavigate();
  const { farmerInput, setStatus } = useRecommendation();

  // currentStage: 0 = not started, 1–8 = active stage, 9 = done
  const [currentStage, setCurrentStage] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const sequenceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelled = useRef(false);

  // Redirect back if no farmer input
  useEffect(() => {
    if (!farmerInput) {
      navigate("/recommendation", { replace: true });
    }
  }, [farmerInput, navigate]);

  // ── Sequential stage progression ──
  const runSequence = useCallback(() => {
    cancelled.current = false;
    let accumulated = 0;

    ANALYSIS_STAGES.forEach((stage, idx) => {
      const stageNum = idx + 1;

      // Activate this stage
      const activateAt = accumulated;
      sequenceRef.current = setTimeout(() => {
        if (cancelled.current) return;
        setCurrentStage(stageNum);
        setMessageIndex(stageNum - 1);
      }, activateAt);

      accumulated += stage.duration;
    });

    // All stages complete → show done state
    const doneAt = accumulated;
    sequenceRef.current = setTimeout(() => {
      if (cancelled.current) return;
      setCurrentStage(ANALYSIS_STAGES.length + 1); // past last = all completed
          }, doneAt);

    // Navigate after short pause on done
    sequenceRef.current = setTimeout(() => {
      if (cancelled.current) return;
      setStatus("success");
      navigate("/results");
    }, doneAt + 1400);
  }, [navigate, setStatus]);

  useEffect(() => {
    // Small initial delay for page enter animation
    const init = setTimeout(runSequence, 400);
    return () => {
      clearTimeout(init);
      cancelled.current = true;
      if (sequenceRef.current) clearTimeout(sequenceRef.current);
    };
  }, [runSequence]);

  const handleCancel = () => {
    cancelled.current = true;
    if (sequenceRef.current) clearTimeout(sequenceRef.current);
    navigate("/recommendation");
  };

  // Respect prefers-reduced-motion
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // ── Completed "all done" overlay ──
  const allComplete = currentStage > ANALYSIS_STAGES.length;

  // Active stage index capped for pipeline display
  const pipelineStage = Math.min(currentStage, ANALYSIS_STAGES.length);

  if (!farmerInput) return null;

  return (
    <div className="min-h-screen bg-ivory relative overflow-x-hidden">
      {/* Subtle background texture */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.025] overflow-hidden" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a3d2e" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-grid)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-8 animate-fade-in">

          {/* ── Header ── */}
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-forest/60">
              Smart Agriculture Intelligence
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-charcoal tracking-tight">
              {allComplete ? "Recommendation ready" : "Analyzing your farm…"}
            </h1>
            <p className="text-sm text-charcoal-muted max-w-md mx-auto leading-relaxed">
              {allComplete
                ? "We've evaluated the available signals for your farm."
                : "We're combining local agricultural history with current and forecast weather to identify suitable crop options."}
            </p>
          </div>

          {/* ── Farm context card ── */}
          <div className="max-w-xl mx-auto animate-slide-up">
            <FarmContextCard input={farmerInput} />
          </div>

          {/* ── All complete state ── */}
          {allComplete && (
            <div className="flex flex-col items-center gap-3 animate-slide-up">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest shadow-md shadow-forest/20">
                <Check className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-sm text-charcoal-muted">
                Navigating to your results…
              </p>
            </div>
          )}

          {/* ── Main two-column layout (hidden once complete) ── */}
          {!allComplete && (
            <div className="grid lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr] gap-6 xl:gap-10 items-start">

              {/* Left — Pipeline */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6">
                  <h2 className="text-sm font-semibold text-charcoal mb-5">
                    Analysis Pipeline
                  </h2>
                  <AnalysisPipeline
                    currentStage={pipelineStage}
                    stages={ANALYSIS_STAGES}
                  />
                </div>

                {/* Rotating message */}
                <AnalysisMessage
                  messages={Object.values(STAGE_MESSAGES)}
                  currentIndex={Math.min(messageIndex, Object.keys(STAGE_MESSAGES).length - 1)}
                />
              </div>

              {/* Right — Visualization + signal cards */}
              <div className="space-y-5">
                {/* Abstract visualization */}
                <div className={cn("h-[220px] md:h-[260px]", prefersReduced && "hidden md:block")}>
                  <AnalysisVisualization activeStage={pipelineStage} />
                </div>

                {/* Signal cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <AnalysisSignalCard
                    icon={<CloudSun className="h-4 w-4" />}
                    title="Weather"
                    subtitle="Current + Forecast"
                    status={weatherStatus(pipelineStage)}
                  />
                  <AnalysisSignalCard
                    icon={<BookOpen className="h-4 w-4" />}
                    title="Historical Data"
                    subtitle="Recent Agricultural Performance"
                    status={historyStatus(pipelineStage)}
                  />
                  <AnalysisSignalCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    title="ML Prediction"
                    subtitle="Candidate Crop Yield"
                    status={mlStatus(pipelineStage)}
                  />
                </div>

                {/* Overall progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-charcoal-muted">Overall progress</p>
                    <p className="text-xs font-medium text-charcoal-muted tabular-nums">
                      {pipelineStage} / {ANALYSIS_STAGES.length}
                    </p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-ivory-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-forest transition-all duration-700 ease-smooth"
                      style={{
                        width: `${(pipelineStage / ANALYSIS_STAGES.length) * 100}%`,
                      }}
                      role="progressbar"
                      aria-valuenow={pipelineStage}
                      aria-valuemin={0}
                      aria-valuemax={ANALYSIS_STAGES.length}
                      aria-label="Analysis progress"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Cancel link ── */}
          {!allComplete && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 text-xs text-charcoal-muted/60 hover:text-charcoal-muted transition-colors duration-150"
                aria-label="Cancel analysis and return to form"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
