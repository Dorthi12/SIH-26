/**
 * CropIntelligenceTable — polished table/list of crop intelligence rows.
 *
 * Desktop: full table with hover and click to select.
 * Mobile: card list representation.
 *
 * Structured to receive backend CropIntelligence[] with no UI changes.
 */

import { ChevronRight } from "lucide-react";
import { Badge } from "../ui/Badge";
import { RiskBadge } from "./DistrictOverviewCards";
import { cn } from "../../utils/cn";
import type { CropIntelligence } from "../../types/districtIntelligence";

interface CropIntelligenceTableProps {
  crops: CropIntelligence[];
  selectedCropId: string | null;
  onSelectCrop: (crop: CropIntelligence) => void;
}

export function CropIntelligenceTable({
  crops,
  selectedCropId,
  onSelectCrop,
}: CropIntelligenceTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-2xl border border-ivory-300 shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ivory-300 bg-ivory-100/70">
              <th className="px-5 py-3 text-left text-2xs font-bold uppercase tracking-widest text-charcoal-muted/60">
                Crop
              </th>
              <th className="px-5 py-3 text-left text-2xs font-bold uppercase tracking-widest text-charcoal-muted/60">
                Suitability
              </th>
              <th className="px-5 py-3 text-left text-2xs font-bold uppercase tracking-widest text-charcoal-muted/60">
                Avg. Yield
              </th>
              <th className="px-5 py-3 text-left text-2xs font-bold uppercase tracking-widest text-charcoal-muted/60">
                Weather Risk
              </th>
              <th className="px-2 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {crops.map((crop, idx) => {
              const isSelected = crop.crop_id === selectedCropId;
              return (
                <tr
                  key={crop.crop_id}
                  onClick={() => onSelectCrop(crop)}
                  className={cn(
                    "group cursor-pointer transition-colors duration-150",
                    isSelected
                      ? "bg-forest/[0.05]"
                      : "hover:bg-forest/[0.025]"
                  )}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectCrop(crop);
                    }
                  }}
                  aria-selected={isSelected}
                  role="row"
                >
                  {/* Rank + Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-2xs font-bold text-forest tabular-nums">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-charcoal">{crop.crop_name}</span>
                      {isSelected && (
                        <Badge variant="default" size="sm">Selected</Badge>
                      )}
                    </div>
                  </td>

                  {/* Suitability bar */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-ivory-300 overflow-hidden max-w-[80px]">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            crop.avg_suitability >= 80
                              ? "bg-forest-500"
                              : crop.avg_suitability >= 60
                              ? "bg-amber-400"
                              : "bg-red-400"
                          )}
                          style={{ width: `${crop.avg_suitability}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-charcoal tabular-nums">
                        {crop.avg_suitability}%
                      </span>
                    </div>
                  </td>

                  {/* Avg Yield */}
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-charcoal tabular-nums">
                      {crop.avg_yield.toFixed(1)}
                    </span>
                    <span className="text-charcoal-muted"> t/ha</span>
                  </td>

                  {/* Risk */}
                  <td className="px-5 py-3.5">
                    <RiskBadge risk={crop.weather_risk} />
                  </td>

                  {/* Arrow */}
                  <td className="px-2 py-3.5">
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-all duration-150",
                        isSelected
                          ? "text-forest"
                          : "text-charcoal-muted/30 group-hover:text-charcoal-muted/60 group-hover:translate-x-0.5"
                      )}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {crops.map((crop, idx) => {
          const isSelected = crop.crop_id === selectedCropId;
          return (
            <button
              key={crop.crop_id}
              type="button"
              onClick={() => onSelectCrop(crop)}
              className={cn(
                "w-full text-left rounded-2xl border p-4 transition-all duration-200 shadow-card",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30",
                isSelected
                  ? "border-forest/30 bg-forest/[0.04] shadow-card-hover"
                  : "border-ivory-300 bg-card hover:border-forest/20 hover:shadow-card-hover"
              )}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-2xs font-bold text-forest">
                    {idx + 1}
                  </span>
                  <p className="font-semibold text-charcoal">{crop.crop_name}</p>
                </div>
                <RiskBadge risk={crop.weather_risk} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-2xs text-charcoal-muted/60 uppercase tracking-wider font-semibold mb-0.5">Suitability</p>
                  <p className="font-bold text-charcoal">{crop.avg_suitability}%</p>
                </div>
                <div>
                  <p className="text-2xs text-charcoal-muted/60 uppercase tracking-wider font-semibold mb-0.5">Avg. Yield</p>
                  <p className="font-bold text-charcoal">{crop.avg_yield.toFixed(1)} t/ha</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
