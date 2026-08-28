import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, HelpCircle, History, CloudSun } from "lucide-react";

import { useRecommendation } from "../context/RecommendationContext";
import { PageContainer }     from "../components/ui/PageContainer";
import { SectionHeader }     from "../components/ui/SectionHeader";
import { Badge }             from "../components/ui/Badge";

// Existing comparison components — unchanged, reused as-is
import { CropRanking }         from "../components/comparison/CropRanking";
import { CropComparisonTable } from "../components/comparison/CropComparisonTable";
import { YieldComparisonChart, SuitabilityComparison } from "../components/comparison/ComparisonCharts";
import { HeadToHeadComparison }  from "../components/comparison/HeadToHeadComparison";
import { EvidenceMatrix }        from "../components/comparison/EvidenceMatrix";
import { RankingExplanation }    from "../components/comparison/RankingExplanation";

// New components built for this step
import { CropSelectorPanel }  from "../components/comparison/CropSelectorPanel";
import { TopOptionBanner }    from "../components/comparison/TopOptionBanner";
import { ComparisonInsights } from "../components/comparison/ComparisonInsights";
import { CurrentLeader }      from "../components/comparison/CurrentLeader";
import { SortControls, sortCrops } from "../components/comparison/SortControls";
import type { SortKey }       from "../components/comparison/SortControls";

import { MOCK_RANKINGS, MOCK_TOP_CROP } from "../data/mockRecommendation";

// ── Demo fallbacks ────────────────────────────────────────────────────────

const DEMO_DISTRICT = "Prayagraj";
const DEMO_SEASON   = "Kharif";
const DEMO_ACRES    = 2.5;

// ── Comparison page ───────────────────────────────────────────────────────

