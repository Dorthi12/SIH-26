/**
 * DistrictOverviewCards — four KPI summary cards for a selected district.
 *
 * Props come directly from DistrictIntelligence so the backend can populate
 * them without any UI changes.
 */

import { Sprout, Star, TrendingUp, CloudLightning } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { cn } from "../../utils/cn";
import type { DistrictIntelligence, WeatherRiskLevel } from "../../types/districtIntelligence";

interface DistrictOverviewCardsProps {
  intelligence: DistrictIntelligence;
}

export function DistrictOverviewCards({ intelligence }: DistrictOverviewCardsProps) {
  const { best_crop_id, crops, avg_district_suitability, avg_district_yield, overall_risk } = intelligence;
  const bestCrop = crops.find((c) => c.crop_id === best_crop_id);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Best Performing Crop */}
      <OverviewCard
        icon={<Sprout className="h-4 w-4" />}
        label="Best Performing Crop"
        accent="forest"
      >
        <p className="text-2xl font-bold text-charcoal tracking-tight truncate">
          {bestCrop?.crop_name ?? "—"}
        </p>
        {bestCrop && (
          <Badge variant="success" size="sm" dot className="mt-1">
            Rank #1
          </Badge>
        )}
      </OverviewCard>

      {/* Average Suitability */}
      <OverviewCard
        icon={<Star className="h-4 w-4" />}
        label="Avg. Suitability"
        accent="forest"
      >
        <p className="text-2xl font-bold text-charcoal tabular-nums">
          {avg_district_suitability}
          <span className="text-base font-normal text-charcoal-muted ml-0.5">%</span>
        </p>
        <SuitabilityBar value={avg_district_suitability} className="mt-2" />
      </OverviewCard>

      {/* Average Yield */}
      <OverviewCard
        icon={<TrendingUp className="h-4 w-4" />}
        label="Avg. Expected Yield"
        accent="olive"
      >
        <p className="text-2xl font-bold text-charcoal tabular-nums">
          {avg_district_yield.toFixed(1)}
          <span className="text-base font-normal text-charcoal-muted ml-1">t/ha</span>
        </p>
      </OverviewCard>

      {/* Overall Risk */}
      <OverviewCard
        icon={<CloudLightning className="h-4 w-4" />}
        label="Overall Weather Risk"
        accent={riskAccent(overall_risk)}
      >
        <RiskBadge risk={overall_risk} large />
        <p className="text-2xs text-charcoal-muted/60 mt-2">
          Across all evaluated crops
        </p>
      </OverviewCard>
    </div>
  );
}

// ── Overview card shell ───────────────────────────────────────────────────

interface OverviewCardProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  accent: "forest" | "olive" | "amber" | "danger";
}

const accentBg: Record<string, string> = {
  forest: "bg-forest/10",
  olive: "bg-olive/10",
  amber: "bg-amber/10",
  danger: "bg-red-50",
};
const accentText: Record<string, string> = {
  forest: "text-forest",
  olive: "text-olive-600",
  amber: "text-amber-600",
  danger: "text-red-600",
};

function OverviewCard({ icon, label, children, accent }: OverviewCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg shrink-0", accentBg[accent], accentText[accent])}>
          {icon}
        </span>
        <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/60 leading-tight">
          {label}
        </p>
      </div>
      <div>{children}</div>
    </Card>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function SuitabilityBar({ value, className }: { value: number; className?: string }) {
  const color = value >= 80 ? "bg-forest-500" : value >= 60 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className={cn("h-1.5 w-full rounded-full bg-ivory-300 overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function RiskBadge({ risk, large }: { risk: WeatherRiskLevel; large?: boolean }) {
  const map: Record<WeatherRiskLevel, { variant: "success" | "warning" | "danger"; dot: boolean }> = {
    Low: { variant: "success", dot: true },
    Medium: { variant: "warning", dot: true },
    High: { variant: "danger", dot: true },
  };
  const { variant, dot } = map[risk];
  return (
    <Badge variant={variant} size={large ? "md" : "sm"} dot={dot}>
      {risk} Risk
    </Badge>
  );
}

function riskAccent(risk: WeatherRiskLevel): "forest" | "amber" | "danger" {
  return risk === "Low" ? "forest" : risk === "Medium" ? "amber" : "danger";
}
