import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  TrendingUp,
  BarChart3,
  History,
  RefreshCw,
  AlertCircle,
  MapPin,
  HelpCircle,
} from "lucide-react";

import { PageContainer } from "../components/ui/PageContainer";
import { SectionHeader }  from "../components/ui/SectionHeader";
import { Badge }          from "../components/ui/Badge";

// Weather components — unchanged
import { CurrentWeatherCard }   from "../components/weather/CurrentWeatherCard";
import { WeatherMetricCard }    from "../components/weather/WeatherMetricCard";
import { ForecastStrip }        from "../components/weather/ForecastStrip";
import { TemperatureChart }     from "../components/weather/TemperatureChart";
import { RainfallChart }        from "../components/weather/RainfallChart";
import { WeatherInsightCard }   from "../components/weather/WeatherInsightCard";
import { CropWeatherRelevance } from "../components/weather/CropWeatherRelevance";
import { WeatherSummary }       from "../components/weather/WeatherSummary";
import { WeatherTimeline }      from "../components/weather/WeatherTimeline";

// Service layer — UI consumes this, NOT mockWeather directly
import {
  getWeatherData,
  formatFetchedAt,
  type WeatherServiceResult,
  type WeatherLoadState,
} from "../services/weatherService";

// ── Skeleton loading state ────────────────────────────────────────────────

function WeatherSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-label="Loading weather data…" role="status">
      <div className="h-48 rounded-2xl bg-ivory-200" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-ivory-200" />
        ))}
      </div>
      <div className="h-36 rounded-2xl bg-ivory-200" />
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="h-52 rounded-2xl bg-ivory-200" />
        <div className="h-52 rounded-2xl bg-ivory-200" />
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────

function WeatherError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
        <AlertCircle className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-charcoal">Weather information is currently unavailable</h2>
        <p className="text-sm text-charcoal-muted max-w-sm">
          Unable to load weather data for your farm location. Please try again.
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

// ── Weather page ──────────────────────────────────────────────────────────

