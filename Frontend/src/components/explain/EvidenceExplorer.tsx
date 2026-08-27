import { useState } from "react";
import { cn } from "../../utils/cn";
import type { CropRecommendation } from "../../types/recommendation";
import type { CropHistoricalData } from "../../data/mockHistoricalData";
import type { WeatherDataset } from "../../data/mockWeather";
import { Badge } from "../ui/Badge";
import { TrendingUp, CloudSun, BarChart3 } from "lucide-react";

type TabKey = "yield" | "historical" | "weather";

interface EvidenceExplorerProps {
  rankings: CropRecommendation[];
  topCrop: CropRecommendation;
  history: CropHistoricalData;
  weather: WeatherDataset;
}

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "yield",      label: "Predicted Yield", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { key: "historical", label: "Historical",       icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { key: "weather",    label: "Weather",          icon: <CloudSun className="h-3.5 w-3.5" /> },
];

export function EvidenceExplorer({ rankings, topCrop, history, weather }: EvidenceExplorerProps) {
  const [active, setActive] = useState<TabKey>("yield");
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  const next = sorted[1];

  return (
    <div className="bg-white rounded-2xl border border-ivory-300 shadow-card overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-ivory-200 bg-ivory-50" role="tablist" aria-label="Evidence explorer">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            aria-controls={`panel-${tab.key}`}
            id={`tab-${tab.key}`}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-semibold transition-all duration-150 border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-inset",
              active === tab.key
                ? "border-forest text-forest bg-white"
                : "border-transparent text-charcoal-muted hover:text-charcoal hover:bg-white/60"
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="p-5 md:p-6">

        {/* ── Predicted Yield ── */}
        <div
          id="panel-yield"
          role="tabpanel"
          aria-labelledby="tab-yield"
          hidden={active !== "yield"}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-forest/15 bg-forest/[0.04] px-4 py-3 text-center">
                <p className="text-xs font-semibold text-charcoal mb-1">{topCrop.crop}</p>
                <p className="text-2xl font-bold text-forest tabular-nums">{topCrop.predicted_yield_t_per_ha}</p>
                <p className="text-xs text-charcoal-muted">t/ha</p>
                <Badge variant="default" size="sm" className="mt-2">Top Pick</Badge>
              </div>
              <div className="rounded-xl border border-ivory-200 bg-white px-4 py-3 text-center opacity-70">
                <p className="text-xs font-semibold text-charcoal mb-1">{next.crop} (next best)</p>
                <p className="text-2xl font-bold text-charcoal tabular-nums">{next.predicted_yield_t_per_ha}</p>
                <p className="text-xs text-charcoal-muted">t/ha</p>
              </div>
            </div>
            <div className="rounded-xl bg-ivory-100 border border-ivory-200 px-4 py-2.5 text-xs text-charcoal-muted">
              Difference: <strong className="text-charcoal">{(topCrop.predicted_yield_t_per_ha - next.predicted_yield_t_per_ha).toFixed(1)} t/ha</strong> in favour of {topCrop.crop}.
            </div>
            <div className="space-y-1.5">
              {sorted.map((c) => (
                <div key={c.crop} className="flex items-center gap-3">
                  <span className="w-20 text-xs font-semibold text-charcoal-light">{c.crop}</span>
                  <div className="flex-1 h-2 rounded-full bg-ivory-200 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", c.crop === topCrop.crop ? "bg-forest" : "bg-olive/40")}
                      style={{ width: `${(c.predicted_yield_t_per_ha / topCrop.predicted_yield_t_per_ha) * 100}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-xs font-semibold tabular-nums text-charcoal-muted">{c.predicted_yield_t_per_ha} t/ha</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Historical ── */}
        <div
          id="panel-historical"
          role="tabpanel"
          aria-labelledby="tab-historical"
          hidden={active !== "historical"}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-ivory-200 px-4 py-3">
                <p className="text-xs text-charcoal-muted/60 mb-0.5">Latest Yield</p>
                <p className="text-xl font-bold text-forest tabular-nums">{history.yearlyYield[history.yearlyYield.length - 1].yield_t_per_ha} t/ha</p>
              </div>
              <div className="rounded-xl border border-ivory-200 px-4 py-3">
                <p className="text-xs text-charcoal-muted/60 mb-0.5">Trend</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <TrendingUp className="h-4 w-4 text-forest" />
                  <Badge variant="success" size="sm">{history.trend}</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-0">
              {history.yearlyYield.map((d) => (
                <div key={d.year} className="flex items-center gap-3 py-2 border-b border-ivory-200 last:border-0">
                  <span className="text-xs font-semibold text-charcoal-muted w-10 shrink-0">{d.year}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-ivory-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-forest/60"
                      style={{ width: `${(d.yield_t_per_ha / history.yearlyYield[history.yearlyYield.length - 1].yield_t_per_ha) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-charcoal tabular-nums w-16 text-right shrink-0">{d.yield_t_per_ha} t/ha</span>
                </div>
              ))}
            </div>
            <p className="text-2xs text-charcoal-muted/50">Stability: <strong className="text-charcoal">{history.stability}</strong></p>
          </div>
        </div>

        {/* ── Weather ── */}
        <div
          id="panel-weather"
          role="tabpanel"
          aria-labelledby="tab-weather"
          hidden={active !== "weather"}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-charcoal">Weather Compatibility:</p>
              <Badge variant="success" size="md" dot>{weather.weather_compatibility}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-ivory-200 px-4 py-3">
                <p className="text-xs text-charcoal-muted/60 mb-0.5">Current Temp</p>
                <p className="text-xl font-bold text-charcoal tabular-nums">{weather.current.temperature_c}°C</p>
              </div>
              <div className="rounded-xl border border-ivory-200 px-4 py-3">
                <p className="text-xs text-charcoal-muted/60 mb-0.5">Humidity</p>
                <p className="text-xl font-bold text-charcoal tabular-nums">{weather.current.humidity_percent}%</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {weather.forecast.map((f) => (
                <div key={f.day} className="flex items-center gap-3">
                  <span className="w-20 text-xs font-semibold text-charcoal-light truncate">{f.day}</span>
                  <span className="text-xs text-charcoal tabular-nums w-10 shrink-0">{f.high_c}°C</span>
                  <span className="text-xs text-charcoal-muted">{f.condition}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
