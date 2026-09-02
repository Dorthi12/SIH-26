import type { SellSmarterCropOption, DirectBuyerOfferItem } from "../../../types/sellSmarter";
import { BarChart2 } from "lucide-react";

interface PriceComparisonChartProps {
  crop: SellSmarterCropOption;
  bestBuyer: DirectBuyerOfferItem;
}

export function PriceComparisonChart({
  crop,
  bestBuyer,
}: PriceComparisonChartProps) {
  const mandiNet = crop.mandi.estimatedNetRealizationPerQ;
  const buyerNet = bestBuyer.estimatedNetRealizationPerQ;
  const maxPrice = Math.max(mandiNet, buyerNet, crop.fairPriceRangeMaxPerQ) * 1.1;

  const mandiWidth = Math.round((mandiNet / maxPrice) * 100);
  const buyerWidth = Math.round((buyerNet / maxPrice) * 100);
  const fairMinWidth = Math.round((crop.fairPriceRangeMinPerQ / maxPrice) * 100);

  const diffPerQ = buyerNet - mandiNet;

  return (
    <div className="bg-white dark:bg-charcoal-dark p-6 rounded-3xl border border-ivory-300 dark:border-charcoal-light shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-3">
        <div>
          <h3 className="font-black text-base text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-forest dark:text-emerald-400" />
            <span>Price Comparison Visualizer</span>
          </h3>
          <p className="text-2xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
            Immediate visual comparison of take-home realization per quintal
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-2xs">
          Advantage: +₹{diffPerQ}/q
        </span>
      </div>

      <div className="space-y-6 pt-2">
        {/* Mandi Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-black">
            <span className="text-charcoal-muted dark:text-ivory-300 flex items-center gap-2">
              <span>🏪 APMC / Mandi Net Realization</span>
            </span>
            <span className="text-charcoal dark:text-ivory-100 text-sm font-black">
              ₹{mandiNet.toLocaleString("en-IN")} / q
            </span>
          </div>

          <div className="w-full bg-ivory-200 dark:bg-charcoal rounded-2xl h-8 p-1 relative overflow-hidden flex items-center">
            <div
              className="bg-amber h-full rounded-xl transition-all duration-700 flex items-center justify-end px-3 font-black text-2xs text-charcoal shadow-xs"
              style={{ width: `${mandiWidth}%` }}
            >
              <span>₹{mandiNet}/q</span>
            </div>
          </div>
        </div>

        {/* Direct Buyer Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-black">
            <span className="text-forest dark:text-emerald-400 flex items-center gap-2">
              <span>🤝 Direct Buyer Net Realization ({bestBuyer.businessName})</span>
            </span>
            <span className="text-forest dark:text-emerald-400 text-base font-black">
              ₹{buyerNet.toLocaleString("en-IN")} / q
            </span>
          </div>

          <div className="w-full bg-ivory-200 dark:bg-charcoal rounded-2xl h-8 p-1 relative overflow-hidden flex items-center">
            <div
              className="bg-gradient-to-r from-emerald-500 to-forest h-full rounded-xl transition-all duration-700 flex items-center justify-end px-3 font-black text-xs text-white shadow-md"
              style={{ width: `${buyerWidth}%` }}
            >
              <span>₹{buyerNet}/q</span>
            </div>
          </div>
        </div>

        {/* Fair Price Reference Range Marker Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-3xs font-bold text-emerald-800 dark:text-emerald-300">
            <span>⚖️ Agrisense Fair Price Reference Range</span>
            <span>₹{crop.fairPriceRangeMinPerQ} – ₹{crop.fairPriceRangeMaxPerQ} / q</span>
          </div>
          <div className="w-full bg-ivory-100 dark:bg-charcoal rounded-xl h-4 relative flex items-center overflow-hidden border border-emerald-300 dark:border-emerald-700/60">
            <div
              className="bg-emerald-400/40 dark:bg-emerald-500/30 h-full border-x border-emerald-600 flex items-center justify-center text-3xs font-black text-emerald-950 dark:text-emerald-100"
              style={{
                marginLeft: `${fairMinWidth}%`,
                width: `${Math.round(((crop.fairPriceRangeMaxPerQ - crop.fairPriceRangeMinPerQ) / maxPrice) * 100)}%`,
              }}
            >
              Reference Zone
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
