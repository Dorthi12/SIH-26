/**
 * CropComparisonChart — horizontal bar comparison of crop suitability & yield.
 *
 * Uses simple progress bars (no external chart library).
 * Structured to receive CropIntelligence[] from the backend.
 */

import { cn } from "../../utils/cn";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { RiskBadge } from "./DistrictOverviewCards";
import type { CropIntelligence } from "../../types/districtIntelligence";

interface CropComparisonChartProps {
  crops: CropIntelligence[];
  selectedCropId: string | null;
}

export function CropComparisonChart({ crops, selectedCropId }: CropComparisonChartProps) {
  const maxYield = Math.max(...crops.map((c) => c.avg_yield));

  return (
    <Card className="space-y-5">
      <CardHeader className="mb-0">
        <CardTitle>Crop Performance Comparison</CardTitle>
        <p className="text-sm text-charcoal-muted mt-0.5">
          Relative suitability and expected yield across evaluated crops.
        </p>
      </CardHeader>

      <div className="space-y-4">
        {crops.map((crop) => {
          const isSelected = crop.crop_id === selectedCropId;
          return (
            <div
              key={crop.crop_id}
              className={cn(
                "rounded-xl border px-4 py-3.5 transition-all duration-200",
                isSelected
                  ? "border-forest/20 bg-forest/[0.03]"
                  : "border-ivory-200 bg-white"
              )}
            >
              {/* Crop name + risk */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  {isSelected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-forest shrink-0" />
                  )}
                  <p className={cn("text-sm font-semibold", isSelected ? "text-forest" : "text-charcoal")}>
                    {crop.crop_name}
                  </p>
                </div>
                <RiskBadge risk={crop.weather_risk} />
              </div>

              {/* Suitability bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-2xs">
                  <span className="font-semibold uppercase tracking-wider text-charcoal-muted/60">
                    Suitability
                  </span>
                  <span className="font-bold text-charcoal tabular-nums">{crop.avg_suitability}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-ivory-300 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out",
                      crop.avg_suitability >= 80
                        ? "bg-forest-500"
                        : crop.avg_suitability >= 60
                        ? "bg-amber-400"
                        : "bg-red-400"
                    )}
                    style={{ width: `${crop.avg_suitability}%` }}
                  />
                </div>
              </div>

              {/* Yield bar */}
              <div className="space-y-1.5 mt-2.5">
                <div className="flex items-center justify-between text-2xs">
                  <span className="font-semibold uppercase tracking-wider text-charcoal-muted/60">
                    Avg. Yield
                  </span>
                  <span className="font-bold text-charcoal tabular-nums">
                    {crop.avg_yield.toFixed(1)} t/ha
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-ivory-300 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-olive-400/80 transition-all duration-700 ease-out"
                    style={{ width: `${(crop.avg_yield / maxYield) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
