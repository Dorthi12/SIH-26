export type RoleMode = 'farmer' | 'buyer';

export type FarmerTab =
  | 'home'
  | 'marketplace'
  | 'profile'
  | 'create_listing'
  | 'listings'
  | 'offers'
  | 'buyers'
  | 'price'
  | 'advisor'
  | 'aggregation'
  | 'logistics'
  | 'payment'
  | 'deals'
  | 'protection'
  | 'documents';

export type BuyerTab =
  | 'marketplace'
  | 'buyer_dashboard'
  | 'requirements'
  | 'offers'
  | 'farmer_listings'
  | 'aggregation'
  | 'logistics'
  | 'payment'
  | 'deals'
  | 'business_profile';

export interface LandParcel {
  id: string;
  name: string;
  areaAcres: number;
  type: 'Irrigated' | 'Rainfed';
  soilType: string;
  currentCrop: string;
  previousCrop: string;
  plannedNextCrop: string;
  productionMethod: 'Conventional' | 'Organic (Certified)' | 'Natural Farming' | 'In-Transition Organic';
}

export interface CropRotationEntry {
  plotId: string;
  year: number;
  crop: string;
  status: 'Healthy' | 'Warning' | 'Consecutive Detected';
  warningMessage?: string;
}

export interface PrivateCompanyContract {
  id: string;
  companyId: string;
  companyName: string;
  crop: string;
  requiredQuantityQuintals: number;
  requestedLandAcres: number;
  allocationPercentage: number;
  contractDurationMonths: number;
  offeredPricePerQuintal: number;
  affectedPlotIds: string[];
  productionConditions: string;
  status: 'Pending Farmer Consent' | 'Active' | 'Completed' | 'Rejected' | 'Blocked by Safeguard';
  farmerConsentGiven: boolean;
}

export interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  farmerRating: number;
  farmerCompletedTransactions: number;
  crop: string;
  variety: string;
  quantityQuintals: number;
  location: string;
  harvestDate: string;
  productionMethod: string;
  productionCostPerQuintal: number;
  grade: 'Grade A' | 'Grade B' | 'Standard';
  moisturePercentage: number;
  organicStatus: 'Verified Organic' | 'Claimed Organic (Pending Evidence)' | 'Conventional';
  organicCertificateNo?: string;
  evidenceStatus: {
    organic: 'Verified' | 'Evidence Provided' | 'Pending' | 'Not Applicable';
    qualityReport: 'Verified' | 'Evidence Provided' | 'Pending';
    productionCost: 'Evidence Provided' | 'Estimated';
    harvestDate: 'Verified' | 'Pending';
  };
  fairPriceRange: {
    min: number;
    max: number;
    breakdown: {
      regionalRef: number;
      productionCost: number;
      qualityPremium: number;
      gradePremium: number;
      organicPremium: number;
      demandPremium: number;
      transportDeduction: number;
      storageDeduction: number;
    };
  };
  askingPricePerQuintal: number;
  verifiedCrop: boolean;
  verifiedFarmer: boolean;
  productionCostsBreakdown?: {
    seeds: number;
    fertilizer: number;
    pesticides: number;
    irrigation: number;
    electricity: number;
    machinery: number;
    labour: number;
    landPrep: number;
    harvesting: number;
    transportation: number;
    storage: number;
    totalProductionCost: number;
  };
  locationDetails?: {
    state: string;
    district: string;
    mandi: string;
    region: string;
    localLabourRate: number;
    inputCostIndex: string;
    transportDistanceKm: number;
  };
  cropCharacteristics?: {
    moisturePct: number;
    quality: string;
    farmingType: string;
    expectedShelfLifeMonths: number;
  };
  marketEstimation?: {
    currentMandiPrice: number;
    historicalAvgPrice: number;
    marketDemand: string;
    marketSupply: string;
    predictedFairPrice: number;
    suggestedWindow: string;
  };
}

export interface BuyerProfile {
  id: string;
  name: string;
  type: 'Food Processor' | 'Wholesaler' | 'Exporter' | 'Retail Chain' | 'Institutional Buyer' | 'Private Agro Co';
  location: string;
  verified: boolean;
  completedTransactions: number;
  paymentReliabilityPct: number;
  avgPaymentDays: number;
  rating: number;
  transparencyScore: number;
  activeDisputes: number;
  resolvedDisputes: number;
  reputationBreakdown: {
    paymentReliability: number;
    priceFairness: number;
    behaviour: number;
    contractAdherence: number;
    pickupReliability: number;
    disputeResolution: number;
  };
  activeRequirementsCount: number;
  purchaseCategories: string[];
}

