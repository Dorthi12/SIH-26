import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Sprout, History as HistoryIcon,
  ArrowRight, RefreshCw, AlertCircle, Layers, Sparkles, Navigation, Globe
} from "lucide-react";

import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Badge } from "../components/ui/Badge";
import { DistrictSelect } from "../components/ui/DistrictSelect";
import { LanguageSwitcher } from "../components/layout/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";
import { useScrollReveal } from "../utils/useScrollReveal";
import { cn } from "../utils/cn";

import { DistrictOverviewCards } from "../components/districtIntelligence/DistrictOverviewCards";
import { CropIntelligenceTable } from "../components/districtIntelligence/CropIntelligenceTable";
import { CropDetailPanel } from "../components/districtIntelligence/CropDetailPanel";
import { CropComparisonChart } from "../components/districtIntelligence/CropComparisonChart";
import { DistrictMapVisual } from "../components/districtIntelligence/DistrictMapVisual";
import { IntelligenceSkeleton } from "../components/districtIntelligence/IntelligenceSkeleton";

import {
  fetchDistricts,
  fetchDistrictIntelligence,
  DETAILED_DISTRICTS,
} from "../services/districtIntelligenceService";

import type {
  DistrictOption,
  DistrictIntelligence,
  CropIntelligence,
  DistrictIntelligenceStatus,
} from "../types/districtIntelligence";

