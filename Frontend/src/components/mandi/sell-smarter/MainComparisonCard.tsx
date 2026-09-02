import { useState } from "react";
import type { SellSmarterCropOption, DirectBuyerOfferItem } from "../../../types/sellSmarter";
import {
  Building2,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";

interface MainComparisonCardProps {
  crop: SellSmarterCropOption;
  bestBuyer: DirectBuyerOfferItem;
  onOpenBuyerProfile: (buyerId: string) => void;
  onOpenWhyThisPrice: (buyer: DirectBuyerOfferItem) => void;
  onContactBuyer: (buyer: DirectBuyerOfferItem) => void;
}

export function MainComparisonCard({
  crop,
  bestBuyer,
  onOpenBuyerProfile,
  onOpenWhyThisPrice,
  onContactBuyer,
}: MainComparisonCardProps) {
  const [showBreakdown, setShowBreakdown] = useState<boolean>(true);

  const mandi = crop.mandi;
  const mandiNetPerQ = mandi.estimatedNetRealizationPerQ;
  const buyerNetPerQ = bestBuyer.estimatedNetRealizationPerQ;
  const diffPerQ = buyerNetPerQ - mandiNetPerQ;
  const totalDiffValue = diffPerQ * crop.quantityQuintals;

  return (
    <div className="bg-white dark:bg-charcoal-dark rounded-3xl border-2 border-forest/30 dark:border-emerald-500/40 shadow-xl overflow-hidden space-y-0">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-forest via-forest-dark to-emerald-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber text-charcoal font-black text-xs uppercase tracking-wider shadow-xs">
              Visual Centerpiece
            </span>
            <span className="text-xs text-ivory-200 font-semibold">
              Net Realization Decision Support
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 flex items-center gap-3">
            <span>🧮 Mandi vs Direct Buyer Comparison</span>
          </h2>
          <p className="text-xs sm:text-sm text-ivory-200 mt-1 max-w-xl">
            Compare expected net realization after subtracting all market charges, handling, and transport costs.
          </p>
        </div>

        {/* Potential Gain Badge Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 text-center space-y-0.5">
          <span className="text-3xs uppercase font-extrabold text-ivory-200 tracking-wider block">
            Potential Net Advantage
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber block">
            +{diffPerQ >= 0 ? `₹${diffPerQ.toLocaleString("en-IN")}` : `₹${diffPerQ}`}/q
          </span>
          <span className="text-xs font-bold text-white block">
            +₹{totalDiffValue.toLocaleString("en-IN")} total for {crop.quantityQuintals} q
          </span>
        </div>
      </div>

      {/* Main Side-By-Side Visual Comparison Grid */}
      <div className="p-6 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* VS Badge Floating Center */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-amber text-charcoal font-black text-sm items-center justify-center border-4 border-white dark:border-charcoal-dark shadow-lg">
            VS
          </div>

          {/* LEFT COLUMN: APMC / MANDI */}
          <div className="bg-ivory-50 dark:bg-charcoal p-6 rounded-3xl border border-ivory-300 dark:border-charcoal-light flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-3">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-amber" />
                  <h3 className="font-black text-lg text-charcoal dark:text-ivory-100">
                    🏪 APMC / MANDI
                  </h3>
                </div>
                <span className="text-3xs font-extrabold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200">
                  {mandi.marketName}
                </span>
              </div>

              {/* Price Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-charcoal-muted dark:text-ivory-400">
                    Current Market Price
                  </span>
                  <span className="text-lg font-black text-charcoal dark:text-ivory-100">
                    ₹{mandi.grossPricePerQ.toLocaleString("en-IN")} / q
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-charcoal-muted dark:text-ivory-400">
                    Quantity
                  </span>
                  <span className="text-xs font-bold text-charcoal dark:text-ivory-200">
                    {mandi.quantityQuintals} q
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-ivory-200 dark:border-charcoal-light pb-2">
                  <span className="text-xs font-bold text-charcoal-muted dark:text-ivory-400">
                    Gross Mandi Value
                  </span>
                  <span className="text-xs font-bold text-charcoal dark:text-ivory-200">
                    ₹{mandi.grossValue.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Deductions breakdown */}
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-rose-900 dark:text-rose-300">
                  <span className="flex items-center gap-1">
                    <span>Estimated Deductions</span>
                    <span className="text-3xs font-bold px-1.5 py-0.2 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100">
                      Estimated
                    </span>
                  </span>
                  <span>-₹{mandi.deductions.totalDeductionsPerQ} / q</span>
                </div>

                <div className="space-y-1 text-3xs font-semibold text-rose-800 dark:text-rose-400 pt-1 border-t border-rose-200/60 dark:border-rose-900/50">
                  <div className="flex justify-between">
                    <span>Market-related charges</span>
                    <span>₹{mandi.deductions.marketChargesPerQ}/q</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling</span>
                    <span>₹{mandi.deductions.handlingPerQ}/q</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loading / Unloading</span>
                    <span>₹{mandi.deductions.loadingUnloadingPerQ}/q</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other estimated deductions</span>
                    <span>₹{mandi.deductions.otherChargesPerQ}/q</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mandi Net Realization Callout */}
            <div className="p-4 rounded-2xl bg-ivory-200 dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light space-y-1 text-center">
              <span className="text-3xs font-black uppercase text-charcoal-muted dark:text-ivory-400 tracking-wider block">
                Estimated Net Realization
              </span>
              <span className="text-2xl font-black text-charcoal dark:text-ivory-100 block">
                ₹{mandiNetPerQ.toLocaleString("en-IN")} / q
              </span>
              <span className="text-xs font-extrabold text-charcoal-muted dark:text-ivory-300 block">
                Total Net: ₹{mandi.estimatedNetValue.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: DIRECT BUYER */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-6 rounded-3xl border-2 border-emerald-400 dark:border-emerald-700/80 flex flex-col justify-between space-y-6 shadow-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-black text-lg text-emerald-950 dark:text-emerald-100">
                      🤝 DIRECT BUYER
                    </h3>
                  </div>
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1 mt-0.5">
                    <span>{bestBuyer.businessName}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </p>
                </div>
                <span className="text-3xs font-black px-2.5 py-1 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                  {bestBuyer.verificationBadge}
                </span>
              </div>

              {/* Price Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Buyer Offer Price
                  </span>
                  <span className="text-lg font-black text-emerald-950 dark:text-emerald-100">
                    ₹{bestBuyer.offerPricePerQ.toLocaleString("en-IN")} / q
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Quantity
                  </span>
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    {bestBuyer.quantityQuintals} q
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-emerald-200 dark:border-emerald-800/60 pb-2">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Gross Offer Value
                  </span>
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    ₹{bestBuyer.grossValue.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Transport Deductions */}
              <div className="p-4 rounded-2xl bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700/60 space-y-1">
                <div className="flex items-center justify-between text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                  <span className="flex items-center gap-1">
                    <span>Estimated Transport</span>
                    <span className="text-3xs font-bold px-1.5 py-0.2 rounded bg-emerald-300 dark:bg-emerald-800 text-emerald-950 dark:text-white">
                      Estimated
                    </span>
                  </span>
                  <span>-₹{bestBuyer.transportCostPerQ} / q</span>
                </div>
                <div className="flex justify-between text-3xs font-bold text-emerald-800 dark:text-emerald-300">
                  <span>Distance: {bestBuyer.distanceKm} km</span>
                  <span>Total Transport: ₹{(bestBuyer.transportCostPerQ * crop.quantityQuintals).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => onOpenBuyerProfile(bestBuyer.buyerId)}
                  className="px-3 py-1.5 rounded-xl text-3xs font-extrabold bg-white dark:bg-charcoal-dark border border-emerald-400 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-50 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <Building2 className="w-3 h-3 text-emerald-600" />
                  <span>Buyer Profile</span>
                </button>

                <button
                  onClick={() => onContactBuyer(bestBuyer)}
                  className="px-3 py-1.5 rounded-xl text-3xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-amber" />
                  <span>View Offer / Contact</span>
                </button>

                <button
                  onClick={() => onOpenWhyThisPrice(bestBuyer)}
                  className="px-3 py-1.5 rounded-xl text-3xs font-extrabold bg-amber-100 dark:bg-amber-950 border border-amber-300 text-amber-900 dark:text-amber-200 hover:bg-amber-200 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3 text-amber-600" />
                  <span>Why this price?</span>
                </button>
              </div>
            </div>

            {/* Direct Buyer Net Realization Callout */}
            <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-md space-y-1 text-center">
              <span className="text-3xs font-black uppercase text-emerald-100 tracking-wider block">
                Estimated Net Realization
              </span>
              <span className="text-2xl font-black block">
                ₹{buyerNetPerQ.toLocaleString("en-IN")} / q
              </span>
              <span className="text-xs font-extrabold text-emerald-100 block">
                Total Net: ₹{bestBuyer.estimatedNetValue.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* PROMINENT EXPECTED NET COMPARISON CALLOUT */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-emerald-500/10 dark:from-amber-950/40 dark:to-emerald-950/40 border-2 border-amber-400 dark:border-amber-600/60 shadow-lg space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 block">
              ⭐ The Most Important Metric ⭐
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-charcoal dark:text-ivory-100">
              Expected Net Realization Comparison
            </h3>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400">
              Compare actual take-home income per quintal after deducting market charges & transport fees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 text-center">
            {/* APMC Net */}
            <div className="p-4 rounded-2xl bg-white dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light shadow-xs space-y-1">
              <span className="text-xs font-bold text-charcoal-muted dark:text-ivory-400 block">
                APMC / MANDI
              </span>
              <span className="text-2xl font-black text-charcoal dark:text-ivory-100 block">
                ₹{mandiNetPerQ.toLocaleString("en-IN")}/q
              </span>
              <span className="text-3xs font-extrabold text-amber-700 dark:text-amber-400 block">
                Expected Net Realization
              </span>
            </div>

            {/* Difference Centerpiece */}
            <div className="p-4 rounded-2xl bg-amber text-charcoal shadow-md space-y-1 transform sm:scale-105">
              <span className="text-xs font-black uppercase tracking-wider block">
                Potential Difference
              </span>
              <span className="text-3xl font-black block">
                +{diffPerQ >= 0 ? `₹${diffPerQ}` : `₹${diffPerQ}`} / q
              </span>
              <span className="text-xs font-bold block">
                For {crop.quantityQuintals} quintals:{" "}
                <strong className="text-forest underline font-black text-sm">
                  +₹{totalDiffValue.toLocaleString("en-IN")}
                </strong>
              </span>
            </div>

            {/* Direct Buyer Net */}
            <div className="p-4 rounded-2xl bg-forest text-white shadow-xs space-y-1">
              <span className="text-xs font-bold text-ivory-200 block">
                DIRECT BUYER
              </span>
              <span className="text-2xl font-black text-amber block">
                ₹{buyerNetPerQ.toLocaleString("en-IN")}/q
              </span>
              <span className="text-3xs font-extrabold text-ivory-200 block">
                Expected Net Realization
              </span>
            </div>
          </div>

          {/* Toggle Expandable Calculation Breakdown */}
          <div className="pt-2 border-t border-amber-300/40 dark:border-amber-800/40 flex justify-center">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-xs font-extrabold text-forest dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{showBreakdown ? "Hide Breakdown of Total Value" : "Show Breakdown of Total Value"}</span>
              {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Expandable Breakdown Section */}
          {showBreakdown && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-in fade-in duration-200">
              {/* Mandi Breakdown */}
              <div className="p-5 rounded-2xl bg-white dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-2 text-xs font-bold">
                <h4 className="font-black text-sm text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-amber" />
                  <span>Mandi Calculation</span>
                </h4>
                <div className="flex justify-between py-1 border-b border-ivory-200 dark:border-charcoal-light">
                  <span className="text-charcoal-muted dark:text-ivory-400">Gross Crop Value</span>
                  <span className="text-charcoal dark:text-ivory-100">₹{mandi.grossValue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-ivory-200 dark:border-charcoal-light text-rose-600 dark:text-rose-400">
                  <span>− Estimated Charges (₹{mandi.deductions.totalDeductionsPerQ}/q)</span>
                  <span>−₹{(mandi.deductions.totalDeductionsPerQ * crop.quantityQuintals).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 text-sm font-black text-charcoal dark:text-ivory-100">
                  <span>Estimated Net</span>
                  <span>₹{mandi.estimatedNetValue.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Direct Buyer Breakdown */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 space-y-2 text-xs font-bold">
                <h4 className="font-black text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Direct Buyer Calculation</span>
                </h4>
                <div className="flex justify-between py-1 border-b border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-emerald-800 dark:text-emerald-300">Gross Crop Value</span>
                  <span className="text-emerald-950 dark:text-emerald-100">₹{bestBuyer.grossValue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400">
                  <span>− Estimated Transport (₹{bestBuyer.transportCostPerQ}/q)</span>
                  <span>−₹{(bestBuyer.transportCostPerQ * crop.quantityQuintals).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 text-sm font-black text-emerald-950 dark:text-emerald-100">
                  <span>Estimated Net</span>
                  <span>₹{bestBuyer.estimatedNetValue.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
