import { useState } from "react";
import { RotateCcw, DollarSign, X } from "lucide-react";
import type { BuyerOffer, UserRole } from "../../types/mandi";
import { mandiService } from "../../services/mandiService";
import { useLanguage } from "../../context/LanguageContext";

interface CounterOfferModalProps {
  offer: BuyerOffer;
  userRole: UserRole;
  onClose: () => void;
  onCounterSubmitted: () => void;
}

export function CounterOfferModal({
  offer,
  userRole,
  onClose,
  onCounterSubmitted,
}: CounterOfferModalProps) {
  const { t } = useLanguage();
  const [counterPrice, setCounterPrice] = useState<number>(offer.counterPricePerQuintal || 2900);
  const [note, setNote] = useState<string>("₹2,880 पर final कर सकते हैं। moisture 11.8% backed by lab test.");

  const handleSendCounter = (e: React.FormEvent) => {
    e.preventDefault();
    mandiService.updateOfferStatus(
      offer.id,
      "COUNTER_OFFERED",
      counterPrice,
      note,
      userRole
    );
    onCounterSubmitted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-ivory-200 dark:border-charcoal-light">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-lg text-charcoal dark:text-ivory-100">
              {t("Make Counter Offer", "काउंटर ऑफर बनाएं")}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-charcoal-muted font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original Offer Summary */}
        <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-charcoal-muted font-bold">Original Offer:</span>
            <span className="font-black text-blue-600">₹{offer.proposedPricePerQuintal}/q</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted font-bold">Quantity:</span>
            <span className="font-semibold text-charcoal dark:text-ivory-100">{offer.quantityQuintals} Quintals</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted font-bold">Payment:</span>
            <span className="font-semibold text-emerald-600">{offer.paymentTerms}</span>
          </div>
        </div>

        <form onSubmit={handleSendCounter} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
              {t("Your Counter Offer (₹ / Quintal)", "आपका काउंटर ऑफर (₹ / क्विंटल)")}
            </label>
            <input
              type="number"
              value={counterPrice}
              onChange={(e) => setCounterPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-400 bg-white font-black text-lg text-charcoal dark:text-ivory-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
              Negotiation Note / Message
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark text-xs text-charcoal dark:text-ivory-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-ivory-100 dark:bg-charcoal text-charcoal dark:text-ivory-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Send Counter Offer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