export interface BuyerRequirement {
  id: string;
  buyerId: string;
  buyerName: string;
  crop: string;
  quantityQuintals: number;
  expectedQuality: string;
  maxMoisturePct: number;
  organicRequired: boolean;
  expectedPricePerQuintal: number;
  requiredDate: string;
  pickupType: 'Buyer Pickup' | 'Seller Delivery' | 'Negotiable';
  paymentTermsDays: number;
  isCashCropContract?: boolean;
  suggestedLandAcres?: number;
}

export interface Offer {
  id: string;
  listingId?: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  quantityQuintals: number;
  offeredPricePerQuintal: number;
  qualityCondition: string;
  moistureCondition: string;
  pickupType: 'Buyer Pickup' | 'Seller Delivery';
  deliveryDate: string;
  paymentTermsDays: number;
  transportResponsibility: 'Buyer Pays' | 'Seller Pays' | 'Shared' | 'Included';
  status: 'Pending' | 'Countered' | 'Accepted' | 'Declined';
  negotiationTimeline: Array<{
    version: number;
    by: 'buyer' | 'farmer';
    price: number;
    quantity: number;
    notes?: string;
    timestamp: string;
  }>;
}

export interface SmartDeal {
  id: string;
  offerId: string;
  dealVersion: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  variety: string;
  quantityQuintals: number;
  pricePerQuintal: number;
  totalValue: number;
  qualityGrade: string;
  moisturePercentage: number;
  pickupLocation: string;
  deliveryDate: string;
  paymentTerms: string;
  transportResponsibility: string;
  buyerConfirmed: boolean;
  farmerConfirmed: boolean;
  termsLocked: boolean;
  paymentProtectionState: PaymentProtectionState;
  landAllocationPct?: number;
  affectedPlots?: string[];
  contractDurationMonths?: number;
}

export type PaymentProtectionState =
  | 'Pending'
  | 'Protection Requested'
  | 'Payment Protected'
  | 'Awaiting Delivery'
  | 'Delivery Submitted'
  | 'Delivery Confirmed'
  | 'Release Pending'
  | 'Payment Released'
  | 'Disputed'
  | 'Cancelled';

export interface LogisticsQuote {
  origin: string;
  destination: string;
  distanceKm: number;
  quantityQuintals: number;
  vehicleType: string;
  estimatedTransportCost: number;
  estimatedDeliveryDays: number;
  costPerQuintal: number;
  options: Array<{
    type: 'Standard Truck' | 'Large Truck' | 'Aggregated Multi-Farmer Truck';
    cost: number;
    days: number;
    savingVsIndividual?: number;
  }>;
}

export interface AggregationLot {
  lotId: string;
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  quantityQuintals: number;
  qualityGrade: string;
  moisturePct: number;
  fairPriceRange: { min: number; max: number };
  askingPrice: number;
  deliveryStatus: 'In Transit' | 'Delivered' | 'Accepted' | 'Disputed';
  paymentState: PaymentProtectionState;
}

export interface SupplyPool {
  id: string;
  crop: string;
  buyerRequirementId: string;
  buyerName: string;
  targetQuantityQuintals: number;
  matchedQuantityQuintals: number;
  matchScorePct: number;
  lots: AggregationLot[];
  status: 'Forming' | 'Matched' | 'Contracted' | 'Fulfilled';
  aggregatedTransportCost: number;
  individualTransportCost: number;
  estimatedSavings: number;
}

export interface SellingAdvisory {
  crop: string;
  currentBestOfferPerQuintal: number;
  farmerProductionCostPerQuintal: number;
  estimatedMarginPerQuintal: number;
  marketTrend: 'Increasing' | 'Stable' | 'Decreasing';
  storageAvailableDays: number;
  recommendation: 'SELL NOW' | 'CONSIDER WAITING 5–10 DAYS' | 'HOLD FOR HIGHER DEMAND';
  confidencePct: number;
  reasons: string[];
  sellNowScenario: {
    expectedNetTotal: number;
    pricePerQuintal: number;
  };
  waitScenario: {
    expectedNetMin: number;
    expectedNetMax: number;
    estimatedStorageCost: number;
    riskLevel: 'Low' | 'Medium' | 'High';
  };
}

export interface VerificationDocument {
  id: string;
  category: 'Identity' | 'Land' | 'Crop' | 'Quality' | 'Organic' | 'Transaction';
  name: string;
  status: 'Uploaded' | 'Under Review' | 'Verified' | 'Rejected';
  isPrivate: boolean;
  uploadDate: string;
}
