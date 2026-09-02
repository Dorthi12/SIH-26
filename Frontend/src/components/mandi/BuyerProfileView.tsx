import { useState } from "react";
import {
  Building2,
  ShieldCheck,
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  HelpCircle,
  FileText,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Scale,
  Award,
  Package,
  Calendar,
  DollarSign,
  MessageSquare,
  Sparkles,
  Lock,
  Search,
} from "lucide-react";
import type { BuyerProfile, BuyingRequirementItem } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";
import { buyerService } from "../../services/buyerService";

// Modular Subcomponents
import { BuyerProfileHero } from "./BuyerProfileHero";
import { BusinessInformation } from "./BusinessInformation";
import { WhatBuyerPurchases } from "./WhatBuyerPurchases";
import { RequirementDetailDrawer } from "./RequirementDetailDrawer";
import { TransactionPerformanceSection } from "./TransactionPerformanceSection";
import { PaymentReliabilityCard } from "./PaymentReliabilityCard";
import { BuyerReputationSection } from "./BuyerReputationSection";
import { VerifiedFarmerReviewsSection } from "./VerifiedFarmerReviewsSection";
import { PrivateBuyerComplianceCard } from "./PrivateBuyerComplianceCard";
import { isPrivateBuyerEntity } from "../../utils/privateBuyerCompliance";
import { DisputeHistorySection } from "./DisputeHistorySection";
import { BuyerBehaviourSummary } from "./BuyerBehaviourSummary";
import { BuyerTransparencyScoreCard } from "./BuyerTransparencyScoreCard";
import { MarketplaceActivityCard } from "./MarketplaceActivityCard";
import { PurchaseHistorySummary } from "./PurchaseHistorySummary";
import { ReportConcernModal } from "./ReportConcernModal";
import { BuyerVerificationForm } from "./BuyerVerificationForm";
import { BuyerPreviewCard } from "./BuyerPreviewCard";

interface BuyerProfileViewProps {
  buyer: BuyerProfile;
  onContactBuyer: () => void;
  onViewRequirementsClick?: () => void;
  onMakeOfferClick?: (requirement?: BuyingRequirementItem) => void;
  onCreateBuyerProfile?: () => void;
}

