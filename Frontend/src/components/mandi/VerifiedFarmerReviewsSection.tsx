import { useState } from "react";
import { Star, ShieldCheck, CheckCircle2, Filter, ArrowUpDown } from "lucide-react";
import type { BuyerProfile, BuyerReview } from "../../types/mandi";

interface VerifiedFarmerReviewsSectionProps {
  buyer: BuyerProfile;
}

export function VerifiedFarmerReviewsSection({ buyer }: VerifiedFarmerReviewsSectionProps) {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"RECENT" | "HIGHEST" | "LOWEST">("RECENT");

  const rawReviews: BuyerReview[] = buyer.reviews || [
    {
      id: "REV-01",
      farmerIdAnonymized: "Verified Farmer - Barabanki",
      rating: 5.0,
      categoryRatings: {
        paymentReliability: 5.0,
        priceFairness: 4.8,
        behaviour: 5.0,
        contractAdherence: 5.0,
        pickupReliability: 5.0,
        disputeResolution: 5.0,
      },
      comment: "Payment was received on time and the pickup process from farmgate was smooth. Very professional behavior.",
      crop: "Wheat",
      quantityQuintals: 250,
      transactionDate: "18 August 2026",
      verifiedTransaction: true,
      reviewCategory: "Payment",
    },
    {
      id: "REV-02",
      farmerIdAnonymized: "Verified Farmer - Unnao",
      rating: 4.0,
      categoryRatings: {
        paymentReliability: 4.5,
        priceFairness: 4.5,
        behaviour: 4.0,
        contractAdherence: 4.0,
        pickupReliability: 3.5,
        disputeResolution: 4.0,
      },
      comment: "Price was fair and payment came within 48 hours, but truck pickup was delayed by one day due to rain.",
      crop: "Rice",
      quantityQuintals: 120,
      transactionDate: "12 August 2026",
      verifiedTransaction: true,
      reviewCategory: "Pickup",
    },
    {
      id: "REV-03",
      farmerIdAnonymized: "Verified Farmer - Sitapur",
      rating: 5.0,
      categoryRatings: {
        paymentReliability: 5.0,
        priceFairness: 4.8,
        behaviour: 5.0,
        contractAdherence: 5.0,
        pickupReliability: 5.0,
        disputeResolution: 5.0,
      },
      comment: "Strict quality moisture check, but offered ₹50/q extra for Grade A wheat. Payment settled instantly.",
      crop: "Wheat",
      quantityQuintals: 400,
      transactionDate: "02 August 2026",
      verifiedTransaction: true,
      reviewCategory: "Price",
    },
  ];

  // Filter logic
  const filteredReviews = rawReviews.filter((rev) => {
    if (activeCategoryFilter === "All") return true;
    return rev.reviewCategory === activeCategoryFilter;
  });

  // Sort logic
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "HIGHEST") return b.rating - a.rating;
    if (sortBy === "LOWEST") return a.rating - b.rating;
    return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
  });

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ivory-200 dark:border-charcoal-light">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-charcoal dark:text-ivory-100">
              Verified Farmer Reviews
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400">
              Feedback from farmers with confirmed Agrisense transactions
            </p>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-charcoal-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-bold text-charcoal dark:text-ivory-100"
          >
            <option value="RECENT">Most Recent</option>
            <option value="HIGHEST">Highest Rated</option>
            <option value="LOWEST">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Review Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {["All", "Payment", "Price", "Pickup", "Behaviour", "Quality", "Dispute"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-extrabold transition-all ${
              activeCategoryFilter === cat
                ? "bg-forest text-white shadow-xs"
                : "bg-ivory-50 dark:bg-charcoal text-charcoal-muted dark:text-ivory-400 hover:text-charcoal border border-ivory-200 dark:border-charcoal-light"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Review Cards Grid */}
      <div className="space-y-4">
        {sortedReviews.length > 0 ? (
          sortedReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-3 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 font-black text-amber-500 text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{rev.rating.toFixed(1)}</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ✓ Verified Purchase
                  </span>
                </div>

                <span className="text-3xs text-charcoal-muted dark:text-ivory-400 font-medium">
                  Transaction Completed: {rev.transactionDate}
                </span>
              </div>

              <p className="text-xs font-semibold text-charcoal dark:text-ivory-100 leading-relaxed italic">
                "{rev.comment}"
              </p>

              <div className="flex items-center justify-between text-2xs pt-2 border-t border-ivory-200 dark:border-charcoal-light">
                <span className="font-extrabold text-charcoal-muted dark:text-ivory-300">
                  👤 {rev.farmerIdAnonymized}
                </span>

                <span className="font-bold text-forest dark:text-emerald-400">
                  🌾 {rev.crop} • {rev.quantityQuintals} q
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-charcoal-muted dark:text-ivory-400 font-semibold bg-ivory-50 dark:bg-charcoal rounded-2xl">
            No reviews match the selected filter category.
          </div>
        )}
      </div>
    </div>
  );
}
