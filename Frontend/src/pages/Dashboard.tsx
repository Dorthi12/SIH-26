import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sprout, CloudSun, History, GitCompare, HelpCircle,
  ArrowRight, TrendingUp, MapPin, Wheat, Droplets,
  FlaskConical, Shovel, RefreshCw, AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useScrollReveal } from "../utils/useScrollReveal";

import { useRecommendation }        from "../context/RecommendationContext";
import { PageContainer }            from "../components/ui/PageContainer";
import { SectionHeader }            from "../components/ui/SectionHeader";
import { Badge }                    from "../components/ui/Badge";

// Dashboard components — unchanged
import { FarmContextCard }         from "../components/dashboard/FarmContextCard";
import { RecommendationSpotlight } from "../components/dashboard/RecommendationSpotlight";
import { FarmSignalCard }          from "../components/dashboard/FarmSignalCard";
import { IntelligenceCard }        from "../components/dashboard/IntelligenceCard";
import { RecommendationEvidence }  from "../components/dashboard/RecommendationEvidence";
import { QuickActionCard }         from "../components/dashboard/QuickActionCard";
import { RecentAnalysis }          from "../components/dashboard/RecentAnalysis";
import { FarmlandVisual }          from "../components/dashboard/FarmlandVisual";

// Service layer
import {
  getDashboardData,
  getDashboardInsight,
  getFarmStatus,
  type DashboardData,
  type DashboardLoadState,
} from "../services/dashboardService";

// ── Skeleton state ─────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading dashboard…">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="h-5 w-28 rounded-lg skeleton-shimmer" />
          <div className="h-10 w-64 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-48 rounded-lg skeleton-shimmer" />
        </div>
        <div className="hidden md:block h-40 rounded-2xl skeleton-shimmer" />
      </div>
      <div className="h-24 rounded-2xl skeleton-shimmer" />
      <div className="h-56 rounded-2xl skeleton-shimmer" />
      <div className="grid sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-36 rounded-2xl skeleton-shimmer" />)}
      </div>
    </div>
  );
}

// ── Error state ────────────────────────────────────────────────────────────

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
        <AlertCircle className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-charcoal">Some farm intelligence couldn't be loaded</h2>
        <p className="text-sm text-charcoal-muted max-w-sm">
          An error occurred while loading your dashboard. Please try again.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white text-sm font-semibold hover:bg-forest-600 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}

// ── Empty state (no recommendation yet) ───────────────────────────────────

