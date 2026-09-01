import type { SupplyPool, FarmerContribution } from "../types/mandi";
import { logisticsService } from "./logisticsService";

const DEFAULT_FARMERS: FarmerContribution[] = [
  {
    farmerId: "FARMER-UP-1042",
    displayName: "Verified Farmer #1042 (Ramesh K. Patel)",
    district: "Barabanki",
    quantityQuintals: 120,
    cropName: "Wheat",
    variety: "HD-2967",
    grade: "Grade A",
    moisturePercentage: 11.8,
    fairPriceRangeMin: 2800,
    fairPriceRangeMax: 2900,
    acceptedPricePerQuintal: 2850,
    verificationStatus: "VERIFIED",
    confirmationStatus: "CONFIRMED",
    paymentAllocationAmount: 342000, // 120 * 2850
    deliveryLotStatus: "DELIVERED",
    lotId: "LOT-A-120Q",
  },
  {
    farmerId: "FARMER-UP-1088",
    displayName: "Verified Farmer #1088 (Suresh Verma)",
    district: "Barabanki",
    quantityQuintals: 80,
    cropName: "Wheat",
    variety: "HD-2967",
    grade: "Grade A",
    moisturePercentage: 11.4,
    fairPriceRangeMin: 2720,
    fairPriceRangeMax: 2820,
    acceptedPricePerQuintal: 2850,
    verificationStatus: "VERIFIED",
    confirmationStatus: "CONFIRMED",
    paymentAllocationAmount: 228000, // 80 * 2850
    deliveryLotStatus: "DELIVERED",
    lotId: "LOT-B-80Q",
  },
  {
    farmerId: "FARMER-UP-1104",
    displayName: "Verified Farmer #1104 (Mahendra Singh)",
    district: "Sitapur",
    quantityQuintals: 150,
    cropName: "Wheat",
    variety: "PBW-550",
    grade: "Grade A",
    moisturePercentage: 12.0,
    fairPriceRangeMin: 2850,
    fairPriceRangeMax: 2940,
    acceptedPricePerQuintal: 2850,
    verificationStatus: "VERIFIED",
    confirmationStatus: "PENDING",
    paymentAllocationAmount: 427500, // 150 * 2850
    deliveryLotStatus: "IN_TRANSIT",
    lotId: "LOT-C-150Q",
  },
  {
    farmerId: "FARMER-UP-1192",
    displayName: "Verified Farmer #1192 (Rajesh Yadav)",
    district: "Unnao",
    quantityQuintals: 100,
    cropName: "Wheat",
    variety: "HD-2967",
    grade: "Grade A",
    moisturePercentage: 11.6,
    fairPriceRangeMin: 2750,
    fairPriceRangeMax: 2850,
    acceptedPricePerQuintal: 2850,
    verificationStatus: "VERIFIED",
    confirmationStatus: "CONFIRMED",
    paymentAllocationAmount: 285000, // 100 * 2850
    deliveryLotStatus: "DELIVERED",
    lotId: "LOT-D-100Q",
  },
  {
    farmerId: "FARMER-UP-1205",
    displayName: "Verified Farmer #1205 (Vikram Rastogi)",
    district: "Hardoi",
    quantityQuintals: 160,
    cropName: "Wheat",
    variety: "HD-2967",
    grade: "Grade A",
    moisturePercentage: 11.9,
    fairPriceRangeMin: 2780,
    fairPriceRangeMax: 2880,
    acceptedPricePerQuintal: 2850,
    verificationStatus: "VERIFIED",
    confirmationStatus: "CONFIRMED",
    paymentAllocationAmount: 456000, // 160 * 2850
    deliveryLotStatus: "PENDING",
    lotId: "LOT-E-160Q",
  },
  {
    farmerId: "FARMER-UP-1240",
    displayName: "Verified Farmer #1240 (Dinesh Kumar)",
    district: "Rae Bareli",
    quantityQuintals: 190,
    cropName: "Wheat",
    variety: "PBW-550",
    grade: "Grade A",
    moisturePercentage: 11.5,
    fairPriceRangeMin: 2800,
    fairPriceRangeMax: 2900,
    acceptedPricePerQuintal: 2850,
    verificationStatus: "VERIFIED",
    confirmationStatus: "CONFIRMED",
    paymentAllocationAmount: 541500, // 190 * 2850
    deliveryLotStatus: "PENDING",
    lotId: "LOT-F-190Q",
  },
];

