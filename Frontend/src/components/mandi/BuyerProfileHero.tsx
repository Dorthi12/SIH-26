import { useState } from "react";
import {
  Building2,
  ShieldCheck,
  MapPin,
  Star,
  Clock,
  HelpCircle,
  MessageSquare,
  Bookmark,
  Share2,
  AlertTriangle,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import type { BuyerProfile } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface BuyerProfileHeroProps {
  buyer: BuyerProfile;
  isSaved: boolean;
  onContactBuyer: () => void;
  onViewRequirementsClick: () => void;
  onOpenVerificationModal: () => void;
  onToggleSaveBuyer: () => void;
  onReportConcernClick: () => void;
}

export function BuyerProfileHero({
  buyer,
  isSaved,
  onContactBuyer,
  onViewRequirementsClick,
  onOpenVerificationModal,
  onToggleSaveBuyer,
  onReportConcernClick,
}: BuyerProfileHeroProps) {
  const { t } = useLanguage();
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert(t("Buyer profile link copied to clipboard!", "खरीदार प्रोफ़ाइल लिंक कॉपी किया गया!"));
    }
  };

  return (
    <div className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-ivory-200 dark:border-charcoal-light">
        {/* Left Avatar & Core Title */}
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xl shrink-0 border-2 border-white dark:border-charcoal">
            {buyer.businessName.substring(0, 2).toUpperCase()}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal dark:text-ivory-100 tracking-tight">
                🏢 {buyer.businessName}
              </h1>

              {/* HIGHLY VISIBLE BUSINESS VERIFIED BADGE */}
              <button
                onClick={onOpenVerificationModal}
                className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-extrabold flex items-center gap-1.5 hover:bg-emerald-200 transition-colors shadow-2xs"
                title="Click to inspect Demo Verification details"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>✓ Business Verified</span>
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600 opacity-75" />
              </button>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-charcoal-muted dark:text-ivory-400 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 text-2xs font-extrabold">
                🏭 {buyer.buyerType}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-blue-500" />
                {buyer.district}, {buyer.state}
              </span>
              <span>•</span>
              <span>Active on Agrisense: {buyer.yearsActiveOnPlatform} Years</span>
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              <div className="flex items-center gap-1 font-black text-charcoal dark:text-ivory-100">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{buyer.farmerRating} / 5</span>
                <span className="text-3xs text-charcoal-muted dark:text-ivory-400 font-normal">
                  ({buyer.reputationBreakdown.totalReviewsCount} Reviews)
                </span>
              </div>
              <span className="text-ivory-300">|</span>
              <span className="font-bold text-charcoal dark:text-ivory-200">
                📦 {buyer.completedTransactionsCount.toLocaleString()} Transactions
              </span>
              <span className="text-ivory-300">|</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                💳 {buyer.paymentReliabilityPercentage}% Payment Reliability
              </span>
            </div>
          </div>
        </div>

        {/* Right CTAs & More Menu */}
        <div className="flex flex-col sm:items-end gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onContactBuyer}
              className="px-5 py-2.5 rounded-xl font-black text-xs bg-forest hover:bg-forest-dark text-white shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-amber" />
              <span>Contact Buyer</span>
            </button>

            <button
              onClick={onViewRequirementsClick}
              className="px-4 py-2.5 rounded-xl font-extrabold text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
            >
              View Active Requirements
            </button>

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu((prev) => !prev)}
                className="p-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal text-charcoal dark:text-ivory-200 hover:bg-ivory-200 transition-colors"
                title="More Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-12 z-30 w-48 p-2 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-xl text-xs space-y-1 animate-in fade-in duration-150">
                  <button
                    onClick={() => {
                      onToggleSaveBuyer();
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-ivory-100 dark:hover:bg-charcoal flex items-center gap-2 font-bold text-charcoal dark:text-ivory-100"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber text-amber" : "text-charcoal-muted"}`} />
                    <span>{isSaved ? "Saved Buyer" : "Save Buyer"}</span>
                  </button>

                  <button
                    onClick={() => {
                      handleShare();
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-ivory-100 dark:hover:bg-charcoal flex items-center gap-2 font-semibold text-charcoal dark:text-ivory-200"
                  >
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <span>Share Buyer Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenVerificationModal();
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-ivory-100 dark:hover:bg-charcoal flex items-center gap-2 font-semibold text-charcoal dark:text-ivory-200"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>View Verification</span>
                  </button>

                  <div className="border-t border-ivory-200 dark:border-charcoal-light my-1"></div>

                  <button
                    onClick={() => {
                      onReportConcernClick();
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 font-semibold text-red-600 dark:text-red-400"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Report Concern</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
