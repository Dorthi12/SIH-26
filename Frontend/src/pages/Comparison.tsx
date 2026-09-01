import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, HelpCircle, History, CloudSun, GitCompare, Sparkles } from "lucide-react";

import { useRecommendation } from "../context/RecommendationContext";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/layout/LanguageSwitcher";
import { PageContainer }     from "../components/ui/PageContainer";
import { SectionHeader }     from "../components/ui/SectionHeader";
import { Badge }             from "../components/ui/Badge";
import { getCropName }       from "../utils/cropTranslations";

// Comparison components
import { CropRanking }         from "../components/comparison/CropRanking";
import { CropComparisonTable } from "../components/comparison/CropComparisonTable";
import { YieldComparisonChart, SuitabilityComparison } from "../components/comparison/ComparisonCharts";
import { HeadToHeadComparison }  from "../components/comparison/HeadToHeadComparison";
import { EvidenceMatrix }        from "../components/comparison/EvidenceMatrix";
import { RankingExplanation }    from "../components/comparison/RankingExplanation";
import { CropSelectorPanel }     from "../components/comparison/CropSelectorPanel";
import { TopOptionBanner }       from "../components/comparison/TopOptionBanner";
import { ComparisonInsights }    from "../components/comparison/ComparisonInsights";
import { CurrentLeader }         from "../components/comparison/CurrentLeader";
import { SortControls, sortCrops } from "../components/comparison/SortControls";
import type { SortKey }          from "../components/comparison/SortControls";

import { MOCK_RANKINGS, MOCK_TOP_CROP } from "../data/mockRecommendation";

// ── Demo fallbacks ────────────────────────────────────────────────────────

const DEMO_DISTRICT = "Prayagraj";
const DEMO_SEASON   = "Kharif";
const DEMO_ACRES    = 2.5;

// ── Comparison page ───────────────────────────────────────────────────────

