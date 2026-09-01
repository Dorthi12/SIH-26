import { useState } from "react";
import { X, Send, Scale, Truck, Calendar, ShieldCheck, DollarSign } from "lucide-react";
import type { CropListing, BuyerOffer } from "../../types/mandi";
import { mandiService } from "../../services/mandiService";
import { useLanguage } from "../../context/LanguageContext";

interface OfferModalProps {
  listing: CropListing;
  onClose: () => void;
  onOfferSent: (offer: BuyerOffer) => void;
}

export function OfferModal({ listing, onClose, onOfferSent }: OfferModalProps) {
  const { t } = useLanguage();

  const [quantityQuintals, setQuantityQuintals] = useState<number>(
    Math.min(100, listing.quantityQuintals)
  );
  const [proposedPrice, setProposedPrice] = useState<number>(listing.askingPricePerQuintal);
  const [pickupPreference, setPickupPreference] = useState<BuyerOffer["pickupPreference"]>(
    "Buyer Arranged Transport"
  );
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("2026-05-15");
  const [paymentTerms, setPaymentTerms] = useState<BuyerOffer["paymentTerms"]>(
    "Escrow / 3-Day Bank Release"
  );
  const [additionalNotes, setAdditionalNotes] = useState(
    "Interested in purchasing this lot. We have verified your Agrisense Crop Report and organic certificate."
  );

  const totalAmount = quantityQuintals * proposedPrice;

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const offer = mandiService.createOffer({
      listingId: listing.id,
      quantityQuintals,
      proposedPricePerQuintal: proposedPrice,
      pickupPreference,
      expectedDeliveryDate,
      paymentTerms,
      additionalNotes,
    });

    onOfferSent(offer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ivory-200 dark:border-charcoal-light bg-gradient-to-r from-forest/10 via-emerald-50 to-ivory-50 dark:from-forest/20 dark:via-charcoal dark:to-charcoal-dark">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-forest text-white shadow-sm">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-charcoal dark:text-ivory-100">
                {t("Make an Offer / Express Interest", "प्रस्ताव भेजें / रुचि व्यक्त करें")}
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-ivory-400">
                {listing.cropName} ({listing.variety}) • Asking: ₹
                {listing.askingPricePerQuintal.toLocaleString()}/q
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-ivory-200 dark:hover:bg-charcoal-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOffer} className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Quantity & Proposed Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1">
                {t("Quantity Required (Quintals)", "आवश्यक मात्रा (क्विंटल)")}
              </label>
              <input
                type="number"
                max={listing.quantityQuintals}
                value={quantityQuintals}
                onChange={(e) => setQuantityQuintals(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm font-bold text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                required
              />
              <span className="text-3xs text-charcoal-muted dark:text-ivory-400 mt-0.5 block">
                Available: {listing.quantityQuintals} Quintals
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1">
                {t("Your Proposed Price (₹ / q)", "आपका प्रस्तावित मूल्य (₹ / क्विंटल)")}
              </label>
              <input
                type="number"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm font-bold text-forest dark:text-emerald-400 focus:ring-2 focus:ring-forest"
                required
              />
              <span className="text-3xs text-charcoal-muted dark:text-ivory-400 mt-0.5 block">
                Fair Range: ₹{listing.priceAnalysis.indicativeMinPrice} – ₹
                {listing.priceAnalysis.indicativeMaxPrice}/q
              </span>
            </div>
          </div>

          {/* Total Calculation Box */}
          <div className="p-4 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-muted dark:text-ivory-400">
              {t("Total Offer Value", "कुल प्रस्ताव मूल्य")}
            </span>
            <span className="text-xl font-black text-forest dark:text-emerald-400">
              ₹{totalAmount.toLocaleString()}
            </span>
          </div>

          {/* Logistics & Pickup */}
          <div>
            <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1">
              {t("Pickup / Delivery Preference", "पिकअप / डिलीवरी वरीयता")}
            </label>
            <select
              value={pickupPreference}
              onChange={(e) =>
                setPickupPreference(e.target.value as BuyerOffer["pickupPreference"])
              }
              className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100"
            >
              <option value="Buyer Arranged Transport">Buyer Arranged Transport (खरीदार द्वारा परिवहन)</option>
              <option value="Farmer Delivery">Farmer Delivery to Factory (किसान द्वारा डिलीवरी)</option>
              <option value="Mandi Pickup Point">APMC Mandi Pickup Point (मंडी पिकअप बिंदु)</option>
            </select>
          </div>

          {/* Expected Date & Payment Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1">
                {t("Expected Pickup Date", "अपेक्षित पिकअप तिथि")}
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1">
                {t("Payment Terms", "भुगतान शर्तें")}
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value as BuyerOffer["paymentTerms"])}
                className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100"
              >
                <option value="Escrow / 3-Day Bank Release">Escrow / 3-Day Bank Release (एस्क्रौ / बैंक रिलीज)</option>
                <option value="Advance Payment">100% Advance Payment (अग्रिम भुगतान)</option>
                <option value="Payment on Delivery">Payment on Delivery (डिलीवरी पर भुगतान)</option>
                <option value="50% Advance + 50% Delivery">50% Advance + 50% Delivery (50% अग्रिम + 50% डिलीवरी)</option>
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1">
              {t("Message to Farmer", "किसान को संदेश")}
            </label>
            <textarea
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs text-charcoal dark:text-ivory-100"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-charcoal-muted hover:text-charcoal dark:hover:text-ivory-100"
            >
              {t("Cancel", "रद्द करें")}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-forest text-white hover:bg-forest-dark transition-colors shadow-md flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {t("Send Offer Now", "अभी प्रस्ताव भेजें")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
