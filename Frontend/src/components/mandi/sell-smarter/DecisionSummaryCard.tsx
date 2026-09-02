import type { SellSmarterCropOption, DirectBuyerOfferItem, SellingDecisionState } from "../../../types/sellSmarter";
import { CheckCircle2, Clock, Users, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

interface DecisionSummaryCardProps {
  crop: SellSmarterCropOption;
  bestBuyer: DirectBuyerOfferItem;
  onContactBuyer: (buyer: DirectBuyerOfferItem) => void;
  onSaveDecision: () => void;
  onMonitorPrice: () => void;
  onViewAllBuyers: () => void;
}

export function DecisionSummaryCard({
  crop,
  bestBuyer,
  onContactBuyer,
  onSaveDecision,
  onMonitorPrice,
  onViewAllBuyers,
}: DecisionSummaryCardProps) {
  const decisionState: SellingDecisionState = crop.advisor.decisionState;

  const renderBadge = () => {
    switch (decisionState) {
      case "CONSIDER_SELLING":
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            🟢 Consider Selling
          </span>
        );
      case "CONSIDER_WAITING":
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-amber-500 text-charcoal font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Clock className="w-4 h-4" />
            🟡 Consider Waiting
          </span>
        );
      case "COMPARE_BUYERS":
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-blue-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Users className="w-4 h-4" />
            🔵 Compare Buyers
          </span>
        );
      case "CONSIDER_SELLING_SOON":
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <AlertCircle className="w-4 h-4" />
            🔴 Consider Selling Soon
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-charcoal-dark p-6 sm:p-8 rounded-3xl border-2 border-forest/30 dark:border-emerald-500/30 shadow-xl space-y-6">
      {/* Top Header & State Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 dark:border-charcoal-light pb-4">
        <div>
          <span className="text-3xs uppercase font-black text-forest dark:text-emerald-400 tracking-widest block">
            End-To-End Decision Synthesis
          </span>
          <h3 className="text-2xl font-black text-charcoal dark:text-ivory-100 mt-0.5">
            Your Selling Decision Summary
          </h3>
        </div>

        <div>{renderBadge()}</div>
      </div>

      {/* Structured Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light text-xs font-bold">
        <div className="space-y-0.5">
          <span className="text-3xs uppercase font-extrabold text-charcoal-muted dark:text-ivory-400 block">
            Current Best Net
          </span>
          <span className="text-base font-black text-forest dark:text-emerald-400 block">
            ₹{bestBuyer.estimatedNetRealizationPerQ.toLocaleString("en-IN")}/q
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-3xs uppercase font-extrabold text-charcoal-muted dark:text-ivory-400 block">
            Fair Price Range
          </span>
          <span className="text-sm font-black text-charcoal dark:text-ivory-100 block">
            ₹{crop.fairPriceRangeMinPerQ}–₹{crop.fairPriceRangeMaxPerQ}/q
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-3xs uppercase font-extrabold text-charcoal-muted dark:text-ivory-400 block">
            Production Cost
          </span>
          <span className="text-sm font-black text-amber-700 dark:text-amber-400 block">
            ₹{crop.productionCostPerQ.toLocaleString("en-IN")}/q
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-3xs uppercase font-extrabold text-charcoal-muted dark:text-ivory-400 block">
            Estimated Margin
          </span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
            +₹{bestBuyer.estimatedNetRealizationPerQ - crop.productionCostPerQ}/q
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-3xs uppercase font-extrabold text-charcoal-muted dark:text-ivory-400 block">
            Market Trend
          </span>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
            ↗ {crop.marketTrend.trend7d}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-3xs uppercase font-extrabold text-charcoal-muted dark:text-ivory-400 block">
            Storage Available
          </span>
          <span className="text-xs font-black text-charcoal dark:text-ivory-100 block">
            {crop.storage.availableDays} days
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-3xs uppercase font-extrabold text-charcoal-muted dark:text-ivory-400 block">
            Best Buyer
          </span>
          <span className="text-xs font-black text-charcoal dark:text-ivory-100 truncate block">
            {bestBuyer.businessName}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-3xs uppercase font-extrabold text-charcoal-muted dark:text-ivory-400 block">
            Buyer Reliability
          </span>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
            {bestBuyer.paymentReliabilityPercentage}%
          </span>
        </div>
      </div>

      {/* WHY & WHAT COULD CHANGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Why */}
        <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-700/50 space-y-3 text-xs">
          <h4 className="font-black text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Why this view?</span>
          </h4>

          <ul className="space-y-2 font-medium text-emerald-900 dark:text-emerald-200">
            {crop.advisor.detailedRationale.slice(0, 3).map((r, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What Could Change */}
        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/50 space-y-3 text-xs">
          <h4 className="font-black text-sm text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>What could change this recommendation?</span>
          </h4>

          <ul className="space-y-2 font-medium text-amber-900 dark:text-amber-200">
            {crop.advisor.risksAndContingencies.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* DYNAMIC ACTION BUTTONS (Prompt Section 30) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-ivory-200 dark:border-charcoal-light">
        <div className="flex flex-wrap items-center gap-3">
          {decisionState === "CONSIDER_SELLING" || decisionState === "CONSIDER_SELLING_SOON" ? (
            <>
              <button
                onClick={() => onContactBuyer(bestBuyer)}
                className="px-6 py-3 rounded-2xl font-black text-xs bg-forest text-white hover:bg-forest-dark transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-amber" />
                <span>Contact Buyer ({bestBuyer.businessName})</span>
              </button>

              <button
                onClick={onSaveDecision}
                className="px-5 py-3 rounded-2xl font-bold text-xs bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light text-charcoal dark:text-ivory-100 hover:bg-ivory-200 transition-all cursor-pointer"
              >
                <span>Save Decision</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onSaveDecision}
                className="px-6 py-3 rounded-2xl font-black text-xs bg-forest text-white hover:bg-forest-dark transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Save Waiting Decision</span>
              </button>

              <button
                onClick={onMonitorPrice}
                className="px-5 py-3 rounded-2xl font-bold text-xs bg-amber text-charcoal hover:bg-amber-dark transition-all shadow-sm cursor-pointer"
              >
                <span>Monitor Price Alerts</span>
              </button>
            </>
          )}

          <button
            onClick={onViewAllBuyers}
            className="px-5 py-3 rounded-2xl font-bold text-xs bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light text-charcoal dark:text-ivory-100 hover:bg-ivory-200 transition-all cursor-pointer"
          >
            <span>Compare All Buyers ({crop.directBuyers.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
