import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  CloudSun,
  BarChart3,
  Layers,
  AlertCircle,
  Wheat,
  RefreshCw,
  Sprout,
} from "lucide-react";

import { useRecommendation }  from "../context/RecommendationContext";
import { PageContainer }      from "../components/ui/PageContainer";
import { SectionHeader }      from "../components/ui/SectionHeader";
import { Badge }              from "../components/ui/Badge";

// Explain components — all unchanged
import { ExplainabilityHero }    from "../components/explain/ExplainabilityHero";
import { DecisionFlow }          from "../components/explain/DecisionFlow";
import { PrimarySignalCard }     from "../components/explain/PrimarySignalCard";
import {
  HistoricalSignalCard,
  WeatherSignalCard,
  YieldTrendSignalCard,
} from "../components/explain/SupportingSignalCard";
import { YieldRanking }          from "../components/explain/YieldRanking";
import { HeadToHeadReasoning }   from "../components/explain/HeadToHeadReasoning";
import { EvidenceExplorer }      from "../components/explain/EvidenceExplorer";
import { RecommendationSummary } from "../components/explain/RecommendationSummary";
import { TransparencyCard }      from "../components/explain/TransparencyCard";
import { TechnicalDetails }      from "../components/explain/TechnicalDetails";
import { ScoreDerivedCard }      from "../components/explain/ScoreDerivedCard";

// Service layer
import {
  getRecommendationExplanation,
  getKeyTakeaway,
  type ExplanationResult,
  type ExplainLoadState,
} from "../services/explainService";

// ── Skeleton loading state ─────────────────────────────────────────────────

function ExplainSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" role="status" aria-label="Loading explanation…">
      <div className="h-40 rounded-2xl bg-ivory-200" />
      <div className="h-32 rounded-2xl bg-ivory-200" />
      <div className="grid sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-ivory-200" />)}
      </div>
      <div className="h-48 rounded-2xl bg-ivory-200" />
      <div className="h-36 rounded-2xl bg-ivory-200" />
    </div>
  );
}

// ── Error state ────────────────────────────────────────────────────────────

