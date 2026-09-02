import { useState } from "react";
import { DollarSign, ShieldCheck, Calendar, Truck, Clock, X, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { CropListing, BuyerOffer, BuyerProfile } from "../../types/mandi";
import { mandiService } from "../../services/mandiService";
import { useLanguage } from "../../context/LanguageContext";
import { isPrivateBuyerEntity, getPrivateBuyerCompliance } from "../../utils/privateBuyerCompliance";
import { PrivateBuyerBadge } from "./PrivateBuyerBadge";

interface StructuredOfferModalProps {
  cropListing: CropListing;
  buyerProfile: BuyerProfile;
  onClose: () => void;
  onOfferSent: (offer: BuyerOffer) => void;
}

export function StructuredOfferModal({
  cropListing,
  buyerProfile,
  onClose,
  onOfferSent,
}: StructuredOfferModalProps) {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState<number>(cropListing.quantityQuintals);
  const [proposedPrice, setProposedPrice] = useState<number>(cropListing.askingPricePerQuintal);
  const [pickupPreference, setPickupPreference] = useState<BuyerOffer["pickupPreference"]>("Buyer Arranged Transport");
  const [expectedDate, setExpectedDate] = useState<string>("15 October 2026");
  const [paymentTerms, setPaymentTerms] = useState<BuyerOffer["paymentTerms"]>("Within 48 hours");
  const [additionalNotes, setAdditionalNotes] = useState<string>(
    "Interested in purchasing this produce for our Lucknow mill. Direct truck pickup arranged."
  );

  const isPrivate = isPrivateBuyerEntity(buyerProfile);
  const comp = getPrivateBuyerCompliance(buyerProfile);

  const isBlocked = comp.landControlStatus === "VIOLATION" || comp.overallStatus === "BLOCKED";

  const totalVal = quantity * proposedPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      alert(t("This offer is blocked because it exceeds the Agrisense 40% private-buyer land-control safeguard.", "यह प्रस्ताव रोका गया है क्योंकि यह 40% निजी खरीदार भूमि-सुरक्षा सीमा से अधिक है।"));
      return;
    }
    const newOffer = mandiService.createOffer({
      listingId: cropListing.id,
      quantityQuintals: quantity,
      proposedPricePerQuintal: proposedPrice,
      pickupPreference,
      expectedDeliveryDate: expectedDate,
      paymentTerms,
      additionalNotes,
      buyerProfile,
    });
    onOfferSent(newOffer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-light">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-forest dark:text-emerald-400">
                Formulate Commercial Trade Offer
              </span>
              {isPrivate && <PrivateBuyerBadge compact />}
            </div>
            <h2 className="text-xl font-black text-charcoal dark:text-ivory-100 mt-0.5">
              Make Structured Offer — {cropListing.cropName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-charcoal-muted hover:bg-ivory-100 dark:hover:bg-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* PRIVATE BUYER COMPLIANCE CHECK PANEL */}
          {isPrivate && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-white dark:via-charcoal to-emerald-500/10 border-2 border-amber-400/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🛡️ Private Buyer Compliance Check</span>
                </span>
                {isBlocked ? (
                  <span className="px-2.5 py-0.5 rounded-lg bg-red-600 text-white font-black text-3xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>🔴 Protection Rule Violation</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-black text-3xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>🟢 Compliant Offer</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-3xs font-bold p-2.5 rounded-xl bg-white/80 dark:bg-charcoal/80 border border-amber-200 dark:border-amber-900">
                <div>
                  <span className="text-charcoal-muted block uppercase">Buyer Type</span>
                  <span className="font-extrabold text-charcoal dark:text-ivory-100">{buyerProfile.buyerType}</span>
                </div>
                <div>
                  <span className="text-charcoal-muted block uppercase">Verification</span>
                  <span className="font-black text-emerald-600">✓ Verified</span>
                </div>
                <div>
                  <span className="text-charcoal-muted block uppercase">Contracted Area</span>
                  <span className={`font-black ${comp.landControlStatus === 'VIOLATION' ? 'text-red-600' : 'text-charcoal dark:text-ivory-100'}`}>
                    {comp.contractedCashCropLandPercentage}% / 40%
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-muted block uppercase">Crop Cycles</span>
                  <span className="font-black text-charcoal dark:text-ivory-100">
                    {comp.consecutiveCropCycles} / 2
                  </span>
                </div>
              </div>

              {/* Rule A Blocking banner if land concentration > 40% */}
              {isBlocked && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 text-3xs font-extrabold text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>
                    🔴 <strong>{t("Offer Blocked:", "प्रस्ताव रोका गया:")}</strong> {t("This agreement exceeds the Agrisense 40% private-buyer land-control safeguard.", "यह समझौता एग्रीसेंस की 40% निजी खरीदार भूमि-सुरक्षा सीमा से अधिक है।")}
                  </span>
                </div>
              )}

              {/* Rule B Rotation warning if cycles >= 2 */}
              {!isBlocked && comp.cropRotationStatus === "VIOLATION" && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-3xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    🟠 <strong>{t("Crop Rotation Required:", "फसल चक्र आवश्यक:")}</strong> {t("This field has reached the recommended consecutive-crop limit. A different crop should be considered for the next cycle.", "इस खेत में लगातार फसल की अनुशंसित सीमा पूरी हो गई है। अगले चक्र में दूसरी फसल पर विचार करें।")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Crop summary snippet */}
          <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex items-center justify-between">
            <div>
              <span className="font-extrabold text-charcoal dark:text-ivory-100 block">
                🌾 {cropListing.cropName} ({cropListing.variety})
              </span>
              <span className="text-2xs text-charcoal-muted">
                Seller: {cropListing.farmerProfile.displayName} ({cropListing.location.district}, {cropListing.location.state})
              </span>
            </div>
            <div className="text-right">
              <span className="text-3xs text-charcoal-muted block font-bold">Asking Price</span>
              <span className="font-black text-forest dark:text-emerald-400 text-sm">
                ₹{cropListing.askingPricePerQuintal}/q
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
                Quantity (Quintals)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-extrabold text-charcoal dark:text-ivory-100 text-sm"
              />
            </div>

            {/* Offer Price */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
                Offer Price (₹ / Quintal)
              </label>
              <input
                type="number"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-extrabold text-forest dark:text-emerald-400 text-sm"
              />
            </div>
          </div>

          {/* Quality & Moisture Presets */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              <span className="text-3xs text-charcoal-muted block font-bold">Target Grade</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
                {cropListing.quality.grade}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              <span className="text-3xs text-charcoal-muted block font-bold">Moisture Limit</span>
              <span className="font-bold text-charcoal dark:text-ivory-100 mt-0.5 block">
                ≤ {cropListing.quality.moisturePercentage}%
              </span>
            </div>
          </div>

          {/* Logistics & Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
                Pickup Preference
              </label>
              <select
                value={pickupPreference}
                onChange={(e) => setPickupPreference(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-semibold text-charcoal dark:text-ivory-100"
              >
                <option value="Buyer Arranged Transport">Buyer Arranged Transport</option>
                <option value="Farmer Delivery">Farmer Delivery</option>
                <option value="Mandi Pickup Point">Mandi Pickup Point</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
                Expected Pickup Date
              </label>
              <input
                type="text"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-semibold text-charcoal dark:text-ivory-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
              Payment Terms
            </label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-semibold text-charcoal dark:text-ivory-100"
            >
              <option value="Within 48 hours">Within 48 hours</option>
              <option value="Escrow / 3-Day Bank Release">Escrow / 3-Day Bank Release</option>
              <option value="Payment on Delivery">Payment on Delivery</option>
              <option value="50% Advance + 50% Delivery">50% Advance + 50% Delivery</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
              Additional Terms / Message
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark text-xs text-charcoal dark:text-ivory-100"
            />
          </div>

          {/* Total Value Summary Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-forest to-emerald-800 text-white text-center">
            <span className="text-3xs uppercase tracking-wider font-bold opacity-90 block">Total Offer Value</span>
            <span className="text-2xl font-black block mt-0.5">₹{totalVal.toLocaleString()}</span>
          </div>

          {/* CTAs */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-ivory-100 dark:bg-charcoal text-charcoal dark:text-ivory-200 hover:bg-ivory-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-black text-xs bg-forest hover:bg-forest-dark text-white shadow-md flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4 text-amber" />
              <span>Send Offer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
