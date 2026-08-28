/**
 * ScenarioSimulator page — /scenarios
 *
 * Agricultural what-if decision tool.
 * Explore how changes in rainfall and temperature could affect crop outlook.
 *
 * Architecture:
 *   - All state lives here (controls, status, result).
 *   - simulateScenario() in scenarioService is the single backend integration point.
 *   - Sub-components receive only the props they need.
 *   - No ML prediction logic; no fake values computed in the frontend.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sprout,
  CloudRain,
  Thermometer,
  History as HistoryIcon,
  ArrowRight,
  Info,
} from "lucide-react";

import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Badge } from "../components/ui/Badge";

import { BasePredictionCard } from "../components/scenario/BasePredictionCard";
import { SimulatorControls } from "../components/scenario/SimulatorControls";
import { ScenarioResults } from "../components/scenario/ScenarioResults";

import { simulateScenario } from "../services/scenarioService";
import { useScrollReveal } from "../utils/useScrollReveal";
import type {
  BasePrediction,
  ScenarioControls,
  ScenarioSimulation,
  SimulatorStatus,
} from "../types/scenario";

// ── Demo seed data ─────────────────────────────────────────────────────────
// Structured so the real selected prediction can replace this later
// (e.g., from a global context, URL param, or query string).

const DEMO_PREDICTION: BasePrediction = {
  id: "demo-prediction-001",
  crop: "Wheat",
  district: "Prayagraj, Uttar Pradesh",
  season: "Rabi",
  predicted_yield_t_per_ha: 4.2,
  suitability_score: 94,
};

const DEFAULT_CONTROLS: ScenarioControls = {
  rainfall_delta_pct: 0,
  temperature_delta_c: 0,
};

// ── Page ──────────────────────────────────────────────────────────────────

export function ScenarioSimulator() {
  const navigate = useNavigate();
  const revealRef = useScrollReveal();

  // Seed prediction — replace with context / route state when backend is ready
  const [prediction] = useState<BasePrediction>(DEMO_PREDICTION);

  // Scenario controls
  const [controls, setControls] = useState<ScenarioControls>(DEFAULT_CONTROLS);

  // Simulator lifecycle
  const [status, setStatus] = useState<SimulatorStatus>("idle");
  const [result, setResult] = useState<ScenarioSimulation | null>(null);

  const handleControlChange = useCallback(
    (key: keyof ScenarioControls, value: number) => {
      setControls((prev) => ({ ...prev, [key]: value }));
      // Clear old result when controls change
      if (status === "result") {
        setStatus("idle");
        setResult(null);
      }
    },
    [status]
  );

  const handleReset = useCallback(() => {
    setControls(DEFAULT_CONTROLS);
    setStatus("idle");
    setResult(null);
  }, []);

  const handleSimulate = useCallback(async () => {
    setStatus("loading");
    setResult(null);

    try {
      // ── BACKEND INTEGRATION POINT ──────────────────────────────────────
      // simulateScenario() will call POST /scenario/simulate when connected.
      // For now it is a stub that resolves after a delay.
      const simulation = await simulateScenario({
        base_prediction_id: prediction.id,
        rainfall_delta_pct: controls.rainfall_delta_pct,
        temperature_delta_c: controls.temperature_delta_c,
      });
      setResult(simulation);
      setStatus("result");
    } catch (_err) {
      // Backend not connected yet — keep the "idle" state with loading done.
      // When the backend is live, surface the error in the UI here.
      setStatus("idle");
    }
  }, [prediction.id, controls]);

  return (
    <div className="min-h-screen bg-ivory">
      {/* ── Sticky context bar ── */}
      <div className="sticky top-16 z-30 bg-ivory dark:bg-[#101815] border-b border-ivory-300 dark:border-[#26362f] shadow-nav">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 text-charcoal-muted/70">
              <Sprout className="h-3.5 w-3.5 text-forest/60 shrink-0" />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 min-w-0">
              <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/50">
                Simulator
              </p>
              <p className="text-sm font-semibold text-charcoal truncate">
                {prediction.crop} — {prediction.district.split(",")[0]}
              </p>
              <Badge variant="default" size="sm">{prediction.season}</Badge>
            </div>
          </div>

          {/* Historical context link */}
          <button
            type="button"
            id="view-history-context-btn"
            onClick={() => navigate("/history")}
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-forest transition-colors rounded-lg px-2 py-1 hover:bg-forest/[0.05]"
            aria-label="View historical performance"
          >
            <HistoryIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Historical performance</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div ref={revealRef as React.Ref<HTMLDivElement>}>
      <PageContainer maxWidth="xl" className="py-8 md:py-12 space-y-10 animate-fade-in">

        {/* ── Page header ── */}
        <header className="space-y-4" data-reveal>
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-forest/60">
                Agricultural Decision Support
              </p>
              <Badge variant="amber" size="sm" dot>
                Beta
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
              Scenario Simulator
            </h1>
            <p className="text-base text-charcoal-muted max-w-xl leading-relaxed">
              Explore how changes in rainfall and temperature could affect your
              crop outlook.
            </p>
          </div>

          {/* Weather control hints */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-ivory-300 bg-white px-3 py-1.5 shadow-sm">
              <CloudRain className="h-3.5 w-3.5 text-forest/60" />
              <span className="text-xs font-semibold text-charcoal-light">
                Rainfall −20% to +20%
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-ivory-300 bg-white px-3 py-1.5 shadow-sm">
              <Thermometer className="h-3.5 w-3.5 text-amber-500/80" />
              <span className="text-xs font-semibold text-charcoal-light">
                Temperature −5°C to +5°C
              </span>
            </div>
          </div>
        </header>

        {/* ── Base prediction ── */}
        <section aria-labelledby="base-prediction-heading" data-reveal data-delay="100">
          <SectionHeader
            id="base-prediction-heading"
            title="Base Prediction"
            subtitle="The crop prediction you are exploring."
            className="mb-4"
          />
          <BasePredictionCard prediction={prediction} />
        </section>

        {/* ── Main simulator area ── */}
        <div
          className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-8 items-start"
          data-reveal
          data-delay="200"
        >
          {/* Controls */}
          <section aria-labelledby="controls-heading">
            <SectionHeader
              id="controls-heading"
              title="Adjust Weather Conditions"
              subtitle="Drag the sliders to explore scenarios."
              className="mb-4"
            />
            <SimulatorControls
              controls={controls}
              status={status}
              onControlChange={handleControlChange}
              onReset={handleReset}
              onSimulate={handleSimulate}
            />
          </section>

          {/* Results */}
          <section aria-labelledby="results-heading">
            <SectionHeader
              id="results-heading"
              title="Scenario Results"
              subtitle={
                status === "idle"
                  ? "Results will appear here after you simulate."
                  : status === "loading"
                  ? "Analysing your scenario…"
                  : "Comparison of current vs. scenario conditions."
              }
              className="mb-4"
            />
            <ScenarioResults
              prediction={prediction}
              controls={controls}
              result={result}
              status={status}
            />
          </section>
        </div>

        {/* ── Info callout ── */}
        <div
          className="flex items-start gap-3 rounded-2xl border border-forest/10 bg-forest/[0.03] px-5 py-4"
          data-reveal
          data-delay="300"
        >
          <Info className="h-4 w-4 text-forest/60 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-charcoal">
              About Scenario Simulation
            </p>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Scenario results are powered by the AgriSense ML model and reflect
              statistical predictions based on historical agricultural data.
              They are decision-support tools, not guarantees of crop performance.
              Always consult local agricultural experts before making major decisions.
            </p>
          </div>
        </div>

        {/* ── Historical context link ── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 pb-4"
          data-reveal
          data-delay="350"
        >
          <button
            type="button"
            id="scenarios-to-history-btn"
            onClick={() => navigate("/history")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-ivory-300 text-sm font-semibold text-charcoal hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
          >
            <HistoryIcon className="h-4 w-4 text-charcoal-muted" />
            View historical performance
          </button>
          <button
            type="button"
            id="scenarios-to-recommendation-btn"
            onClick={() => navigate("/recommendation")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-forest text-white text-sm font-semibold hover:bg-forest-600 transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
          >
            <Sprout className="h-4 w-4" />
            New Recommendation
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </PageContainer>
      </div>
    </div>
  );
}