let mockSupplyPool: SupplyPool = {
  id: "POOL-WHEAT-800Q-2026",
  buyerId: "BUYER-001",
  buyerBusinessName: "ABC Foods & Flour Mills Pvt Ltd",
  buyerLocation: "Kanpur / Lucknow Hub, UP",
  cropName: "Wheat",
  variety: "HD-2967 / PBW-550 Grade A",
  requiredQuantityQuintals: 800,
  matchedQuantityQuintals: 800,
  qualityGradeRequired: "Grade A",
  maxMoisturePercentage: 12.0,
  expectedPriceMin: 2700,
  expectedPriceMax: 2850,
  buyerOfferPricePerQuintal: 2850,
  requiredByDate: "15 October 2026",
  matchScorePercentage: 94,
  matchBreakdown: {
    crop: true,
    grade: true,
    moisture: true,
    quantity: true,
    harvestDate: true,
    location: true,
    verification: true,
    organic: true,
  },
  farmers: DEFAULT_FARMERS,
  logistics: logisticsService.calculateEstimate(800, "Lucknow Region", "Kanpur Warehouse", 185, "Buyer Pays"),
  status: "FULFILLED",
  combinedQualitySummary: {
    gradeABreakdown: "6 / 6 Farmers (Grade A Compliant)",
    moistureRange: "11.4% – 12.0%",
    averageMoisture: 11.7,
    verificationText: "✓ 100% Quality & Moisture Lab Verified",
  },
};

export const aggregationService = {
  getSupplyPool(): SupplyPool {
    return mockSupplyPool;
  },

  joinSupplyPool(farmerId: string, quantityQuintals: number): SupplyPool {
    const existing = mockSupplyPool.farmers.find((f) => f.farmerId === farmerId);
    if (!existing) {
      const newFarmer: FarmerContribution = {
        farmerId,
        displayName: "Verified Farmer (Current User)",
        district: "Barabanki",
        quantityQuintals,
        cropName: "Wheat",
        variety: "HD-2967",
        grade: "Grade A",
        moisturePercentage: 11.8,
        fairPriceRangeMin: 2800,
        fairPriceRangeMax: 2900,
        acceptedPricePerQuintal: mockSupplyPool.buyerOfferPricePerQuintal,
        verificationStatus: "VERIFIED",
        confirmationStatus: "CONFIRMED",
        paymentAllocationAmount: quantityQuintals * mockSupplyPool.buyerOfferPricePerQuintal,
        deliveryLotStatus: "PENDING",
        lotId: `LOT-USER-${quantityQuintals}Q`,
      };
      mockSupplyPool.farmers.push(newFarmer);
      mockSupplyPool.matchedQuantityQuintals = mockSupplyPool.farmers.reduce((sum, f) => sum + f.quantityQuintals, 0);
    }
    return mockSupplyPool;
  },

  updateFarmerPriceConfirmation(farmerId: string, status: "CONFIRMED" | "REJECTED", counterPrice?: number): SupplyPool {
    const farmer = mockSupplyPool.farmers.find((f) => f.farmerId === farmerId);
    if (farmer) {
      farmer.confirmationStatus = status;
      if (counterPrice) {
        farmer.acceptedPricePerQuintal = counterPrice;
        farmer.paymentAllocationAmount = farmer.quantityQuintals * counterPrice;
      }
    }
    return mockSupplyPool;
  },

  sendPoolProposal(buyerOfferPricePerQuintal: number): SupplyPool {
    mockSupplyPool.buyerOfferPricePerQuintal = buyerOfferPricePerQuintal;
    mockSupplyPool.farmers.forEach((f) => {
      f.acceptedPricePerQuintal = buyerOfferPricePerQuintal;
      f.paymentAllocationAmount = f.quantityQuintals * buyerOfferPricePerQuintal;
    });
    return mockSupplyPool;
  },
};
