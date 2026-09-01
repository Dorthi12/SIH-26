import { useState } from "react";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  Building2,
  UserCheck,
  Send,
  Scale,
  ShieldCheck,
} from "lucide-react";
import type { BuyerOffer, UserRole } from "../../types/mandi";
import { mandiService } from "../../services/mandiService";
import { useLanguage } from "../../context/LanguageContext";

interface NegotiationPanelProps {
  userRole: UserRole;
  offers: BuyerOffer[];
  onOfferUpdated: () => void;
}

export function NegotiationPanel({ userRole, offers, onOfferUpdated }: NegotiationPanelProps) {
  const { t } = useLanguage();
  const [selectedOffer, setSelectedOffer] = useState<BuyerOffer | null>(
    offers.length > 0 ? offers[0] : null
  );
  const [counterPrice, setCounterPrice] = useState<number>(
    selectedOffer ? selectedOffer.proposedPricePerQuintal : 2880
  );
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [showCounterInput, setShowCounterInput] = useState<boolean>(false);

  const handleAction = (status: BuyerOffer["status"]) => {
    if (!selectedOffer) return;
    mandiService.updateOfferStatus(
      selectedOffer.id,
      status,
      status === "COUNTER_OFFERED" ? counterPrice : undefined,
      replyMessage || (status === "ACCEPTED" ? "Offer Accepted!" : "Offer updated."),
      userRole
    );
    setShowCounterInput(false);
    setReplyMessage("");
    onOfferUpdated();
  };

  if (offers.length === 0) {
    return (
      <div className="p-12 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-ivory-100 dark:bg-charcoal flex items-center justify-center mx-auto text-charcoal-muted">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-lg text-charcoal dark:text-ivory-100">
          {userRole === "SELLER"
            ? t("No Buyer Offers Received Yet", "अभी तक कोई खरीदार प्रस्ताव प्राप्त नहीं हुआ है")
            : t("No Offers Placed Yet", "अभी तक कोई प्रस्ताव नहीं भेजा गया है")}
        </h3>
        <p className="text-xs text-charcoal-muted dark:text-ivory-400 max-w-md mx-auto">
          {userRole === "SELLER"
            ? t(
                "When verified buyers express interest in your crop listings, their offers and negotiation messages will appear here.",
                "जब सत्यापित खरीदार आपकी फसल की सूची में रुचि व्यक्त करेंगे, तो उनके प्रस्ताव यहाँ दिखाई देंगे।"
              )
            : t(
                "Browse the Agrisense Mandi marketplace to make evidence-backed direct offers to farmers.",
                "किसानों को सीधे प्रस्ताव भेजने के लिए एग्रीसेंस मंडी का अवलोकन करें।"
              )}
        </p>
      </div>
    );
  }

  const active = selectedOffer || offers[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
      {/* Left List Column */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-charcoal dark:text-ivory-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-forest dark:text-emerald-400" />
          {userRole === "SELLER" ? t("Incoming Offers", "प्राप्त प्रस्ताव") : t("Sent Offers", "भेजे गए प्रस्ताव")}
        </h3>

        <div className="space-y-2.5">
          {offers.map((off) => {
            const isSelected = active.id === off.id;
            return (
              <div
                key={off.id}
                onClick={() => {
                  setSelectedOffer(off);
                  setCounterPrice(off.proposedPricePerQuintal);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-forest bg-forest/5 dark:bg-forest/20 shadow-md"
                    : "border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark hover:border-forest/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-charcoal dark:text-ivory-100">
                    {off.cropListing.cropName} ({off.cropListing.variety})
                  </span>
                  <span
                    className={`text-3xs font-bold px-2 py-0.5 rounded-full ${
                      off.status === "ACCEPTED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : off.status === "COUNTER_OFFERED"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : off.status === "REJECTED"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                    }`}
                  >
                    {off.status === "AWAITING_RESPONSE" && "🟡 Negotiation"}
                    {off.status === "ACCEPTED" && "🟢 Accepted"}
                    {off.status === "COUNTER_OFFERED" && "🔴 Counter Offered"}
                    {off.status === "REJECTED" && "❌ Declined"}
                  </span>
                </div>

                <div className="mt-2 text-xs text-charcoal-muted dark:text-ivory-400 flex items-center justify-between">
                  <span>
                    {off.quantityQuintals} q @ ₹{off.proposedPricePerQuintal}/q
                  </span>
                  <span className="font-bold text-forest dark:text-emerald-400">
                    ₹{off.totalAmount.toLocaleString()}
                  </span>
                </div>

                <p className="text-3xs text-charcoal-muted dark:text-ivory-400 mt-1 truncate">
                  By: {off.buyerProfile.businessName}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Offer Detailed Negotiation Room */}
      <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="pb-4 border-b border-ivory-200 dark:border-charcoal-light flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-2xs font-mono font-bold text-forest dark:text-emerald-400">
                Offer Ref: {active.id}
              </span>
              <h2 className="text-xl font-extrabold text-charcoal dark:text-ivory-100">
                {active.cropListing.cropName} — {active.quantityQuintals} Quintals
              </h2>
              <p className="text-xs text-charcoal-muted dark:text-ivory-400">
                Buyer: <strong className="text-charcoal dark:text-ivory-200">{active.buyerProfile.businessName}</strong> ({active.buyerProfile.buyerType})
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xs uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 block font-bold">
                {t("Proposed Price", "प्रस्तावित मूल्य")}
              </span>
              <span className="text-2xl font-black text-forest dark:text-emerald-400">
                ₹{active.proposedPricePerQuintal.toLocaleString()}
                <span className="text-xs font-normal text-charcoal-muted"> / q</span>
              </span>
            </div>
          </div>

          {/* Terms Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light text-xs">
            <div>
              <span className="text-3xs text-charcoal-muted dark:text-ivory-400 block font-bold">
                Pickup Preference
              </span>
              <span className="font-semibold text-charcoal dark:text-ivory-100">
                {active.pickupPreference}
              </span>
            </div>

            <div>
              <span className="text-3xs text-charcoal-muted dark:text-ivory-400 block font-bold">
                Expected Date
              </span>
              <span className="font-semibold text-charcoal dark:text-ivory-100">
                {active.expectedDeliveryDate}
              </span>
            </div>

            <div>
              <span className="text-3xs text-charcoal-muted dark:text-ivory-400 block font-bold">
                Payment Terms
              </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {active.paymentTerms}
              </span>
            </div>
          </div>

          {/* Chat Message Thread */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400">
              {t("Negotiation Messages Thread", "बातचीत का संदेश थ्रेड")}
            </h4>

            <div className="p-4 rounded-2xl bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-3 max-h-60 overflow-y-auto">
              {active.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl max-w-lg space-y-1 ${
                    msg.senderRole === userRole
                      ? "ml-auto bg-forest text-white"
                      : "mr-auto bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light text-charcoal dark:text-ivory-100"
                  }`}
                >
                  <div className="flex items-center justify-between text-3xs font-bold opacity-80">
                    <span>{msg.senderName}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="text-xs">{msg.message}</p>
                  {msg.counterPricePerQuintal && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-3xs font-bold bg-amber-400 text-charcoal">
                      Counter Offer: ₹{msg.counterPricePerQuintal}/q
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons (For Seller) */}
          {userRole === "SELLER" && active.status === "AWAITING_RESPONSE" && (
            <div className="space-y-3 pt-2 border-t border-ivory-200 dark:border-charcoal-light">
              {!showCounterInput ? (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleAction("ACCEPTED")}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t("Accept Offer", "प्रस्ताव स्वीकार करें")}
                  </button>

                  <button
                    onClick={() => setShowCounterInput(true)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t("Make Counter Offer", "काउंटर ऑफर बनाएं")}
                  </button>

                  <button
                    onClick={() => handleAction("REJECTED")}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    {t("Decline", "अस्वीकार करें")}
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 space-y-3">
                  <span className="font-bold text-xs text-amber-900 dark:text-amber-200">
                    {t("Specify Counter Asking Price (₹ / q)", "काउंटर मांग मूल्य दर्ज करें (₹ / क्विंटल)")}
                  </span>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(Number(e.target.value))}
                      className="w-36 px-3 py-2 rounded-xl border border-amber-400 bg-white font-extrabold text-sm text-charcoal"
                    />

                    <input
                      type="text"
                      placeholder="Add note to buyer..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-amber-400 bg-white text-xs text-charcoal"
                    />

                    <button
                      onClick={() => handleAction("COUNTER_OFFERED")}
                      className="px-4 py-2 rounded-xl font-bold text-xs bg-amber-600 text-white hover:bg-amber-700"
                    >
                      {t("Send Counter", "काउंटर भेजें")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
