import type { SellSmarterCropOption } from "../../../types/sellSmarter";
import { FileText, Droplets, ShieldCheck, Tag, DollarSign, Scale } from "lucide-react";

interface FarmerCropSummaryCardProps {
  crop: SellSmarterCropOption;
  onViewCropReport?: () => void;
}

export function FarmerCropSummaryCard({
  crop,
  onViewCropReport,
}: FarmerCropSummaryCardProps) {
  const icon = crop.cropName.includes("Wheat")
    ? "🌾"
    : crop.cropName.includes("Rice")
    ? "🌾"
    : crop.cropName.includes("Chana")
    ? "🫘"
    : "🍅";

  return (
    <div className="bg-white dark:bg-charcoal-dark p-6 rounded-3xl border border-ivory-300 dark:border-charcoal-light shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 dark:border-charcoal-light pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-2xl shadow-xs">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xs uppercase font-black px-2 py-0.5 rounded-full bg-forest/10 dark:bg-emerald-950 text-forest dark:text-emerald-400">
                Selected Crop Context
              </span>
              <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-ivory-200 dark:bg-charcoal text-charcoal-muted dark:text-ivory-300">
                {crop.location}
              </span>
            </div>
            <h3 className="text-xl font-black text-charcoal dark:text-ivory-100 mt-0.5">
              {crop.cropName} — <span className="text-forest dark:text-emerald-400">{crop.variety}</span>
            </h3>
          </div>
        </div>

        {onViewCropReport && (
          <button
            onClick={onViewCropReport}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light text-forest dark:text-emerald-400 hover:bg-forest hover:text-white transition-all shadow-xs flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber" />
            <span>View Crop Report</span>
          </button>
        )}
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
          <span className="text-3xs font-bold text-charcoal-muted dark:text-ivory-400 block uppercase">
            Quantity
          </span>
          <span className="text-base font-black text-charcoal dark:text-ivory-100 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
            {crop.quantityQuintals} q
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
          <span className="text-3xs font-bold text-charcoal-muted dark:text-ivory-400 block uppercase">
            Quality Grade
          </span>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {crop.qualityGrade}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
          <span className="text-3xs font-bold text-charcoal-muted dark:text-ivory-400 block uppercase">
            Moisture Level
          </span>
          <span className="text-base font-black text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5" />
            {crop.moisturePercentage}%
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
          <span className="text-3xs font-bold text-charcoal-muted dark:text-ivory-400 block uppercase">
            Production Type
          </span>
          <span className="text-base font-black text-charcoal dark:text-ivory-100">
            {crop.productionMethod}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1">
          <span className="text-3xs font-bold text-amber-800 dark:text-amber-300 block uppercase">
            Production Cost
          </span>
          <span className="text-base font-black text-amber-900 dark:text-amber-200 flex items-center gap-0.5">
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            ₹{crop.productionCostPerQ.toLocaleString("en-IN")}/q
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 space-y-1">
          <span className="text-3xs font-bold text-emerald-800 dark:text-emerald-300 block uppercase">
            Fair Price Range
          </span>
          <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ₹{crop.fairPriceRangeMinPerQ}–₹{crop.fairPriceRangeMaxPerQ}/q
          </span>
        </div>
      </div>
    </div>
  );
}