function ExplainError({ onRetry }: { onRetry: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
        <AlertCircle className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-charcoal">Recommendation explanation is currently unavailable</h2>
        <p className="text-sm text-charcoal-muted max-w-sm">
          Unable to load the explanation. Please try again or view your recommendation directly.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white text-sm font-semibold hover:bg-forest-600 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <button
          type="button"
          onClick={() => navigate("/results")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-ivory-300 bg-white text-sm font-semibold text-charcoal hover:border-forest/30 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
        >
          View Recommendation
        </button>
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function ExplainEmpty() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-forest/8 text-forest">
        <Wheat className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-charcoal">No recommendation available yet</h2>
        <p className="text-sm text-charcoal-muted max-w-sm">
          Get a crop recommendation first, then return here to understand why it was selected.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate("/recommendation")}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-forest text-white text-sm font-bold hover:bg-forest-600 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 group"
      >
        <Sprout className="h-4 w-4" />
        Get Crop Recommendation
        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

// ── Explain page ───────────────────────────────────────────────────────────

export function Explain() {
  const navigate = useNavigate();
  const { farmerInput, recommendations } = useRecommendation();

  const [loadState, setLoadState] = useState<ExplainLoadState>("idle");
  const [result, setResult]       = useState<ExplanationResult | null>(null);

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const farm = farmerInput
        ? {
            district: farmerInput.district,
            season:   farmerInput.season,
            acres:    farmerInput.land_area_acres,
          }
        : undefined;
      const res = await getRecommendationExplanation(farm, recommendations);
      setResult(res);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [farmerInput, recommendations]);

  useEffect(() => { load(); }, [load]);

  // ── Render gates ────────────────────────────────────────────────────────
  if (loadState === "loading" || loadState === "idle") {
    return (
      <div className="min-h-screen bg-ivory">
        <PageContainer maxWidth="xl" className="py-8 md:py-12">
          <ExplainSkeleton />
        </PageContainer>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="min-h-screen bg-ivory">
        <PageContainer maxWidth="xl" className="py-8 md:py-12">
          <ExplainError onRetry={load} />
        </PageContainer>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-ivory">
        <PageContainer maxWidth="xl" className="py-8 md:py-12">
          <ExplainEmpty />
        </PageContainer>
      </div>
    );
  }

  const {
    farm,
    topCrop,
    secondCrop,
    sortedRankings,
    topCropHistory,
    weather,
    scoreExplanation,
  } = result;

  const keyTakeaway = getKeyTakeaway(result);
  const recommended = topCrop.crop;

  return (
    <div className="min-h-screen bg-ivory">

      {/* ── Sticky context bar ── */}
      <div className="sticky top-16 z-30 bg-ivory dark:bg-[#101815] border-b border-ivory-300 dark:border-[#26362f] shadow-nav">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-forest/60 shrink-0" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 min-w-0">
              <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/50">Farm</p>
              <p className="text-sm font-semibold text-charcoal truncate">{farm.district.split(",")[0]}</p>
              <Badge variant="default" size="sm">{farm.season}</Badge>
              <Badge variant="neutral" size="sm">{farm.acres} ac</Badge>
              <Badge variant="success" size="sm">{recommended}</Badge>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/results")}
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-forest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20 rounded"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back to Recommendation</span>
          </button>
        </div>
      </div>

      <PageContainer maxWidth="xl" className="py-8 md:py-12 space-y-14 animate-fade-in">

        {/* ── Page header ── */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-forest/60">
            Why This Crop?
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
            See the factors behind your recommendation.
          </h1>
          <p className="text-base text-charcoal-muted max-w-xl leading-relaxed">
            Understand how AgriSense arrived at this recommendation — the evidence behind
            the ranking, not just the result.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-charcoal-muted">
            <MapPin className="h-3.5 w-3.5 text-forest/50" />
            <span>{farm.district}</span>
            <span className="text-charcoal-muted/40">·</span>
            <span>{farm.acres} acres</span>
            <span className="text-charcoal-muted/40">·</span>
            <span>{farm.season}</span>
          </div>
        </div>

        {/* ── Section 1: Hero ── */}
        <section aria-labelledby="hero-ex-heading">
          <h2 id="hero-ex-heading" className="sr-only">Recommendation Overview</h2>
          <ExplainabilityHero top={topCrop} />
          <p className="sr-only">
            {recommended} is ranked first with a suitability score of {topCrop.suitability_score} out of 100,
            and a predicted yield of {topCrop.predicted_yield_t_per_ha} tonnes per hectare.
          </p>
        </section>

        {/* ── KEY TAKEAWAY ── */}
        <section aria-labelledby="takeaway-heading">
          <h2 id="takeaway-heading" className="sr-only">Key Takeaway</h2>
          <div className="bg-white rounded-2xl border border-forest/12 shadow-card overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-forest via-forest/70 to-transparent" />
            <div className="px-6 py-5 space-y-2">
              <p className="text-2xs font-bold uppercase tracking-widest text-forest/60">The Key Takeaway</p>
              <p className="text-base font-semibold text-charcoal leading-relaxed">{keyTakeaway}</p>
              <p className="text-xs text-charcoal-muted/60">
                Recommendations are based on the available data and should be considered alongside
                local farming knowledge and conditions.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 2: Decision Flow ── */}
        <section aria-labelledby="flow-heading" className="space-y-4">
          <SectionHeader
            id="flow-heading"
            title="How the Decision Was Made"
            subtitle="The pipeline that produced this recommendation."
          />
          <DecisionFlow
            district={farm.district}
            season={farm.season}
            acres={farm.acres}
            recommendedCrop={recommended}
          />
        </section>

        {/* ── Section 3: Primary Signal ── */}
        <section aria-labelledby="primary-heading" className="space-y-4">
          <SectionHeader
            id="primary-heading"
            title="Primary Ranking Signal"
            subtitle="The main factor used to rank candidate crops."
          />
          <PrimarySignalCard rankings={sortedRankings} topCrop={recommended} />
        </section>

        {/* ── Section 4: Score Derivation ── */}
        <section aria-labelledby="score-heading" className="space-y-4">
          <SectionHeader
            id="score-heading"
            title="How the Suitability Score is Derived"
            subtitle="Transparent explanation of the current MVP scoring approach."
          />
          <ScoreDerivedCard scoreExplanation={scoreExplanation} />
        </section>

        {/* ── Section 5: Supporting Signals ── */}
        <section aria-labelledby="supporting-heading" className="space-y-4">
          <SectionHeader
            id="supporting-heading"
            title="Supporting Evidence"
            subtitle="These signals complement the primary ranking — they do not independently determine the recommendation."
          />
          <div className="grid sm:grid-cols-3 gap-4">
            <HistoricalSignalCard data={topCropHistory} />
            <WeatherSignalCard    data={weather} />
            <YieldTrendSignalCard data={topCropHistory} />
          </div>
        </section>

        {/* ── Section 6: Candidate Ranking ── */}
        <section aria-labelledby="ranking-heading" className="space-y-4">
          <SectionHeader
            id="ranking-heading"
            title="How the Options Compare"
            subtitle="All evaluated candidates ranked by predicted yield."
          />
          <YieldRanking rankings={sortedRankings} />
          <p className="sr-only">
            {sortedRankings.map((c) =>
              `Rank ${c.rank}: ${c.crop}, suitability score ${c.suitability_score} out of 100, predicted yield ${c.predicted_yield_t_per_ha} tonnes per hectare.`
            ).join(" ")}
          </p>
        </section>

        {/* ── Section 7: Head-to-Head ── */}
        <section aria-labelledby="h2h-heading" className="space-y-4">
          <SectionHeader
            id="h2h-heading"
            title={`Why ${recommended} over ${secondCrop.crop}?`}
            subtitle="A direct signal-by-signal comparison of the top two candidates."
          />
          <HeadToHeadReasoning left={topCrop} right={secondCrop} />
        </section>

        {/* ── Section 8: Evidence Explorer ── */}
        <section aria-labelledby="explorer-heading" className="space-y-4">
          <SectionHeader
            id="explorer-heading"
            title="Explore the Evidence"
            subtitle="Dive into each signal category interactively."
          />
          <EvidenceExplorer
            rankings={sortedRankings}
            topCrop={topCrop}
            history={topCropHistory}
            weather={weather}
          />
        </section>

        {/* ── Section 9: Farm Context ── */}
        <section aria-labelledby="farm-ctx-heading" className="space-y-4">
          <SectionHeader
            id="farm-ctx-heading"
            title="Your Farm Context"
            subtitle="The inputs used to produce this recommendation."
          />
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Location", value: farm.district },
              { label: "Farm Area", value: `${farm.acres} acres` },
              { label: "Season",   value: farm.season },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-xl border border-ivory-300 shadow-sm px-4 py-4"
              >
                <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/60 mb-1">
                  {item.label}
                </p>
                <p className="text-base font-bold text-charcoal">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 10: Recommendation Summary ── */}
        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="sr-only">Recommendation Summary</h2>
          <RecommendationSummary cropName={recommended} />
        </section>

        {/* ── Section 11: Transparency ── */}
        <section aria-labelledby="transparency-heading" className="space-y-4">
          <SectionHeader id="transparency-heading" title="Recommendation Transparency" />
          <TransparencyCard />
        </section>

        {/* ── Section 12: Technical Details (collapsible) ── */}
        <section aria-labelledby="tech-heading" className="space-y-2">
          <SectionHeader id="tech-heading" title="Technical Details" />
          <TechnicalDetails
            context={{ district: farm.district, season: farm.season, acres: farm.acres }}
            rankings={sortedRankings}
          />
        </section>

        {/* ── Navigation CTAs ── */}
        <div className="space-y-3 pt-2 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/results")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-forest text-white text-sm font-semibold hover:bg-forest-600 transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" />
              View Recommendation
            </button>
            <button
              type="button"
              onClick={() => navigate("/comparison")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-ivory-300 text-sm font-semibold text-charcoal hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
            >
              <Layers className="h-4 w-4" />
              Compare Alternatives
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/weather")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-xs font-semibold text-charcoal shadow-sm hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
            >
              <CloudSun className="h-3.5 w-3.5 text-forest/60" />
              Weather Context
            </button>
            <button
              type="button"
              onClick={() => navigate("/history")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-xs font-semibold text-charcoal shadow-sm hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
            >
              <BarChart3 className="h-3.5 w-3.5 text-forest/60" />
              Historical Context
            </button>
            <button
              type="button"
              onClick={() => navigate("/recommendation")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-xs font-semibold text-charcoal shadow-sm hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
            >
              <Sprout className="h-3.5 w-3.5 text-forest/60" />
              New Recommendation
            </button>
          </div>
        </div>

      </PageContainer>
    </div>
  );
}
