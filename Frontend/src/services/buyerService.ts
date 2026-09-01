import type { BuyerProfile, BuyingRequirementItem } from "../types/mandi";
import { MOCK_BUYER_PROFILES } from "../data/mockMandiData";

let localBuyers: BuyerProfile[] = [...MOCK_BUYER_PROFILES];

export const buyerService = {
  /**
   * Get all buyer profiles
   */
  getAllBuyers(): BuyerProfile[] {
    return localBuyers;
  },

  /**
   * Get buyer by ID
   */
  getBuyerById(id: string): BuyerProfile | undefined {
    return localBuyers.find((b) => b.id === id);
  },

  /**
   * Get default featured buyer (e.g. ABC Foods Pvt Ltd)
   */
  getDefaultBuyer(): BuyerProfile {
    return localBuyers[0] || MOCK_BUYER_PROFILES[0];
  },

  /**
   * Search buyers by crop requirement or location
   */
  searchBuyers(query: string): BuyerProfile[] {
    if (!query) return localBuyers;
    const q = query.toLowerCase();
    return localBuyers.filter(
      (b) =>
        b.businessName.toLowerCase().includes(q) ||
        b.buyerType.toLowerCase().includes(q) ||
        b.district.toLowerCase().includes(q) ||
        b.state.toLowerCase().includes(q) ||
        b.activeRequirements.some((req) => req.toLowerCase().includes(q))
    );
  },

  /**
   * Add a new buying requirement for a buyer
   */
  addRequirement(buyerId: string, requirement: Omit<BuyingRequirementItem, "id" | "status">): BuyerProfile {
    const buyer = this.getBuyerById(buyerId);
    if (!buyer) throw new Error("Buyer not found");

    const newReq: BuyingRequirementItem = {
      ...requirement,
      id: `REQ-${Date.now()}`,
      status: "ACTIVE",
    };

    buyer.detailedRequirements = [newReq, ...buyer.detailedRequirements];
    buyer.activeRequirements = Array.from(
      new Set([`${requirement.cropName} (${requirement.minQuantityQuintals}-${requirement.maxQuantityQuintals} q)`, ...buyer.activeRequirements])
    );

    return buyer;
  },

  /**
   * Create a new Buyer Profile with valid ID documents
   */
  createBuyerProfile(profileData: Omit<BuyerProfile, "id" | "verificationId" | "completedTransactionsCount" | "totalQuantityPurchasedQuintals" | "averageOrderQuintals" | "farmerRating" | "paymentReliabilityPercentage" | "onTimePaymentPercentage" | "delayedPaymentPercentage" | "averagePaymentDays" | "reputationBreakdown" | "disputeRecord">): BuyerProfile {
    const newId = `BUYER-${Math.floor(100 + Math.random() * 900)}`;
    const verificationId = `AGR-BUY-2026-${profileData.state.substring(0, 2).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;

    const newBuyer: BuyerProfile = {
      ...profileData,
      id: newId,
      verificationId,
      completedTransactionsCount: 0,
      totalQuantityPurchasedQuintals: 0,
      averageOrderQuintals: 0,
      farmerRating: 5.0,
      paymentReliabilityPercentage: 100,
      onTimePaymentPercentage: 100,
      delayedPaymentPercentage: 0,
      averagePaymentDays: 1.0,
      reputationBreakdown: {
        overallRating: 5.0,
        paymentReliability: 5.0,
        priceFairness: 5.0,
        behaviour: 5.0,
        contractAdherence: 5.0,
        pickupReliability: 5.0,
        disputeResolution: 5.0,
        totalReviewsCount: 1,
      },
      disputeRecord: {
        totalDisputes: 0,
        resolvedDisputes: 0,
        unresolvedDisputes: 0,
        disputesList: [],
      },
    };

    localBuyers = [newBuyer, ...localBuyers];
    return newBuyer;
  },

  /**
   * Saved buyers set (mock state)
   */
  savedBuyerIds: new Set<string>(["BUYER-001"]),

  isBuyerSaved(buyerId: string): boolean {
    return this.savedBuyerIds.has(buyerId);
  },

  toggleSaveBuyer(buyerId: string): boolean {
    if (this.savedBuyerIds.has(buyerId)) {
      this.savedBuyerIds.delete(buyerId);
      return false;
    } else {
      this.savedBuyerIds.add(buyerId);
      return true;
    }
  },

  /**
   * Report concern simulation
   */
  reportConcern(buyerId: string, category: string, details: string) {
    return {
      success: true,
      reportId: `RPT-BUYER-${Date.now()}`,
      category,
      message: "Concern recorded for platform trust desk audit.",
    };
  },
};