// DashboardEmpty is rendered inline in the ready state when no recommendation exists.
// Kept as a named component for future extraction if needed.
function DashboardEmpty({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      {/* Wheat field imagery for empty state */}
      <div className="relative w-48 h-32 rounded-2xl overflow-hidden shadow-card mx-auto">
        <img
          src="/wheat-field.jpg"
          alt="Wheat crop field"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm shadow-sm animate-float">
            <Wheat className="h-6 w-6 text-forest" strokeWidth={1.5} />
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-charcoal">Ready to Analyse Your Farm</h2>
        <p className="text-sm text-charcoal-muted max-w-sm">
          Enter your farm context to receive a personalised crop recommendation from AgriSense.
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-forest text-white text-sm font-bold hover:bg-forest-600 transition-all shadow-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
      >
        Get Crop Recommendation
        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

// ── Dashboard page ─────────────────────────────────────────────────────────

export function Dashboard() {
  const navigate = useNavigate();
  const { farmerInput } = useRecommendation();

  const revealRef = useScrollReveal();

  const [loadState, setLoadState] = useState<DashboardLoadState>("idle");
  const [data, setData]           = useState<DashboardData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setLoadState("loading");
    }
    try {
      const farm = farmerInput
        ? {
            district: farmerInput.district,
            season:   farmerInput.season,
            acres:    farmerInput.land_area_acres,
          }
        : undefined;
      const result = await getDashboardData(farm);
      setData(result);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    } finally {
      setIsRefreshing(false);
    }
  }, [farmerInput]);

  useEffect(() => { load(); }, [load]);

  // ── Render gates ────────────────────────────────────────────────────────
  if (loadState === "loading" || loadState === "idle") {
    return (
      <div className="min-h-screen bg-ivory">
        <PageContainer maxWidth="xl" className="py-8 md:py-12">
          <DashboardSkeleton />
        </PageContainer>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="min-h-screen bg-ivory">
        <PageContainer maxWidth="xl" className="py-8 md:py-12">
          <DashboardError onRetry={() => load()} />
        </PageContainer>
      </div>
    );
  }

  // Empty state: data loaded but no recommendation exists yet
  if (!data) {
    return (
      <div className="min-h-screen bg-ivory">
        <PageContainer maxWidth="xl" className="py-8 md:py-12">
          <DashboardEmpty onStart={() => navigate("/recommendation")} />
        </PageContainer>
      </div>
    );
  }

  const { farm, topCrop, rankings, weather, topHistory, latestYield } = data;
  const insight    = getDashboardInsight(data);
  const farmStatus = getFarmStatus(data);

  return (
    <div className="min-h-screen bg-ivory">

      {/* ── Sticky context bar ── */}
      <div className="sticky top-16 z-30 bg-ivory/95 backdrop-blur-sm border-b border-ivory-300 shadow-nav">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-forest/60 shrink-0" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 min-w-0">
              <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/50">Farm</p>
              <p className="text-sm font-semibold text-charcoal truncate">{farm.district}</p>
              <Badge variant="default" size="sm">{farm.season}</Badge>
              <Badge variant="neutral" size="sm">{farm.acres} ac</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => load(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-forest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20 rounded disabled:opacity-50"
              aria-label="Refresh dashboard"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/recommendation")}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-forest/20 bg-white px-3 py-1.5 text-xs font-bold text-forest shadow-sm hover:bg-forest/[0.04] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
            >
              <Sprout className="h-3.5 w-3.5" />
              New Recommendation
            </button>
          </div>
        </div>
      </div>

      <div ref={revealRef as React.RefObject<HTMLDivElement>}>
      <PageContainer maxWidth="xl" className="py-8 md:py-12 space-y-12 animate-fade-in">

        {/* ── 1. HERO ── */}
        <section aria-labelledby="dashboard-greeting" className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-forest/60">Good morning</p>
              <h1 id="dashboard-greeting" className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight leading-tight">
                Your farm intelligence<br className="hidden sm:block" /> at a glance.
              </h1>
            </div>
            <p className="text-base text-charcoal-muted max-w-md leading-relaxed">
              Monitor the signals behind your current crop recommendation.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral" size="sm"><MapPin className="h-3 w-3 mr-1" />{farm.district.split(",")[0]}</Badge>
              <Badge variant="default" size="sm">{farm.season}</Badge>
              <Badge variant="success" size="sm">{topCrop.crop} recommended</Badge>
            </div>
            {/* Primary CTAs */}
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate("/recommendation")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest text-white text-sm font-bold hover:bg-forest-600 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 group"
              >
                <Sprout className="h-4 w-4" />
                Get Crop Recommendation
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/results")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-ivory-300 text-sm font-semibold text-charcoal hover:border-forest/30 hover:bg-forest/[0.02] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
              >
                View Latest Recommendation
              </button>
            </div>
          </div>
          {/* Farmland visual */}
          <div className="hidden md:block h-48 rounded-2xl border border-ivory-300 bg-white shadow-card overflow-hidden">
            <FarmlandVisual />
          </div>
        </section>

        {/* ── 2. FARM STATUS STRIP ── */}
        <section aria-labelledby="farm-status-heading" data-reveal data-delay="100">
          <h2 id="farm-status-heading" className="sr-only">Farm Status</h2>
          <div className="grid grid-cols-3 gap-3">
            {farmStatus.map((s, i) => (
              <div
                key={s.label}
                className="flex items-center gap-2.5 rounded-xl border border-ivory-200 bg-white px-4 py-3 shadow-sm hover:shadow-card hover:border-forest/20 transition-all duration-200"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <CheckCircle2 className="h-4 w-4 text-forest shrink-0" />
                <div>
                  <p className="text-2xs text-charcoal-muted/60 uppercase tracking-wide font-bold">{s.label}</p>
                  <p className="text-xs font-semibold text-charcoal">{s.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. FARM CONTEXT ── */}
        <section aria-labelledby="farm-ctx" data-reveal data-delay="150">
          <h2 id="farm-ctx" className="sr-only">Farm Context</h2>
          <FarmContextCard district={farm.district} season={farm.season} acres={farm.acres} />
        </section>

        {/* ── 4. RECOMMENDATION SPOTLIGHT ── */}
        <section aria-labelledby="rec-spot" data-reveal data-delay="200">
          <h2 id="rec-spot" className="sr-only">Current Recommendation</h2>
          <RecommendationSpotlight top={topCrop} />
        </section>

        {/* ── 5. FARM SIGNALS ── */}
        <section aria-labelledby="signals-heading" className="space-y-4" data-reveal>
          <SectionHeader
            id="signals-heading"
            title="Farm Signals"
            subtitle="Key conditions influencing your current farm context."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Weather signal */}
            <div data-reveal data-delay="100">
            <FarmSignalCard
              icon={<CloudSun className="h-5 w-5" strokeWidth={1.5} />}
              label="Weather"
              value={String(weather.temperature_c)}
              unit="°C"
              subLabel="Compatibility"
              subValue={topCrop.weather_compatibility}
              route="/weather"
            >
              <div className="space-y-1">
                <p className="text-2xs text-charcoal-muted/60">{weather.condition}</p>
                <div className="flex items-end gap-1 h-6">
                  {/* Mini temperature sparkline from forecast */}
                  {(weather.forecast ?? []).slice(0, 5).map((f, i) => (
                    <div
                      key={f.day}
                      className="flex-1 rounded-sm bg-forest/15"
                      style={{
                        height:    `${Math.max(10, ((f.temp_c - 26) / 4) * 100)}%`,
                        minHeight: "4px",
                        opacity:   i === 0 ? 1 : 0.55,
                      }}
                    />
                  ))}
                </div>
                <p className="text-2xs text-charcoal-muted/50">5-day temp trend</p>
              </div>
            </FarmSignalCard></div>

            {/* Historical signal */}
            <div data-reveal data-delay="200"><FarmSignalCard
              icon={<History className="h-5 w-5" strokeWidth={1.5} />}
              label="Historical"
              value={String(latestYield)}
              unit="t/ha"
              subLabel="Trend"
              subValue={`↑ ${topHistory.trend}`}
              route="/history"
            >
              <div className="flex items-center gap-3 text-2xs">
                <div>
                  <p className="text-charcoal-muted/50">{topHistory.yearlyYield[0].year}</p>
                  <p className="font-semibold text-charcoal">{topHistory.yearlyYield[0].yield_t_per_ha}</p>
                </div>
                <div className="flex-1 h-px bg-forest/20 relative">
                  <TrendingUp className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 text-forest/60" />
                </div>
                <div>
                  <p className="text-charcoal-muted/50">{topHistory.yearlyYield[topHistory.yearlyYield.length - 1].year}</p>
                  <p className="font-semibold text-forest">{latestYield}</p>
                </div>
              </div>
            </FarmSignalCard></div>

            {/* Predicted yield */}
            <div data-reveal data-delay="300"><FarmSignalCard
              icon={<TrendingUp className="h-5 w-5" strokeWidth={1.5} />}
              label="Predicted Yield"
              value={String(topCrop.predicted_yield_t_per_ha)}
              animateValue
              unit="t/ha"
              subLabel="Rank"
              subValue="#1"
              route="/comparison"
            >
              <div className="space-y-1">
                {rankings.slice(0, 2).map((c) => (
                  <div key={c.crop} className="flex items-center gap-1.5">
                    <span className="text-2xs w-12 text-charcoal-light font-medium truncate">{c.crop}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-ivory-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-forest transition-all duration-700"
                        style={{
                          width:   `${(c.predicted_yield_t_per_ha / topCrop.predicted_yield_t_per_ha) * 100}%`,
                          opacity: c.rank === 1 ? 1 : 0.4,
                        }}
                        role="progressbar"
                        aria-valuenow={c.predicted_yield_t_per_ha}
                        aria-valuemin={0}
                        aria-valuemax={topCrop.predicted_yield_t_per_ha}
                        aria-label={`${c.crop} yield: ${c.predicted_yield_t_per_ha} t/ha`}
                      />
                    </div>
                    <span className="text-2xs text-charcoal-muted tabular-nums w-10 text-right">{c.predicted_yield_t_per_ha}</span>
                  </div>
                ))}
              </div>
            </FarmSignalCard></div>

            {/* Farm area */}
            <div data-reveal data-delay="400"><FarmSignalCard
              icon={<MapPin className="h-5 w-5" strokeWidth={1.5} />}
              label="Farm Area"
              value={String(farm.acres)}
              unit=" ac"
              subLabel="Location"
              subValue={farm.district.split(",")[0]}
              route="/recommendation"
              statusColor="charcoal"
              animateValue
            >
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="default" size="sm">{farm.season}</Badge>
                <Badge variant="neutral" size="sm">
                  <Wheat className="h-3 w-3 mr-1" />
                  {topCrop.crop}
                </Badge>
              </div>
            </FarmSignalCard></div>
          </div>
        </section>

        {/* ── 6. CROP OPTIONS ── */}
        <section aria-labelledby="crops-heading" className="space-y-4" data-reveal>
          <SectionHeader
            id="crops-heading"
            title="Crop Options"
            subtitle="All evaluated candidates ranked by predicted yield."
            action={
              <button
                type="button"
                onClick={() => navigate("/comparison")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline focus-visible:outline-none"
              >
                Compare All
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            }
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...rankings].sort((a, b) => a.rank - b.rank).map((c, idx) => {
              const isTop = c.rank === 1;
              const staggerDelay = idx * 80;
              return (
                <button
                  key={c.crop}
                  type="button"
                  onClick={() => navigate("/comparison")}
                  data-reveal
                  data-delay={String(staggerDelay)}
                  className={`group flex flex-col gap-2 rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2 active:scale-[0.97]
                    ${isTop
                      ? "border-forest/25 bg-white shadow-card hover:shadow-card-hover hover:-translate-y-1"
                      : "border-ivory-300 bg-white shadow-sm hover:border-forest/20 hover:shadow-card hover:-translate-y-0.5"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-bold text-charcoal-muted/60 uppercase tracking-wide">#{c.rank}</span>
                    {isTop && (
                      <span className="rounded-full border border-forest/15 bg-forest/[0.06] px-1.5 py-0.5 text-2xs font-bold text-forest">
                        TOP
                      </span>
                    )}
                  </div>
                  <p className={`text-base font-bold ${isTop ? "text-charcoal" : "text-charcoal-muted"}`}>
                    {c.crop}
                  </p>
                  <p className={`text-xl font-bold tabular-nums ${isTop ? "text-forest" : "text-charcoal-muted"}`}>
                    {c.suitability_score}
                    <span className="text-sm font-normal text-charcoal-muted/60">/100</span>
                  </p>
                  <div className="h-1.5 rounded-full bg-ivory-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isTop ? "bg-forest" : "bg-olive/40"}`}
                      style={{ width: `${c.suitability_score}%` }}
                      role="progressbar"
                      aria-valuenow={c.suitability_score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${c.crop} suitability: ${c.suitability_score} out of 100`}
                    />
                  </div>
                  <p className="text-2xs text-charcoal-muted">{c.predicted_yield_t_per_ha} t/ha</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── 7. INTELLIGENCE CENTER ── */}
        <section aria-labelledby="intel-heading" className="space-y-4" data-reveal>
          <SectionHeader
            id="intel-heading"
            title="Your Farm Intelligence"
            subtitle="Explore the signals behind your recommendation."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <IntelligenceCard
              icon={<MessageSquareText className="h-5 w-5" strokeWidth={1.5} />}
              title="AI Agricultural Assistant"
              description="Ask questions about crop suitability, yield optimization, weather risks, and farming decisions."
              ctaLabel="Chat with Assistant"
              route="/assistant"
              accentClass="bg-forest/[0.06]"
            />
            <IntelligenceCard
              icon={<Sprout className="h-5 w-5" strokeWidth={1.5} />}
              title="Crop Recommendation"
              description="Explore your current crop recommendation, suitability score, and the evidence behind the ranking."
              ctaLabel="Explore Recommendation"
              route="/results"
              accentClass="bg-forest/[0.04]"
            />
            <IntelligenceCard
              icon={<CloudSun className="h-5 w-5" strokeWidth={1.5} />}
              title="Weather Intelligence"
              description="Monitor current and forecast conditions affecting your farm context."
              ctaLabel="View Weather"
              route="/weather"
              accentClass="bg-amber/[0.04]"
            />
            <IntelligenceCard
              icon={<History className="h-5 w-5" strokeWidth={1.5} />}
              title="Historical Performance"
              description="Explore historical crop yields, long-term trends and stability patterns."
              ctaLabel="View History"
              route="/history"
              accentClass="bg-olive/[0.04]"
            />
            <IntelligenceCard
              icon={<GitCompare className="h-5 w-5" strokeWidth={1.5} />}
              title="Crop Comparison"
              description="Compare candidate crops across predicted yield, weather, and historical signals."
              ctaLabel="Compare Crops"
              route="/comparison"
              accentClass="bg-forest/[0.03]"
            />
          </div>
        </section>

        {/* ── 8. WHY THIS RECOMMENDATION ── */}
        <section aria-labelledby="why-heading" className="space-y-4" data-reveal>
          <SectionHeader id="why-heading" title="Why This Recommendation?" />
          <RecommendationEvidence top={topCrop} />
        </section>

        {/* ── 9. QUICK ACTIONS ── */}
        <section aria-labelledby="actions-heading" className="space-y-4" data-reveal>
          <SectionHeader id="actions-heading" title="Quick Actions" />
          <div className="grid sm:grid-cols-3 gap-3">
            <QuickActionCard
              icon={<Sprout className="h-5 w-5" strokeWidth={1.5} />}
              label="New Recommendation"
              description="Start a fresh crop analysis"
              route="/recommendation"
              primary
            />
            <QuickActionCard
              icon={<GitCompare className="h-5 w-5" strokeWidth={1.5} />}
              label="Compare Crops"
              description="Side-by-side crop analysis"
              route="/comparison"
            />
            <QuickActionCard
              icon={<CloudSun className="h-5 w-5" strokeWidth={1.5} />}
              label="Check Weather"
              description="Current & forecast conditions"
              route="/weather"
            />
          </div>
        </section>

        {/* ── 10. AGRI INSIGHT ── */}
        <section aria-labelledby="insight-heading" className="space-y-4" data-reveal>
          <SectionHeader id="insight-heading" title="Agri Insight" />
          <div className="bg-white rounded-2xl border border-forest/10 shadow-card px-6 py-5 space-y-2">
            <p className="text-2xs font-bold uppercase tracking-widest text-forest/60">Current Signal</p>
            <p className="text-sm text-charcoal-muted leading-relaxed">{insight}</p>
          </div>
        </section>

        {/* ── 11. RECENT ANALYSIS + WHY EXPLAINABILITY ── */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <section aria-labelledby="recent-heading" className="space-y-4">
            <SectionHeader id="recent-heading" title="Recent Analysis" />
            <RecentAnalysis />
          </section>

          <section aria-labelledby="explain-entry-heading" className="space-y-4">
            <SectionHeader id="explain-entry-heading" title="Understand the Recommendation" />
            <button
              type="button"
              onClick={() => navigate("/explain")}
              className="group w-full flex flex-col gap-3 rounded-2xl border border-ivory-300 bg-white shadow-card p-5 text-left hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/8 text-forest group-hover:bg-forest group-hover:text-white transition-all">
                  <HelpCircle className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-bold text-charcoal">Why This Crop?</p>
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Understand how AgriSense arrived at this recommendation — the primary signals, supporting evidence, and the decision flow.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-forest">
                Explore Explainability
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </section>
        </div>

        {/* ── 12. COMING SOON ── */}
        <section aria-labelledby="coming-heading" className="space-y-4">
          <SectionHeader id="coming-heading" title="More Farm Intelligence Coming Soon" />
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { icon: <FlaskConical className="h-5 w-5" strokeWidth={1.5} />, label: "Soil Intelligence",   desc: "Analyse soil conditions and nutrient data" },
              { icon: <Droplets     className="h-5 w-5" strokeWidth={1.5} />, label: "Irrigation Planning", desc: "Smart water management insights" },
              { icon: <Shovel       className="h-5 w-5" strokeWidth={1.5} />, label: "Market Insights",     desc: "Crop price and market signal indicators" },
            ].map((m) => (
              <div
                key={m.label}
                className="flex items-center gap-3.5 rounded-2xl border border-ivory-200 bg-white/50 px-4 py-3.5 opacity-60"
                aria-label={`${m.label} — coming soon`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-charcoal/6 text-charcoal-muted shrink-0">
                  {m.icon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-charcoal-muted">{m.label}</p>
                    <span className="text-2xs rounded-full border border-charcoal/10 px-1.5 py-0.5 text-charcoal-muted/60 font-bold uppercase tracking-wide">Soon</span>
                  </div>
                  <p className="text-2xs text-charcoal-muted/60">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 13. BOTTOM CTA ── */}
        <section
          aria-labelledby="cta-heading"
          className="relative rounded-2xl bg-forest overflow-hidden px-6 py-10 text-center"
          data-reveal
        >
          {/* Subtle field-line background */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
            viewBox="0 0 600 160"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
          >
            {[0,1,2,3,4,5,6,7,8,9].map((i) => (
              <line key={i} x1={i * 70} y1={0} x2={i * 70} y2={160} stroke="white" strokeWidth="0.8" />
            ))}
            {[0,1,2,3,4].map((i) => (
              <line key={i + 10} x1={0} y1={i * 40} x2={600} y2={i * 40} stroke="white" strokeWidth="0.8" />
            ))}
          </svg>
          <div className="relative space-y-4">
            <h2 id="cta-heading" className="text-xl sm:text-2xl font-bold text-white">
              Ready to explore another crop decision?
            </h2>
            <p className="text-sm text-white/70 max-w-md mx-auto">
              Start a new recommendation using your farm location, season and land area.
            </p>
            <button
              type="button"
              onClick={() => navigate("/recommendation")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-forest text-sm font-bold hover:bg-ivory transition-all duration-200 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-forest group"
            >
              Start New Recommendation
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </section>

      </PageContainer>
      </div>
    </div>
  );
}