export function Weather() {
  const navigate = useNavigate();

  const [loadState, setLoadState]   = useState<WeatherLoadState>("idle");
  const [result, setResult]         = useState<WeatherServiceResult | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setLoadState("loading");
    }
    try {
      const res = await getWeatherData();
      setResult(res);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => load(true);

  // ── Render gates ─────────────────────────────────────────────────────
  if (loadState === "loading" || loadState === "idle") {
    return (
      <div className="min-h-screen bg-ivory">
        <PageContainer maxWidth="xl" className="py-8 md:py-12">
          <WeatherSkeleton />
        </PageContainer>
      </div>
    );
  }

  if (loadState === "error" || !result) {
    return (
      <div className="min-h-screen bg-ivory">
        <PageContainer maxWidth="xl" className="py-8 md:py-12">
          <WeatherError onRetry={() => load()} />
        </PageContainer>
      </div>
    );
  }

  const { data, tempSeries, rainfallSeries, fetchedAt } = result;

  // ── Rainfall insight — derived, no fabrication ────────────────────────
  const maxRain     = Math.max(...data.forecast.map((d) => d.rainfall_mm));
  const rainyDays   = data.forecast.filter((d) => d.rainfall_mm > 0).length;
  const rainfallInsight = rainyDays >= 3
    ? `Rainfall is expected on ${rainyDays} of the next ${data.forecast.length} forecast days.`
    : rainyDays === 0
    ? "No significant rainfall is expected in the current forecast window."
    : `Rainfall is expected on ${rainyDays} day(s) in the current forecast window.`;

  return (
    <div className="min-h-screen bg-ivory">

      {/* ── Sticky context bar ── */}
      <div className="sticky top-16 z-30 bg-ivory/95 backdrop-blur-sm border-b border-ivory-300 shadow-nav">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-forest/60 shrink-0" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 min-w-0">
              <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/50">Farm</p>
              <p className="text-sm font-semibold text-charcoal truncate">{data.location}</p>
              <Badge variant="default" size="sm">{data.season}</Badge>
              <Badge variant="success" size="sm">{data.recommended_crop}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* As of time */}
            <p className="hidden sm:block text-2xs text-charcoal-muted/50">
              As of {formatFetchedAt(fetchedAt)}
            </p>
            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-forest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20 rounded disabled:opacity-50"
              aria-label="Refresh weather data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <PageContainer maxWidth="xl" className="py-8 md:py-12 space-y-14 animate-fade-in">

        {/* ── PAGE HEADER ── */}
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-forest/60">
              Weather Intelligence
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
              Understand the conditions around your farm.
            </h1>
            <p className="text-base text-charcoal-muted max-w-xl leading-relaxed">
              Current and forecast weather signals provide additional context for your crop recommendation.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral" size="sm">{data.location}</Badge>
            <Badge variant="default" size="sm">{data.season}</Badge>
            <Badge variant="success" size="sm">{data.recommended_crop}</Badge>
          </div>
        </div>

        {/* ── Section 1: Current Weather Hero ── */}
        <section aria-labelledby="current-heading">
          <h2 id="current-heading" className="sr-only">Current Weather</h2>
          <CurrentWeatherCard data={data} />
          {/* Screen-reader accessible summary */}
          <p className="sr-only">
            Current temperature is {data.current.temperature_c}°C with {data.current.condition}.
            Humidity is {data.current.humidity_percent}%, rainfall is {data.current.rainfall_mm}mm,
            and wind speed is {data.current.wind_kmh} km/h.
            Weather compatibility for {data.recommended_crop} is {data.weather_compatibility}.
          </p>
        </section>

        {/* ── Section 2: Metric Cards ── */}
        <section aria-labelledby="metrics-heading" className="space-y-4">
          <SectionHeader id="metrics-heading" title="Weather Metrics" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <WeatherMetricCard
              icon={<Thermometer className="h-4 w-4" />}
              label="Temperature"
              value={String(data.current.temperature_c)}
              unit="°C"
              context="Current air temperature"
            />
            <WeatherMetricCard
              icon={<Droplets className="h-4 w-4" />}
              label="Humidity"
              value={String(data.current.humidity_percent)}
              unit="%"
              context="Relative atmospheric humidity"
            />
            <WeatherMetricCard
              icon={<CloudRain className="h-4 w-4" />}
              label="Rainfall"
              value={String(data.current.rainfall_mm)}
              unit="mm"
              context="Recent / expected precipitation"
            />
            <WeatherMetricCard
              icon={<Wind className="h-4 w-4" />}
              label="Wind Speed"
              value={String(data.current.wind_kmh)}
              unit="km/h"
              context="Current surface wind speed"
            />
          </div>
        </section>

        {/* ── Section 3: 5-Day Forecast ── */}
        <section aria-labelledby="forecast-heading" className="space-y-4">
          <SectionHeader
            id="forecast-heading"
            title="5-Day Forecast"
            subtitle="Upcoming weather conditions for the selected location."
          />
          <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6">
            <ForecastStrip forecast={data.forecast} />
          </div>
          <p className="sr-only">
            {data.forecast.map((d) =>
              `${d.day}: High ${d.high_c}°C, Low ${d.low_c}°C, Rainfall ${d.rainfall_mm}mm, ${d.condition}.`
            ).join(" ")}
          </p>
        </section>

        {/* ── Section 4: Weather Timeline ── */}
        <section aria-labelledby="timeline-heading" className="space-y-4">
          <SectionHeader
            id="timeline-heading"
            title="Weather Timeline"
            subtitle="How conditions are expected to evolve."
          />
          <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6">
            <WeatherTimeline forecast={data.forecast} />
          </div>
        </section>

        {/* ── Section 5: Charts ── */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <section aria-labelledby="temp-chart-heading" className="space-y-4">
            <SectionHeader
              id="temp-chart-heading"
              title="Temperature Trend"
              subtitle="Forecast high temperatures over the coming days."
            />
            <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6 space-y-3">
              <TemperatureChart series={tempSeries} />
              <p className="text-2xs text-charcoal-muted/50">
                Illustrative temperature data. Actual values subject to change.
              </p>
              <p className="sr-only">
                Temperature trend: {tempSeries.map((d) => `${d.label} ${d.value}°C`).join(", ")}.
              </p>
            </div>
          </section>

          <section aria-labelledby="rain-chart-heading" className="space-y-4">
            <SectionHeader
              id="rain-chart-heading"
              title="Rainfall Outlook"
              subtitle="Expected precipitation across the forecast period."
            />
            <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6 space-y-3">
              <RainfallChart series={rainfallSeries} />
              <p className="text-2xs text-charcoal-muted/50">
                Forecast rainfall is distributed across the upcoming period.
              </p>
              <p className="sr-only">
                Rainfall outlook: {rainfallSeries.map((d) => `${d.label} ${d.value}mm`).join(", ")}.
                Peak rainfall: {maxRain}mm.
              </p>
            </div>
          </section>
        </div>

        {/* ── Section 6: Weather Insight ── */}
        <section aria-labelledby="insight-heading" className="space-y-4">
          <SectionHeader
            id="insight-heading"
            title="Weather Insight"
            subtitle="Derived from the current forecast data."
          />
          <div className="bg-white rounded-2xl border border-forest/10 shadow-card px-5 py-4">
            <p className="text-sm text-charcoal-muted leading-relaxed">{rainfallInsight}</p>
          </div>
        </section>

        {/* ── Section 7: Weather Signals ── */}
        <section aria-labelledby="signals-heading" className="space-y-4">
          <SectionHeader
            id="signals-heading"
            title="Weather Signals"
            subtitle="Contextual observations from the current and forecast data."
          />
          <div className="grid sm:grid-cols-3 gap-4">
            <WeatherInsightCard
              icon={<Thermometer className="h-5 w-5" />}
              title="Temperature"
              description="Temperatures remain within the current forecast range across the coming days."
            />
            <WeatherInsightCard
              icon={<CloudRain className="h-5 w-5" />}
              title="Rainfall"
              description="Rainfall is expected across multiple forecast days, providing moderate precipitation."
            />
            <WeatherInsightCard
              icon={<Droplets className="h-5 w-5" />}
              title="Humidity"
              description="Humidity remains elevated in the current conditions, consistent with the Kharif season."
            />
          </div>
        </section>

        {/* ── Section 8: Crop Weather Relevance ── */}
        <section aria-labelledby="crop-rel-heading" className="space-y-4">
          <SectionHeader
            id="crop-rel-heading"
            title={`Weather Relevance for ${data.recommended_crop}`}
            subtitle="How current and forecast conditions relate to the recommended crop."
          />
          <CropWeatherRelevance data={data} />
        </section>

        {/* ── Section 9: Weather Summary ── */}
        <section aria-labelledby="summary-heading" className="space-y-4">
          <SectionHeader id="summary-heading" title="Weather Summary" />
          <WeatherSummary data={data} />
        </section>

        {/* ── Section 10: How weather fits into recommendation ── */}
        <section aria-labelledby="fit-heading" className="space-y-4">
          <SectionHeader
            id="fit-heading"
            title="How weather fits into your recommendation"
            subtitle="Weather is one signal among several — not the sole driver."
          />
          <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6 space-y-5">
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Weather is one of the supporting signals considered alongside predicted yield and
              historical agricultural performance.
            </p>
            <div className="space-y-2">
              {[
                {
                  icon:      <TrendingUp className="h-4 w-4" />,
                  label:     "Predicted Yield",
                  role:      "PRIMARY RANKING SIGNAL",
                  roleClass: "text-forest",
                  bg:        "bg-forest/[0.04] border-forest/12",
                },
                {
                  icon:      <CloudRain className="h-4 w-4" />,
                  label:     "Weather",
                  role:      "SUPPORTING EVIDENCE",
                  roleClass: "text-charcoal-muted",
                  bg:        "bg-ivory-100 border-ivory-200",
                },
                {
                  icon:      <BarChart3 className="h-4 w-4" />,
                  label:     "Historical Performance",
                  role:      "SUPPORTING EVIDENCE",
                  roleClass: "text-charcoal-muted",
                  bg:        "bg-ivory-100 border-ivory-200",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${item.bg}`}
                >
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
            {/* CTA to explainability */}
            <button
              type="button"
              onClick={() => navigate("/explain")}
              className="flex items-center gap-1.5 text-xs font-bold text-forest hover:underline focus-visible:outline-none group"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Why this crop?
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </section>

        {/* ── Navigation footer ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 pb-4">
          <button
            type="button"
            onClick={() => navigate("/results")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-ivory-300 text-sm font-semibold text-charcoal hover:border-forest/30 hover:bg-forest/[0.02] transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" />
            View Recommendation
          </button>
          <button
            type="button"
            onClick={() => navigate("/explain")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-forest text-white text-sm font-semibold hover:bg-forest-600 transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
          >
            <HelpCircle className="h-4 w-4" />
            Why This Crop?
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Secondary nav */}
        <div className="flex flex-wrap justify-center gap-3 pb-4">
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-xs font-semibold text-charcoal shadow-sm hover:border-forest/30 hover:bg-forest/[0.02] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
          >
            <History className="h-3.5 w-3.5 text-forest/60" />
            Historical Performance
          </button>
          <button
            type="button"
            onClick={() => navigate("/comparison")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-xs font-semibold text-charcoal shadow-sm hover:border-forest/30 hover:bg-forest/[0.02] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
          >
            <BarChart3 className="h-3.5 w-3.5 text-forest/60" />
            Compare Crops
          </button>
          <button
            type="button"
            onClick={() => navigate("/recommendation")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-xs font-semibold text-charcoal shadow-sm hover:border-forest/30 hover:bg-forest/[0.02] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-forest/60" />
            New Recommendation
          </button>
        </div>

      </PageContainer>
    </div>
  );
}
