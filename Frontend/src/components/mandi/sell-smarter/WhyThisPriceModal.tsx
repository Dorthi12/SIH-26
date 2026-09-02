import type { DirectBuyerOfferItem, SellSmarterCropOption } from "../../../types/sellSmarter";
import { HelpCircle, Scale, DollarSign, Info } from "lucide-react";

interface WhyThisPriceModalProps {
  crop: SellSmarterCropOption;
  buyer: DirectBuyerOfferItem | null;
  onClose: () => void;
}

export function WhyThisPriceModal({
  crop,
  buyer,
  onClose,
}: WhyThisPriceModalProps) {
  if (!buyer) return null;

  const diff = buyer.offerPricePerQ - crop.fairPriceRangeMinPerQ;

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-charcoal-dark max-w-lg w-full rounded-3xl p-6 border border-ivory-300 dark:border-charcoal-light shadow-2xl space-y-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-black text-base text-charcoal dark:text-ivory-100">
              Why Is This Price Offered?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-black text-charcoal-muted hover:text-charcoal cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Comparison Numbers */}
        <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-3">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-charcoal-muted dark:text-ivory-400">Buyer Offer</span>
            <span className="text-base font-black text-charcoal dark:text-ivory-100">
              ₹{buyer.offerPricePerQ.toLocaleString("en-IN")} / q
            </span>
          </div>

          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              Agrisense Fair Price Range
            </span>
            <span className="text-emerald-800 dark:text-emerald-300 font-extrabold">
              ₹{crop.fairPriceRangeMinPerQ} – ₹{crop.fairPriceRangeMaxPerQ} / q
            </span>
          </div>

          <div className="flex justify-between items-center text-xs font-bold border-t border-ivory-200 dark:border-charcoal-light pt-2">
            <span className="text-charcoal-muted dark:text-ivory-400">Difference vs Reference Min</span>
            <span className={`font-black ${diff >= 0 ? "text-emerald-600" : "text-amber-600 dark:text-amber-400"}`}>
              {diff >= 0 ? `+₹${diff}/q` : `-₹${Math.abs(diff)}/q`}
            </span>
          </div>
        </div>

        {/* Explanatory Reasons List */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-charcoal dark:text-ivory-200 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-forest dark:text-emerald-400" />
            <span>Possible Contributing Factors</span>
          </h4>

          <ul className="space-y-2 text-xs font-medium text-charcoal-muted dark:text-ivory-300">
            {buyer.whyThisPriceFactors.map((factor, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex items-start gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-forest dark:bg-emerald-400 mt-1.5 shrink-0" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer Note */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-3xs font-semibold text-amber-900 dark:text-amber-200">
          ℹ️ <strong>Explanatory Context:</strong> Buyer pricing reflects market demand, quality specifications, and logistics arrangements. This explanation is neutral decision support and does not represent an accusation of unfair pricing.
        </div>

        {/* Close Action */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-forest text-white hover:bg-forest-dark transition-colors shadow-xs"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
