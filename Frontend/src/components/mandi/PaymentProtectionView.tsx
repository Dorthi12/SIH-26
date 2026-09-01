import { useState } from "react";
import {
  ShieldCheck,
  Building2,
  User,
  Truck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Package,
} from "lucide-react";
import { useMandi } from "../../context/MandiContext";
import { paymentService } from "../../services/paymentService";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PaymentTimeline } from "./PaymentTimeline";
import { DeliveryConfirmationModal } from "./DeliveryConfirmationModal";
import { BuyerDeliveryReviewModal } from "./BuyerDeliveryReviewModal";
import { DeliveryDisputeModal } from "./DeliveryDisputeModal";
import type { DeliverySubmission } from "../../types/mandi";

export function PaymentProtectionView() {
  const { userRole, setActiveTab, showNotification } = useMandi();
  const [selectedDealId, setSelectedDealId] = useState<string>("AGR-DEAL-2026-004821");

  const [activeDeliveryModal, setActiveDeliveryModal] = useState<boolean>(false);
  const [activeBuyerReviewModal, setActiveBuyerReviewModal] = useState<boolean>(false);
  const [activeDisputeModal, setActiveDisputeModal] = useState<boolean>(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const paymentRecord = paymentService.getPaymentStatus(selectedDealId);
  const deliverySubmission = paymentService.getDeliverySubmission(selectedDealId);

  const handleFarmerSubmitDelivery = (submission: DeliverySubmission) => {
    paymentService.submitDelivery(submission);
    setActiveDeliveryModal(false);
    showNotification("Delivery submitted successfully! Payment status updated.");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleBuyerConfirmDelivery = () => {
    paymentService.confirmDelivery(selectedDealId);
    setActiveBuyerReviewModal(false);
    showNotification("Delivery Confirmed! Payment Released to Farmer.");
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleRaiseDispute = (issueDetails: {
    issueType: string;
    expectedQuantity: number;
    receivedQuantity: number;
    details: string;
  }) => {
    paymentService.raiseDeliveryDispute(selectedDealId, issueDetails);
    setActiveDisputeModal(false);
    setActiveBuyerReviewModal(false);
    showNotification("Issue reported! Payment release held for dispute review.");
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-forest dark:text-emerald-400" />
            <h2 className="text-2xl font-black text-charcoal dark:text-ivory-100">
              🔒 Payment Protection & Escrow Simulation
            </h2>
          </div>
          <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-1">
            Protected transaction workflow giving both farmers and buyers 100% payment visibility.
          </p>
        </div>

        {/* Prototype Demo Badge */}
        <div className="px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-center gap-2 text-2xs font-extrabold text-amber-900 dark:text-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>Demo Payment Protection</span>
        </div>
      </div>

      {/* Mandatory Regulatory Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-400/40 dark:border-amber-700/60 flex items-start gap-3 shadow-xs">
        <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
          {paymentRecord.disclaimer}
        </p>
      </div>

      {/* Select Active Deal Switcher (Standard vs Aggregated Pool Deal) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light w-fit">
        <button
          onClick={() => setSelectedDealId("AGR-DEAL-2026-004821")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            selectedDealId === "AGR-DEAL-2026-004821"
              ? "bg-forest text-white shadow-sm"
              : "text-charcoal-muted dark:text-ivory-400 hover:text-charcoal"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Single Farmer Deal (AGR-DEAL-2026-004821)</span>
        </button>

        <button
          onClick={() => setSelectedDealId("AGR-POOL-DEAL-800Q")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            selectedDealId === "AGR-POOL-DEAL-800Q"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-charcoal-muted dark:text-ivory-400 hover:text-charcoal"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Multi-Farmer Aggregated Deal (800 q)</span>
        </button>
      </div>

      {/* Main Grid: Card & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dashboard Card & View Perspective */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Payment Protection Dashboard Card (As Specified in Prompt #5) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-forest/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-4">
              <div>
                <span className="text-3xs uppercase font-extrabold tracking-wider text-charcoal-muted dark:text-ivory-400 block">
                  🔒 PAYMENT PROTECTION RECORD
                </span>
                <h3 className="text-lg font-black text-charcoal dark:text-ivory-100 font-mono mt-0.5">
                  {paymentRecord.dealId}
                </h3>
              </div>
              <PaymentStatusBadge status={paymentRecord.status} size="lg" />
            </div>

            {/* Amount & Parties Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
                <span className="text-3xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400">
                  Protected Deal Value
                </span>
                <span className="text-2xl font-black text-forest dark:text-emerald-400 block">
                  ₹{paymentRecord.totalAmount.toLocaleString("en-IN")}
                </span>
                <span className="text-3xs text-charcoal-muted font-semibold">
                  {paymentRecord.quantityQuintals} q × ₹{paymentRecord.unitPrice}/q
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
                <span className="text-3xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400">
                  Buyer (Deposit Source)
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-bold text-xs text-charcoal dark:text-ivory-100 truncate">
                    {paymentRecord.buyerName}
                  </span>
                </div>
                <span className="text-3xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ✓ Business Verified
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
                <span className="text-3xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400">
                  Seller (Recipient)
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <User className="w-4 h-4 text-amber shrink-0" />
                  <span className="font-bold text-xs text-charcoal dark:text-ivory-100 truncate">
                    {paymentRecord.sellerName}
                  </span>
                </div>
                <span className="text-3xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ✓ Verified Seller
                </span>
              </div>
            </div>

            {/* Next Step & Actions */}
            <div className="p-4 rounded-2xl bg-forest/5 dark:bg-forest/20 border border-forest/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-3xs uppercase font-extrabold text-forest dark:text-emerald-400 block">
                  Next Required Action:
                </span>
                <span className="font-extrabold text-sm text-charcoal dark:text-ivory-100">
                  {paymentRecord.nextStep}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab("smart-deal")}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-charcoal text-charcoal dark:text-ivory-100 border border-ivory-300 dark:border-charcoal-light hover:bg-ivory-100 transition-colors shadow-2xs"
                >
                  View Digital Deal
                </button>

                {userRole === "SELLER" && paymentRecord.status !== "Payment Released" && (
                  <button
                    onClick={() => setActiveDeliveryModal(true)}
                    className="px-5 py-2 rounded-xl text-xs font-extrabold bg-forest text-white hover:bg-forest-dark transition-colors shadow-md flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4 text-amber" />
                    <span>Submit Delivery</span>
                  </button>
                )}

                {userRole === "BUYER" && deliverySubmission && paymentRecord.status !== "Payment Released" && (
                  <button
                    onClick={() => setActiveBuyerReviewModal(true)}
                    className="px-5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Review & Confirm Delivery</span>
                  </button>
                )}
              </div>
            </div>

            {/* Perspective View (Prompt #8 Buyer View vs #9 Farmer View) */}
            <div className="pt-4 border-t border-ivory-200 dark:border-charcoal-light space-y-3">
              <h4 className="text-2xs font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400">
                {userRole === "BUYER" ? "🏢 Buyer Payment Perspective" : "👩‍🌾 Farmer Payment Perspective"}
              </h4>

              {userRole === "BUYER" ? (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-2 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-3xs text-charcoal-muted">Deal Value:</span>
                      <p className="font-extrabold text-charcoal dark:text-ivory-100">₹{paymentRecord.totalAmount.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <span className="text-3xs text-charcoal-muted">Protected Amount:</span>
                      <p className="font-extrabold text-emerald-600">₹{paymentRecord.protectedAmount.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <span className="text-3xs text-charcoal-muted">Delivery Status:</span>
                      <p className="font-bold text-charcoal dark:text-ivory-100">{deliverySubmission ? "Submitted" : "Pending"}</p>
                    </div>
                    <div>
                      <span className="text-3xs text-charcoal-muted">Release Trigger:</span>
                      <p className="font-bold text-charcoal dark:text-ivory-100">Post Delivery Receipt</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setActiveTab("smart-deal")}
                      className="px-3 py-1.5 rounded-lg text-2xs font-extrabold bg-blue-600 text-white"
                    >
                      [View Deal]
                    </button>
                    {deliverySubmission && (
                      <button
                        onClick={() => setActiveBuyerReviewModal(true)}
                        className="px-3 py-1.5 rounded-lg text-2xs font-extrabold bg-white dark:bg-charcoal text-blue-700 dark:text-blue-300 border border-blue-300"
                      >
                        [View Delivery Status]
                      </button>
                    )}
                    <button
                      onClick={() => setActiveDisputeModal(true)}
                      className="px-3 py-1.5 rounded-lg text-2xs font-extrabold text-rose-700 bg-rose-50 border border-rose-200"
                    >
                      [Report Issue]
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-3xs text-charcoal-muted">Deal Value:</span>
                      <p className="font-extrabold text-charcoal dark:text-ivory-100">₹{paymentRecord.totalAmount.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <span className="text-3xs text-charcoal-muted">Payment Status:</span>
                      <p className="font-extrabold text-emerald-600">🟢 Protected</p>
                    </div>
                    <div>
                      <span className="text-3xs text-charcoal-muted">Delivery Status:</span>
                      <p className="font-bold text-charcoal dark:text-ivory-100">{deliverySubmission ? "Submitted" : "Pending"}</p>
                    </div>
                    <div>
                      <span className="text-3xs text-charcoal-muted">Expected Release:</span>
                      <p className="font-bold text-charcoal dark:text-ivory-100">After Delivery Confirmation</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setActiveTab("smart-deal")}
                      className="px-3 py-1.5 rounded-lg text-2xs font-extrabold bg-forest text-white"
                    >
                      [View Deal]
                    </button>
                    <button
                      onClick={() => setActiveDeliveryModal(true)}
                      className="px-3 py-1.5 rounded-lg text-2xs font-extrabold bg-amber text-charcoal"
                    >
                      [Submit Delivery]
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Aggregated Deal Lot-level Payout Allocation (Section 38, 40) */}
            {paymentRecord.isAggregatedDeal && (
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-extrabold uppercase text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-purple-600" />
                    Multi-Farmer Lot Payout Allocation
                  </span>
                  <span className="text-3xs font-mono font-bold text-purple-800 dark:text-purple-300">
                    Total: ₹22,80,000 (800 q)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-charcoal border border-purple-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-charcoal dark:text-ivory-100">Farmer A (120 q)</p>
                      <span className="text-3xs text-emerald-600 font-bold">✓ Delivered & Accepted</span>
                    </div>
                    <span className="font-extrabold text-emerald-600">🟢 Payout Released (₹3,42,000)</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-charcoal border border-purple-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-charcoal dark:text-ivory-100">Farmer B (80 q)</p>
                      <span className="text-3xs text-emerald-600 font-bold">✓ Delivered & Accepted</span>
                    </div>
                    <span className="font-extrabold text-emerald-600">🟢 Payout Released (₹2,28,000)</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-charcoal border border-purple-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-charcoal dark:text-ivory-100">Farmer C (150 q)</p>
                      <span className="text-3xs text-amber-600 font-bold">🚚 In Transit</span>
                    </div>
                    <span className="font-extrabold text-amber-600">🔒 Payment Protected (₹4,27,500)</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-charcoal border border-purple-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-charcoal dark:text-ivory-100">Farmer D (100 q)</p>
                      <span className="text-3xs text-emerald-600 font-bold">✓ Delivered & Accepted</span>
                    </div>
                    <span className="font-extrabold text-emerald-600">🟢 Payout Released (₹2,85,000)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Stage Timeline */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md">
          <PaymentTimeline milestones={paymentRecord.milestones} />
        </div>
      </div>

      {/* Modals */}
      {activeDeliveryModal && (
        <DeliveryConfirmationModal
          dealId={paymentRecord.dealId}
          defaultQuantity={paymentRecord.quantityQuintals}
          onClose={() => setActiveDeliveryModal(false)}
          onSubmit={handleFarmerSubmitDelivery}
        />
      )}

      {activeBuyerReviewModal && deliverySubmission && (
        <BuyerDeliveryReviewModal
          submission={deliverySubmission}
          onClose={() => setActiveBuyerReviewModal(false)}
          onConfirm={handleBuyerConfirmDelivery}
          onRaiseIssue={() => setActiveDisputeModal(true)}
        />
      )}

      {activeDisputeModal && (
        <DeliveryDisputeModal
          dealId={paymentRecord.dealId}
          expectedQuantity={paymentRecord.quantityQuintals}
          onClose={() => setActiveDisputeModal(false)}
          onSubmitDispute={handleRaiseDispute}
        />
      )}
    </div>
  );
}
