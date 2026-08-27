/**
 * DistrictMapVisual — production-quality placeholder for a real map integration.
 *
 * This component is intentionally designed to look like a real agricultural
 * intelligence map view. It uses SVG, icons, and data overlays to communicate
 * the concept without requiring a real map API.
 *
 * To replace with a real map later:
 *   1. Remove this component's contents.
 *   2. Mount your preferred map library (Leaflet, Mapbox, etc.) in its place.
 *   3. The container div with fixed aspect ratio remains unchanged.
 */

import { MapPin, CloudSun, Sprout, BarChart3, AlertTriangle, Wifi } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { cn } from "../../utils/cn";
import type { DistrictIntelligence } from "../../types/districtIntelligence";

interface DistrictMapVisualProps {
  intelligence: DistrictIntelligence;
}

export function DistrictMapVisual({ intelligence }: DistrictMapVisualProps) {
  return (
    <Card noPadding className="overflow-hidden">
      {/* Map header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-ivory-200">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-forest" />
          <p className="text-sm font-semibold text-charcoal">{intelligence.district_name}</p>
          <Badge variant="neutral" size="sm">Uttar Pradesh</Badge>
        </div>
        <div className="flex items-center gap-1.5 text-2xs text-charcoal-muted/60">
          <Wifi className="h-3 w-3" />
          <span>Awaiting live data</span>
        </div>
      </div>

      {/* Map visual area */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] bg-gradient-to-br from-forest-50 via-ivory-100 to-olive-50 overflow-hidden">

        {/* Real farmland background image */}
        <div className="img-zoom-wrap absolute inset-0">
          <img
            src="/hero-farmland.jpg"
            alt=""
            aria-hidden
            className="w-full h-full object-cover opacity-30"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Topographic-style SVG overlay */}
        <svg
          viewBox="0 0 800 400"
          className="absolute inset-0 w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          {/* Contour lines — terrain feel */}
          <path d="M 0 280 Q 200 260 400 270 Q 600 280 800 265" stroke="#1a3d2e" strokeWidth="1" strokeOpacity="0.08" fill="none" />
          <path d="M 0 300 Q 200 285 400 292 Q 600 300 800 287" stroke="#1a3d2e" strokeWidth="0.8" strokeOpacity="0.06" fill="none" />
          <path d="M 0 320 Q 200 308 400 314 Q 600 320 800 309" stroke="#1a3d2e" strokeWidth="0.6" strokeOpacity="0.05" fill="none" />

          {/* Agricultural zone polygons */}
          <polygon
            points="150,100 280,80 350,160 220,180 140,150"
            fill="#1a3d2e"
            fillOpacity="0.06"
            stroke="#1a3d2e"
            strokeWidth="1"
            strokeOpacity="0.15"
          />
          <polygon
            points="380,90 520,70 580,150 450,170 370,140"
            fill="#3d5c2f"
            fillOpacity="0.05"
            stroke="#3d5c2f"
            strokeWidth="1"
            strokeOpacity="0.12"
          />
          <polygon
            points="550,180 680,160 730,240 600,260 530,230"
            fill="#c8922a"
            fillOpacity="0.04"
            stroke="#c8922a"
            strokeWidth="0.8"
            strokeOpacity="0.12"
          />
          <polygon
            points="100,220 230,200 280,280 160,300 80,270"
            fill="#1a3d2e"
            fillOpacity="0.04"
            stroke="#1a3d2e"
            strokeWidth="0.8"
            strokeOpacity="0.10"
          />

          {/* Data nodes */}
          {[
            [215, 130, "#1a3d2e", "0.20"],
            [465, 115, "#3d5c2f", "0.18"],
            [615, 210, "#c8922a", "0.15"],
            [175, 255, "#1a3d2e", "0.14"],
          ].map(([cx, cy, fill, opacity], i) => (
            <g key={i}>
              <circle cx={Number(cx)} cy={Number(cy)} r="16" fill={String(fill)} fillOpacity={Number(opacity)} />
              <circle cx={Number(cx)} cy={Number(cy)} r="5" fill={String(fill)} fillOpacity="0.6" />
              <circle cx={Number(cx)} cy={Number(cy)} r="5" fill="white" fillOpacity="0.4" />
            </g>
          ))}

          {/* District centre marker */}
          <circle cx="400" cy="200" r="8" fill="#1a3d2e" fillOpacity="0.7" />
          <circle cx="400" cy="200" r="16" fill="#1a3d2e" fillOpacity="0.12" />
          <circle cx="400" cy="200" r="26" fill="#1a3d2e" fillOpacity="0.05" />
          <line x1="400" y1="176" x2="400" y2="90" stroke="#1a3d2e" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 3" />
        </svg>

        {/* District label */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-ivory-300 rounded-full px-3 py-1.5 shadow-sm">
          <MapPin className="h-3 w-3 text-forest" />
          <span className="text-xs font-bold text-charcoal">{intelligence.district_name}</span>
        </div>

        {/* Floating intelligence badges */}
        <FloatingBadge
          style={{ top: "22%", left: "20%" }}
          delay="0ms"
          color="forest"
          icon={<Sprout className="h-3 w-3" />}
          label={intelligence.crops[0]?.crop_name ?? "—"}
        />
        <FloatingBadge
          style={{ top: "30%", right: "18%" }}
          delay="600ms"
          color="amber"
          icon={<CloudSun className="h-3 w-3" />}
          label={`Risk: ${intelligence.overall_risk}`}
        />
        <FloatingBadge
          style={{ bottom: "28%", left: "30%" }}
          delay="1200ms"
          color="olive"
          icon={<BarChart3 className="h-3 w-3" />}
          label={`${intelligence.avg_district_yield.toFixed(1)} t/ha avg`}
        />
        {intelligence.overall_risk === "High" && (
          <FloatingBadge
            style={{ bottom: "28%", right: "22%" }}
            delay="900ms"
            color="danger"
            icon={<AlertTriangle className="h-3 w-3" />}
            label="High Risk Zone"
          />
        )}

        {/* Corner legend */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 bg-white/90 backdrop-blur-sm border border-ivory-200 rounded-xl px-3 py-2.5 shadow-sm">
          <p className="text-2xs font-bold text-charcoal-muted/60 uppercase tracking-wider">Zones</p>
          {[
            { color: "bg-forest", label: "High suitability" },
            { color: "bg-olive-500", label: "Medium suitability" },
            { color: "bg-amber-400", label: "Weather risk" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-sm shrink-0", item.color)} />
              <span className="text-2xs text-charcoal-muted">{item.label}</span>
            </div>
          ))}
        </div>

        {/* "Replace me" note — only visible in dev, hidden via opacity-0 on production */}
        <div className="absolute bottom-3 left-3 bg-amber/10 border border-amber/20 rounded-lg px-2 py-1">
          <p className="text-2xs text-amber-700/70 font-medium">Map placeholder — replace with real GIS</p>
        </div>
      </div>
    </Card>
  );
}

// ── Floating badge ────────────────────────────────────────────────────────

interface FloatingBadgeProps {
  style: React.CSSProperties;
  delay: string;
  color: "forest" | "amber" | "olive" | "danger";
  icon: React.ReactNode;
  label: string;
}

const colorMap: Record<string, string> = {
  forest: "bg-forest/10 text-forest border-forest/15",
  amber: "bg-amber/10 text-amber-700 border-amber/20",
  olive: "bg-olive/10 text-olive-700 border-olive/20",
  danger: "bg-red-50 text-red-700 border-red-200",
};

function FloatingBadge({ style, delay, color, icon, label }: FloatingBadgeProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 shadow-sm",
        "text-2xs font-semibold backdrop-blur-sm bg-white/80",
        "animate-float",
        colorMap[color]
      )}
      style={{ ...style, animationDelay: delay }}
    >
      {icon}
      {label}
    </div>
  );
}
