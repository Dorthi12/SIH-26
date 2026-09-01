import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sprout, CloudSun, History, GitCompare, HelpCircle,
  ArrowRight, TrendingUp, MapPin, Droplets, RefreshCw,
  AlertCircle, Sparkles, Leaf, Wheat, ThermometerSun,
  BarChart3, ShieldCheck, Zap, Wind, BookOpen, BrainCircuit,FileText
} from "lucide-react";

import { useRecommendation } from "../context/RecommendationContext";
import { SuitabilityMiniGauge } from "../components/dashboard/RecommendationSpotlight";

import {
  getDashboardData,
  getDashboardInsight,
  getFarmStatus,
  type DashboardData,
  type DashboardLoadState,
} from "../services/dashboardService";

/* ── helpers ───────────────────────────────────────────────────────────────── */

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/* ── Skeleton ──────────────────────────────────────────────────────────────── */

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading dashboard…">
      <div className="h-48 rounded-3xl skeleton-shimmer" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl skeleton-shimmer" />)}
      </div>
      <div className="h-64 rounded-3xl skeleton-shimmer" />
      <div className="grid sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl skeleton-shimmer" />)}
      </div>
    </div>
  );
}

/* ── Error ─────────────────────────────────────────────────────────────────── */

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
        <AlertCircle className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-charcoal">Couldn't load farm intelligence</h2>
        <p className="text-sm text-charcoal-muted max-w-sm">Please try again.</p>
      </div>
      <button type="button" onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white text-sm font-semibold hover:bg-forest-600 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2">
        <RefreshCw className="h-4 w-4" /> Try Again
      </button>
    </div>
  );
}

/* ── Empty (no recommendation yet) ────────────────────────────────────────── */

function DashboardEmpty({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 text-center px-4">
      {/* Illustrated empty hero */}
      <div className="relative">
        <div className="absolute -inset-6 rounded-full bg-forest/5 animate-pulse" style={{ animationDuration: "3s" }} />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-forest to-olive shadow-card-glow">
          <Sprout className="h-14 w-14 text-white" strokeWidth={1.5} />
          <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 shadow-sm animate-float">
            <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
        </div>
      </div>
      <div className="space-y-3 max-w-md">
        <h1 className="text-3xl font-bold text-charcoal tracking-tight">Ready to Analyse Your Farm</h1>
        <p className="text-base text-charcoal-muted leading-relaxed">
          Enter your farm location, season, and area to receive an AI-powered crop recommendation with full evidence and weather analysis.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onStart}
          className="group flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-forest text-white font-bold hover:bg-forest-600 transition-all shadow-md hover:shadow-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2">
          <Sprout className="h-5 w-5" />
          Get Crop Recommendation
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {["Weather Analysis", "Historical Yield Data", "Government Schemes", "AI Explainability"].map((f) => (
          <span key={f} className="text-xs font-medium text-forest/70 bg-forest/[0.06] border border-forest/10 rounded-full px-3 py-1">{f}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Mini sparkline bar chart ──────────────────────────────────────────────── */

function SparkBars({ values, color = "bg-forest" }: { values: number[]; color?: string }) {
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div key={i} className={`flex-1 rounded-sm ${color} transition-all`}
          style={{ height: `${Math.max(15, (v / max) * 100)}%`, opacity: i === values.length - 1 ? 1 : 0.45 + i * 0.12 }} />
      ))}
    </div>
  );
}

/* ── Stat card ─────────────────────────────────────────────────────────────── */

