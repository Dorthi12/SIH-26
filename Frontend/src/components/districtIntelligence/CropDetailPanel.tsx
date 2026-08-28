/**
 * CropDetailPanel — slide-in detail panel for a selected crop.
 *
 * Shows:
 *   - Crop name + suitability + yield + risk
 *   - Historical performance entry point (links to /history)
 *   - Recommendation CTA
 *
 * Slots are structured for future backend data — nothing is invented.
 */

import { useNavigate } from "react-router-dom";
import {
  X, TrendingUp, Star, CloudLightning, History,
  Sprout, ArrowRight, Info,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { RiskBadge } from "./DistrictOverviewCards";
import { cn } from "../../utils/cn";
import type { CropIntelligence } from "../../types/districtIntelligence";

interface CropDetailPanelProps {
  crop: CropIntelligence;
  districtName: string;
  onClose: () => void;
}

export function CropDetailPanel({ crop, districtName, onClose }: CropDetailPanelProps) {
  const navigate = useNavigate();

  const suitabilityColor =
    crop.avg_suitability >= 80
      ? "text-forest-600"
      : crop.avg_suitability >= 60
      ? "text-amber-600"
      : "text-red-600";

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        "border-forest/15 bg-gradient-to-br from-forest/[0.03] to-transparent",
        "animate-slide-up"
      )}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close crop detail"
        className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-ivory-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-5 pr-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/10">
          <Sprout className="h-5 w-5 text-forest" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/60">
            Crop Detail
          </p>
          <h3 className="text-xl font-bold text-charcoal">{crop.crop_name}</h3>
          <p className="text-xs text-charcoal-muted/60">{districtName}</p>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <DetailMetric
          icon={<Star className="h-3.5 w-3.5" />}
          label="Suitability"
        >
          <span className={cn("text-xl font-bold tabular-nums", suitabilityColor)}>
            {crop.avg_suitability}%
          </span>
          <SuitabilityMini value={crop.avg_suitability} />
        </DetailMetric>

        <DetailMetric
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Avg. Yield"
        >
          <span className="text-xl font-bold text-charcoal tabular-nums">
            {crop.avg_yield.toFixed(1)}
          </span>
          <span className="text-xs text-charcoal-muted"> t/ha</span>
        </DetailMetric>

        <DetailMetric
          icon={<CloudLightning className="h-3.5 w-3.5" />}
          label="Weather Risk"
        >
          <RiskBadge risk={crop.weather_risk} />
        </DetailMetric>
      </div>

      {/* Placeholder info — slots for future backend data */}
      <div className="flex items-start gap-2 rounded-xl border border-forest/10 bg-forest/[0.03] px-4 py-3 mb-5">
        <Info className="h-3.5 w-3.5 text-forest/60 shrink-0 mt-0.5" />
        <p className="text-xs text-charcoal-muted leading-relaxed">
          Detailed crop-level insights — including seasonal variation and risk factors — will be
          available once connected to the backend intelligence API.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          id={`crop-detail-history-${crop.crop_id}`}
          onClick={() => navigate("/history")}
          className="flex items-center gap-2 rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm font-semibold text-charcoal hover:border-forest/30 hover:bg-forest/[0.02] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
        >
          <History className="h-4 w-4 text-charcoal-muted" />
          View Historical Performance
          <ArrowRight className="h-3.5 w-3.5 ml-auto text-charcoal-muted/50" />
        </button>

        <Button
          id={`crop-detail-recommend-${crop.crop_id}`}
          variant="primary"
          size="md"
          className="w-full group"
          icon={<ArrowRight className="h-4 w-4" />}
          iconPosition="right"
          onClick={() => navigate("/recommendation")}
        >
          Get Crop Recommendation
        </Button>
      </div>
    </Card>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function DetailMetric({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl bg-ivory-100/60 border border-ivory-200 px-3 py-3">
      <div className="flex items-center gap-1.5 text-charcoal-muted/60">
        {icon}
        <span className="text-2xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function SuitabilityMini({ value }: { value: number }) {
  const color = value >= 80 ? "bg-forest-500" : value >= 60 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="h-1 w-full rounded-full bg-ivory-300 overflow-hidden mt-1">
      <div
        className={cn("h-full rounded-full transition-all duration-700", color)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
