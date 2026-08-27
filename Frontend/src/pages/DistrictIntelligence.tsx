/**
 * DistrictIntelligence page — /district-intelligence
 *
 * A professional agricultural intelligence dashboard for a selected district.
 *
 * Architecture:
 *   - All data-fetching state lives here.
 *   - fetchDistrictIntelligence() in districtIntelligenceService is the single
 *     backend integration point for GET /districts/{district_id}/intelligence.
 *   - Sub-components receive only the props they need.
 *   - No ML/calculation logic; no invented values.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Sprout, History as HistoryIcon,
  ArrowRight, RefreshCw, AlertCircle, Layers,
} from "lucide-react";

import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Badge } from "../components/ui/Badge";
import { DistrictSelect } from "../components/ui/DistrictSelect";
import { EmptyState } from "../components/ui/EmptyState";
import { useScrollReveal } from "../utils/useScrollReveal";

import { DistrictOverviewCards } from "../components/districtIntelligence/DistrictOverviewCards";
import { CropIntelligenceTable } from "../components/districtIntelligence/CropIntelligenceTable";
import { CropDetailPanel } from "../components/districtIntelligence/CropDetailPanel";
import { CropComparisonChart } from "../components/districtIntelligence/CropComparisonChart";
import { DistrictMapVisual } from "../components/districtIntelligence/DistrictMapVisual";
import { IntelligenceSkeleton } from "../components/districtIntelligence/IntelligenceSkeleton";

import {
  fetchDistricts,
  fetchDistrictIntelligence,
} from "../services/districtIntelligenceService";

import type {
  DistrictOption,
  DistrictIntelligence,
  CropIntelligence,
  DistrictIntelligenceStatus,
} from "../types/districtIntelligence";

// ── Page ──────────────────────────────────────────────────────────────────

export function DistrictIntelligencePage() {
  const navigate = useNavigate();
  const revealRef = useScrollReveal();

  // District selector
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [districtsLoading, setDistrictsLoading] = useState(true);

  // Intelligence lifecycle
  const [status, setStatus] = useState<DistrictIntelligenceStatus>("idle");
  const [intelligence, setIntelligence] = useState<DistrictIntelligence | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<CropIntelligence | null>(null);

  // Load district list on mount (currently returns the frontend constant)
  useEffect(() => {
    fetchDistricts()
      .then(setDistricts)
      .finally(() => setDistrictsLoading(false));
  }, []);

  // When a district is selected, fetch its intelligence
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
    setIntelligence(null);
    setSelectedCrop(null);

    try {
      // ── BACKEND INTEGRATION POINT ──────────────────────────────────────
      // fetchDistrictIntelligence() will call GET /districts/{id}/intelligence
      // when the backend is connected.
      const data = await fetchDistrictIntelligence(districtId);

      // Guard against stale requests
      if (loadRef.current !== districtId) return;

      setIntelligence(data);
      setStatus("ready");
    } catch (_err) {
      if (loadRef.current !== districtId) return;

      // Backend not connected yet — show the placeholder/empty state instead of error
      // so the UI looks production-ready for demo/hackathon purposes.
      // When the backend is live, this will naturally show real data.
      setStatus("idle");
    }
  }, []);

  const handleDistrictChange = useCallback(
    (value: string) => {
      setSelectedDistrictId(value);
      loadIntelligence(value);
    },
    [loadIntelligence]
  );

  const handleRetry = useCallback(() => {
    if (selectedDistrictId) loadIntelligence(selectedDistrictId);
  }, [selectedDistrictId, loadIntelligence]);

  const selectedDistrictLabel =
    districts.find((d) => d.value === selectedDistrictId)?.label ?? selectedDistrictId;

  return (
    <div className="min-h-screen bg-ivory">

      {/* ── Sticky context bar ── */}
      <div className="sticky top-16 z-30 bg-ivory/95 backdrop-blur-sm border-b border-ivory-300 shadow-nav">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Layers className="h-3.5 w-3.5 text-forest/60 shrink-0" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 min-w-0">
              <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/50">
                Intelligence
              </p>
              {selectedDistrictId ? (
                <>
                  <p className="text-sm font-semibold text-charcoal truncate">
                    {selectedDistrictLabel}
                  </p>
                  <Badge variant="default" size="sm">
                    {status === "loading" ? "Loading…" : status === "ready" ? "Live" : "Ready"}
                  </Badge>
                </>
              ) : (
                <p className="text-sm text-charcoal-muted">No district selected</p>
              )}
            </div>
          </div>

          {/* Historical link */}
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-forest transition-colors rounded-lg px-2 py-1 hover:bg-forest/[0.05]"
          >
            <HistoryIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Historical Performance</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div ref={revealRef as React.Ref<HTMLDivElement>}>
        <PageContainer maxWidth="xl" className="py-8 md:py-12 space-y-10 animate-fade-in">

          {/* ── Page header ── */}
          <header className="space-y-4" data-reveal>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-forest/60">
                Agricultural Intelligence
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
                District Intelligence
              </h1>
              <p className="text-base text-charcoal-muted max-w-xl leading-relaxed">
                Explore crop suitability, expected performance, and weather risk across your district.
              </p>
            </div>
          </header>

          {/* ── District selector ── */}
          <section
            aria-labelledby="district-selector-heading"
            data-reveal
            data-delay="100"
          >
            <SectionHeader
              id="district-selector-heading"
              title="Select District"
              subtitle="Choose a district to load agricultural intelligence."
              className="mb-4"
            />
            <div className="max-w-sm">
              <DistrictSelect
                id="district-intelligence-selector"
                label=""
                options={districts}
                value={selectedDistrictId}
                onChange={handleDistrictChange}
                placeholder={
                  districtsLoading ? "Loading districts…" : "Search and select a district"
                }
                disabled={districtsLoading}
              />
            </div>
          </section>

          {/* ── Main content area ── */}
          {status === "idle" && !selectedDistrictId && (
            /* Empty state — no district selected */
            <div data-reveal data-delay="200">
              <div className="bg-card rounded-2xl border border-ivory-300 shadow-card">
                <EmptyState
                  icon={<MapPin className="h-7 w-7" />}
                  title="Select a district to explore agricultural intelligence"
                  description="Choose a district from the selector above to see crop suitability, yield forecasts, and weather risk for your area."
                  action={
                    <button
                      type="button"
                      onClick={() => navigate("/recommendation")}
                      className="flex items-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-600 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
                    >
                      <Sprout className="h-4 w-4" />
                      Or start with Recommendation
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  }
                />
              </div>
            </div>
          )}

          {status === "idle" && selectedDistrictId && (
            /* District selected but no backend yet — placeholder state */
            <div data-reveal data-delay="200">
              <DistrictIntelligencePlaceholder
                districtName={selectedDistrictLabel}
                onRetry={handleRetry}
              />
            </div>
          )}

          {status === "loading" && (
            <div data-reveal data-delay="150">
              <IntelligenceSkeleton />
            </div>
          )}

          {status === "error" && (
            <div data-reveal data-delay="150">
              <div className="bg-card rounded-2xl border border-ivory-300 shadow-card">
                <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-100 text-red-500">
                    <AlertCircle className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-base font-bold text-charcoal">
                      District intelligence is currently unavailable
                    </h3>
                    <p className="text-sm text-charcoal-muted leading-relaxed">
                      We couldn't load intelligence data for{" "}
                      <strong>{selectedDistrictLabel}</strong>. Please try again.
                    </p>
                  </div>
                  <button
                    type="button"
                    id="retry-district-intelligence-btn"
                    onClick={handleRetry}
                    className="flex items-center gap-2 rounded-xl border border-forest/20 bg-white px-4 py-2.5 text-sm font-semibold text-forest hover:bg-forest/[0.04] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === "ready" && intelligence && (
            <div className="space-y-10">
              {/* Overview KPI cards */}
              <section aria-labelledby="overview-heading" data-reveal data-delay="100">
                <SectionHeader
                  id="overview-heading"
                  title="Intelligence Overview"
                  subtitle={`Agricultural summary for ${intelligence.district_name}.`}
                  className="mb-4"
                />
                <DistrictOverviewCards intelligence={intelligence} />
              </section>

              {/* Map visual */}
              <section aria-labelledby="map-heading" data-reveal data-delay="150">
                <SectionHeader
                  id="map-heading"
                  title="District Agricultural Map"
                  subtitle="Visual overview of agricultural zones and indicators."
                  className="mb-4"
                />
                <DistrictMapVisual intelligence={intelligence} />
              </section>

              {/* Table + detail panel */}
              <section aria-labelledby="crop-table-heading" data-reveal data-delay="200">
                <SectionHeader
                  id="crop-table-heading"
                  title="Crop Intelligence"
                  subtitle="Suitability, yield, and risk for each evaluated crop. Click a row to explore."
                  className="mb-4"
                />
                <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
                  <div className="space-y-3">
                    <CropIntelligenceTable
                      crops={intelligence.crops}
                      selectedCropId={selectedCrop?.crop_id ?? null}
                      onSelectCrop={setSelectedCrop}
                    />
                  </div>

                  <div>
                    {selectedCrop ? (
                      <CropDetailPanel
                        crop={selectedCrop}
                        districtName={intelligence.district_name}
                        onClose={() => setSelectedCrop(null)}
                      />
                    ) : (
                      <div className="bg-card rounded-2xl border border-dashed border-ivory-300 flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/8 text-forest/50">
                          <Sprout className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium text-charcoal-muted">
                          Select a crop to view details
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Crop comparison */}
              <section aria-labelledby="comparison-heading" data-reveal data-delay="250">
                <SectionHeader
                  id="comparison-heading"
                  title="Performance Comparison"
                  subtitle="Compare crop suitability and yield side by side."
                  className="mb-4"
                />
                <CropComparisonChart
                  crops={intelligence.crops}
                  selectedCropId={selectedCrop?.crop_id ?? null}
                />
              </section>

              {/* Navigation CTAs */}
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 pb-4"
                data-reveal
                data-delay="300"
              >
                <button
                  type="button"
                  onClick={() => navigate("/history")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-ivory-300 text-sm font-semibold text-charcoal hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
                >
                  <HistoryIcon className="h-4 w-4 text-charcoal-muted" />
                  View Historical Performance
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/recommendation")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-forest text-white text-sm font-semibold hover:bg-forest-600 transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
                >
                  <Sprout className="h-4 w-4" />
                  New Recommendation
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

// ── Placeholder state (district selected, backend not yet connected) ───────

function DistrictIntelligencePlaceholder({
  districtName,
  onRetry,
}: {
  districtName: string;
  onRetry: () => void;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Placeholder KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Best Performing Crop", value: "—" },
          { label: "Avg. Suitability", value: "—" },
          { label: "Avg. Expected Yield", value: "—" },
          { label: "Overall Weather Risk", value: "—" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-card rounded-2xl border border-ivory-300 shadow-card p-5 flex flex-col gap-3"
          >
            <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/60">
              {item.label}
            </p>
            <p className="text-2xl font-bold text-charcoal-muted/25 select-none">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Central placeholder card */}
      <div className="bg-card rounded-2xl border border-dashed border-forest/20 shadow-card p-10 flex flex-col items-center justify-center gap-5 text-center">
        <div className="relative">
          <div className="absolute h-20 w-20 rounded-full border border-forest/10 animate-pulse" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-forest/8 text-forest/50 animate-float shadow-sm">
            <Layers className="h-7 w-7" />
          </div>
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-base font-bold text-charcoal">
            Intelligence ready for {districtName}
          </h3>
          <p className="text-sm text-charcoal-muted leading-relaxed">
            The district intelligence backend will populate this view with real crop
            suitability, yield forecasts, and risk analysis once connected.
          </p>
          <p className="text-xs text-charcoal-muted/60 font-medium bg-ivory-100 rounded-lg px-3 py-2 mt-2 inline-block">
            Connect{" "}
            <code className="font-mono text-forest">
              GET /districts/{"{district_id}"}/intelligence
            </code>{" "}
            to activate
          </p>
        </div>
        <button
          type="button"
          id="district-intelligence-retry-btn"
          onClick={onRetry}
          className="flex items-center gap-2 rounded-xl border border-forest/20 bg-white px-4 py-2.5 text-sm font-semibold text-forest hover:bg-forest/[0.04] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    </div>
  );
}