function StatCard({
  icon, label, value, unit, sub, color = "forest", onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  color?: "forest" | "amber" | "olive" | "sky";
  onClick?: () => void;
}) {
  const bg = { forest: "bg-forest/[0.08] text-forest", amber: "bg-amber-400/10 text-amber-600", olive: "bg-olive/[0.08] text-olive-600", sky: "bg-sky-100 text-sky-600" }[color];
  const ring = { forest: "hover:ring-forest/20", amber: "hover:ring-amber-400/20", olive: "hover:ring-olive/20", sky: "hover:ring-sky-300/20" }[color];
  return (
    <button type="button" onClick={onClick}
      className={`group text-left flex flex-col gap-3 rounded-2xl border border-ivory-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-card ring-1 ring-transparent ${ring} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2 active:scale-[0.98] w-full`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} transition-all group-hover:scale-110`}>
        {icon}
      </div>
      <div>
        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-charcoal-muted/60 mb-0.5">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-charcoal tabular-nums">{value}</span>
          {unit && <span className="text-sm font-medium text-charcoal-muted">{unit}</span>}
        </div>
        {sub && <p className="text-xs text-charcoal-muted mt-0.5">{sub}</p>}
      </div>
    </button>
  );
}

/* ── Crop rank row ─────────────────────────────────────────────────────────── */

function CropRankRow({ rank, name, score, yield_, isTop }: { rank: number; name: string; score: number; yield_: number; isTop: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${isTop ? "bg-forest/[0.06]" : "hover:bg-ivory-100"}`}>
      <span className={`w-5 text-xs font-bold tabular-nums ${isTop ? "text-forest" : "text-charcoal-muted/60"}`}>#{rank}</span>
      <span className={`flex-1 text-sm font-semibold ${isTop ? "text-charcoal" : "text-charcoal-muted"}`}>{name}</span>
      <div className="w-24 h-1.5 rounded-full bg-ivory-200 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${isTop ? "bg-gradient-to-r from-forest to-olive" : "bg-charcoal/20"}`}
          style={{ width: `${score}%` }} />
      </div>
      <span className={`w-12 text-right text-xs font-bold tabular-nums ${isTop ? "text-forest" : "text-charcoal-muted/70"}`}>{yield_} t</span>
    </div>
  );
}

/* ── Intelligence nav card ─────────────────────────────────────────────────── */

