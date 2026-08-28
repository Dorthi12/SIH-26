import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  ArrowLeft,
  ArrowRight,
  CloudSun,
  TrendingUp,
  BarChart3,
  Wheat,
  CheckCircle2,
  Layers,
  FileText,
} from "lucide-react";

import { useRecommendation } from "../context/RecommendationContext";
import { PageContainer }    from "../components/ui/PageContainer";
import { SectionHeader }    from "../components/ui/SectionHeader";
import { Badge }            from "../components/ui/Badge";
import { useScrollReveal } from "../utils/useScrollReveal";

// Existing results components — unchanged
import { RecommendationHero }   from "../components/results/RecommendationHero";
import { SuitabilityGauge }     from "../components/results/SuitabilityGauge";
import { RecommendationMetric } from "../components/results/RecommendationMetric";
import { EvidenceCard }         from "../components/results/EvidenceCard";
import { DecisionPipeline }     from "../components/results/DecisionPipeline";
import { CropComparison }       from "../components/results/CropComparison";
import { WeatherSnapshot }      from "../components/results/WeatherSnapshot";
import { HistoricalYieldChart } from "../components/results/HistoricalYieldChart";
import { DecisionSummary }      from "../components/results/DecisionSummary";
import { ScoreExplanation }     from "../components/results/ScoreExplanation";
import { PredictionExplainability } from "../components/results/PredictionExplainability";
import { FarmReportModal }      from "../components/results/FarmReportModal";

// New enhancement components
import {
  RecommendationReadyBadge,
  DecisionInsightCard,
  ResultsSkeletonState,
  ResultsErrorState,
  ResultsEmptyState,
} from "../components/results/ResultsEnhancements";

import {
  MOCK_TOP_CROP,
  MOCK_RANKINGS,
  MOCK_WEATHER,
  MOCK_HISTORICAL_YIELD,
} from "../data/mockRecommendation";

// ── Demo fallbacks ────────────────────────────────────────────────────────

const DEMO_DISTRICT = "Prayagraj, Uttar Pradesh";
const DEMO_SEASON   = "Kharif";
const DEMO_ACRES    = 2.5;

// ── Derived utilities ─────────────────────────────────────────────────────

function getYieldDifference(
  topYield: number,
  rankings: typeof MOCK_RANKINGS
): { diff: number; nextBestCrop: string } {
  const sorted  = [...rankings].sort((a, b) => b.predicted_yield_t_per_ha - a.predicted_yield_t_per_ha);
  const nextBest = sorted[1];
  return {
    diff:         Math.round((topYield - nextBest.predicted_yield_t_per_ha) * 100) / 100,
    nextBestCrop: nextBest.crop,
  };
}

function getTopAlternatives(rankings: typeof MOCK_RANKINGS, topRank: number) {
  return rankings.filter((c) => c.rank !== topRank).sort((a, b) => a.rank - b.rank).slice(0, 3);
}

// ── Results page ──────────────────────────────────────────────────────────

