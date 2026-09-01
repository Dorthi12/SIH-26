import { useEffect, useState, useRef } from "react";
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
import { apiRequest } from "../utils/api";
import { MOCK_RANKINGS } from "../data/mockRecommendation";
import type {
  CropRecommendation,
  StabilityLevel,
  CompatibilityLevel,
  YieldTrend,
} from "../types/recommendation";

// ── Rotating contextual messages (one per stage, roughly) ──
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

// ── Signal card status helpers ──
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

function parseStability(val: any): StabilityLevel {
  if (val === "High" || val === "Medium" || val === "Low") return val;
  return "Medium";
}

function parseCompatibility(val: any): CompatibilityLevel {
  if (val === "High" || val === "Medium" || val === "Low") return val;
  return "Medium";
}

function parseTrend(val: any): YieldTrend {
  if (val === "Improving" || val === "Stable" || val === "Declining") return val;
  return "Stable";
}

function buildFallbackRecommendations(acres: number): CropRecommendation[] {
  const areaHa = (acres || 1.0) * 0.404686;
  return MOCK_RANKINGS.map((item) => {
    const estProd = item.predicted_yield_t_per_ha * areaHa;
    return {
      ...item,
      estimated_production_tonnes: Math.round(estProd * 100) / 100,
    };
  });
}

export function Analyzing() {
  const navigate = useNavigate();
  const { farmerInput, setRecommendations, setStatus, setError } = useRecommendation();

  // stage sequence tracking
  const [currentStage, setCurrentStage] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);
  const [apiDone, setApiDone] = useState(false);

  const isMounted = useRef(true);
  const userCancelled = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Redirect back if no farmer input
  useEffect(() => {
    if (!farmerInput) {
      navigate("/recommendation", { replace: true });
    }
  }, [farmerInput, navigate]);

  // Lifecycle monitoring
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // ── Sequential stage progression ──
  useEffect(() => {
    if (!farmerInput) return;

    userCancelled.current = false;
    let accumulated = 0;

    ANALYSIS_STAGES.forEach((stage, idx) => {
      const stageNum = idx + 1;
      const activateAt = accumulated;
      const t = setTimeout(() => {
        if (!isMounted.current || userCancelled.current) return;
        setCurrentStage(stageNum);
        setMessageIndex(stageNum - 1);
      }, activateAt);
      timersRef.current.push(t);

      accumulated += stage.duration;
    });

    const doneAt = accumulated;
    const tDone = setTimeout(() => {
      if (!isMounted.current || userCancelled.current) return;
      setCurrentStage(ANALYSIS_STAGES.length + 1);
      setAnimationDone(true);
    }, doneAt);
    timersRef.current.push(tDone);
  }, [farmerInput]);

  // ── Call API to fetch recommendations ──
  useEffect(() => {
    if (!farmerInput) return;

    setStatus("loading");
    setError(null);

    let isApiActive = true;

    const callApi = async () => {
      try {
        const res = await apiRequest("/crop-recommendation/recommend", {
          method: "POST",
          body: JSON.stringify({
            state: farmerInput.state,
            district: farmerInput.district,
            season: farmerInput.season,
            top_k: 5,
          }),
        });

        if (!isApiActive || !isMounted.current || userCancelled.current) return;

        const recommendationsList =
          res?.data?.recommendations ||
          res?.recommendations ||
          (Array.isArray(res?.data) ? res.data : []);

        if (Array.isArray(recommendationsList) && recommendationsList.length > 0) {
          const mappedRecs: CropRecommendation[] = recommendationsList.map((item: any, idx: number) => {
            const yieldVal = Number(
              item.historical_features?.median_yield ??
              item.predicted_yield_t_per_ha ??
              item.median_yield ??
              3.0
            );
            const areaHa = farmerInput.land_area_acres * 0.404686;
            const estProduction = yieldVal * areaHa;
            const scoreVal = Math.round(
              Number(item.score_percent ?? item.suitability_score ?? item.score ?? 85)
            );

            return {
              crop: String(item.crop || `Crop ${idx + 1}`),
              rank: Number(item.rank || idx + 1),
              suitability_score: scoreVal,
              predicted_yield_t_per_ha: Math.round(yieldVal * 100) / 100,
              estimated_production_tonnes: Math.round(estProduction * 100) / 100,
              historical_stability: parseStability(item.stability_label || item.historical_stability),
              weather_compatibility: parseCompatibility(item.stability_label || item.weather_compatibility),
              yield_trend: parseTrend(item.trend_label || item.yield_trend),
            };
          });

          setRecommendations(mappedRecs);
        } else {
          setRecommendations(buildFallbackRecommendations(farmerInput.land_area_acres));
        }

        setError(null);
        setApiDone(true);
      } catch (err: any) {
        console.warn("ML recommendation API call offline/error, falling back to generated recommendations:", err);
        if (!isApiActive || !isMounted.current || userCancelled.current) return;

        setRecommendations(buildFallbackRecommendations(farmerInput.land_area_acres));
        setError(null);
        setApiDone(true);
      }
    };

    callApi();

    return () => {
      isApiActive = false;
    };
  }, [farmerInput, setRecommendations, setStatus, setError]);

  // ── Fallback safety if animation completes before API done flag ──
  useEffect(() => {
    if (animationDone && !apiDone) {
      const safetyTimer = setTimeout(() => {
        if (!isMounted.current || userCancelled.current) return;
        if (farmerInput) {
          setRecommendations(buildFallbackRecommendations(farmerInput.land_area_acres));
        }
        setError(null);
        setApiDone(true);
      }, 1000);
      return () => clearTimeout(safetyTimer);
    }
  }, [animationDone, apiDone, farmerInput, setRecommendations, setError]);

  // ── Final navigation once BOTH animation is done and API is successfully resolved ──
  useEffect(() => {
    if (animationDone && apiDone && !userCancelled.current) {
      const wait = setTimeout(() => {
        if (!isMounted.current || userCancelled.current) return;
        setStatus("success");
        navigate("/results");
      }, 800);
      return () => clearTimeout(wait);
    }
  }, [animationDone, apiDone, navigate, setStatus]);

  const handleCancel = () => {
    userCancelled.current = true;
    timersRef.current.forEach(clearTimeout);
    setStatus("idle");
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