export function DistrictIntelligencePage() {
  const navigate = useNavigate();
  const revealRef = useScrollReveal();
  const { t } = useLanguage();

  // District selector
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  // Auto-select Prayagraj by default so page is immediately populated!
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("prayagraj");
  const [districtsLoading, setDistrictsLoading] = useState(true);

  // Intelligence lifecycle
  const [status, setStatus] = useState<DistrictIntelligenceStatus>("loading");
  const [intelligence, setIntelligence] = useState<DistrictIntelligence | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<CropIntelligence | null>(null);

  // Load district list on mount
  useEffect(() => {
    fetchDistricts()
      .then((data) => {
        setDistricts(data);
      })
      .finally(() => setDistrictsLoading(false));
  }, []);

  const loadRef = useRef<string | null>(null);

  const loadIntelligence = useCallback(async (districtId: string) => {
    if (!districtId) {
      setStatus("idle");
      setIntelligence(null);
      setSelectedCrop(null);
      return;
    }

    loadRef.current = districtId;
    setStatus("loading");
    setSelectedCrop(null);

    try {
      const data = await fetchDistrictIntelligence(districtId);
      if (loadRef.current !== districtId) return;

      setIntelligence(data);
      setStatus("ready");
    } catch (_err) {
      if (loadRef.current !== districtId) return;
      setStatus("error");
    }
  }, []);

  // Fetch intelligence when selectedDistrictId changes
  useEffect(() => {
    if (selectedDistrictId) {
      loadIntelligence(selectedDistrictId);
    }
  }, [selectedDistrictId, loadIntelligence]);

  const handleDistrictChange = useCallback(
    (value: string) => {
      setSelectedDistrictId(value);
    },
    []
  );

  const handleRetry = useCallback(() => {
    if (selectedDistrictId) loadIntelligence(selectedDistrictId);
  }, [selectedDistrictId, loadIntelligence]);

  const selectedDistrictLabel =
    districts.find((d) => d.value.toLowerCase() === selectedDistrictId.toLowerCase())?.label ?? selectedDistrictId;

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#090f0c] text-slate-900 dark:text-slate-100 transition-colors">

      {/* ── Sticky Context Bar with Language Switcher ── */}
      <div className="sticky top-16 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Layers className="h-4 w-4 shrink-0" />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 min-w-0">
              <p className="text-2xs font-extrabold uppercase tracking-widest text-slate-400">
                {t("Intelligence", "बुद्धिमत्ता")}
              </p>
              {selectedDistrictId ? (
                <>
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {selectedDistrictLabel}
                  </p>
                  <Badge variant="amber" size="sm" className="font-extrabold">
                    {status === "loading" ? t("Loading…", "लोड हो रहा है…") : status === "ready" ? t("Live GIS", "लाइव") : t("Ready", "तैयार")}
                  </Badge>
                </>
              ) : (
                <p className="text-sm text-slate-400">{t("No district selected", "कोई ज़िला नहीं चुना गया")}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Language Switcher Button */}
            <LanguageSwitcher className="shadow-sm" />

            <button
              type="button"
              onClick={() => navigate("/history")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <HistoryIcon className="h-3.5 w-3.5" />
              <span>{t("Historical Performance", "ऐतिहासिक प्रदर्शन")}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <div ref={revealRef as React.Ref<HTMLDivElement>}>
        <PageContainer maxWidth="xl" className="py-8 md:py-12 space-y-10 animate-fade-in">

          {/* ── 1. Vibrant Hero Banner ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/90 via-teal-900/95 to-slate-950 p-8 sm:p-10 text-white shadow-2xl shadow-emerald-950/20 border border-emerald-500/20">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

            <div className="relative space-y-4 max-w-3xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-2xs font-extrabold uppercase tracking-widest backdrop-blur-md">
                <Globe className="h-3.5 w-3.5 text-amber-400 animate-spin-slow" />
                {t("Agricultural GIS Intelligence", "कृषि जीआईएस बुद्धिमत्ता")}
              </span>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                {t("District Intelligence", "ज़िला कृषि बुद्धिमत्ता")}
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/80 leading-relaxed font-medium">
                {t(
                  "Explore crop suitability, expected yield, weather risk, and soil maps for any district in Uttar Pradesh.",
                  "उत्तर प्रदेश के किसी भी ज़िले के लिए फ़सल की उपयुक्तता, अनुमानित उपज, मौसम के जोखिम और मिट्टी का नक्शा देखें।"
                )}
              </p>
            </div>
          </div>

          {/* ── 2. Side-by-Side Google Maps Style Selection & Interactive GIS View ── */}
          <section aria-labelledby="district-selector-heading" className="space-y-6">
            <SectionHeader
              id="district-selector-heading"
              title={t("Select District & Map View", "ज़िला चुनें और नक्शा देखें")}
              subtitle={t("Click any district chip below or search to view GIS map & live intelligence.", "जीआईएस नक्शा और लाइव बुद्धिमत्ता देखने के लिए नीचे किसी भी ज़िले पर क्लिक करें या खोजें।")}
            />

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: District Selector & Popular Quick Cards (5 cols) */}
              <div className="lg:col-span-5 space-y-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 backdrop-blur-md">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("Search District Name", "ज़िले का नाम खोजें")}
                  </label>
                  <DistrictSelect
                    id="district-intelligence-selector"
                    label=""
                    options={districts}
                    value={selectedDistrictId}
                    onChange={handleDistrictChange}
                    placeholder={
                      districtsLoading ? t("Loading districts…", "ज़िले लोड हो रहे हैं…") : t("Search and select a district…", "ज़िला खोजें और चुनें…")
                    }
                    disabled={districtsLoading}
                  />
                </div>

                {/* Popular Districts Grid (Cards/Chips so districts are clearly seen) */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t("Popular Districts in UP", "उत्तर प्रदेश के लोकप्रिय ज़िले")}
                    </p>
                    <span className="text-3xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {DETAILED_DISTRICTS.length} {t("Available", "उपलब्ध")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5">
                    {DETAILED_DISTRICTS.map((d) => {
                      const isSelected = d.value.toLowerCase() === selectedDistrictId.toLowerCase();
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => handleDistrictChange(d.value)}
                          className={cn(
                            "flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer select-none",
                            isSelected
                              ? "border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-slate-900 dark:text-white shadow-md scale-[1.02] font-black"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          <div className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors",
                            isSelected ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-sm" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                          )}>
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black truncate">{d.label}</p>
                            <p className="text-3xs text-slate-400 truncate">{d.best_crop} • {d.crops[0]?.suitability}%</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Google Maps Style GIS Map Visual (7 cols) */}
              <div className="lg:col-span-7">
                {intelligence ? (
                  <DistrictMapVisual intelligence={intelligence} />
                ) : (
                  <div className="h-64 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                    <p className="text-xs font-bold">{t("Loading Google Maps visual…", "गूगल मैप्स विजुअल लोड हो रहा है…")}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── 3. Main Intelligence Analytics Section ── */}
          {status === "loading" && (
            <div data-reveal data-delay="150">
              <IntelligenceSkeleton />
            </div>
          )}

          {status === "error" && (
            <div data-reveal data-delay="150">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-500/20 shadow-xl p-10 text-center space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto">
                  <AlertCircle className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {t("District intelligence is currently unavailable", "ज़िला बुद्धिमत्ता वर्तमान में अनुपलब्ध है")}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t(`Could not load data for ${selectedDistrictLabel}.`, `${selectedDistrictLabel} के लिए डेटा लोड नहीं हो सका।`)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-md"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("Try Again", "फिर से प्रयास करें")}
                </button>
              </div>
            </div>
          )}

          {status === "ready" && intelligence && (
            <div className="space-y-10">
              {/* Overview KPI Cards */}
              <section aria-labelledby="overview-heading">
                <SectionHeader
                  id="overview-heading"
                  title={t("Intelligence Overview", "बुद्धिमत्ता अवलोकन")}
                  subtitle={t(`Agricultural summary for ${intelligence.district_name}.`, `${intelligence.district_name} का कृषि सारांश।`)}
                  className="mb-4"
                />
                <DistrictOverviewCards intelligence={intelligence} />
              </section>

              {/* Crop Intelligence Table & Detail Panel */}
              <section aria-labelledby="crop-table-heading">
                <SectionHeader
                  id="crop-table-heading"
                  title={t("Crop Intelligence", "फ़सल बुद्धिमत्ता")}
                  subtitle={t("Suitability, yield, and risk for each evaluated crop. Click a row to explore details.", "प्रत्येक मूल्यांकन की गई फ़सल की उपयुक्तता, उपज और जोखिम। विवरण देखने के लिए क्लिक करें।")}
                  className="mb-4"
                />
                <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
                  <CropIntelligenceTable
                    crops={intelligence.crops}
                    selectedCropId={selectedCrop?.crop_id ?? null}
                    onSelectCrop={setSelectedCrop}
                  />

                  <div>
                    {selectedCrop ? (
                      <CropDetailPanel
                        crop={selectedCrop}
                        districtName={intelligence.district_name}
                        onClose={() => setSelectedCrop(null)}
                      />
                    ) : (
                      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 py-16 px-6 text-center shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                          <Sprout className="h-6 w-6" />
                        </div>
                        <p className="text-xs font-black text-slate-500 dark:text-slate-400">
                          {t("Select a crop row to view detailed recommendations", "विस्तृत सिफारिशों के लिए एक फ़सल चुनें")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Crop Comparison Chart */}
              <section aria-labelledby="comparison-heading">
                <SectionHeader
                  id="comparison-heading"
                  title={t("Performance Comparison", "प्रदर्शन तुलना")}
                  subtitle={t("Compare crop suitability and yield side by side.", "फ़सल उपयुक्तता और उपज की एक साथ तुलना करें।")}
                  className="mb-4"
                />
                <CropComparisonChart
                  crops={intelligence.crops}
                  selectedCropId={selectedCrop?.crop_id ?? null}
                />
              </section>

              {/* Navigation Footer CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/history")}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-800 dark:text-slate-200 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all shadow-md cursor-pointer"
                >
                  <HistoryIcon className="h-4 w-4 text-slate-500" />
                  {t("View Historical Performance", "ऐतिहासिक प्रदर्शन देखें")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/recommendation")}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Sprout className="h-4 w-4" />
                  {t("New Recommendation", "नई फ़सल सिफारिश")}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </PageContainer>
      </div>
    </div>
  );
}
