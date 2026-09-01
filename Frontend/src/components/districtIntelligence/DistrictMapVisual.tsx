import { useState } from "react";
import {
  MapPin, CloudSun, Sprout, BarChart3, AlertTriangle, Layers,
  ZoomIn, ZoomOut, Compass, Navigation, Eye, Globe, ShieldAlert, Sparkles, CheckCircle2
} from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { useLanguage } from "../../context/LanguageContext";
import { cn } from "../../utils/cn";
import type { DistrictIntelligence } from "../../types/districtIntelligence";

interface ExtendedDistrictIntelligence extends DistrictIntelligence {
  state?: string;
  lat?: number;
  lng?: number;
  soil_type?: string;
  climate_zone?: string;
  arable_land_acres?: number;
  sub_zones?: { name: string; crop: string; suitability: number; lat: number; lng: number }[];
}

interface DistrictMapVisualProps {
  intelligence: ExtendedDistrictIntelligence;
}

type MapMode = "map" | "satellite" | "heatmap";

export function DistrictMapVisual({ intelligence }: DistrictMapVisualProps) {
  const { t } = useLanguage();
  const [mapMode, setMapMode] = useState<MapMode>("satellite");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeSubZone, setActiveSubZone] = useState<number | null>(null);

  const lat = intelligence.lat ?? 25.4358;
  const lng = intelligence.lng ?? 81.8463;
  const soilType = intelligence.soil_type ?? "Alluvial Clay";
  const climateZone = intelligence.climate_zone ?? "Humid Subtropical";
  const acres = intelligence.arable_land_acres ?? 150000;
  const stateName = intelligence.state ?? "Uttar Pradesh";

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.2, 1.6));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.2, 0.8));
  const handleResetZoom = () => { setZoomLevel(1); setActiveSubZone(null); };

  return (
    <Card noPadding className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 backdrop-blur-xl">
      {/* ── Google Maps-style Header Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <Navigation className="h-5 w-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black tracking-tight truncate text-white">
                {intelligence.district_name}
              </h3>
              <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                {stateName}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 text-3xs font-bold text-slate-400">
              <span className="text-amber-400">🌐 GPS: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E</span>
              <span>🌱 {soilType}</span>
              <span>🌤️ {climateZone}</span>
            </div>
          </div>
        </div>

        {/* View Mode Switcher (Google Map Style: Map / Satellite / Heatmap) */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-800/90 border border-slate-700 backdrop-blur-md gap-1">
          {[
            { id: "satellite", label: t("Satellite", "सैटेलाइट"), icon: <Globe className="h-3.5 w-3.5" /> },
            { id: "map", label: t("Terrain Map", "नक्शा"), icon: <Eye className="h-3.5 w-3.5" /> },
            { id: "heatmap", label: t("Heatmap", "हीटमैप"), icon: <ShieldAlert className="h-3.5 w-3.5" /> },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setMapMode(mode.id as MapMode)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer select-none",
                mapMode === mode.id
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-[1.03]"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/60"
              )}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Interactive Map Canvas Container ── */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2.2/1] overflow-hidden bg-slate-950 select-none">
        
        {/* Background Layer: Satellite vs Map vs Heatmap */}
        <div
          className="absolute inset-0 transition-transform duration-500 ease-out"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {mapMode === "satellite" && (
            <div className="relative h-full w-full">
              <img
                src="/hero-farmland.jpg"
                alt="Satellite View"
                className="h-full w-full object-cover brightness-[0.6] contrast-[1.15] filter saturate-150"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>
          )}

          {mapMode === "map" && (
            <div className="h-full w-full bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 relative">
              {/* Topographic Lines SVG */}
              <svg viewBox="0 0 1000 500" className="absolute inset-0 h-full w-full opacity-30">
                <path d="M 0 350 Q 250 320 500 340 Q 750 360 1000 330" stroke="#10b981" strokeWidth="1.5" fill="none" />
                <path d="M 0 380 Q 250 350 500 370 Q 750 390 1000 360" stroke="#10b981" strokeWidth="1" fill="none" />
                <path d="M 0 410 Q 250 380 500 400 Q 750 420 1000 390" stroke="#10b981" strokeWidth="0.8" fill="none" />
                {/* River Mesh (Ganga & Yamuna confluence style) */}
                <path d="M 100 0 Q 350 200 500 250 Q 750 320 1000 500" stroke="#38bdf8" strokeWidth="4" fill="none" strokeOpacity="0.7" />
                <path d="M 0 250 Q 250 220 500 250" stroke="#38bdf8" strokeWidth="3" fill="none" strokeOpacity="0.6" />
              </svg>
            </div>
          )}

          {mapMode === "heatmap" && (
            <div className="h-full w-full bg-slate-950 relative">
              <img
                src="/hero-farmland.jpg"
                alt="Heatmap View"
                className="h-full w-full object-cover opacity-20 filter grayscale"
              />
              {/* Risk & Yield Heatmap circles */}
              <div className="absolute top-1/4 left-1/3 h-56 w-56 rounded-full bg-emerald-500/30 blur-3xl" />
              <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-amber-500/25 blur-3xl" />
              <div className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-teal-500/30 blur-3xl" />
            </div>
          )}

          {/* SVG Overlay for Polygons & Boundaries */}
          <svg viewBox="0 0 1000 500" className="absolute inset-0 h-full w-full pointer-events-none">
            {/* Zone Polygons */}
            <polygon points="200,120 380,90 480,220 300,260 180,200" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
            <polygon points="520,100 700,80 780,210 600,240 500,180" fill="#f59e0b" fillOpacity="0.12" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
            <polygon points="350,280 550,260 620,400 420,420 300,360" fill="#06b6d4" fillOpacity="0.15" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 2" />
          </svg>

          {/* ── Main Pulsing Radar Pin at District Center ── */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto">
            {/* Radar Wave Pulse animation */}
            <div className="relative flex items-center justify-center">
              <span className="absolute h-16 w-16 rounded-full bg-rose-500/30 animate-ping" />
              <span className="absolute h-10 w-10 rounded-full bg-amber-400/40 animate-pulse" />
              
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-2xl shadow-rose-500/50 border-2 border-white cursor-pointer hover:scale-110 transition-transform">
                <MapPin className="h-6 w-6 text-white drop-shadow-md" />
              </div>
            </div>

            {/* Glowing District Label Pill */}
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-slate-900/90 border border-slate-700 px-4 py-1.5 shadow-2xl backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black text-white">{intelligence.district_name}</span>
              <Badge variant="amber" size="sm" className="font-extrabold">{intelligence.crops[0]?.crop_name ?? "Maize"}</Badge>
            </div>
          </div>

          {/* ── Interactive Agricultural Sub-Zone Nodes ── */}
          {[
            { id: 0, top: "28%", left: "32%", name: t("North Plain Zone", "उत्तरी मैदानी क्षेत्र"), crop: intelligence.crops[0]?.crop_name ?? "Maize", suit: 94 },
            { id: 1, top: "35%", right: "26%", name: t("Riverine Basin", "नदी बेसिन क्षेत्र"), crop: intelligence.crops[1]?.crop_name ?? "Wheat", suit: 90 },
            { id: 2, bottom: "25%", left: "38%", name: t("Southern Plateau", "दक्षिणी पठार"), crop: intelligence.crops[2]?.crop_name ?? "Soybean", suit: 85 },
          ].map((zone) => (
            <div
              key={zone.id}
              className="absolute pointer-events-auto cursor-pointer group"
              style={{ top: zone.top, left: zone.left, right: zone.right, bottom: zone.bottom }}
              onClick={() => setActiveSubZone(activeSubZone === zone.id ? null : zone.id)}
            >
              <div className="relative flex items-center gap-2 bg-slate-900/80 hover:bg-slate-900 text-white border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md transition-all group-hover:scale-105">
                <Sprout className="h-4 w-4 text-emerald-400" />
                <span className="text-2xs font-extrabold">{zone.name}</span>
                <span className="text-3xs bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                  {zone.suit}%
                </span>
              </div>

              {/* Popup details card when clicked */}
              {activeSubZone === zone.id && (
                <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-900 text-white p-3 rounded-2xl border border-emerald-500/40 shadow-2xl backdrop-blur-xl z-30 animate-fade-in space-y-1">
                  <div className="flex items-center justify-between text-2xs font-extrabold text-emerald-400">
                    <span>{zone.name}</span>
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <p className="text-xs font-black">{t("Top Crop", "शीर्ष फ़सल")}: {zone.crop}</p>
                  <p className="text-3xs text-slate-400">{t("Suitability Rating", "उपयुक्तता रेटिंग")}: <strong className="text-emerald-300">{zone.suit}%</strong></p>
                </div>
              )}
            </div>
          ))}

        </div>

        {/* ── Google Maps Floating Controls ── */}

        {/* Zoom & Navigation Controls (Top Right) */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 text-white border border-slate-700 hover:bg-emerald-500 hover:text-slate-950 transition-colors shadow-lg cursor-pointer"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 text-white border border-slate-700 hover:bg-emerald-500 hover:text-slate-950 transition-colors shadow-lg cursor-pointer"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Map View"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 text-white border border-slate-700 hover:bg-emerald-500 hover:text-slate-950 transition-colors shadow-lg cursor-pointer"
          >
            <Compass className="h-4 w-4" />
          </button>
        </div>

        {/* Live Weather & Risk Badge (Top Left) */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 border border-slate-700 px-3.5 py-1.5 shadow-lg backdrop-blur-md">
            <CloudSun className="h-4 w-4 text-amber-400 animate-pulse" />
            <span className="text-2xs font-extrabold text-white">
              {t("Overall Risk", "मौसम जोखिम")}: <span className="text-emerald-400">{intelligence.overall_risk}</span>
            </span>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-slate-900/90 border border-slate-700 px-3.5 py-1.5 shadow-lg backdrop-blur-md">
            <BarChart3 className="h-4 w-4 text-emerald-400" />
            <span className="text-2xs font-extrabold text-white">
              {t("Avg Yield", "औसत उपज")}: <span className="text-amber-300">{intelligence.avg_district_yield} t/ha</span>
            </span>
          </div>
        </div>

        {/* Bottom Legend Overlay (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 rounded-2xl bg-slate-900/90 border border-slate-700 px-4 py-2 shadow-lg backdrop-blur-md text-2xs text-slate-300 font-bold">
          <span className="text-slate-400 uppercase tracking-wider text-3xs">{t("Legend", "संकेत")}:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>{t("High Suitability", "उच्च उपयुक्तता")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>{t("Moderate Risk", "मध्यम जोखिम")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
            <span>{t("River Water Basin", "जल बेसिन")}</span>
          </div>
        </div>

        {/* Bottom GPS Coordinates & Arable Land Badge (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1.5 text-2xs font-black text-emerald-300 shadow-lg backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>{acres.toLocaleString()} {t("acres arable land", "एकड़ कृषि योग्य भूमि")}</span>
        </div>
      </div>
    </Card>
  );
}
