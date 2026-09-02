import type { SellSmarterCropOption, DirectBuyerOfferItem } from "../../../types/sellSmarter";
import { DollarSign, ShieldAlert, Award, Calculator } from "lucide-react";

interface ProfitMarginCardProps {
  crop: SellSmarterCropOption;
  bestBuyer: DirectBuyerOfferItem;
}

export function ProfitMarginCard({ crop, bestBuyer }: ProfitMarginCardProps) {
  const prodCost = crop.productionCostPerQ;
  const netRealization = bestBuyer.estimatedNetRealizationPerQ;
  const marginPerQ = netRealization - prodCost;
  const totalProfitMargin = marginPerQ * crop.quantityQuintals;

  const targetMarginPerQ = 200;
  const costBasedFloor = prodCost + targetMarginPerQ;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* PROFIT & MARGIN CARD */}
      <div className="bg-white dark:bg-charcoal-dark p-6 rounded-3xl border border-ivory-300 dark:border-charcoal-light shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-black text-base text-charcoal dark:text-ivory-100">
              Farmer Profit & Margin Analysis
            </h3>
          </div>
          <span className="text-3xs font-black px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            Net Economic Margin
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-baseline text-xs font-bold">
            <span className="text-charcoal-muted dark:text-ivory-400">Your Production Cost</span>
            <span className="text-charcoal dark:text-ivory-100 font-extrabold">₹{prodCost.toLocaleString("en-IN")} / q</span>
          </div>

          <div className="flex justify-between items-baseline text-xs font-bold">
            <span className="text-charcoal-muted dark:text-ivory-400">Current Net Realization</span>
            <span className="text-forest dark:text-emerald-400 font-extrabold">₹{netRealization.toLocaleString("en-IN")} / q</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 space-y-1">
            <div className="flex justify-between items-center text-xs font-black text-emerald-950 dark:text-emerald-100">
              <span>Estimated Profit Margin per Quintal</span>
              <span className="text-lg text-emerald-600 dark:text-emerald-400">
                +₹{marginPerQ.toLocaleString("en-IN")} / q
              </span>
            </div>

            <div className="flex justify-between items-center text-3xs font-extrabold text-emerald-800 dark:text-emerald-300 pt-1 border-t border-emerald-200 dark:border-emerald-800/60">
              <span>Total Net Profit ({crop.quantityQuintals} q)</span>
              <span className="text-base text-emerald-900 dark:text-emerald-200 font-black">
                +₹{totalProfitMargin.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* COST-BASED REFERENCE FLOOR CARD */}
      <div className="bg-white dark:bg-charcoal-dark p-6 rounded-3xl border border-ivory-300 dark:border-charcoal-light shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-black text-base text-charcoal dark:text-ivory-100">
              Your Cost-Based Reference Floor
            </h3>
          </div>
          <span className="text-3xs font-black px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
            Cost + Target Margin
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-baseline text-xs font-bold">
            <span className="text-charcoal-muted dark:text-ivory-400">Production Cost</span>
            <span className="text-charcoal dark:text-ivory-100">₹{prodCost.toLocaleString("en-IN")}/q</span>
          </div>

          <div className="flex justify-between items-baseline text-xs font-bold">
            <span className="text-charcoal-muted dark:text-ivory-400">Target Minimum Margin</span>
            <span className="text-charcoal dark:text-ivory-100">+₹{targetMarginPerQ}/q</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-1">
            <span className="text-3xs font-extrabold uppercase text-amber-800 dark:text-amber-300 block">
              Cost + Target Margin Floor Reference
            </span>
            <span className="text-2xl font-black text-amber-950 dark:text-amber-100 block">
              ₹{costBasedFloor.toLocaleString("en-IN")} / q
            </span>
          </div>

          <p className="text-3xs font-semibold text-charcoal-muted dark:text-ivory-400 pt-1">
            ℹ️ "This is a cost-based reference and does not guarantee that buyers will offer this price."
          </p>
        </div>
      </div>
    </div>
  );
}
