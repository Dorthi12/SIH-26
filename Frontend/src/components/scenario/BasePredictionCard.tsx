/**
 * BasePredictionCard — displays the prediction that seeds the simulator.
 *
 * Structured so the `prediction` prop can later be hydrated from the
 * backend's prediction API instead of the demo data.
 */

import { Wheat, MapPin, Calendar, TrendingUp, Star } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import type { BasePrediction } from "../../types/scenario";

interface BasePredictionCardProps {
  prediction: BasePrediction;
}

export function BasePredictionCard({ prediction }: BasePredictionCardProps) {
  const suitabilityVariant =
    prediction.suitability_score >= 85
      ? "success"
      : prediction.suitability_score >= 70
      ? "warning"
      : "danger";

  return (
    <Card className="relative overflow-hidden">
      {/* Subtle decorative stripe */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-forest-400 to-forest-700"
      />

      <div className="pl-4">
        {/* Label row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest/10">
              <Wheat className="h-4 w-4 text-forest" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/60">
                Base Prediction
              </p>
              <p className="text-sm font-semibold text-charcoal leading-tight">
                Simulating from this crop
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm" dot>
            Active
          </Badge>
        </div>

        {/* Crop name */}
        <p className="text-2xl font-bold text-charcoal tracking-tight mb-4">
          {prediction.crop}
        </p>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetaItem
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="District"
            value={prediction.district.split(",")[0]}
          />
          <MetaItem
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Season"
            value={prediction.season}
          />
          <MetaItem
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Predicted Yield"
            value={`${prediction.predicted_yield_t_per_ha} t/ha`}
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-charcoal-muted/70">
              <Star className="h-3.5 w-3.5" />
              <span className="text-2xs font-semibold uppercase tracking-wider">
                Suitability
              </span>
            </div>
            <Badge variant={suitabilityVariant} size="md">
              {prediction.suitability_score}%
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-charcoal-muted/70">
        {icon}
        <span className="text-2xs font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold text-charcoal">{value}</p>
    </div>
  );
}