export function Comparison() {
  const navigate = useNavigate();
  const { farmerInput } = useRecommendation();

  const district = farmerInput?.district       ?? DEMO_DISTRICT;
  const season   = farmerInput?.season         ?? DEMO_SEASON;
  const acres    = farmerInput?.land_area_acres ?? DEMO_ACRES;

  // ── Reactive crop selection ───────────────────────────────────────────
  const [selectedCrops, setSelectedCrops] = useState<string[]>(
    MOCK_RANKINGS.map((c) => c.crop)          // all selected by default
  );
  const [sortKey, setSortKey] = useState<SortKey>("yield");

  const toggleCrop = (crop: string) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  // Filtered + sorted rankings for reactive sections
  const filteredRankings = sortCrops(
    MOCK_RANKINGS.filter((c) => selectedCrops.includes(c.crop)),
    sortKey
  );

  // The current top crop among selected (by yield)
  const currentTop = filteredRankings.length > 0 ? filteredRankings[0] : MOCK_TOP_CROP;

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
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate("/results")}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-forest transition-colors"
              aria-label="Back to recommendation"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Recommendation
            </button>
          </div>
        </div>
      </div>

      <PageContainer maxWidth="xl" className="py-8 md:py-12 space-y-12 animate-fade-in">

        {/* ── 1. PAGE HEADER ── */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-forest/60">Crop Comparison</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
            Compare your options before making a decision.
          </h1>
          <p className="text-base text-charcoal-muted max-w-2xl leading-relaxed">
            Explore predicted yield, historical performance and weather compatibility across candidate crops.
          </p>
          <p className="text-sm text-charcoal-muted/70">
            {district} · {season} · {acres} acres
          </p>
        </div>

        {/* ── 2. TOP OPTION BANNER ── */}
        <section aria-labelledby="top-option-heading">
          <h2 id="top-option-heading" className="sr-only">Current Top Option</h2>
          <TopOptionBanner top={MOCK_TOP_CROP} />
        </section>

        {/* ── 3. CROP SELECTOR + SORT ── */}
        <section aria-labelledby="selector-heading" className="space-y-4">
          <SectionHeader
            id="selector-heading"
            title="Choose Crops to Compare"
            subtitle="Select or deselect crops to update all sections below."
            action={<SortControls value={sortKey} onChange={setSortKey} />}
          />
          <div className="bg-white rounded-2xl border border-ivory-300 shadow-card px-5 py-4">
            <CropSelectorPanel
              allCrops={MOCK_RANKINGS}
              selected={selectedCrops}
              onToggle={toggleCrop}
              minCrops={2}
            />
          </div>
        </section>

        {/* ── 4. CURRENT LEADER ── */}
        <section aria-labelledby="leader-heading">
          <h2 id="leader-heading" className="sr-only">Current Leader</h2>
          <CurrentLeader crops={filteredRankings} />
        </section>

        {/* ── 5. CROP RANKING ── */}
        <section aria-labelledby="ranking-heading" className="space-y-4">
          <SectionHeader
            id="ranking-heading"
            title="Crop Ranking"
            subtitle="Ranked by predicted yield under the selected conditions."
          />
          <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6">
            <CropRanking rankings={filteredRankings} />
          </div>
        </section>

        {/* ── 6. WHY #1? ── */}
        <section aria-labelledby="explain-heading" className="space-y-4">
          <SectionHeader
            id="explain-heading"
            title={`Why is ${currentTop.crop} Currently Leading?`}
            subtitle="Understand the primary signal and supporting evidence."
          />
          <RankingExplanation rankings={filteredRankings} />
        </section>

        {/* ── 7. FULL COMPARISON TABLE ── */}
        <section aria-labelledby="table-heading" className="space-y-4">
          <SectionHeader
            id="table-heading"
            title="Full Crop Comparison"
            subtitle="All selected crops ranked side by side across key indicators."
          />
          <CropComparisonTable rankings={filteredRankings} />
        </section>

        {/* ── 8. HEAD-TO-HEAD ── */}
        <section aria-labelledby="h2h-heading" className="space-y-4">
          <SectionHeader
            id="h2h-heading"
            title="Compare Two Crops"
            subtitle="Select any two crops to view a direct side-by-side comparison."
          />
          <HeadToHeadComparison rankings={filteredRankings.length >= 2 ? filteredRankings : MOCK_RANKINGS} />
        </section>

        {/* ── 9. CHARTS (side by side on large) ── */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <section aria-labelledby="yield-chart-heading" className="space-y-4">
            <SectionHeader
              id="yield-chart-heading"
              title="Predicted Yield by Crop"
              subtitle="Predicted yield is the primary ranking signal."
            />
            <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6">
              <YieldComparisonChart rankings={filteredRankings} />
              {/* Yield difference note */}
              {filteredRankings.length >= 2 && (() => {
                const sorted = [...filteredRankings].sort((a, b) => b.predicted_yield_t_per_ha - a.predicted_yield_t_per_ha);
                const diff = (sorted[0].predicted_yield_t_per_ha - sorted[1].predicted_yield_t_per_ha).toFixed(2);
                return (
                  <p className="text-xs text-charcoal-muted mt-3 pt-3 border-t border-ivory-200">
                    <strong className="text-forest">+{diff} t/ha</strong> difference from next-best option ({sorted[1].crop}).
                  </p>
                );
              })()}
            </div>
          </section>

          <section aria-labelledby="suit-chart-heading" className="space-y-4">
            <SectionHeader
              id="suit-chart-heading"
              title="Relative Suitability"
              subtitle="Suitability represents each crop's relative position among evaluated candidates."
            />
            <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6">
              <SuitabilityComparison rankings={filteredRankings} />
            </div>
          </section>
        </div>

        {/* ── 10. EVIDENCE MATRIX ── */}
        <section aria-labelledby="matrix-heading" className="space-y-4">
          <SectionHeader
            id="matrix-heading"
            title="Supporting Evidence Matrix"
            subtitle="Historical, weather and trend indicators across all selected crops."
          />
          <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6">
            <EvidenceMatrix rankings={filteredRankings} />
          </div>
        </section>

        {/* ── 11. COMPARISON INSIGHTS ── */}
        <section aria-labelledby="insights-heading" className="space-y-4">
          <SectionHeader
            id="insights-heading"
            title="Comparison Insights"
            subtitle="Calculated from the currently selected crops."
          />
          <ComparisonInsights crops={filteredRankings} />
        </section>

        {/* ── 12. NAVIGATION FOOTER ── */}
        <div className="rounded-2xl border border-ivory-200 bg-white shadow-card p-5 space-y-4">
          <p className="text-sm font-semibold text-charcoal">Continue your analysis</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/results")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ivory-300 bg-white text-xs font-semibold text-charcoal hover:border-forest/30 hover:bg-forest/[0.02] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2 group"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              View Recommendation
            </button>
            <button
              type="button"
              onClick={() => navigate("/explain")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-forest/20 bg-forest/[0.04] text-xs font-bold text-forest hover:bg-forest/[0.08] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2 group"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Why This Crop?
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/history")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ivory-300 bg-white text-xs font-semibold text-charcoal hover:border-forest/30 hover:bg-forest/[0.02] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
            >
              <History className="h-3.5 w-3.5" />
              Historical Performance
            </button>
            <button
              type="button"
              onClick={() => navigate("/weather")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ivory-300 bg-white text-xs font-semibold text-charcoal hover:border-forest/30 hover:bg-forest/[0.02] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
            >
              <CloudSun className="h-3.5 w-3.5" />
              Weather Intelligence
            </button>
          </div>
        </div>

      </PageContainer>
    </div>
  );
}
