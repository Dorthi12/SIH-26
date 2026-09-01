import { Building2, ShieldCheck, MapPin, Star, MessageSquare, ChevronRight } from "lucide-react";
import type { BuyerProfile } from "../../types/mandi";

interface BuyerPreviewCardProps {
  buyer: BuyerProfile;
  onViewBuyer: () => void;
  onContactBuyer: () => void;
}

export function BuyerPreviewCard({ buyer, onViewBuyer, onContactBuyer }: BuyerPreviewCardProps) {
  const req = buyer.detailedRequirements[0] || {
    cropName: "Wheat",
    minQuantityQuintals: 500,
    expectedPriceMin: 2700,
    expectedPriceMax: 2850,
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-4 hover:border-blue-500/40 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-sm shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
              🏢 {buyer.businessName}
            </h4>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400 flex items-center gap-1">
              <span>{buyer.buyerType}</span>
              <span>•</span>
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>
                {buyer.district}, {buyer.state}
              </span>
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-3xs font-extrabold flex items-center gap-1 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>✓ Business Verified</span>
        </span>
      </div>

      {/* Trust Stats Bar */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs p-2.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
        <div>
          <span className="text-3xs text-charcoal-muted block font-bold">Rating</span>
          <span className="font-black text-amber-500 flex items-center justify-center gap-0.5 mt-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {buyer.farmerRating}/5
          </span>
        </div>

        <div>
          <span className="text-3xs text-charcoal-muted block font-bold">Purchases</span>
          <span className="font-black text-charcoal dark:text-ivory-100 mt-0.5 block">
            {buyer.completedTransactionsCount.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-3xs text-charcoal-muted block font-bold">Payment</span>
          <span className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {buyer.paymentReliabilityPercentage}%
          </span>
        </div>
      </div>

      {/* Requirement Highlight */}
      <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs space-y-1">
        <span className="text-3xs font-extrabold uppercase text-blue-700 dark:text-blue-300 block">
          Current requirement:
        </span>
        <div className="flex items-center justify-between font-extrabold text-charcoal dark:text-ivory-100">
          <span>🌾 {req.minQuantityQuintals} q {req.cropName}</span>
          <span className="text-forest dark:text-emerald-400">
            ₹{req.expectedPriceMin.toLocaleString()} – ₹{req.expectedPriceMax.toLocaleString()}/q
          </span>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onViewBuyer}
          className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-ivory-100 dark:bg-charcoal text-charcoal dark:text-ivory-200 border border-ivory-300 dark:border-charcoal-light hover:bg-ivory-200 transition-colors flex items-center justify-center gap-1"
        >
          <span>[View Buyer]</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onContactBuyer}
          className="flex-1 py-2 rounded-xl text-xs font-black bg-forest hover:bg-forest-dark text-white shadow-sm transition-colors flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber" />
          <span>[Contact]</span>
        </button>
      </div>
    </div>
  );
}
