import { ShieldCheck, Calendar, Truck, DollarSign, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { BuyerOffer, UserRole } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface OfferCardInlineProps {
  offer: BuyerOffer;
  userRole: UserRole;
  onAccept: () => void;
  onCounter: () => void;
  onReject: () => void;
}

export function OfferCardInline({ offer, userRole, onAccept, onCounter, onReject }: OfferCardInlineProps) {
  const { t } = useLanguage();
  const displayPrice = offer.counterPricePerQuintal || offer.proposedPricePerQuintal;
  const totalAmount = displayPrice * offer.quantityQuintals;

  return (
    <div className="my-4 p-5 rounded-3xl bg-gradient-to-br from-ivory-50 to-white dark:from-charcoal dark:to-charcoal-dark border-2 border-forest/40 dark:border-emerald-500/40 shadow-lg space-y-4 max-w-lg mx-auto">
      {/* Header Banner */}
      <div className="text-center pb-3 border-b border-ivory-200 dark:border-charcoal-light space-y-1">
        <span className="text-3xs uppercase tracking-widest font-black text-forest dark:text-emerald-400 block">
          ━━━━━━━━ BUYER OFFER ━━━━━━━━
        </span>
        <h3 className="text-lg font-black text-charcoal dark:text-ivory-100">
          🌾 {offer.cropListing.cropName} ({offer.cropListing.variety})
        </h3>
        <p className="text-xs text-charcoal-muted dark:text-ivory-400">
          {offer.buyerProfile.businessName} • <span className="text-emerald-600 font-bold">✓ Business Verified</span>
        </p>
      </div>

      {/* Main Commercial Terms */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="p-3 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light">
          <span className="text-3xs text-charcoal-muted block font-bold">Quantity</span>
          <span className="text-lg font-black text-charcoal dark:text-ivory-100 mt-0.5 block">
            {offer.quantityQuintals} Quintals
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60">
          <span className="text-3xs text-emerald-800 dark:text-emerald-300 block font-bold">Offer Rate</span>
          <span className="text-lg font-black text-forest dark:text-emerald-400 mt-0.5 block">
            ₹{displayPrice.toLocaleString()} / q
          </span>
        </div>
      </div>

      {/* Structured Terms Breakdown */}
      <div className="space-y-2 text-xs bg-white dark:bg-charcoal-dark p-3.5 rounded-2xl border border-ivory-200 dark:border-charcoal-light">
        <div className="flex justify-between">
          <span className="text-charcoal-muted font-bold">Total Deal Value:</span>
          <span className="font-black text-forest dark:text-emerald-400">₹{totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-charcoal-muted font-bold">Quality Spec:</span>
          <span className="font-semibold text-blue-600">{offer.qualityGrade || offer.cropListing.quality.grade}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-charcoal-muted font-bold">Moisture Limit:</span>
          <span className="font-semibold text-charcoal dark:text-ivory-100">≤ {offer.maxMoisturePercentage || 12.0}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-charcoal-muted font-bold">Logistics / Pickup:</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{offer.pickupPreference}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-charcoal-muted font-bold">Target Date:</span>
          <span className="font-semibold text-amber-700 dark:text-amber-400">{offer.expectedDeliveryDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-charcoal-muted font-bold">Payment Terms:</span>
          <span className="font-semibold text-emerald-600">{offer.paymentTerms}</span>
        </div>
      </div>

      {/* Actions (If Awaiting Response) */}
      {offer.status === "AWAITING_RESPONSE" ? (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-ivory-200 dark:border-charcoal-light">
          <button
            onClick={onAccept}
            className="py-2.5 rounded-xl font-extrabold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-1 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>[Accept]</span>
          </button>

          <button
            onClick={onCounter}
            className="py-2.5 rounded-xl font-extrabold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md flex items-center justify-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>[Counter]</span>
          </button>

          <button
            onClick={onReject}
            className="py-2.5 rounded-xl font-extrabold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center justify-center gap-1 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>[Reject]</span>
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-center font-extrabold text-xs text-emerald-800 dark:text-emerald-200">
          🟢 Status: {offer.status}
        </div>
      )}
    </div>
  );
}
