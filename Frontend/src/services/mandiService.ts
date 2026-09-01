import type {
  CropListing,
  MarketplaceFilter,
  PriceAnalysis,
  ProductionCosts,
  QualityMetrics,
  OrganicVerification,
  PriceFactor,
  BuyerOffer,
  FarmerPublicProfile,
  BuyerProfile,
} from "../types/mandi";
import { MOCK_CROP_LISTINGS, MOCK_BUYER_OFFERS, MOCK_BUYER_PROFILES } from "../data/mockMandiData";

const REGIONAL_BASE_RATES: Record<string, number> = {
  Wheat: 2300,
  "Basmati Rice": 4200,
  Rice: 2150,
  Soybean: 4300,
  "Red Onion": 1950,
  Mustard: 5150,
  "Gram / Chana": 5400,
  Maize: 2050,
  Potato: 1400,
};

let localListings: CropListing[] = [...MOCK_CROP_LISTINGS];
let localOffers: BuyerOffer[] = [...MOCK_BUYER_OFFERS];

export const mandiService = {
  // ── Calculate Fair Price Engine ─────────────────────────────────────────
  calculateFairPriceRange(params: {
    cropName: string;
    variety: string;
    quantityQuintals: number;
    productionCosts: ProductionCosts;
    quality: QualityMetrics;
    organic: OrganicVerification;
    location: { state: string; district: string };
  }): PriceAnalysis {
    const baseRate = REGIONAL_BASE_RATES[params.cropName] || 2200;
    const factors: PriceFactor[] = [];

    // 1. Base rate factor
    factors.push({
      id: "PF-BASE",
      name: `Regional Reference Market Rate (${params.location.district})`,
      category: "BASE",
      amountPerQuintal: baseRate,
      description: `Baseline APMC market reference price in ${params.location.district}, ${params.location.state}`,
    });

    // 2. Organic premium
    if (params.organic.isOrganic) {
      const organicPremium =
        params.organic.verificationState === "VERIFIED" ? 300 : 180;
      factors.push({
        id: "PF-ORG",
        name: `Organic Crop Premium (${params.organic.certificationType || "Claimed"})`,
        category: "ORGANIC",
        amountPerQuintal: organicPremium,
        description:
          params.organic.verificationState === "VERIFIED"
            ? "100% Verified Chemical-Free Organic Premium"
            : "Organic Claimed - Pending Document Verification",
        evidenceTitle: params.organic.certificateDocument?.fileName,
        evidenceVerified: params.organic.verificationState === "VERIFIED",
      });
    }

    // 3. Quality & Grade premiums
    let gradeAmt = 0;
    if (params.quality.grade === "Premium Export") gradeAmt = 350;
    else if (params.quality.grade === "Grade A") gradeAmt = 180;
    else if (params.quality.grade === "Grade B") gradeAmt = 80;

    if (gradeAmt > 0) {
      factors.push({
        id: "PF-GRADE",
        name: `Quality Grade Premium (${params.quality.grade})`,
        category: "QUALITY",
        amountPerQuintal: gradeAmt,
        description: `Visual appearance, grain sizing (${params.quality.physicalQuality})`,
      });
    }

    // Moisture bonus/penalty
    if (params.quality.moisturePercentage <= 12) {
      factors.push({
        id: "PF-MOIST",
        name: `Optimal Low Moisture Premium (${params.quality.moisturePercentage}%)`,
        category: "QUALITY",
        amountPerQuintal: 100,
        description: "Low moisture extends shelf life and prevents post-harvest fungal mold",
        evidenceTitle: params.quality.labReportFile?.fileName,
        evidenceVerified: params.quality.hasLabTest,
      });
    } else if (params.quality.moisturePercentage > 14) {
      factors.push({
        id: "PF-MOIST-PEN",
        name: `High Moisture Penalty (${params.quality.moisturePercentage}%)`,
        category: "QUALITY",
        amountPerQuintal: -90,
        description: "Moisture content above 14% requires additional ambient drying",
      });
    }

    // Lab Test Evidence Bonus
    if (params.quality.hasLabTest) {
      factors.push({
        id: "PF-LAB",
        name: "Certified Laboratory Test Verification",
        category: "QUALITY",
        amountPerQuintal: 70,
        description: `Verified purity (${params.quality.purityPercentage}%) by ${params.quality.labName || "Accredited Agrisense Lab"}`,
        evidenceTitle: params.quality.labReportFile?.fileName,
        evidenceVerified: true,
      });
    }

    // 4. Logistics & Deductions
    factors.push({
      id: "PF-TRANS",
      name: "Estimated Local Transport Logistics",
      category: "LOGISTICS",
      amountPerQuintal: -80,
      description: "Farm gate loading and regional haulage cost adjustment",
    });

    factors.push({
      id: "PF-PACK",
      name: "Storage & Packaging Handling",
      category: "LOGISTICS",
      amountPerQuintal: -40,
      description: "Bagging and storage maintenance cost",
    });

    // 5. Demand Premium
    factors.push({
      id: "PF-DEMAND",
      name: "Regional Buyer Demand Index",
      category: "DEMAND",
      amountPerQuintal: 120,
      description: "High direct processor demand in regional trade zone",
    });

    // Calculate sum
    const totalAdjustments = factors.reduce((sum, f) => sum + f.amountPerQuintal, 0);
    const suggestedPrice = Math.round(totalAdjustments);
    const indicativeMinPrice = Math.round(suggestedPrice * 0.975);
    const indicativeMaxPrice = Math.round(suggestedPrice * 1.025);

    // Calculate transparency score (0 - 100)
    let score = 50; // base score for entering basic data
    if (params.productionCosts.totalCost > 0) score += 15;
    if (params.productionCosts.evidenceList.length > 0) score += 10;
    if (params.quality.hasLabTest) score += 15;
    if (params.organic.isOrganic && params.organic.verificationState === "VERIFIED") score += 10;

    return {
      regionalReferencePrice: baseRate,
      indicativeMinPrice,
      indicativeMaxPrice,
      suggestedPrice,
      transparencyScore: Math.min(100, score),
      confidencePercentage: Math.min(95, Math.round(score * 0.95)),
      factors,
      calculationMethodNotes:
        "The reference price is combined with crop quality, production economics, verified organic status, logistics, and regional market demand. The result is an indicative evidence-backed range.",
    };
  },

  // ── Fetch & Filter Crop Listings ───────────────────────────────────────
  getListings(filters?: Partial<MarketplaceFilter>): CropListing[] {
    let result = [...localListings];

    if (!filters) return result;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.cropName.toLowerCase().includes(q) ||
          item.variety.toLowerCase().includes(q) ||
          item.location.state.toLowerCase().includes(q) ||
          item.location.district.toLowerCase().includes(q)
      );
    }

    if (filters.cropName && filters.cropName !== "ALL") {
      result = result.filter(
        (item) => item.cropName.toLowerCase() === filters.cropName?.toLowerCase()
      );
    }

    if (filters.state && filters.state !== "ALL") {
      result = result.filter((item) => item.location.state === filters.state);
    }

    if (filters.district && filters.district !== "ALL") {
      result = result.filter((item) => item.location.district === filters.district);
    }

    if (filters.organicOnly) {
      result = result.filter((item) => item.organic.isOrganic);
    }

    if (filters.qualityGrade && filters.qualityGrade !== "ALL") {
      result = result.filter((item) => item.quality.grade === filters.qualityGrade);
    }

    if (filters.govtVerifiedOnly) {
      result = result.filter((item) => item.verification.isVerified);
    }

    if (filters.minPrice !== null && filters.minPrice !== undefined && filters.minPrice > 0) {
      result = result.filter((item) => item.askingPricePerQuintal >= filters.minPrice!);
    }

    if (filters.maxPrice !== null && filters.maxPrice !== undefined && filters.maxPrice > 0) {
      result = result.filter((item) => item.askingPricePerQuintal <= filters.maxPrice!);
    }

    if (filters.minQuantity !== null && filters.minQuantity !== undefined && filters.minQuantity > 0) {
      result = result.filter((item) => item.quantityQuintals >= filters.minQuantity!);
    }

    // Sort
    if (filters.sortBy === "LOWEST_PRICE") {
      result.sort((a, b) => a.askingPricePerQuintal - b.askingPricePerQuintal);
    } else if (filters.sortBy === "HIGHEST_QUALITY") {
      result.sort((a, b) => b.priceAnalysis.transparencyScore - a.priceAnalysis.transparencyScore);
    } else if (filters.sortBy === "HIGHEST_TRANSPARENCY") {
      result.sort((a, b) => b.priceAnalysis.transparencyScore - a.priceAnalysis.transparencyScore);
    } else if (filters.sortBy === "NEWEST") {
      result.sort(
        (a, b) => new Date(b.listingDate).getTime() - new Date(a.listingDate).getTime()
      );
    }

    return result;
  },

  getListingById(id: string): CropListing | undefined {
    return localListings.find((item) => item.id === id);
  },

  // ── Create New Crop Listing ─────────────────────────────────────────────
  createListing(listingData: Omit<CropListing, "id" | "listingDate" | "viewsCount" | "offersCount" | "status">): CropListing {
    const newId = `MND-2026-${listingData.cropName.substring(0, 3).toUpperCase()}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newListing: CropListing = {
      ...listingData,
      id: newId,
      listingDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      viewsCount: 1,
      offersCount: 0,
    };

    localListings = [newListing, ...localListings];
    return newListing;
  },

  // ── Offer Management ──────────────────────────────────────────────────
  createOffer(params: {
    listingId: string;
    quantityQuintals: number;
    proposedPricePerQuintal: number;
    pickupPreference: BuyerOffer["pickupPreference"];
    expectedDeliveryDate: string;
    paymentTerms: BuyerOffer["paymentTerms"];
    additionalNotes?: string;
    buyerProfile?: BuyerProfile;
  }): BuyerOffer {
    const listing = this.getListingById(params.listingId);
    if (!listing) throw new Error("Listing not found");

    const buyer = params.buyerProfile || MOCK_BUYER_PROFILES[0];
    const newOffer: BuyerOffer = {
      id: `OFFER-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      listingId: listing.id,
      cropListing: listing,
      buyerId: buyer.id,
      buyerProfile: buyer,
      sellerId: listing.farmerId,
      quantityQuintals: params.quantityQuintals,
      proposedPricePerQuintal: params.proposedPricePerQuintal,
      totalAmount: params.quantityQuintals * params.proposedPricePerQuintal,
      qualityGrade: listing.quality.grade,
      maxMoisturePercentage: listing.quality.moisturePercentage,
      pickupPreference: params.pickupPreference,
      expectedDeliveryDate: params.expectedDeliveryDate,
      paymentTerms: params.paymentTerms,
      additionalNotes: params.additionalNotes,
      status: "AWAITING_RESPONSE",
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      messages: [
        {
          id: `MSG-${Date.now()}`,
          senderRole: "BUYER",
          senderName: buyer.businessName,
          timestamp: new Date().toLocaleString(),
          message: params.additionalNotes || `Placed offer for ${params.quantityQuintals} Quintals at ₹${params.proposedPricePerQuintal}/q.`,
        },
      ],
      negotiationTimeline: [
        {
          id: `TL-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actorName: buyer.businessName,
          actorRole: "BUYER",
          actionType: "OFFER_CREATED",
          pricePerQuintal: params.proposedPricePerQuintal,
          quantityQuintals: params.quantityQuintals,
          note: `Placed offer at ₹${params.proposedPricePerQuintal}/q`,
        },
      ],
    };

    localOffers = [newOffer, ...localOffers];
    
    // Increment listing offers count
    listing.offersCount += 1;

    return newOffer;
  },

  getOffersForSeller(sellerId: string): BuyerOffer[] {
    return localOffers.filter((off) => off.sellerId === sellerId);
  },

  getOffersForBuyer(buyerId: string): BuyerOffer[] {
    return localOffers.filter((off) => off.buyerId === buyerId);
  },

  updateOfferStatus(
    offerId: string,
    status: BuyerOffer["status"],
    counterPricePerQuintal?: number,
    messageText?: string,
    senderRole: "SELLER" | "BUYER" = "SELLER"
  ): BuyerOffer {
    const offer = localOffers.find((o) => o.id === offerId);
    if (!offer) throw new Error("Offer not found");

    offer.status = status;
    offer.updatedAt = new Date().toLocaleString();

    if (counterPricePerQuintal) {
      offer.counterPricePerQuintal = counterPricePerQuintal;
    }

    if (messageText) {
      offer.messages.push({
        id: `MSG-${Date.now()}`,
        senderRole,
        senderName: senderRole === "SELLER" ? offer.cropListing.farmerProfile.displayName : offer.buyerProfile.businessName,
        timestamp: new Date().toLocaleString(),
        message: messageText,
        counterPricePerQuintal,
      });
    }

    return offer;
  },
};