function NavCard({ icon, title, desc, route, accent }: { icon: React.ReactNode; title: string; desc: string; route: string; accent: string }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(route)}
      className="group text-left flex gap-4 items-start rounded-2xl border border-ivory-200 bg-white p-5 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2 active:scale-[0.98]">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent} transition-all group-hover:scale-105`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-charcoal leading-tight">{title}</p>
        <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">{desc}</p>
        <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-forest group-hover:gap-1.5 transition-all">
          Explore <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </button>
  );
}

/* ── Main Dashboard ────────────────────────────────────────────────────────── */

export function Dashboard() {
  const navigate = useNavigate();
  const { farmerInput } = useRecommendation();

  const [loadState, setLoadState] = useState<DashboardLoadState>("idle");
  const [data, setData] = useState<DashboardData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    else setLoadState("loading");
    try {
      const farm = farmerInput
        ? { district: farmerInput.district, season: farmerInput.season, acres: farmerInput.land_area_acres }
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

  /* ── Loading ── */
  if (loadState === "loading" || loadState === "idle") {
    return (
      <div className="min-h-screen bg-ivory px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <Skeleton />
      </div>
    );
  }

  /* ── Error ── */
  if (loadState === "error") {
    return (
      <div className="min-h-screen bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardError onRetry={() => load()} />
        </div>
      </div>
    );
  }

  /* ── Empty ── */
  if (!data) {
    return (
      <div className="min-h-screen bg-ivory">
        <DashboardEmpty onStart={() => navigate("/recommendation")} />
      </div>
    );
  }

  const { farm, topCrop, rankings, weather, topHistory, latestYield } = data;
  const insight = getDashboardInsight(data);
  const farmStatus = getFarmStatus(data);

  const yieldSparkValues = topHistory.yearlyYield.map((y) => y.yield_t_per_ha);
  const tempSparkValues = (weather.forecast ?? []).slice(0, 7).map((f) => f.temp_c);

  return (
    <div className="min-h-screen bg-[#f5f3ef] dark:bg-[#0f1714]">

      {/* ── Sticky context bar ── */}
      <div className="sticky top-0 z-30 bg-ivory/95 dark:bg-[#101815]/95 backdrop-blur border-b border-ivory-300 dark:border-[#26362f]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-forest/60 shrink-0" />
            <span className="text-sm font-semibold text-charcoal truncate">{farm.district}</span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-forest/[0.08] border border-forest/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-forest">{farm.season}</span>
            <span className="hidden sm:inline text-[0.65rem] font-medium text-charcoal-muted/60">{farm.acres} ac</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={() => load(true)} disabled={isRefreshing}
              className="flex items-center gap-1.5 text-xs font-medium text-charcoal-muted hover:text-forest transition-colors focus-visible:outline-none disabled:opacity-50" aria-label="Refresh">
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button type="button" onClick={() => navigate("/recommendation")}
              className="flex items-center gap-1.5 rounded-xl border border-forest/20 bg-white px-3 py-1.5 text-xs font-bold text-forest shadow-sm hover:bg-forest/[0.04] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2">
              <Sprout className="h-3.5 w-3.5" /> New Recommendation
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ═══════════════════════════════════
            1. HERO BANNER
        ═══════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest via-forest-700 to-olive text-white">
          {/* grid lines background */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice" aria-hidden>
            {[...Array(12)].map((_, i) => <line key={i} x1={i * 72} y1={0} x2={i * 72} y2={200} stroke="white" strokeWidth="0.6" />)}
            {[...Array(6)].map((_, i) => <line key={i + 12} x1={0} y1={i * 40} x2={800} y2={i * 40} stroke="white" strokeWidth="0.6" />)}
          </svg>
          {/* floating ambient orbs */}
          <div className="absolute top-[-40px] right-[-40px] h-56 w-56 rounded-full bg-white/[0.04] blur-2xl pointer-events-none" />
          <div className="absolute bottom-[-20px] left-[20%] h-32 w-32 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />

          <div className="relative px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row md:items-center gap-8">
            {/* Left: greeting + crop */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <Leaf className="h-5 w-5 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60">{greet()}</p>
                  <p className="text-sm font-semibold text-white/90">AgriSense Dashboard</p>
                </div>
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                  Your farm intelligence<br className="hidden sm:block" /> at a glance.
                </h1>
                <p className="mt-2 text-white/70 text-base leading-relaxed max-w-md">
                  Monitor the signals behind your {topCrop.crop} recommendation for {farm.district.split(",")[0]}.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {farmStatus.map((s) => (
                  <span key={s.label} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    {s.label}: {s.status}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button type="button" onClick={() => navigate("/results")}
                  className="group inline-flex items-center gap-2 rounded-xl bg-white text-forest px-5 py-2.5 text-sm font-bold shadow-md hover:bg-ivory transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
                  View Recommendation
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button type="button" onClick={() => navigate("/recommendation")}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 text-white px-5 py-2.5 text-sm font-semibold hover:bg-white/15 transition-all active:scale-[0.97] focus-visible:outline-none">
                  <Sprout className="h-4 w-4" /> New Recommendation
                </button>
              </div>
            </div>

            {/* Right: recommendation spotlight mini-card */}
            <div className="shrink-0 w-full md:w-72">
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-white/60">Top Recommendation</p>
                  <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 text-[0.65rem] font-bold text-amber-300 uppercase tracking-wide">Ranked #1</span>
                </div>
                <div className="flex items-center gap-4">
                  <SuitabilityMiniGauge score={topCrop.suitability_score} size={80} />
                  <div>
                    <p className="text-2xl font-bold text-white">{topCrop.crop}</p>
                    <p className="text-xs text-white/60 mt-0.5">Suitability {topCrop.suitability_score}/100</p>
                    <p className="text-lg font-bold text-amber-300 mt-1 tabular-nums">{topCrop.predicted_yield_t_per_ha} t/ha</p>
                    <p className="text-[0.65rem] text-white/50 font-medium">Predicted Yield</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white/8 px-2.5 py-2">
                    <p className="text-[0.6rem] text-white/50 uppercase tracking-wider">Stability</p>
                    <p className="text-sm font-bold text-white">{topCrop.historical_stability}</p>
                  </div>
                  <div className="rounded-lg bg-white/8 px-2.5 py-2">
                    <p className="text-[0.6rem] text-white/50 uppercase tracking-wider">Trend</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-400" />
                      <p className="text-sm font-bold text-white">{topCrop.yield_trend}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            2. KEY METRICS ROW
        ═══════════════════════════════════ */}
        <section aria-label="Key metrics" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<ThermometerSun className="h-5 w-5" strokeWidth={1.5} />}
            label="Temperature"
            value={weather.temperature_c}
            unit="°C"
            sub={weather.condition}
            color="amber"
            onClick={() => navigate("/weather")}
          />
          <StatCard
            icon={<BarChart3 className="h-5 w-5" strokeWidth={1.5} />}
            label="Latest Yield"
            value={latestYield}
            unit="t/ha"
            sub={`↑ ${topHistory.trend}`}
            color="forest"
            onClick={() => navigate("/history")}
          />
          <StatCard
            icon={<Droplets className="h-5 w-5" strokeWidth={1.5} />}
            label="Humidity"
            value={weather.humidity_percent ?? 72}
            unit="%"
            sub="Relative humidity"
            color="sky"
            onClick={() => navigate("/weather")}
          />
          <StatCard
            icon={<MapPin className="h-5 w-5" strokeWidth={1.5} />}
            label="Farm Area"
            value={farm.acres}
            unit="ac"
            sub={farm.district.split(",")[0]}
            color="olive"
            onClick={() => navigate("/recommendation")}
          />
        </section>

        {/* ═══════════════════════════════════
            3. MIDDLE ROW — Crop Rankings + Trend Chart
        ═══════════════════════════════════ */}
        <section className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">

          {/* Crop Rankings card */}
          <div className="rounded-3xl border border-ivory-200 bg-white shadow-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-charcoal">Crop Rankings</h2>
                <p className="text-xs text-charcoal-muted mt-0.5">All candidates ranked by suitability</p>
              </div>
              <button type="button" onClick={() => navigate("/comparison")}
                className="inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline focus-visible:outline-none">
                Compare All <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {[...rankings].sort((a, b) => a.rank - b.rank).map((c) => (
                <CropRankRow key={c.crop} rank={c.rank} name={c.crop}
                  score={c.suitability_score} yield_={c.predicted_yield_t_per_ha} isTop={c.rank === 1} />
              ))}
            </div>
            <div className="pt-3 border-t border-ivory-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-forest shrink-0" />
              <p className="text-xs text-charcoal-muted leading-relaxed">
                <span className="font-semibold text-charcoal">{topCrop.crop}</span> leads with {topCrop.suitability_score}/100 suitability — {topCrop.historical_stability.toLowerCase()} historical stability, {topCrop.yield_trend.toLowerCase()} yield trend.
              </p>
            </div>
          </div>

          {/* Historical trend + weather snapshot */}
          <div className="space-y-4">
            {/* Yield trend card */}
            <div className="rounded-3xl border border-ivory-200 bg-white shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-charcoal">Yield Trend</h2>
                  <p className="text-xs text-charcoal-muted">{topCrop.crop} — last 5 years</p>
                </div>
                <button type="button" onClick={() => navigate("/history")}
                  className="text-xs font-bold text-forest hover:underline flex items-center gap-1 focus-visible:outline-none">
                  History <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <SparkBars values={yieldSparkValues} color="bg-forest" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-charcoal-muted">{topHistory.yearlyYield[0].year} — {topHistory.yearlyYield[0].yield_t_per_ha} t/ha</span>
                <span className="font-bold text-forest">Now — {latestYield} t/ha ↑</span>
              </div>
            </div>

            {/* Weather snapshot card */}
            <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-charcoal">5-Day Forecast</h2>
                  <p className="text-xs text-charcoal-muted">{farm.district.split(",")[0]}</p>
                </div>
                <button type="button" onClick={() => navigate("/weather")}
                  className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 focus-visible:outline-none">
                  Full View <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              {tempSparkValues.length > 0 && (
                <SparkBars values={tempSparkValues} color="bg-amber-400" />
              )}
              <div className="flex items-center gap-3">
                <CloudSun className="h-5 w-5 text-amber-500" strokeWidth={1.5} />
                <div>
                  <span className="text-2xl font-bold text-charcoal tabular-nums">{weather.temperature_c}°C</span>
                  <span className="text-sm text-charcoal-muted ml-2">{weather.condition}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/60 backdrop-blur-sm px-3 py-2">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wide text-amber-700/60">Compatibility</p>
                  <p className="text-sm font-bold text-charcoal">{topCrop.weather_compatibility}</p>
                </div>
                <div className="rounded-xl bg-white/60 backdrop-blur-sm px-3 py-2">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wide text-amber-700/60">Wind</p>
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3 text-amber-600" />
                    <p className="text-sm font-bold text-charcoal">12 km/h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════
            4. AGRI INSIGHT BANNER
        ═══════════════════════════════════ */}
        <section className="rounded-3xl border border-forest/10 bg-gradient-to-r from-forest/[0.04] via-white to-olive/[0.04] p-6 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/[0.08] text-forest">
            <Zap className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-forest/60 mb-1">Current Signal</p>
            <p className="text-sm text-charcoal leading-relaxed">{insight}</p>
          </div>
          <button type="button" onClick={() => navigate("/explain")}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-forest/20 bg-white px-3.5 py-2 text-xs font-bold text-forest hover:bg-forest/[0.04] transition-all shadow-sm focus-visible:outline-none">
            Why This Crop? <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>

        {/* ═══════════════════════════════════
            5. INTELLIGENCE CENTER
        ═══════════════════════════════════ */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-charcoal">Farm Intelligence</h2>
            <p className="text-sm text-charcoal-muted mt-0.5">Explore the full depth of your recommendation.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NavCard icon={<BrainCircuit className="h-5 w-5 text-forest" strokeWidth={1.5} />}
              title="AI Agricultural Assistant"
              desc="Ask questions about crop suitability, yield optimization, weather risks, and farming decisions in Hindi, English or Hinglish."
              route="/assistant"
              accent="bg-forest/[0.08] text-forest" />
            <NavCard icon={<Wheat className="h-5 w-5 text-amber-600" strokeWidth={1.5} />}
              title="Crop Recommendation"
              desc="Explore your current crop ranking, suitability scores, and the evidence behind each recommendation."
              route="/results"
              accent="bg-amber-400/10 text-amber-600" />
            <NavCard icon={<CloudSun className="h-5 w-5 text-sky-600" strokeWidth={1.5} />}
              title="Weather Intelligence"
              desc="Monitor current conditions, 5-day forecast, and weather impact on your farm context."
              route="/weather"
              accent="bg-sky-100 text-sky-600" />
            <NavCard icon={<History className="h-5 w-5 text-olive-600" strokeWidth={1.5} />}
              title="Historical Performance"
              desc="Explore historical crop yields, long-term trends and year-on-year stability patterns."
              route="/history"
              accent="bg-olive/[0.08] text-olive-600" />
            <NavCard
              icon={<GitCompare className="h-5 w-5 text-forest" strokeWidth={1.5} />}
              title="Crop Comparison"
              desc="Compare all candidate crops side-by-side across predicted yield, weather fit, and historical signals."
              route="/comparison"
              accent="bg-forest/[0.06] text-forest"
            />

            <NavCard
              icon={<FileText className="h-5 w-5 text-red-600" strokeWidth={1.5} />}
              title="Complaints"
              desc="Report an issue, view all complaints, or track the complaints you have submitted."
              route="/complaints"
              accent="bg-red-50 text-red-600"
            />

            <NavCard
              icon={<HelpCircle className="h-5 w-5 text-charcoal-muted" strokeWidth={1.5} />}
              title="Why This Crop?"
              desc="Understand how AgriSense arrived at this recommendation — signals, evidence, and the decision flow."
              route="/explain"
              accent="bg-charcoal/[0.06] text-charcoal-muted"
            />
          </div>
        </section>

        {/* ═══════════════════════════════════
            6. QUICK ACTIONS + COMING SOON
        ═══════════════════════════════════ */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Quick actions */}
          {[
            { icon: <Sprout className="h-5 w-5" strokeWidth={1.5} />, label: "New Recommendation", route: "/recommendation", primary: true },
            { icon: <BookOpen className="h-5 w-5" strokeWidth={1.5} />, label: "Government Schemes", route: "/assistant", primary: false },
            { icon: <Sparkles className="h-5 w-5" strokeWidth={1.5} />, label: "Scenario Simulator", route: "/scenarios", primary: false },
          ].map((a) => (
            <button key={a.label} type="button" onClick={() => navigate(a.route)}
              className={`group flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2 active:scale-[0.98]
                ${a.primary
                  ? "border-forest bg-forest text-white hover:bg-forest-600 shadow-md"
                  : "border-ivory-300 bg-white text-charcoal hover:border-forest/30 hover:shadow-card shadow-sm"}`}>
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${a.primary ? "bg-white/15" : "bg-forest/[0.07] text-forest group-hover:bg-forest group-hover:text-white"}`}>
                {a.icon}
              </span>
              <span className="flex-1 text-left">{a.label}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </section>

        {/* ═══════════════════════════════════
            7. BOTTOM CTA STRIP
        ═══════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-forest-800 via-forest to-olive text-white px-8 py-10 text-center">
          <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none" viewBox="0 0 600 140" preserveAspectRatio="xMidYMid slice" aria-hidden>
            {[...Array(9)].map((_, i) => <line key={i} x1={i * 70} y1={0} x2={i * 70} y2={140} stroke="white" strokeWidth="0.8" />)}
            {[...Array(4)].map((_, i) => <line key={i + 9} x1={0} y1={i * 40} x2={600} y2={i * 40} stroke="white" strokeWidth="0.8" />)}
          </svg>
          <div className="relative space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold">Ready to explore another crop decision?</h2>
            <p className="text-sm text-white/70 max-w-md mx-auto">
              Start a new recommendation using your farm location, season and land area.
            </p>
            <button type="button" onClick={() => navigate("/recommendation")}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-white text-forest text-sm font-bold hover:bg-ivory transition-all shadow-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-forest group">
              Start New Recommendation
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