export function Results() {
  const navigate = useNavigate();
  const { farmerInput } = useRecommendation();
  const revealRef = useScrollReveal();

  // Simulate a loaded state — in production this would come from the recommendation status
  const [loadState] = useState<"ready" | "loading" | "error" | "empty">("ready");

  // Farm Decision Report modal
  const [reportOpen, setReportOpen] = useState(false);

  const district = farmerInput?.district       ?? DEMO_DISTRICT;
  const season   = farmerInput?.season         ?? DEMO_SEASON;
  const acres    = farmerInput?.land_area_acres ?? DEMO_ACRES;

  const top          = MOCK_TOP_CROP;
  const alternatives = getTopAlternatives(MOCK_RANKINGS, top.rank);
  const { diff: yieldDiff, nextBestCrop } = getYieldDifference(
    top.predicted_yield_t_per_ha,
    MOCK_RANKINGS
  );

  // ReportPreviewData — assembled from existing page data, no new data sources
  const reportData = {
    district:                    district,
    season:                      season,
    land_area_acres:             acres,
    crop:                        top.crop,
    suitability_score:           top.suitability_score,
    predicted_yield_t_per_ha:    top.predicted_yield_t_per_ha,
    estimated_production_tonnes: top.estimated_production_tonnes,
    weather_compatibility:       top.weather_compatibility,
    historical_stability:        top.historical_stability,
    yield_trend:                 top.yield_trend,
    generated_at:                new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-ivory">

      {/* ── Sticky context bar ── */}
      <div className="sticky top-16 z-30 bg-ivory dark:bg-[#101815] border-b border-ivory-300 dark:border-[#26362f] shadow-nav">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-forest/60 shrink-0" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 min-w-0">
              <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/50">Your Farm</p>
              <p className="text-sm font-semibold text-charcoal truncate">{district}</p>
              <Badge variant="default" size="sm">{season}</Badge>
              <Badge variant="neutral" size="sm">{acres} ac</Badge>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/recommendation")}
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-forest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20 rounded"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Change Farm Details</span>
          </button>
        </div>
      </div>

      <div ref={revealRef as React.RefObject<HTMLDivElement>}>
      <PageContainer maxWidth="xl" className="py-8 md:py-12 animate-fade-in">
        <div className="space-y-14">

          {/* ── Loading / Error / Empty gates ── */}
          {loadState === "loading" && <ResultsSkeletonState />}
          {loadState === "error"   && <ResultsErrorState onRetry={() => navigate("/recommendation")} />}
          {loadState === "empty"   && <ResultsEmptyState />}

          {loadState === "ready" && <>

            {/* ── PAGE HEADER ── */}
            <div className="space-y-3">
              <RecommendationReadyBadge />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-forest/60">
                  Your Farm Recommendation
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
                  Here's what AgriSense found.
                </h1>
                <p className="text-base text-charcoal-muted max-w-xl leading-relaxed">
                  Based on the farm context and available evaluation signals.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-charcoal-muted">
                <MapPin className="h-3.5 w-3.5 text-forest/50" />
                <span>{district}</span>
                <span className="text-charcoal-muted/40">·</span>
                <span>{acres} acres</span>
                <span className="text-charcoal-muted/40">·</span>
                <span>{season}</span>
              </div>
            </div>

            {/* ── Section 1: RECOMMENDATION HERO ── */}
            <section aria-labelledby="hero-heading" className="space-y-8">
              <RecommendationHero
                id="hero-heading"
                cropName={top.crop}
                rank={top.rank}
              />

              {/* Score + metrics */}
              <div className="grid sm:grid-cols-[auto_1fr] gap-6 lg:gap-10 items-center">
                <div className="flex justify-center sm:justify-start">
                  <SuitabilityGauge score={top.suitability_score} size={200} />
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <RecommendationMetric
                      label="Predicted Yield"
                      value={String(top.predicted_yield_t_per_ha)}
                      unit="t/ha"
                      supportingLabel="Model-predicted yield"
                      accent
                    />
                    <RecommendationMetric
                      label="Estimated Production"
                      value={String(top.estimated_production_tonnes)}
                      unit="tonnes"
                      supportingLabel={`Based on ${acres} acres`}
                    />
                  </div>
                  {/* Yield diff vs next-best */}
                  <div className="rounded-xl border border-forest/10 bg-forest/[0.04] px-4 py-3 flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-forest shrink-0" />
                    <p className="text-sm text-charcoal-muted">
                      <strong className="text-forest">+{yieldDiff} t/ha</strong> vs next-best option{" "}
                      <span className="text-charcoal-muted/70">({nextBestCrop})</span>
                    </p>
                  </div>
                  {/* Production calculation note */}
                  <div className="rounded-xl bg-forest/[0.03] border border-forest/8 px-4 py-2.5">
                    <p className="text-2xs text-charcoal-muted/60">
                      <strong className="text-charcoal-light">Calculation:</strong>{" "}
                      {acres} acres × 0.4047 ha/acre = {(acres * 0.4047).toFixed(4)} ha
                      &nbsp;·&nbsp;
                      {(acres * 0.4047).toFixed(4)} ha × {top.predicted_yield_t_per_ha} t/ha
                      = {top.estimated_production_tonnes} tonnes
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Section 2: DECISION INSIGHT ── */}
            <section aria-labelledby="insight-heading">
              <h2 id="insight-heading" className="sr-only">Decision Insight</h2>
              <DecisionInsightCard
                cropName={top.crop}
                suitabilityScore={top.suitability_score}
                yieldDiff={yieldDiff}
                nextBestCrop={nextBestCrop}
              />
            </section>

            {/* ── Section 3: EVIDENCE STRIP ── */}
            <section id="evidence" aria-labelledby="evidence-heading" className="space-y-4 scroll-mt-28" data-reveal>
              <SectionHeader
                id="evidence-heading"
                title="Supporting Evidence"
                subtitle="These signals support the recommendation but do not individually determine it."
              />
              <div className="grid sm:grid-cols-3 gap-4">
                <div data-reveal data-delay="100">
                <EvidenceCard
                  icon={<BarChart3 className="h-5 w-5" />}
                  label="Historical Stability"
                  value={top.historical_stability}
                  description="Recent historical performance is relatively consistent for this crop in the district."
                /></div>
                <div data-reveal data-delay="200">
                <EvidenceCard
                  icon={<CloudSun className="h-5 w-5" />}
                  label="Weather Compatibility"
                  value={top.weather_compatibility}
                  description="Current and forecast conditions are favorable for this crop."
                /></div>
                <div data-reveal data-delay="300">
                <EvidenceCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  label="Yield Trend"
                  value={top.yield_trend}
                  description="Recent historical yield trend is improving for this crop."
                /></div>
              </div>
            </section>

            {/* ── Section 4: WHY THIS CROP ── */}
            <section aria-labelledby="why-heading" className="space-y-5" data-reveal>
              <SectionHeader
                id="why-heading"
                title={`Why is ${top.crop} recommended?`}
                subtitle="A structured look at the evidence supporting this crop choice."
              />
              <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-7 space-y-6">
                {/* Visual flow */}
                <div className="flex flex-col sm:flex-row items-stretch gap-0">
                  <div className="flex flex-col items-center justify-center text-center px-6 py-4 sm:w-40 shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest text-white mb-2 shadow-sm">
                      <Wheat className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                    <p className="font-bold text-charcoal text-sm">{top.crop.toUpperCase()}</p>
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-3 border-l border-ivory-200 pl-4 sm:pl-6">
                    {[
                      { label: "Predicted Yield",    value: `${top.predicted_yield_t_per_ha} t/ha`, icon: <TrendingUp className="h-4 w-4" /> },
                      { label: "Weather Match",      value: top.weather_compatibility,              icon: <CloudSun className="h-4 w-4" />   },
                      { label: "History Stability",  value: top.historical_stability,               icon: <BarChart3 className="h-4 w-4" />  },
                    ].map((p) => (
                      <div key={p.label} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-forest/[0.03] border border-forest/8">
                        <span className="text-forest/60">{p.icon}</span>
                        <p className="text-2xs font-bold uppercase tracking-wide text-charcoal-muted/60">{p.label}</p>
                        <p className="text-sm font-bold text-charcoal">{p.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Ranked #1 badge */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-forest/8 border border-forest/15 px-4 py-1.5">
                    <CheckCircle2 className="h-4 w-4 text-forest" />
                    <span className="text-xs font-semibold text-forest">Ranked #1 among evaluated options</span>
                  </div>
                </div>
                {/* Explanation */}
                <p className="text-sm text-charcoal-muted leading-relaxed border-t border-ivory-200 pt-4">
                  <strong className="text-charcoal">{top.crop}</strong> is ranked highest because its predicted
                  yield is strongest among the evaluated candidate crops under the selected location, season and
                  weather conditions. Historical performance is also relatively stable, and the yield trend is
                  improving.
                </p>
              </div>
            </section>

            {/* ── Section 4b: MODEL EXPLAINABILITY ── */}
            {/*
             * Explainability section — populated by GET /predictions/{id}/explain.
             * Uses a stable placeholder ID until the recommendation context
             * provides a real prediction_id from the backend response.
             * Replace DEMO_PREDICTION_ID with the real ID when wiring the backend.
             */}
            <PredictionExplainability
              predictionId={`demo-${top.crop.toLowerCase()}-${season.toLowerCase()}`}
              cropName={top.crop}
            />

            {/* ── Section 5: ALTERNATIVE CROPS ── */}
            <section aria-labelledby="alt-heading" className="space-y-4" data-reveal>
              <SectionHeader
                id="alt-heading"
                title="Other Options Considered"
                subtitle="These crops were evaluated but ranked below the primary recommendation."
                action={
                  <button
                    type="button"
                    onClick={() => navigate("/comparison")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-forest/20 bg-white px-3.5 py-2 text-xs font-semibold text-forest shadow-sm hover:bg-forest/[0.04] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Compare All
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                }
              />
              <div className="grid sm:grid-cols-3 gap-4">
                {alternatives.map((alt, idx) => (
                  <div
                    key={alt.crop}
                    data-reveal
                    data-delay={String(idx * 100)}
                    className="bg-white rounded-2xl border border-ivory-300 shadow-card p-4 space-y-2.5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal-muted/60 uppercase tracking-wide">#{alt.rank} Ranked</span>
                      <Badge variant="neutral" size="sm">{alt.suitability_score}/100</Badge>
                    </div>
                    <p className="text-lg font-bold text-charcoal">{alt.crop}</p>
                    <p className="text-sm text-charcoal-muted">{alt.predicted_yield_t_per_ha} t/ha</p>
                    <div className="h-1.5 rounded-full bg-ivory-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-olive/50 transition-all duration-700"
                        style={{ width: `${alt.suitability_score}%` }}
                        role="progressbar"
                        aria-valuenow={alt.suitability_score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${alt.crop} suitability: ${alt.suitability_score} out of 100`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Section 6: DECISION PIPELINE ── */}
            <section aria-labelledby="pipeline-heading" className="space-y-4" data-reveal>
              <SectionHeader
                id="pipeline-heading"
                title="How the Decision Was Made"
                subtitle="The AgriSense intelligence pipeline that produced this recommendation."
              />
              <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6 overflow-x-auto">
                <DecisionPipeline />
              </div>
            </section>

            {/* ── Section 7: FULL COMPARISON (compact) ── */}
            <section aria-labelledby="compare-heading" className="space-y-4" data-reveal>
              <SectionHeader
                id="compare-heading"
                title="Compare Your Options"
                subtitle="See how the recommended crop compares with other evaluated options."
                action={
                  <button
                    type="button"
                    onClick={() => navigate("/comparison")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-forest/20 bg-white px-3.5 py-2 text-xs font-semibold text-forest shadow-sm hover:bg-forest/[0.04] hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
                    aria-label="View full crop comparison page"
                  >
                    Compare All Crops
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                }
              />
              <CropComparison rankings={MOCK_RANKINGS} />
            </section>

            {/* ── Section 8: WEATHER + HISTORY side by side ── */}
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <section aria-labelledby="weather-heading" className="space-y-4">
                <SectionHeader
                  id="weather-heading"
                  title="Weather Snapshot"
                  action={
                    <button
                      type="button"
                      onClick={() => navigate("/weather")}
                      className="text-xs font-semibold text-forest hover:underline focus-visible:outline-none"
                    >
                      View full →
                    </button>
                  }
                />
                <WeatherSnapshot data={MOCK_WEATHER} />
              </section>

              <section aria-labelledby="history-heading" className="space-y-4">
                <SectionHeader
                  id="history-heading"
                  title="Historical Yield Trend"
                  action={
                    <button
                      type="button"
                      onClick={() => navigate("/history")}
                      className="text-xs font-semibold text-forest hover:underline focus-visible:outline-none"
                    >
                      View full →
                    </button>
                  }
                />
                <HistoricalYieldChart data={MOCK_HISTORICAL_YIELD} cropName={top.crop} />
              </section>
            </div>

            {/* ── Section 9: SCORE EXPLANATION ── */}
            <section aria-labelledby="score-explain-heading" className="space-y-4">
              <SectionHeader
                id="score-explain-heading"
                title="Methodology"
                subtitle="Understand how scores are derived."
              />
              <ScoreExplanation />
            </section>

            {/* ── Section 10: DECISION SUMMARY ── */}
            <section aria-labelledby="summary-heading" className="space-y-4">
              <SectionHeader id="summary-heading" title="Your Farm Decision" />
              <DecisionSummary top={top} evidenceSectionId="evidence" />
            </section>

            {/* ── Disclaimer ── */}
            <p className="text-center text-2xs text-charcoal-muted/50 max-w-xl mx-auto">
              Recommendations are decision-support guidance based on available data and model outputs.
              They do not guarantee agricultural outcomes.
            </p>

            {/* ── PRIMARY CTA: Why This Crop + Generate Report ── */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pb-2">
              <button
                type="button"
                onClick={() => navigate("/explain")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-forest text-white text-sm font-bold hover:bg-forest-600 transition-all duration-200 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 group"
                aria-label="Understand why this crop was recommended"
              >
                Why this crop?
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/comparison")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-ivory-300 text-sm font-semibold text-charcoal hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2 group"
              >
                <Layers className="h-4 w-4" />
                Compare Alternatives
              </button>
              {/* Generate Report — secondary CTA, does not compete with primary */}
              <button
                type="button"
                id="generate-farm-report-cta"
                onClick={() => setReportOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-ivory-300 text-sm font-semibold text-charcoal hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
                aria-label="Generate a Farm Decision Report"
              >
                <FileText className="h-4 w-4 text-forest/60" />
                Generate Farm Report
              </button>
            </div>

            {/* ── Secondary nav row ── */}
            <div className="flex flex-wrap justify-center gap-3 pb-4">
              <button
                type="button"
                onClick={() => navigate("/weather")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-xs font-semibold text-charcoal shadow-sm hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
              >
                <CloudSun className="h-3.5 w-3.5 text-forest/60" />
                Weather Intelligence
              </button>
              <button
                type="button"
                onClick={() => navigate("/history")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-xs font-semibold text-charcoal shadow-sm hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
              >
                <BarChart3 className="h-3.5 w-3.5 text-forest/60" />
                Historical Performance
              </button>
              <button
                type="button"
                onClick={() => navigate("/recommendation")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-xs font-semibold text-charcoal shadow-sm hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-forest/60" />
                New Recommendation
              </button>
            </div>

          </>}
        </div>
      </PageContainer>
      </div>

      {/* ── Farm Decision Report Modal ── */}
      <FarmReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        predictionId={`demo-${top.crop.toLowerCase()}-${season.toLowerCase()}`}
        data={reportData}
      />
    </div>
  );
}
