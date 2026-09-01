import { Star, ShieldCheck, CheckCircle2 } from "lucide-react";
import type { BuyerProfile } from "../../types/mandi";

interface BuyerReputationSectionProps {
  buyer: BuyerProfile;
}

export function BuyerReputationSection({ buyer }: BuyerReputationSectionProps) {
  const rep = buyer.reputationBreakdown;

  const categories = [
    { label: "Payment Reliability", rating: rep.paymentReliability },
    { label: "Price Fairness", rating: rep.priceFairness },
    { label: "Behaviour", rating: rep.behaviour },
    { label: "Contract Adherence", rating: rep.contractAdherence },
    { label: "Pickup Reliability", rating: rep.pickupReliability },
    { label: "Dispute Resolution", rating: rep.disputeResolution },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ivory-200 dark:border-charcoal-light">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-charcoal dark:text-ivory-100">
              Farmer Reputation
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400">
              Verified rating breakdown from farmers who completed transactions
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-2xs font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Based on verified transactions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left Rating Hero */}
        <div className="p-6 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-4xl sm:text-5xl font-black text-charcoal dark:text-ivory-100">
            <Star className="w-9 h-9 fill-amber-400 text-amber-400" />
            <span>{rep.overallRating}</span>
            <span className="text-xl text-charcoal-muted font-normal">/ 5</span>
          </div>

          <p className="text-xs font-bold text-charcoal-muted dark:text-ivory-400">
            Based on {rep.totalReviewsCount} verified farmer reviews
          </p>
        </div>

        {/* Right Horizontal Rating Bars (2 Columns on MD) */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {categories.map((cat) => (
            <div key={cat.label} className="space-y-1">
              <div className="flex items-center justify-between font-bold text-charcoal dark:text-ivory-200">
                <span>{cat.label}</span>
                <span className="flex items-center gap-1 text-charcoal dark:text-ivory-100">
                  {cat.rating} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-ivory-200 dark:bg-charcoal overflow-hidden">
                <div
                  style={{ width: `${(cat.rating / 5) * 100}%` }}
                  className="h-full rounded-full bg-amber-400"
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
