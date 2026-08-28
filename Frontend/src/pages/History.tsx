import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, CloudSun, BarChart3, TrendingUp } from "lucide-react";

import { PageContainer }   from "../components/ui/PageContainer";
import { SectionHeader }   from "../components/ui/SectionHeader";
import { Badge }           from "../components/ui/Badge";

import { HistoricalHero }           from "../components/history/HistoricalHero";
import { YieldTrendChart }          from "../components/history/YieldTrendChart";
import { RecommendedCropHistory }   from "../components/history/RecommendedCropHistory";
import { RecentPerformanceTable }   from "../components/history/RecentPerformanceTable";
import { HistoricalCropComparison } from "../components/history/HistoricalCropComparison";
import { AverageYieldChart }        from "../components/history/AverageYieldChart";
import { StabilitySection, TrendSection } from "../components/history/StabilityTrendSections";
import { HistoricalInsight }        from "../components/history/HistoricalInsight";

import { MOCK_HISTORICAL_DATA } from "../data/mockHistoricalData";

// ── History page ─────────────────────────────────────────────────────────

const DEMO_DISTRICT = "Prayagraj, Uttar Pradesh";
const DEMO_SEASON   = "Kharif";
const DEMO_ACRES    = 2.5;
const RECOMMENDED   = "Maize";
const PERIOD_LABEL  = "5 Years";