export function BuyerProfileView({
  buyer,
  onContactBuyer,
  onViewRequirementsClick,
  onMakeOfferClick,
  onCreateBuyerProfile,
}: BuyerProfileViewProps) {
  const { t } = useLanguage();
  const isPrivate = isPrivateBuyerEntity(buyer);
  const [activeTab, setActiveTab] = useState<"overview" | "protection" | "requirements" | "reputation" | "transactions" | "verification">("overview");

  // Modals & Drawers state
  const [showDemoVerifyModal, setShowDemoVerifyModal] = useState<boolean>(false);
  const [showReportConcernModal, setShowReportConcernModal] = useState<boolean>(false);
  const [selectedRequirement, setSelectedRequirement] = useState<BuyingRequirementItem | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(buyerService.isBuyerSaved(buyer.id));

  const handleToggleSave = () => {
    const nextSavedState = buyerService.toggleSaveBuyer(buyer.id);
    setIsSaved(nextSavedState);
  };

  const handleReportSubmitted = (category: string, text: string) => {
    buyerService.reportConcern(buyer.id, category, text);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 2. STRONG PAGE TITLE & SUBTITLE */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-charcoal dark:text-ivory-100 tracking-tight flex items-center gap-3">
          <span>Buyer Profile & Trust Center</span>
          {onCreateBuyerProfile && (
            <button
              onClick={onCreateBuyerProfile}
              className="px-3.5 py-1.5 rounded-xl font-extrabold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors flex items-center gap-1.5 ml-auto"
            >
              <Building2 className="w-4 h-4" />
              <span>+ Create Buyer Profile</span>
            </button>
          )}
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-charcoal-muted dark:text-ivory-400">
          "Know who you are trading with — verified information, transaction history, reputation and active buying requirements."
        </p>
      </div>

      {/* Featured Verified Buyer Requirement Card in Merchant / Buyer Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-blue-600" />
          Featured Verified Buyer Requirement
        </h3>
        <BuyerPreviewCard
          buyer={buyer}
          onViewBuyer={() => setActiveTab("requirements")}
          onContactBuyer={onContactBuyer}
        />
      </div>

      {/* 3. PROFILE HERO SECTION */}
      <BuyerProfileHero
        buyer={buyer}
        isSaved={isSaved}
        onContactBuyer={onContactBuyer}
        onViewRequirementsClick={() => setActiveTab("requirements")}
        onOpenVerificationModal={() => setShowDemoVerifyModal(true)}
        onToggleSaveBuyer={handleToggleSave}
        onReportConcernClick={() => setShowReportConcernModal(true)}
      />

      {/* 31. PROFILE NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-ivory-300 dark:border-charcoal-light pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: "overview", label: "Overview", icon: "📊" },
          ...(isPrivate ? [{ key: "protection", label: "Protection", icon: "🛡️" }] : []),
          { key: "requirements", label: "Requirements", icon: "📦" },
          { key: "reputation", label: "Reputation", icon: "⭐" },
          { key: "transactions", label: "Transactions", icon: "💳" },
          { key: "verification", label: "Verification", icon: "🛡️" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
              activeTab === tab.key
                ? "bg-forest text-white shadow-md scale-102"
                : "bg-white dark:bg-charcoal text-charcoal-muted dark:text-ivory-400 border border-ivory-200 dark:border-charcoal-light hover:text-charcoal"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {isPrivate && <PrivateBuyerComplianceCard buyer={buyer} onOpenReportModal={() => setShowReportConcernModal(true)} />}
          <BusinessInformation buyer={buyer} />
          <BuyerTransparencyScoreCard buyer={buyer} />
          <TransactionPerformanceSection buyer={buyer} />
          <BuyerBehaviourSummary buyer={buyer} />
          <WhatBuyerPurchases buyer={buyer} />
        </div>
      )}

      {/* TAB: PROTECTION (PRIVATE) */}
      {activeTab === "protection" && isPrivate && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <PrivateBuyerComplianceCard buyer={buyer} onOpenReportModal={() => setShowReportConcernModal(true)} />
          <BuyerTransparencyScoreCard buyer={buyer} />
          <BuyerBehaviourSummary buyer={buyer} />
        </div>
      )}

      {/* TAB 2: REQUIREMENTS */}
      {activeTab === "requirements" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <WhatBuyerPurchases buyer={buyer} />

          {/* Active Requirements List */}
          <div id="buyer-requirements-section" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-light">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-forest/10 text-forest dark:text-emerald-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-charcoal dark:text-ivory-100">
                    Active Buying Requirements
                  </h2>
                  <p className="text-xs text-charcoal-muted dark:text-ivory-400">
                    Open commodity requirements currently accepting farmer offers
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                🟢 {buyer.detailedRequirements.length} Active Demands
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buyer.detailedRequirements.map((req) => (
                <div
                  key={req.id}
                  className="p-6 rounded-3xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-base text-charcoal dark:text-ivory-100 flex items-center gap-2">
                        🌾 {req.cropName}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-600 text-white shadow-2xs">
                        🟢 Active
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light">
                        <span className="text-3xs font-extrabold uppercase text-charcoal-muted block">Required Quantity</span>
                        <span className="font-extrabold text-sm text-charcoal dark:text-ivory-100">
                          {req.minQuantityQuintals} – {req.maxQuantityQuintals} Quintals
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light">
                        <span className="text-3xs font-extrabold uppercase text-charcoal-muted block">Expected Price</span>
                        <span className="font-extrabold text-sm text-forest dark:text-emerald-400">
                          ₹{req.expectedPriceMin.toLocaleString()} – ₹{req.expectedPriceMax.toLocaleString()} / q
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-2xs font-bold text-charcoal-muted dark:text-ivory-300">
                        <div>Grade: <span className="text-charcoal dark:text-ivory-100 font-extrabold">{req.qualityGrade}</span></div>
                        <div>Moisture: <span className="text-charcoal dark:text-ivory-100 font-extrabold">≤ {req.maxMoisturePercentage}%</span></div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-2xs font-bold text-charcoal-muted dark:text-ivory-300">
                        <div>Pickup: <span className="text-charcoal dark:text-ivory-100 font-extrabold">{req.deliveryType}</span></div>
                        <div>Required By: <span className="text-charcoal dark:text-ivory-100 font-extrabold">{req.requiredByDate}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-ivory-200 dark:border-charcoal-light">
                    <button
                      onClick={() => setSelectedRequirement(req)}
                      className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-ivory-100 dark:bg-charcoal-dark text-charcoal dark:text-ivory-200 hover:bg-ivory-200 transition-colors"
                    >
                      [View Requirement]
                    </button>
                    <button
                      onClick={() => {
                        if (onMakeOfferClick) onMakeOfferClick(req);
                        else onContactBuyer();
                      }}
                      className="flex-1 py-2.5 rounded-xl font-black text-xs bg-forest hover:bg-forest-dark text-white shadow-sm transition-colors flex items-center justify-center gap-1"
                    >
                      <span>[Make Offer]</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REPUTATION */}
      {activeTab === "reputation" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <BuyerReputationSection buyer={buyer} />
          <VerifiedFarmerReviewsSection buyer={buyer} />
          <DisputeHistorySection buyer={buyer} />
        </div>
      )}

      {/* TAB 4: TRANSACTIONS */}
      {activeTab === "transactions" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <TransactionPerformanceSection buyer={buyer} />
          <PaymentReliabilityCard buyer={buyer} />
          <PurchaseHistorySummary buyer={buyer} />
          <MarketplaceActivityCard buyer={buyer} />
        </div>
      )}

      {/* TAB 5: VERIFICATION */}
      {activeTab === "verification" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <BuyerVerificationForm />
        </div>
      )}

      {/* 4. DEMO VERIFICATION EXPLANATION MODAL */}
      {showDemoVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200 dark:border-charcoal-light">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h3 className="font-extrabold text-lg text-charcoal dark:text-ivory-100">
                  ✓ Business Verification Details
                </h3>
              </div>
              <button
                onClick={() => setShowDemoVerifyModal(false)}
                className="p-1 rounded-lg text-charcoal-muted font-bold hover:bg-ivory-100 dark:hover:bg-charcoal"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 space-y-2 text-xs">
              <span className="font-extrabold text-emerald-900 dark:text-emerald-200 block">
                Platform Verification Statement:
              </span>
              <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                "Business verification indicates that the buyer has completed the required platform verification process."
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs space-y-1">
              <span className="font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider block text-3xs">
                Prototype Notice
              </span>
              <p className="text-amber-800 dark:text-amber-300 text-2xs font-semibold">
                This verification status is currently labeled as <strong>Verified Status</strong> for prototype evaluation purposes, rather than implying real government agency verification.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-charcoal dark:text-ivory-200 block">Completed Verification Checks:</span>
              <div className="space-y-1.5 text-2xs text-charcoal-muted font-medium">
                <div className="flex items-center gap-2">✓ Certificate of Incorporation (MCA Registry)</div>
                <div className="flex items-center gap-2">✓ Registered Physical Processing Premises</div>
                <div className="flex items-center gap-2">✓ Authorized Procurement Manager Identity</div>
                <div className="flex items-center gap-2">✓ GSTIN Active Trading Status</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal text-3xs text-charcoal-muted font-semibold flex items-center justify-between">
              <span>Verification ID: {buyer.verificationId}</span>
              <span>Status: VERIFIED</span>
            </div>

            <button
              onClick={() => setShowDemoVerifyModal(false)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-forest text-white hover:bg-forest-dark transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* REQUIREMENT DETAIL DRAWER */}
      <RequirementDetailDrawer
        requirement={selectedRequirement}
        onClose={() => setSelectedRequirement(null)}
        onContactBuyer={onContactBuyer}
        onMakeOffer={(req) => {
          if (onMakeOfferClick) onMakeOfferClick(req);
          else onContactBuyer();
        }}
      />

      {/* REPORT CONCERN MODAL */}
      {showReportConcernModal && (
        <ReportConcernModal
          buyerName={buyer.businessName}
          onClose={() => setShowReportConcernModal(false)}
          onSubmitReport={handleReportSubmitted}
        />
      )}
    </div>
  );
}
