import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  Printer,
  Calendar,
  Building2,
  UserCheck,
  DollarSign,
  Truck,
  Clock,
  ArrowLeft,
  FileCheck,
} from "lucide-react";
import type { SmartDealRecord, UserRole } from "../../types/mandi";
import { dealService } from "../../services/dealService";
import { useLanguage } from "../../context/LanguageContext";

interface SmartDealViewProps {
  deal: SmartDealRecord;
  userRole: UserRole;
  onDealUpdated: () => void;
  onBackToChat?: () => void;
}

export function SmartDealView({ deal, userRole, onDealUpdated, onBackToChat }: SmartDealViewProps) {
  const { t } = useLanguage();
  const [currentDeal, setCurrentDeal] = useState<SmartDealRecord>(deal);

  const handleConfirm = () => {
    const updated = dealService.confirmDeal(currentDeal.dealId, userRole);
    setCurrentDeal({ ...updated });
    onDealUpdated();
  };

  const handleDownload = () => {
    dealService.downloadAgreementRecord(currentDeal);
  };

  const isConfirmed = currentDeal.sellerConfirmed && currentDeal.buyerConfirmed;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Back Button */}
      {onBackToChat && (
        <button
          onClick={onBackToChat}
          className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-ivory-100 dark:bg-charcoal text-charcoal dark:text-ivory-200 hover:bg-ivory-200 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Negotiation Chat</span>
        </button>
      )}

      {/* CONFIRMED BANNER IF LOCKED */}
      {isConfirmed ? (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-forest to-emerald-800 text-white shadow-xl text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">🌾</span>
            <h1 className="text-2xl font-black tracking-tight">DEAL CONFIRMED</h1>
          </div>
          <p className="text-xs text-emerald-200">
            Digital transaction confirmation completed by both parties. Recorded agreement locked.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-900 to-amber-700 text-white shadow-xl text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">⏳</span>
            <h1 className="text-xl font-black">AWAITING DIGITAL CONFIRMATION</h1>
          </div>
          <p className="text-xs text-amber-200">
            Both farmer and buyer must confirm agreement terms below to lock the transaction.
          </p>
        </div>
      )}

      {/* MAIN DIGITAL AGREEMENT DOCUMENT CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border-2 border-forest/30 dark:border-emerald-500/30 shadow-xl space-y-6">
        {/* DOCUMENT HEADER */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-ivory-200 dark:border-charcoal-light">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🌾</span>
              <h2 className="text-2xl font-black text-charcoal dark:text-ivory-100">
                AGRISENSE SMART DEAL
              </h2>
            </div>
            <span className="text-2xs font-mono font-bold text-forest dark:text-emerald-400">
              Deal ID: {currentDeal.dealId}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {/* LOCKED TERMS BADGE */}
            <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 font-extrabold text-xs flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>🔒 Terms Locked ({currentDeal.version})</span>
            </span>
            <span className="text-3xs text-charcoal-muted font-mono">
              Created: {currentDeal.createdAt}
            </span>
          </div>
        </div>

        {/* 1. CONTRACTING PARTIES */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400">
            Contracting Parties
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Buyer Card */}
            <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1.5">
              <span className="text-3xs font-extrabold uppercase text-blue-600 dark:text-blue-400 block">
                BUYER
              </span>
              <h4 className="font-extrabold text-sm text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
                🏢 {currentDeal.buyerInfo.businessName}
              </h4>
              <p className="text-2xs text-charcoal-muted">
                {currentDeal.buyerInfo.buyerType} ({currentDeal.buyerInfo.location})
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-3xs font-bold">
                ✓ Business Verified ({currentDeal.buyerInfo.verificationId})
              </span>
            </div>

            {/* Seller Card */}
            <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1.5">
              <span className="text-3xs font-extrabold uppercase text-forest dark:text-emerald-400 block">
                SELLER (FARMER)
              </span>
              <h4 className="font-extrabold text-sm text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
                👩‍🌾 {currentDeal.sellerInfo.displayName}
              </h4>
              <p className="text-2xs text-charcoal-muted">
                Location: {currentDeal.sellerInfo.district}, {currentDeal.sellerInfo.state}
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-3xs font-bold">
                ✓ Farmer Verified ({currentDeal.sellerInfo.verificationId})
              </span>
            </div>
          </div>
        </div>

        {/* 2. PRODUCE SPECIFICATIONS */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400">
            Produce Specifications
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
            <div>
              <span className="text-3xs text-charcoal-muted block font-bold">Crop & Variety</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">
                {currentDeal.produceInfo.cropName} ({currentDeal.produceInfo.variety})
              </span>
            </div>

            <div>
              <span className="text-3xs text-charcoal-muted block font-bold">Agreed Quantity</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">
                {currentDeal.produceInfo.quantityQuintals} Quintals
              </span>
            </div>

            <div>
              <span className="text-3xs text-charcoal-muted block font-bold">Quality Grade</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {currentDeal.produceInfo.qualityGrade}
              </span>
            </div>

            <div>
              <span className="text-3xs text-charcoal-muted block font-bold">Moisture Limit</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">
                ≤ {currentDeal.produceInfo.moisturePercentage}%
              </span>
            </div>

            <div>
              <span className="text-3xs text-charcoal-muted block font-bold">Production Method</span>
              <span className="font-bold text-forest dark:text-emerald-400">
                {currentDeal.produceInfo.productionMethod}
              </span>
            </div>
          </div>
        </div>

        {/* 3. COMMERCIAL TERMS & TOTAL */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400">
            Commercial & Payment Terms
          </h3>

          <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-3xs text-charcoal-muted block font-bold">Agreed Unit Rate</span>
                <span className="font-black text-forest dark:text-emerald-400 text-lg">
                  ₹{currentDeal.commercialTerms.finalPricePerQuintal.toLocaleString()} / q
                </span>
              </div>

              <div>
                <span className="text-3xs text-charcoal-muted block font-bold">Total Deal Value</span>
                <span className="font-black text-forest dark:text-emerald-400 text-2xl">
                  ₹{currentDeal.commercialTerms.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-ivory-200 dark:border-charcoal-light grid grid-cols-2 gap-2 text-2xs">
              <div>Payment Schedule: <strong>{currentDeal.commercialTerms.paymentTimeframe}</strong></div>
              <div>Payment Method: <strong>{currentDeal.commercialTerms.paymentTerms}</strong></div>
            </div>
          </div>
        </div>

        {/* 4. LOGISTICS & PICKUP */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400">
            Logistics & Transport
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
            <div>
              <span className="text-3xs text-charcoal-muted block font-bold">Pickup Preference</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {currentDeal.logisticsInfo.pickupType}
              </span>
            </div>

            <div>
              <span className="text-3xs text-charcoal-muted block font-bold">Target Pickup Date</span>
              <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {currentDeal.logisticsInfo.pickupDate}
              </span>
            </div>
          </div>
        </div>

        {/* 5. VISUAL TERMS LOCK SUMMARY */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-extrabold text-emerald-900 dark:text-emerald-200">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>🔒 Agreed Terms Locked</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-2xs font-bold text-emerald-800 dark:text-emerald-300">
            <div>✓ Price agreed</div>
            <div>✓ Quantity agreed</div>
            <div>✓ Quality agreed</div>
            <div>✓ Moisture agreed</div>
            <div>✓ Pickup agreed</div>
            <div>✓ Payment terms agreed</div>
          </div>
        </div>

        {/* 6. DUAL DIGITAL CONFIRMATION STATUS */}
        <div className="p-5 rounded-2xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-4">
          <h4 className="font-extrabold text-xs text-charcoal dark:text-ivory-100 uppercase tracking-wider">
            Digital Transaction Confirmation Status
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Seller Status */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light flex items-center justify-between">
              <div>
                <span className="font-bold text-charcoal dark:text-ivory-100 block">Seller Confirmation</span>
                <span className="text-3xs text-charcoal-muted">
                  {currentDeal.sellerConfirmed ? `Confirmed on ${currentDeal.sellerConfirmedAt}` : "Pending confirmation"}
                </span>
              </div>
              {currentDeal.sellerConfirmed ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-3xs font-extrabold">
                  ✓ Confirmed
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-3xs font-extrabold">
                  ⏳ Pending
                </span>
              )}
            </div>

            {/* Buyer Status */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light flex items-center justify-between">
              <div>
                <span className="font-bold text-charcoal dark:text-ivory-100 block">Buyer Confirmation</span>
                <span className="text-3xs text-charcoal-muted">
                  {currentDeal.buyerConfirmed ? `Confirmed on ${currentDeal.buyerConfirmedAt}` : "Pending confirmation"}
                </span>
              </div>
              {currentDeal.buyerConfirmed ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-3xs font-extrabold">
                  ✓ Confirmed
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-3xs font-extrabold">
                  ⏳ Pending
                </span>
              )}
            </div>
          </div>

          {/* Action Confirm Button */}
          {!isConfirmed && (
            <div className="pt-2 text-center">
              <button
                onClick={handleConfirm}
                className="px-6 py-3 rounded-2xl font-black text-xs bg-forest hover:bg-forest-dark text-white shadow-lg flex items-center justify-center gap-2 mx-auto"
              >
                <CheckCircle2 className="w-4 h-4 text-amber" />
                <span>Confirm Agreement ({userRole === "SELLER" ? "Seller Confirmation" : "Buyer Confirmation"})</span>
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-ivory-200 dark:border-charcoal-light">
          <div className="text-3xs text-charcoal-muted italic">
            Digital Transaction Confirmation Record created on Agrisense Mandi.
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>[Download Record]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
