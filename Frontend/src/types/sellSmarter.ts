import type { QualityGrade, ProductionMethod } from "./mandi";

export type SellingDecisionState =
  | "CONSIDER_SELLING"
  | "CONSIDER_WAITING"
  | "COMPARE_BUYERS"
  | "CONSIDER_SELLING_SOON";

export interface MandiDeductions {
  marketChargesPerQ: number; // e.g. ₹30/q
  handlingPerQ: number; // e.g. ₹20/q
  loadingUnloadingPerQ: number; // e.g. ₹15/q
  otherChargesPerQ: number; // e.g. ₹15/q
  totalDeductionsPerQ: number; // e.g. ₹80/q
}

export interface MandiRealization {
  marketName: string;
  grossPricePerQ: number; // e.g. ₹2,550
  quantityQuintals: number;
  grossValue: number;
  deductions: MandiDeductions;
  estimatedNetRealizationPerQ: number; // e.g. ₹2,470
  estimatedNetValue: number; // e.g. ₹6,17,500
}

export interface DirectBuyerOfferItem {
  id: string;
  buyerId: string;
  businessName: string;
  verificationBadge: string; // e.g. "✓ Business Verified"
  isVerified: boolean;
  offerPricePerQ: number; // e.g. ₹2,720
  quantityQuintals: number;
  grossValue: number;
  transportCostPerQ: number; // e.g. ₹60
  transportPaidBy: "Buyer" | "Farmer" | "Shared";
  estimatedNetRealizationPerQ: number; // e.g. ₹2,660
  estimatedNetValue: number; // e.g. ₹6,65,000
  paymentTerms: string; // e.g. "Within 48 hours"
  paymentReliabilityPercentage: number; // e.g. 96%
  buyerRating: number; // e.g. 4.7
  avgPaymentDays: number; // e.g. 2.3 days
  distanceKm: number;
  moistureRequirementMax: number;
  qualityRequirement: QualityGrade;
  offerValidityHours: number;
  priceFairnessCategory: "BELOW_REFERENCE" | "WITHIN_REFERENCE" | "ABOVE_REFERENCE";
  whyThisPriceFactors: string[];
}

export interface CropStorageProfile {
  available: boolean;
  availableDays: number;
  storageCostPerQPerDay: number;
  capacityQuintals: number;
  currentUsedQuintals: number;
  shelfLifeCategory: "Long" | "Medium" | "Short";
  storageSensitivity: "Low" | "Moderate" | "High";
  recommendedStorageConditions: string;
  urgencyText: string;
}

export interface MarketTrendInfo {
  cropName: string;
  trend7d: "Increasing" | "Stable" | "Decreasing";
  percentage7d: number;
  trend30d: "Moderate Increase" | "Stable" | "Slight Decline";
  percentage30d: number;
  currentRegionalPricePerQ: number;
  previous30DayAvgPerQ: number;
  chartHistory: { date: string; mandiPrice: number; directBuyerPrice: number }[];
}

export interface MarketForecastInfo {
  expectedDirection: "↗ Slightly Positive" | "→ Stable" | "↘ Softening";
  confidencePercentage: number;
  forecastRangeMinPerQ: number;
  forecastRangeMaxPerQ: number;
  timeframeDaysText: string;
  isModelEstimate: boolean;
  disclaimer: string;
}

export interface AISellingAdvisorRecommendation {
  decisionState: SellingDecisionState;
  shortRecommendation: string;
  detailedRationale: string[];
  confidencePercentage: number;
  factorsConsidered: string[];
  risksAndContingencies: string[];
  disclaimer: string;
}

export interface ScenarioSimulationParams {
  waitingDays: number; // 0 - 30
  expectedPriceChangePercentage: number; // -5% to +10%
  storageCostPerQDay: number; // 0 to 20
  transportCostPerQ: number; // 0 to 200
}

export interface ScenarioSimulationResult {
  sellTodayNetPerQ: number;
  sellTodayNetTotal: number;
  futureGrossPricePerQ: number;
  totalStorageCost: number;
  futureNetPerQ: number;
  futureNetTotal: number;
  netDifferenceTotal: number;
  riskLevel: "Low" | "Medium" | "High";
}

export interface HistoricalTransactionAvg {
  transactionCount: number;
  mandiAveragePerQ: number;
  directBuyerAveragePerQ: number;
  netRealizationDifferencePerQ: number;
}

export interface SellSmarterCropOption {
  id: string;
  cropName: string;
  variety: string;
  quantityQuintals: number;
  location: string;
  qualityGrade: QualityGrade;
  moisturePercentage: number;
  productionMethod: ProductionMethod;
  productionCostPerQ: number;
  fairPriceRangeMinPerQ: number;
  fairPriceRangeMaxPerQ: number;
  mandi: MandiRealization;
  directBuyers: DirectBuyerOfferItem[];
  storage: CropStorageProfile;
  marketTrend: MarketTrendInfo;
  forecast: MarketForecastInfo;
  advisor: AISellingAdvisorRecommendation;
  historicalAvg: HistoricalTransactionAvg;
}
