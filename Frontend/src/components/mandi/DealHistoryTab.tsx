import { useState } from "react";
import { FileCheck, ShieldCheck, Calendar, DollarSign, ChevronRight, Building2, UserCheck } from "lucide-react";
import type { SmartDealRecord, UserRole } from "../../types/mandi";
import { dealService } from "../../services/dealService";
import { useLanguage } from "../../context/LanguageContext";

interface DealHistoryTabProps {
  userRole: UserRole;
  onSelectDeal: (deal: SmartDealRecord) => void;
}

export function DealHistoryTab({ userRole, onSelectDeal }: DealHistoryTabProps) {
  const { t } = useLanguage();
  const deals = dealService.getAllDeals();

  if (deals.length === 0) {
    return (
      <div className="p-12 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light text-center space-y-3">
        <FileCheck className="w-10 h-10 text-charcoal-muted mx-auto" />
        <h3 className="font-extrabold text-base text-charcoal dark:text-ivory-100">
          No Smart Deals Recorded Yet
        </h3>
        <p className="text-xs text-charcoal-muted">
          Finalized agreements between farmers and verified buyers will be stored here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-charcoal dark:text-ivory-100 flex items-center gap-2">
            🌾 {t("My Smart Deals", "मेरे स्मार्ट सौदे")}
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-ivory-400">
            Recorded digital transaction agreements and confirmed contracts.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-2xs font-extrabold">
          🟢 {deals.length} Confirmed Deals
        </span>
      </div>

      <div className="space-y-4">
        {deals.map((deal) => (
          <div
            key={deal.dealId}
            onClick={() => onSelectDeal(deal)}
            className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md hover:border-forest/40 transition-all cursor-pointer space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-ivory-200 dark:border-charcoal-light">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-forest text-white shadow-sm">
                  <span className="text-xl">🌾</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-charcoal dark:text-ivory-100">
                    {deal.produceInfo.cropName} — {deal.produceInfo.quantityQuintals} Quintals
                  </h3>
                  <span className="text-2xs font-mono font-bold text-forest dark:text-emerald-400">
                    Deal ID: {deal.dealId}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold">
                  🟢 {deal.status === "CONFIRMED_LOCKED" ? "Confirmed" : deal.status}
                </span>

                <span className="text-xl font-black text-forest dark:text-emerald-400">
                  ₹{deal.commercialTerms.finalPricePerQuintal}/q
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                <span className="text-3xs text-charcoal-muted block font-bold">
                  {userRole === "SELLER" ? "Buyer Name" : "Seller Name"}
                </span>
                <span className="font-bold text-charcoal dark:text-ivory-100 mt-0.5 block truncate">
                  {userRole === "SELLER" ? deal.buyerInfo.businessName : deal.sellerInfo.displayName}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                <span className="text-3xs text-charcoal-muted block font-bold">Total Value</span>
                <span className="font-bold text-forest dark:text-emerald-400 mt-0.5 block">
                  ₹{deal.commercialTerms.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                <span className="text-3xs text-charcoal-muted block font-bold">Pickup Date</span>
                <span className="font-bold text-amber-700 dark:text-amber-400 mt-0.5 block">
                  {deal.logisticsInfo.pickupDate}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                <span className="text-3xs text-charcoal-muted block font-bold">Agreement Record</span>
                <span className="font-bold text-blue-600 mt-0.5 block">
                  {deal.version} Locked
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end text-xs font-extrabold text-forest dark:text-emerald-400 gap-1">
              <span>View Full Smart Deal Agreement</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
