import { useState } from "react";
import {
  Package,
  CheckCircle2,
  Users,
  Building2,
  Calendar,
  Scale,
  DollarSign,
  Truck,
  Send,
  PlusCircle,
  FileCheck,
} from "lucide-react";
import { useMandi } from "../../context/MandiContext";
import { aggregationService } from "../../services/aggregationService";
import { dealService } from "../../services/dealService";
import { FarmerPrivacyLotBreakdown } from "./FarmerPrivacyLotBreakdown";
import type { SupplyPool } from "../../types/mandi";

export function AggregationDashboardView() {
  const { userRole, setActiveTab, showNotification } = useMandi();

  const [pool, setPool] = useState<SupplyPool>(aggregationService.getSupplyPool());
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [userContributionQty, setUserContributionQty] = useState<number>(80);
  const [proposalOfferPrice, setProposalOfferPrice] = useState<number>(pool.buyerOfferPricePerQuintal);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleJoinPool = () => {
    const updated = aggregationService.joinSupplyPool("FARMER-UP-1042", userContributionQty);
    setPool({ ...updated });
    setIsJoinModalOpen(false);
    showNotification(`Joined Aggregated Supply Pool with ${userContributionQty} q!`);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleFarmerConfirm = (farmerId: string, status: "CONFIRMED" | "REJECTED") => {
    const updated = aggregationService.updateFarmerPriceConfirmation(farmerId, status);
    setPool({ ...updated });
    showNotification(`Confirmation status updated for ${farmerId}`);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleBroadcastProposal = () => {
    const updated = aggregationService.sendPoolProposal(proposalOfferPrice);
    setPool({ ...updated });
    showNotification(`Pool offer proposal of ₹${proposalOfferPrice}/q sent to all pool farmers!`);
    setRefreshTrigger((prev) => prev + 1);
  };

  const confirmedFarmersCount = pool.farmers.filter((f) => f.confirmationStatus === "CONFIRMED").length;
  const confirmedQuantity = pool.farmers
    .filter((f) => f.confirmationStatus === "CONFIRMED")
    .reduce((sum, f) => sum + f.quantityQuintals, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-7 h-7 text-forest dark:text-emerald-400" />
            <h2 className="text-2xl font-black text-charcoal dark:text-ivory-100">
              📦 Multi-Farmer Produce Aggregation
            </h2>
          </div>
          <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-1">
            Combine compatible small-farmer harvests into high-volume bulk supply pools for institutional buyers.
          </p>
        </div>

        {/* Action Button */}
        {userRole === "SELLER" && (
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-forest text-white hover:bg-forest-dark transition-colors shadow-md flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-amber" />
            <span>Join Aggregated Supply Pool</span>
          </button>
        )}
      </div>

      {/* Summary Widgets Bar (Section 42 Prompt Widgets) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-xs space-y-1">
          <span className="text-3xs uppercase font-bold text-charcoal-muted">
            {userRole === "SELLER" ? "My Aggregation Opps" : "Active Requirements"}
          </span>
          <span className="text-2xl font-black text-forest dark:text-emerald-400 block">
            {userRole === "SELLER" ? "2" : "4"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-xs space-y-1">
          <span className="text-3xs uppercase font-bold text-charcoal-muted">
            {userRole === "SELLER" ? "Active Supply Pools" : "Matched Requirements"}
          </span>
          <span className="text-2xl font-black text-charcoal dark:text-ivory-100 block">
            {userRole === "SELLER" ? "1 Pool" : "2 Pools"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-xs space-y-1">
          <span className="text-3xs uppercase font-bold text-charcoal-muted">
            Total Aggregated Qty
          </span>
          <span className="text-2xl font-black text-blue-600 block">
            {pool.matchedQuantityQuintals} q
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-xs space-y-1">
          <span className="text-3xs uppercase font-bold text-charcoal-muted">
            Protected Payments
          </span>
          <span className="text-2xl font-black text-emerald-600 block">
            ₹22.8 L
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-xs space-y-1">
          <span className="text-3xs uppercase font-bold text-charcoal-muted">
            Logistics Savings
          </span>
          <span className="text-2xl font-black text-amber-500 block">
            ₹10,500
          </span>
        </div>
      </div>

      {/* Main Aggregated Pool Hero Card (Sections 21, 22, 25) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory-200 dark:border-charcoal-light pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-mono font-bold text-purple-700 dark:text-purple-300 uppercase">
                  {pool.id}
                </span>
                <span className="text-3xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold">
                  🟢 Requirement 100% Fulfilled
                </span>
              </div>
              <h3 className="text-lg font-black text-charcoal dark:text-ivory-100">
                {pool.cropName} Bulk Requirement — {pool.requiredQuantityQuintals} Quintals
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xs text-charcoal-muted uppercase block font-extrabold">
              Target Buyer
            </span>
            <span className="font-extrabold text-sm text-charcoal dark:text-ivory-100 flex items-center gap-1">
              <Building2 className="w-4 h-4 text-blue-600" />
              {pool.buyerBusinessName}
            </span>
          </div>
        </div>

        {/* Progress Bar & Fulfillment Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-charcoal dark:text-ivory-100">
              Aggregated Supply Progress: <b>{pool.matchedQuantityQuintals} q / {pool.requiredQuantityQuintals} q</b>
            </span>
            <span className="text-emerald-600 font-black">100% Matched ({pool.farmers.length} Farmers)</span>
          </div>

          <div className="w-full h-3 rounded-full bg-ivory-200 dark:bg-charcoal overflow-hidden p-0.5">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 w-full animate-pulse" />
          </div>
        </div>

        {/* Compatibility Match Score Breakdown Card (Section 22) */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-black text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Match Score: {pool.matchScorePercentage}% Compatible
            </span>
            <span className="text-3xs font-bold text-emerald-700 dark:text-emerald-300">
              Strict Quality & Location Verification Passed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs font-bold text-charcoal dark:text-ivory-200">
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
              ✓ Crop Match ({pool.cropName})
            </span>
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
              ✓ Grade A Compliant
            </span>
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
              ✓ Moisture ≤ {pool.maxMoisturePercentage}%
            </span>
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
              ✓ Quantity Fully Matched
            </span>
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
              ✓ Harvest Window Valid
            </span>
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
              ✓ Same Regional Belt ({pool.buyerLocation})
            </span>
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
              ✓ 100% Kisan Verified
            </span>
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
              ✓ Organic / Standard Grade
            </span>
          </div>
        </div>

        {/* Combined Supply Quality Summary (Section 28) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
            <span className="text-3xs font-extrabold uppercase text-charcoal-muted">
              Quality Grade Breakdown
            </span>
            <span className="font-extrabold text-charcoal dark:text-ivory-100 block">
              {pool.combinedQualitySummary.gradeABreakdown}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
            <span className="text-3xs font-extrabold uppercase text-charcoal-muted">
              Moisture Range & Average
            </span>
            <span className="font-extrabold text-charcoal dark:text-ivory-100 block">
              {pool.combinedQualitySummary.moistureRange} (Avg {pool.combinedQualitySummary.averageMoisture}%)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
            <span className="text-3xs font-extrabold uppercase text-charcoal-muted">
              Lab & Moisture Verification
            </span>
            <span className="font-extrabold text-emerald-600 block">
              {pool.combinedQualitySummary.verificationText}
            </span>
          </div>
        </div>

        {/* Aggregated Transport Savings Card (Section 34) */}
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-400/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber text-charcoal shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-xs text-amber-950 dark:text-amber-200">
                Aggregated Multi-Village Transport Savings
              </h4>
              <p className="text-3xs text-amber-900 dark:text-amber-300">
                Shared vehicle pickup route reduces individual transport costs by 32%.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-3xs text-charcoal-muted block">Individual Total: ₹32,000</span>
            <span className="text-sm font-black text-emerald-600">
              Aggregated: ₹21,500
            </span>
            <span className="text-3xs px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold block mt-0.5">
              Estimated Savings: ₹10,500
            </span>
          </div>
        </div>
      </div>

      {/* Section 30 & 31: Aggregated Pricing & Pool Offer Proposal Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-4">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Commercial Proposal & Individual Price Confirmations
            </h3>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
              Fair Price Engine remains individual. Each farmer holds independent accepted price terms.
            </p>
          </div>

          <div className="text-right">
            <span className="text-3xs font-extrabold text-charcoal-muted uppercase block">
              Confirmed Participation
            </span>
            <span className="text-sm font-black text-forest dark:text-emerald-400">
              {confirmedFarmersCount} / {pool.farmers.length} Farmers ({confirmedQuantity} q)
            </span>
          </div>
        </div>

        {/* Buyer Proposal Sender Panel (Section 31) */}
        {userRole === "BUYER" && (
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-2xs font-extrabold uppercase text-blue-900 dark:text-blue-200 block">
                Broadcast Buyer Pool Offer to All Farmers
              </span>
              <p className="text-3xs text-blue-800 dark:text-blue-300">
                Offer ₹2,850/q to all 6 pool farmers for 800 q Wheat.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                value={proposalOfferPrice}
                onChange={(e) => setProposalOfferPrice(Number(e.target.value))}
                className="w-28 px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-charcoal text-xs font-bold text-charcoal dark:text-ivory-100 font-mono"
              />
              <button
                onClick={handleBroadcastProposal}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Broadcast Proposal
              </button>
            </div>
          </div>
        )}

        {/* Individual Farmer Confirmation List (Section 37) */}
        <div className="space-y-3">
          <h4 className="text-2xs font-extrabold uppercase tracking-wider text-charcoal-muted">
            Individual Farmer Payout & Confirmation Status
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pool.farmers.map((farmer) => {
              const isCurrentUser = farmer.farmerId === "FARMER-UP-1042";

              return (
                <div
                  key={farmer.farmerId}
                  className="p-4 rounded-2xl border bg-ivory-50 dark:bg-charcoal border-ivory-200 dark:border-charcoal-light space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-charcoal dark:text-ivory-100 truncate max-w-[140px]">
                      {farmer.displayName}
                    </span>
                    <span
                      className={`text-3xs font-black px-2 py-0.5 rounded-full ${
                        farmer.confirmationStatus === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {farmer.confirmationStatus === "CONFIRMED" ? "✓ Confirmed" : "⏳ Pending"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-3xs text-charcoal-muted">
                    <div>
                      <span>Quantity:</span>
                      <p className="font-bold text-charcoal dark:text-ivory-200 text-xs">
                        {farmer.quantityQuintals} q
                      </p>
                    </div>
                    <div>
                      <span>Accepted Price:</span>
                      <p className="font-bold text-emerald-600 text-xs font-mono">
                        ₹{farmer.acceptedPricePerQuintal || 2850}/q
                      </p>
                    </div>
                  </div>

                  {isCurrentUser && userRole === "SELLER" && (
                    <div className="pt-2 border-t border-ivory-200 dark:border-charcoal-light flex gap-2">
                      <button
                        onClick={() => handleFarmerConfirm(farmer.farmerId, "CONFIRMED")}
                        className="w-full py-1 rounded-lg text-3xs font-extrabold bg-emerald-600 text-white"
                      >
                        Confirm Terms ✓
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Generate Smart Deal Button (Section 35, 36) */}
        <div className="pt-4 border-t border-ivory-200 dark:border-charcoal-light flex items-center justify-between">
          <div>
            <span className="font-extrabold text-xs text-charcoal dark:text-ivory-100 block">
              Total Deal Commercial Value: ₹22,80,000 (800 q)
            </span>
            <span className="text-3xs text-charcoal-muted">
              Status: 🟢 Ready for Digital Smart Agreement
            </span>
          </div>

          <button
            onClick={() => {
              const offerObj = {
                id: "OFFER-POOL-800Q",
                listingId: "MND-2026-WHT-001",
                cropListing: {} as any,
                buyerId: pool.buyerId,
                buyerProfile: {} as any,
                sellerId: "FARMER-UP-1042",
                quantityQuintals: 800,
                proposedPricePerQuintal: 2850,
                totalAmount: 2280000,
                qualityGrade: "Grade A" as any,
                maxMoisturePercentage: 12.0,
                pickupPreference: "Buyer Arranged Transport" as any,
                expectedDeliveryDate: "15 October 2026",
                paymentTerms: "Escrow / 3-Day Bank Release" as any,
                status: "ACCEPTED" as any,
                messages: [],
                negotiationTimeline: [],
                createdAt: "2026-09-01",
                updatedAt: "2026-09-01",
              };
              dealService.createSmartDeal(offerObj as any);
              showNotification("Multi-Farmer Aggregated Smart Deal Generated!");
              setActiveTab("smart-deal");
            }}
            className="px-6 py-3 rounded-2xl font-extrabold text-xs bg-forest text-white hover:bg-forest-dark transition-colors shadow-lg flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4 text-amber" />
            <span>Generate Multi-Farmer Smart Deal →</span>
          </button>
        </div>
      </div>

      {/* Lot Breakdown Privacy Guard Component (Section 26, 27, 29) */}
      <FarmerPrivacyLotBreakdown farmers={pool.farmers} userRole={userRole} />

      {/* Join Pool Confirmation Modal for Farmer */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <h3 className="font-extrabold text-base text-charcoal dark:text-ivory-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-forest" /> Confirm Participation in Supply Pool
            </h3>

            <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-2 text-xs">
              <p><b>Target Buyer:</b> {pool.buyerBusinessName}</p>
              <p><b>Crop:</b> Wheat Grade A (Moisture ≤ 12%)</p>
              <p><b>Expected Price Range:</b> ₹2,700–₹2,850/q</p>
              <p><b>Your Role:</b> Supply Contributor</p>
            </div>

            <div>
              <label className="block text-2xs font-extrabold uppercase text-charcoal-muted mb-1">
                Your Quantity Contribution (Quintals)
              </label>
              <input
                type="number"
                value={userContributionQty}
                onChange={(e) => setUserContributionQty(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal text-xs font-bold text-charcoal dark:text-ivory-100 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsJoinModalOpen(false)}
                className="px-4 py-2 rounded-xl font-bold text-xs text-charcoal-muted hover:bg-ivory-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleJoinPool}
                className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-forest text-white hover:bg-forest-dark transition-colors shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-amber" />
                <span>Confirm Participation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
