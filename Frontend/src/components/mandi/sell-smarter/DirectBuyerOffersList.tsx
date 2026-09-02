import { useState } from "react";
import type { DirectBuyerOfferItem, SellSmarterCropOption } from "../../../types/sellSmarter";
import {
  Building2,
  ShieldCheck,
  Star,
  Truck,
  DollarSign,
  HelpCircle,
  SlidersHorizontal,
  Info,
  Clock,
  ArrowRight,
} from "lucide-react";

interface DirectBuyerOffersListProps {
  crop: SellSmarterCropOption;
  offers: DirectBuyerOfferItem[];
  onSelectBuyer: (buyer: DirectBuyerOfferItem) => void;
  onOpenWhyThisPrice: (buyer: DirectBuyerOfferItem) => void;
  onOpenBuyerProfile: (buyerId: string) => void;
}

type SortOption =
  | "HIGHEST_NET"
  | "HIGHEST_GROSS"
  | "LOWEST_TRANSPORT"
  | "REPUTATION"
  | "DISTANCE";

export function DirectBuyerOffersList({
  crop,
  offers,
  onSelectBuyer,
  onOpenWhyThisPrice,
  onOpenBuyerProfile,
}: DirectBuyerOffersListProps) {
  const [sortBy, setSortBy] = useState<SortOption>("HIGHEST_NET");
  const [activeQualityModalOffer, setActiveQualityModalOffer] = useState<DirectBuyerOfferItem | null>(null);

  const sortedOffers = [...offers].sort((a, b) => {
    if (sortBy === "HIGHEST_NET") return b.estimatedNetRealizationPerQ - a.estimatedNetRealizationPerQ;
    if (sortBy === "HIGHEST_GROSS") return b.offerPricePerQ - a.offerPricePerQ;
    if (sortBy === "LOWEST_TRANSPORT") return a.transportCostPerQ - b.transportCostPerQ;
    if (sortBy === "REPUTATION") return b.buyerRating - a.buyerRating;
    if (sortBy === "DISTANCE") return a.distanceKm - b.distanceKm;
    return 0;
  });

  return (
    <div className="bg-white dark:bg-charcoal-dark p-6 rounded-3xl border border-ivory-300 dark:border-charcoal-light shadow-sm space-y-6">
      {/* Top Header & Sort Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 dark:border-charcoal-light pb-4">
        <div>
          <h3 className="font-black text-lg text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-forest dark:text-emerald-400" />
            <span>Available Direct Buyer Offers ({offers.length})</span>
          </h3>
          <p className="text-2xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
            Verified corporate buyers, flour mills, dal mills, and exporters bidding for your crop
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-charcoal-muted dark:text-ivory-400" />
          <span className="text-3xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400">
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light text-charcoal dark:text-ivory-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest"
          >
            <option value="HIGHEST_NET">Highest Net Realization</option>
            <option value="HIGHEST_GROSS">Highest Gross Offer</option>
            <option value="LOWEST_TRANSPORT">Lowest Transport Cost</option>
            <option value="REPUTATION">Highest Buyer Rating</option>
            <option value="DISTANCE">Closest Distance</option>
          </select>
        </div>
      </div>

      {/* Offers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sortedOffers.map((offer) => {
          const isFairWithin = offer.offerPricePerQ >= crop.fairPriceRangeMinPerQ;

          return (
            <div
              key={offer.id}
              className="bg-ivory-50/80 dark:bg-charcoal p-5 rounded-2xl border border-ivory-300 dark:border-charcoal-light hover:border-forest dark:hover:border-emerald-500 transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                {/* Buyer Title & Rating Header */}
                <div className="flex items-start justify-between gap-2 border-b border-ivory-200 dark:border-charcoal-light/60 pb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-sm text-charcoal dark:text-ivory-100 truncate max-w-[160px]">
                        {offer.businessName}
                      </h4>
                      {offer.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-3xs font-bold text-charcoal-muted dark:text-ivory-400">
                      <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        {offer.buyerRating}/5
                      </span>
                      <span>•</span>
                      <span>{offer.distanceKm} km away</span>
                    </div>
                  </div>

                  {/* Price Fairness Indicator Badge */}
                  <span
                    className={`text-3xs font-black px-2 py-0.5 rounded-full shrink-0 ${
                      isFairWithin
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200"
                    }`}
                  >
                    {isFairWithin ? "✓ Within Fair Range" : "⚠️ Below Reference Range"}
                  </span>
                </div>

                {/* Offer Numbers */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-charcoal-muted dark:text-ivory-400">
                      Gross Offer Price
                    </span>
                    <span className="text-base font-black text-charcoal dark:text-ivory-100">
                      ₹{offer.offerPricePerQ.toLocaleString("en-IN")} / q
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-xs font-bold">
                    <span className="text-charcoal-muted dark:text-ivory-400 flex items-center gap-1">
                      <Truck className="w-3 h-3 text-amber" />
                      Transport Cost
                    </span>
                    <span className="text-rose-600 dark:text-rose-400">
                      -₹{offer.transportCostPerQ} / q
                    </span>
                  </div>

                  {/* Net Realization Box */}
                  <div className="p-3 rounded-xl bg-forest/10 dark:bg-emerald-950/40 border border-forest/20 dark:border-emerald-700/50 flex items-center justify-between mt-2">
                    <span className="text-xs font-black text-forest dark:text-emerald-300">
                      Expected Net
                    </span>
                    <span className="text-lg font-black text-forest dark:text-emerald-400">
                      ₹{offer.estimatedNetRealizationPerQ.toLocaleString("en-IN")} / q
                    </span>
                  </div>
                </div>

                {/* Trust & Quality Indicators */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-3xs font-bold">
                  <div className="p-2 rounded-xl bg-ivory-200 dark:bg-charcoal-dark text-charcoal-muted dark:text-ivory-300">
                    <span className="block text-4xs uppercase font-extrabold text-charcoal-muted">Payment Terms</span>
                    <span className="text-charcoal dark:text-ivory-100 truncate block">{offer.paymentTerms}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-ivory-200 dark:bg-charcoal-dark text-charcoal-muted dark:text-ivory-300">
                    <span className="block text-4xs uppercase font-extrabold text-charcoal-muted">Payment Reliability</span>
                    <span className="text-emerald-600 dark:text-emerald-400 block font-black">
                      {offer.paymentReliabilityPercentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="space-y-2 pt-2 border-t border-ivory-200 dark:border-charcoal-light/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectBuyer(offer)}
                    className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-forest text-white hover:bg-forest-dark transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-amber" />
                    <span>View / Select</span>
                  </button>

                  <button
                    onClick={() => onOpenWhyThisPrice(offer)}
                    title="Why this price?"
                    className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 border border-amber-300 text-amber-900 dark:text-amber-200 hover:bg-amber-200 transition-colors shrink-0 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-700" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-4xs font-bold text-charcoal-muted dark:text-ivory-400">
                  <button
                    onClick={() => setActiveQualityModalOffer(offer)}
                    className="text-forest dark:text-emerald-400 underline hover:text-forest-dark cursor-pointer flex items-center gap-0.5"
                  >
                    <Info className="w-2.5 h-2.5" />
                    <span>Quality Check Details</span>
                  </button>

                  <button
                    onClick={() => onOpenBuyerProfile(offer.buyerId)}
                    className="hover:underline cursor-pointer"
                  >
                    Profile
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Offer Quality Check Modal */}
      {activeQualityModalOffer && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-charcoal-dark max-w-lg w-full rounded-3xl p-6 border border-ivory-300 dark:border-charcoal-light shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-forest dark:text-emerald-400" />
                <h3 className="font-black text-base text-charcoal dark:text-ivory-100">
                  Offer Quality & Reliability Check
                </h3>
              </div>
              <button
                onClick={() => setActiveQualityModalOffer(null)}
                className="text-xs font-black text-charcoal-muted hover:text-charcoal cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-forest/5 dark:bg-emerald-950/40 border border-forest/20 text-charcoal dark:text-ivory-100 font-extrabold flex justify-between">
                <span>Buyer:</span>
                <span>{activeQualityModalOffer.businessName}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-2xs">
                <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                  <span className="text-charcoal-muted block">Gross Offer</span>
                  <span className="font-black text-sm text-charcoal dark:text-ivory-100">₹{activeQualityModalOffer.offerPricePerQ}/q</span>
                </div>

                <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                  <span className="text-charcoal-muted block">Expected Net</span>
                  <span className="font-black text-sm text-forest dark:text-emerald-400">₹{activeQualityModalOffer.estimatedNetRealizationPerQ}/q</span>
                </div>

                <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                  <span className="text-charcoal-muted block">Quality Spec</span>
                  <span className="font-bold text-charcoal dark:text-ivory-100">{activeQualityModalOffer.qualityRequirement}</span>
                </div>

                <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                  <span className="text-charcoal-muted block">Max Moisture</span>
                  <span className="font-bold text-charcoal dark:text-ivory-100">{activeQualityModalOffer.moistureRequirementMax}%</span>
                </div>

                <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                  <span className="text-charcoal-muted block">Payment Reliability</span>
                  <span className="font-bold text-emerald-600">{activeQualityModalOffer.paymentReliabilityPercentage}%</span>
                </div>

                <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                  <span className="text-charcoal-muted block">Avg Payment Time</span>
                  <span className="font-bold text-charcoal dark:text-ivory-100">{activeQualityModalOffer.avgPaymentDays} Days</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-900 dark:text-amber-200 text-3xs font-semibold">
                💡 Quality Recommendation: Higher gross offers may have stricter moisture limits or higher transport charges. Always evaluate net realization.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveQualityModalOffer(null)}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-forest text-white hover:bg-forest-dark"
              >
                Close Check
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