export function History() {
  const navigate = useNavigate();
  const [_period] = useState(PERIOD_LABEL); // extensible for future ranges

  const topCrop = MOCK_HISTORICAL_DATA.find((c) => c.crop === RECOMMENDED)!;

  return (
    <div className="min-h-screen bg-ivory">
      {/* ── Sticky context bar ── */}
      <div className="sticky top-16 z-30 bg-ivory dark:bg-[#101815] border-b border-ivory-300 dark:border-[#26362f] shadow-nav">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-forest/60 shrink-0" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 min-w-0">
              <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/50">Farm</p>
              <p className="text-sm font-semibold text-charcoal truncate">{DEMO_DISTRICT}</p>
              <Badge variant="default" size="sm">{DEMO_SEASON}</Badge>
              <Badge variant="neutral" size="sm">{DEMO_ACRES} ac</Badge>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/results")}
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-forest transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back to Recommendation</span>
          </button>
        </div>
      </div>

      <PageContainer maxWidth="xl" className="py-8 md:py-12 space-y-14 animate-fade-in">

        {/* ── Page header ── */}
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-forest/60">
              Historical Agricultural Intelligence
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
              Understand crop performance over time.
            </h1>
            <p className="text-base text-charcoal-muted max-w-xl leading-relaxed">
              Explore historical yield patterns and trends that provide context for your crop recommendation.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral" size="sm">{DEMO_DISTRICT}</Badge>
            <Badge variant="default" size="sm">{DEMO_SEASON}</Badge>
            <Badge variant="success" size="sm">{RECOMMENDED}</Badge>
          </div>
        </div>

        {/* ── Section 1: Hero summary ── */}
        <section aria-labelledby="hero-hist-heading">
          <h2 id="hero-hist-heading" className="sr-only">Historical Performance Summary</h2>
          <HistoricalHero topCrop={topCrop} />
        </section>

        {/* ── Section 2: Main yield trend chart ── */}
        <section aria-labelledby="trend-chart-heading" className="space-y-4">
          <SectionHeader
            id="trend-chart-heading"
            title="Historical Yield Trend"
            subtitle="Yield performance across recent agricultural years."
            action={
              <div className="flex items-center gap-2">
                <label htmlFor="period-select" className="text-xs text-charcoal-muted font-medium">
                  Period:
                </label>
                <div className="relative">
                  <select
                    id="period-select"
                    className="appearance-none rounded-lg border border-ivory-300 bg-white px-3 py-1.5 pr-7 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/20"
                    defaultValue={PERIOD_LABEL}
                    aria-label="Historical period"
                  >
                    <option value="5 Years">5 Years</option>
                  </select>
                  <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-charcoal-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m19 9-7 7-7-7"/></svg>
                </div>
              </div>
            }
          />
          <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6">
            <YieldTrendChart crops={MOCK_HISTORICAL_DATA} recommendedCrop={RECOMMENDED} />
          </div>
        </section>

        {/* ── Section 3: Recommended crop highlight + recent performance ── */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <section aria-labelledby="rec-hist-heading" className="space-y-4">
            <SectionHeader
              id="rec-hist-heading"
              title={`${RECOMMENDED} — Historical View`}
              subtitle="Earliest to latest yield movement."
            />
            <RecommendedCropHistory data={topCrop} />
          </section>

          <section aria-labelledby="recent-heading" className="space-y-4">
            <SectionHeader
              id="recent-heading"
              title="Recent Performance"
              subtitle={`Year-by-year yield for ${RECOMMENDED}.`}
            />
            <RecentPerformanceTable data={topCrop} />
          </section>
        </div>

        {/* ── Section 4: Historical crop comparison table ── */}
        <section aria-labelledby="hist-compare-heading" className="space-y-4">
          <SectionHeader
            id="hist-compare-heading"
            title="Historical Crop Comparison"
            subtitle="Latest yield, average yield, trend and stability across all evaluated crops."
          />
          <HistoricalCropComparison crops={MOCK_HISTORICAL_DATA} />
        </section>

        {/* ── Section 5: Average yield chart ── */}
        <section aria-labelledby="avg-yield-heading" className="space-y-4">
          <SectionHeader
            id="avg-yield-heading"
            title="Average Historical Yield"
            subtitle="Arithmetic mean of yearly yields across the 2021–2025 period."
          />
          <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6">
            <AverageYieldChart crops={MOCK_HISTORICAL_DATA} />
          </div>
        </section>

        {/* ── Section 6: Stability + Trend side by side ── */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <section aria-labelledby="stability-heading" className="space-y-4">
            <SectionHeader
              id="stability-heading"
              title="Historical Stability"
            />
            <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6">
              <StabilitySection crops={MOCK_HISTORICAL_DATA} />
            </div>
          </section>

          <section aria-labelledby="trend-heading" className="space-y-4">
            <SectionHeader
              id="trend-heading"
              title="Yield Trend"
            />
            <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6">
              <TrendSection crops={MOCK_HISTORICAL_DATA} />
            </div>
          </section>
        </div>

        {/* ── Section 7: Historical insight ── */}
        <section aria-labelledby="insight-heading" className="space-y-4">
          <SectionHeader id="insight-heading" title="Historical Insight" />
          <HistoricalInsight topCrop={RECOMMENDED} />
        </section>

        {/* ── Section 8: How history fits into recommendation ── */}
        <section aria-labelledby="hist-fit-heading" className="space-y-4">
          <SectionHeader
            id="hist-fit-heading"
            title="How historical data fits into your recommendation"
            subtitle="Historical performance is supporting evidence — not the primary ranking signal."
          />
          <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6 space-y-4">
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Historical agricultural data provides context for the crop recommendation.
              The primary ranking signal is the predicted yield estimate; historical performance
              and weather compatibility serve as supporting evidence.
            </p>
            <div className="space-y-2">
              {[
                { icon: <TrendingUp className="h-4 w-4" />, label: "Predicted Yield",        role: "PRIMARY RANKING SIGNAL",  bg: "bg-forest/[0.04] border-forest/12", roleClass: "text-forest" },
                { icon: <BarChart3 className="h-4 w-4" />,  label: "Historical Performance", role: "SUPPORTING EVIDENCE",      bg: "bg-ivory-100 border-ivory-200",     roleClass: "text-charcoal-muted" },
                { icon: <CloudSun className="h-4 w-4" />,   label: "Weather Compatibility",  role: "SUPPORTING EVIDENCE",      bg: "bg-ivory-100 border-ivory-200",     roleClass: "text-charcoal-muted" },
              ].map((item) => (
                <div key={item.label} className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${item.bg}`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-forest/60">{item.icon}</span>
                    <span className="text-sm font-semibold text-charcoal">{item.label}</span>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${item.roleClass}`}>
                    {item.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Navigation CTAs ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 pb-4">
          <button
            type="button"
            onClick={() => navigate("/results")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-ivory-300 text-sm font-semibold text-charcoal hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recommendation
          </button>
          <button
            type="button"
            onClick={() => navigate("/weather")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-forest text-white text-sm font-semibold hover:bg-forest-600 transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
          >
            <CloudSun className="h-4 w-4" />
            View Weather Intelligence
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </PageContainer>
    </div>
  );
}