export function Comparison() {
  const navigate = useNavigate();
  const { farmerInput } = useRecommendation();
  const { t } = useLanguage();

  const district = farmerInput?.district       ?? DEMO_DISTRICT;
  const season   = farmerInput?.season         ?? DEMO_SEASON;
  const acres    = farmerInput?.land_area_acres ?? DEMO_ACRES;

  // Reactive crop selection
  const [selectedCrops, setSelectedCrops] = useState<string[]>(
    MOCK_RANKINGS.map((c) => c.crop)
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

  // Current top crop among selected
  const currentTop = filteredRankings.length > 0 ? filteredRankings[0] : MOCK_TOP_CROP;
  const currentTopName = getCropName(currentTop.crop, t);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#090f0c] text-slate-900 dark:text-slate-100 transition-colors">

      {/* ── Sticky context bar ── */}
      <div className="sticky top-16 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MapPin className="h-4 w-4 shrink-0" />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 min-w-0">
              <p className="text-2xs font-extrabold uppercase tracking-widest text-slate-400">
                {t("Your Farm", "आपका खेत")}
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{district}</p>
              <Badge variant="amber" size="sm" className="font-extrabold">{season}</Badge>
              <Badge variant="neutral" size="sm" className="font-extrabold">{acres} {t("ac", "एकड़")}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Language Switcher */}
            <LanguageSwitcher className="shadow-sm" />

            <button
              type="button"
              onClick={() => navigate("/results")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              aria-label="Back to recommendation"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("Recommendation", "सिफारिश")}
            </button>
          </div>
        </div>
      </div>

      <PageContainer maxWidth="xl" className="py-8 md:py-12 space-y-10 animate-fade-in">

        {/* ── 1. PAGE HEADER ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/90 via-teal-900/95 to-slate-950 p-8 sm:p-10 text-white shadow-2xl shadow-emerald-950/20 border border-emerald-500/20">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          
          <div className="relative space-y-4 max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-2xs font-extrabold uppercase tracking-widest backdrop-blur-md">
              <GitCompare className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              {t("Crop Comparison", "फ़सल तुलना")}
            </span>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {t(
                "Compare your options before making a decision.",
                "निर्णय लेने से पहले अपने विकल्पों की तुलना करें।"
              )}
            </h1>
            
            <p className="text-base sm:text-lg text-emerald-100/80 leading-relaxed font-medium">
              {t(
                "Explore predicted yield, historical performance and weather compatibility across candidate crops.",
                "उम्मीदवार फ़सलों में अनुमानित उपज, ऐतिहासिक प्रदर्शन और मौसम अनुकूलता का अन्वेषण करें।"
              )}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-amber-300/90 pt-2">
              <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">📍 {district}</span>
              <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">🌾 {season}</span>
              <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">📐 {acres} {t("acres", "एकड़")}</span>
            </div>
          </div>
        </div>

        {/* ── 2. TOP OPTION BANNER ── */}
        <section aria-labelledby="top-option-heading">
          <h2 id="top-option-heading" className="sr-only">
            {t("Current Top Option", "वर्तमान शीर्ष विकल्प")}
          </h2>
          <TopOptionBanner top={MOCK_TOP_CROP} />
        </section>

        {/* ── 3. CROP SELECTOR + SORT ── */}
        <section aria-labelledby="selector-heading" className="space-y-4">
          <SectionHeader
            id="selector-heading"
            title={t("Choose Crops to Compare", "तुलना के लिए फ़सलें चुनें")}
            subtitle={t("Select or deselect crops to update all sections below.", "नीचे दिए गए सभी अनुभागों को अपडेट करने के लिए फ़सलों को चुनें या हटाएं।")}
            action={<SortControls value={sortKey} onChange={setSortKey} />}
          />
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 backdrop-blur-md">
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
          <h2 id="leader-heading" className="sr-only">
            {t("Current Leader", "वर्तमान अग्रणी फ़सल")}
          </h2>
          <CurrentLeader crops={filteredRankings} />
        </section>

        {/* ── 5. CROP RANKING ── */}
        <section aria-labelledby="ranking-heading" className="space-y-4">
          <SectionHeader
            id="ranking-heading"
            title={t("Crop Ranking", "फ़सल रैंकिंग")}
            subtitle={t("Ranked by predicted yield under the selected conditions.", "चयनित परिस्थितियों में अनुमानित उपज के आधार पर रैंक।")}
          />
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 md:p-8 backdrop-blur-md">
            <CropRanking rankings={filteredRankings} />
          </div>
        </section>

        {/* ── 6. WHY #1? ── */}
        <section aria-labelledby="explain-heading" className="space-y-4">
          <SectionHeader
            id="explain-heading"
            title={t(`Why is ${currentTop.crop} Currently Leading?`, `${currentTopName} वर्तमान में आगे क्यों है?`)}
            subtitle={t("Understand the primary signal and supporting evidence.", "प्राथमिक संकेत और सहायक साक्ष्यों को समझें।")}
          />
          <RankingExplanation rankings={filteredRankings} />
        </section>

        {/* ── 7. FULL COMPARISON TABLE ── */}
        <section aria-labelledby="table-heading" className="space-y-4">
          <SectionHeader
            id="table-heading"
            title={t("Full Crop Comparison", "पूर्ण फ़सल तुलना")}
            subtitle={t("All selected crops ranked side by side across key indicators.", "प्रमुख संकेतकों पर सभी चयनित फ़सलों की एक साथ तुलना।")}
          />
          <CropComparisonTable rankings={filteredRankings} />
        </section>

        {/* ── 8. HEAD-TO-HEAD ── */}
        <section aria-labelledby="h2h-heading" className="space-y-4">
          <SectionHeader
            id="h2h-heading"
            title={t("Compare Two Crops", "दो फ़सलों की तुलना करें")}
            subtitle={t("Select any two crops to view a direct side-by-side comparison.", "प्रत्यक्ष आमने-सामने तुलना देखने के लिए किन्हीं दो फ़सलों को चुनें।")}
          />
          <HeadToHeadComparison rankings={filteredRankings.length >= 2 ? filteredRankings : MOCK_RANKINGS} />
        </section>

        {/* ── 9. CHARTS (side by side on large) ── */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <section aria-labelledby="yield-chart-heading" className="space-y-4">
            <SectionHeader
              id="yield-chart-heading"
              title={t("Predicted Yield by Crop", "फ़सल अनुसार अनुमानित उपज")}
              subtitle={t("Predicted yield is the primary ranking signal.", "अनुमानित उपज प्राथमिक रैंकिंग संकेत है।")}
            />
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 md:p-8 backdrop-blur-md">
              <YieldComparisonChart rankings={filteredRankings} />
              {filteredRankings.length >= 2 && (() => {
                const sorted = [...filteredRankings].sort((a, b) => b.predicted_yield_t_per_ha - a.predicted_yield_t_per_ha);
                const diff = (sorted[0].predicted_yield_t_per_ha - sorted[1].predicted_yield_t_per_ha).toFixed(2);
                const nextCrop = getCropName(sorted[1].crop, t);
                return (
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <strong className="text-emerald-600 dark:text-emerald-400 font-black">+{diff} {t("t/ha", "टन/हेक्टेयर")}</strong>{" "}
                    {t(`difference from next-best option (${nextCrop}).`, `अगले सर्वश्रेष्ठ विकल्प (${nextCrop}) से अंतर।`)}
                  </p>
                );
              })()}
            </div>
          </section>

          <section aria-labelledby="suit-chart-heading" className="space-y-4">
            <SectionHeader
              id="suit-chart-heading"
              title={t("Relative Suitability", "सापेक्ष उपयुक्तता")}
              subtitle={t("Suitability represents each crop's relative position among evaluated candidates.", "उपयुक्तता मूल्यांकन किए गए उम्मीदवारों में प्रत्येक फ़सल की सापेक्ष स्थिति का प्रतिनिधित्व करती है।")}
            />
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 md:p-8 backdrop-blur-md">
              <SuitabilityComparison rankings={filteredRankings} />
            </div>
          </section>
        </div>

        {/* ── 10. EVIDENCE MATRIX ── */}
        <section aria-labelledby="matrix-heading" className="space-y-4">
          <SectionHeader
            id="matrix-heading"
            title={t("Supporting Evidence Matrix", "सहायक साक्ष्य मैट्रिक्स")}
            subtitle={t("Historical, weather and trend indicators across all selected crops.", "सभी चयनित फ़सलों में ऐतिहासिक, मौसम और रुझान सूचकांक।")}
          />
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 md:p-8 backdrop-blur-md">
            <EvidenceMatrix rankings={filteredRankings} />
          </div>
        </section>

        {/* ── 11. COMPARISON INSIGHTS ── */}
        <section aria-labelledby="insights-heading" className="space-y-4">
          <SectionHeader
            id="insights-heading"
            title={t("Comparison Insights", "तुलना अंतर्दृष्टि")}
            subtitle={t("Calculated from the currently selected crops.", "वर्तमान में चयनित फ़सलों के आधार पर गणना की गई।")}
          />
          <ComparisonInsights crops={filteredRankings} />
        </section>

        {/* ── 12. NAVIGATION FOOTER ── */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 space-y-4 backdrop-blur-md">
          <p className="text-sm font-black text-slate-900 dark:text-white">
            {t("Continue your analysis", "अपना विश्लेषण जारी रखें")}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/results")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-black text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all shadow-sm cursor-pointer group"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("View Recommendation", "सिफारिश देखें")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/explain")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-black text-white hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md shadow-emerald-600/20 cursor-pointer group"
            >
              <HelpCircle className="h-4 w-4" />
              {t("Why This Crop?", "यह फ़सल क्यों?")}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/history")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-black text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all shadow-sm cursor-pointer"
            >
              <History className="h-4 w-4" />
              {t("Historical Performance", "ऐतिहासिक प्रदर्शन")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/weather")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-black text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all shadow-sm cursor-pointer"
            >
              <CloudSun className="h-4 w-4" />
              {t("Weather Intelligence", "मौसम बुद्धिमत्ता")}
            </button>
          </div>
        </div>

      </PageContainer>
    </div>
  );
}
