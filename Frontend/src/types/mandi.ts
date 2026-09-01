export type UserRole = "SELLER" | "BUYER";

export type ProductionMethod = "Conventional" | "Organic" | "Natural" | "Other";

export type QualityGrade = "Grade A" | "Grade B" | "Grade C" | "Premium Export";

export type VerificationState = "NOT_VERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

export interface FarmerAuthDetails {
  farmerId: string; // Kisan Pehchan Patra (e.g. KPP-UP-2026-8912)
  fullName: string;
  mobileNumber: string; // Confidential
  aadhaarMock: string; // Confidential (e.g. XXXX-XXXX-8912)
  khasraKhatauniNumber: string; // Confidential land record number
  state: string;
  district: string;
  villageBlock: string; // Confidential
  isVerified: boolean;
  verificationDate: string;
  verificationId: string;
  verifiedByOfficer: string;
}

export interface BuyerAuthDetails {
  buyerId: string;
  merchantId?: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstinMock: string;
  buyerType: "Food Processor" | "Exporter" | "Wholesaler" | "Retail Chain" | "Agri Cooperative" | "Individual Buyer";
  state: string;
  district: string;
  isVerified: boolean;
}

export interface CostEvidence {
  id: string;
  title: string;
  category: string;
  fileName: string;
  uploadDate: string;
  verified: boolean;
  fileUrl?: string;
}

export interface ProductionCosts {
  seedsCost: number;
  seedQuantityKg: number;
  fertilizerCost: number;
  fertilizerType: string;
  pesticidesCost: number;
  irrigationCost: number;
  electricityDieselCost: number;
  machineryCost: number;
  labourCost: number;
  labourersCount: number;
  labourDays: number;
  landPreparationCost: number;
  harvestingCost: number;
  transportationCost: number;
  storageCost: number;
  otherExpensesCost: number;
  otherExpensesNotes?: string;
  totalCost: number;
  costPerQuintal: number;
  evidenceList: CostEvidence[];
}

export interface QualityMetrics {
  grade: QualityGrade;
  moisturePercentage: number;
  physicalQuality: string; // e.g. "Bold grain, uniform size, lustrous color"
  grainSizeMm?: number;
  colorGrade?: string;
  damagePercentage: number;
  purityPercentage: number;
  foreignMatterPercentage: number;
  hasLabTest: boolean;
  labName?: string;
  testCertificateNumber?: string;
  testDate?: string;
  labReportFile?: CostEvidence;
}

export interface OrganicVerification {
  isOrganic: boolean;
  certificationType?: "NPOP" | "PGS-India" | "EU Organic" | "USDA Organic" | "Third-Party Certified";
  certificateNumber?: string;
  certificationAuthority?: string;
  certificationDate?: string;
  validUntil?: string;
  verificationState: VerificationState;
  certificateDocument?: CostEvidence;
}

export interface PriceFactor {
  id: string;
  name: string;
  category: "BASE" | "QUALITY" | "LOGISTICS" | "ORGANIC" | "DEMAND";
  amountPerQuintal: number; // positive for premium, negative for deduction
  description: string;
  evidenceTitle?: string;
  evidenceVerified?: boolean;
}

export interface PriceAnalysis {
  regionalReferencePrice: number;
  indicativeMinPrice: number;
  indicativeMaxPrice: number;
  suggestedPrice: number;
  transparencyScore: number; // 0 - 100
  confidencePercentage: number;
  factors: PriceFactor[];
  calculationMethodNotes: string;
}

export interface GovernmentVerification {
  isVerified: boolean;
  verificationStatus: VerificationState;
  verifiedByOfficer?: string;
  verificationDate?: string;
  verificationId?: string;
  comments?: string;
}

export interface FarmerPublicProfile {
  id: string;
  displayName: string; // e.g. "Verified Farmer #1042" or "Ramesh K."
  district: string;
  state: string;
  isGovtVerified: boolean;
  verificationId: string;
  activeListingsCount: number;
  completedSalesCount: number;
  averageRating: number;
  memberSinceYear: number;
  cropsGrown: string[];
}

export interface CropListing {
  id: string;
  farmerId: string;
  farmerProfile: FarmerPublicProfile;
  cropName: string;
  variety: string;
  quantityQuintals: number;
  harvestDate: string;
  expectedShelfLifeMonths: number;
  productionMethod: ProductionMethod;
  
  location: {
    state: string;
    district: string;
    nearestMandi: string;
    regionVillageName: string; // Hidden in public card, only District/State public
  };
  
  productionCosts: ProductionCosts;
  quality: QualityMetrics;
  organic: OrganicVerification;
  priceAnalysis: PriceAnalysis;
  
  askingPricePerQuintal: number;
  totalAskingPrice: number;
  
  verification: GovernmentVerification;
  
  listingDate: string;
  status: "ACTIVE" | "UNDER_NEGOTIATION" | "SOLD" | "CANCELLED";
  viewsCount: number;
  offersCount: number;
  images: string[];
}

export interface BuyerVerificationDoc {
  id: string;
  docType: "Business Registration" | "GST Certificate" | "Identity Proof" | "Trade License" | "Authorized Rep ID" | "Tax Registration" | "Business Address Proof";
  fileName: string;
  uploadDate: string;
  status: VerificationState | "UNDER_REVIEW" | "EXPIRED";
  verifiedDate?: string;
  notes?: string;
}

export interface BuyingRequirementItem {
  id: string;
  cropName: string;
  variety?: string;
  minQuantityQuintals: number;
  maxQuantityQuintals: number;
  expectedPriceMin: number;
  expectedPriceMax: number;
  qualityGrade: QualityGrade;
  maxMoisturePercentage: number;
  deliveryType: "Buyer Pickup" | "Farmer Delivery" | "Mandi Hub Dropoff";
  requiredByDate: string;
  status: "ACTIVE" | "FULFILLED" | "EXPIRED";
  notes?: string;
}

export interface ReputationRatingBreakdown {
  overallRating: number;
  paymentReliability: number;
  priceFairness: number;
  behaviour: number;
  contractAdherence: number;
  pickupReliability: number;
  disputeResolution: number;
  totalReviewsCount: number;
}

export interface DisputeRecordItem {
  id: string; // e.g. AGR-D-1021
  category: "Quality disagreement" | "Payment delay" | "Quantity mismatch" | "Logistics delay" | "Packaging defect";
  status: "Resolved" | "Under Investigation" | "Escalated to Mandi Board";
  resolution: string; // e.g. "Mutually agreed adjustment"
  completedDate: string;
  detailsPrivacySafe: string;
}

export interface BuyerReview {
  id: string;
  farmerIdAnonymized: string; // e.g. "Verified Farmer - Barabanki"
  rating: number; // e.g. 5.0
  categoryRatings: {
    paymentReliability: number;
    priceFairness: number;
    behaviour: number;
    contractAdherence: number;
    pickupReliability: number;
    disputeResolution: number;
  };
  comment: string;
  crop: string; // e.g. "Wheat"
  quantityQuintals: number; // e.g. 250
  transactionDate: string; // e.g. "18 August 2026"
  verifiedTransaction: boolean;
  reviewCategory?: "Payment" | "Price" | "Pickup" | "Behaviour" | "Quality" | "Dispute";
}

export interface PurchasingCropCategory {
  cropName: string;
  icon: string; // e.g. "🌾"
  typicalVolume: string; // e.g. "500 – 2,000 q"
  preferredGrade: QualityGrade;
  preferredMoisturePercentage: number;
  currentDemandStatus: "High" | "Moderate" | "Low";
  typicalPriceRange: string; // e.g. "₹2,700 – ₹2,850 / q"
}

export interface BuyerMarketplaceActivity {
  activeRequirementsCount: number;
  offersReceivedCount: number;
  offersAcceptedCount: number;
  completedDealsCount: number;
  lastActiveText: string;
}

export interface CropPurchaseShare {
  cropName: string;
  percentageShare: number;
}

export interface YearlyVolumeGrowth {
  year: number;
  volumeQuintals: number;
}

export interface BuyerProfile {
  id: string;
  businessName: string;
  buyerType: "Food Processor" | "Exporter" | "Wholesaler" | "Retail Chain" | "Agri Cooperative" | "Institutional Buyer" | "Restaurant / Food Service" | "Aggregator" | "Other";
  industry: string;
  state: string;
  district: string;
  operatingRegions: string[];
  yearsActiveOnPlatform: number;
  operatingSinceYear?: number;
  aboutDescription?: string;
  isVerified: boolean; // Demo Verification badge
  verificationId: string;
  verificationProgress: number; // e.g. 85
  documents: BuyerVerificationDoc[];
  typicalOrderVolume: string; // e.g. "500 – 2,000 Quintals"
  completedTransactionsCount: number;
  totalQuantityPurchasedQuintals: number;
  averageOrderQuintals: number;
  farmerRating: number;
  paymentReliabilityPercentage: number; // e.g. 96%
  onTimePaymentPercentage: number; // e.g. 96%
  delayedPaymentPercentage: number; // e.g. 4%
  averagePaymentDays: number; // e.g. 2.3 days
  activeRequirements: string[];
  detailedRequirements: BuyingRequirementItem[];
  reputationBreakdown: ReputationRatingBreakdown;
  disputeRecord: {
    totalDisputes: number;
    resolvedDisputes: number;
    unresolvedDisputes: number;
    disputesList: DisputeRecordItem[];
  };
  purchasingCropCategories?: PurchasingCropCategory[];
  reviews?: BuyerReview[];
  activity?: BuyerMarketplaceActivity;
  purchaseShares?: CropPurchaseShare[];
  yearlyVolumeGrowth?: YearlyVolumeGrowth[];
  transparencyScore?: number;
  transparencyChecklist?: Record<string, boolean>;
  behaviourSummary?: {
    positiveTraits: string[];
    areaToWatch: string;
  };
}

export interface ChatMessageAttachment {
  id: string;
  title: string;
  type: "CROP_REPORT" | "QUALITY_CERTIFICATE" | "ORGANIC_CERT" | "PHOTO" | "DOCUMENT";
  fileUrl?: string;
  fileName: string;
  verified?: boolean;
}

export interface OfferMessage {
  id: string;
  senderRole: UserRole;
  senderName: string;
  timestamp: string;
  message: string;
  counterPricePerQuintal?: number;
  isVoice?: boolean;
  audioDurationSeconds?: number;
  aiTranslatedMessage?: string;
  attachment?: ChatMessageAttachment;
}

export interface NegotiationTimelineItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  actionType: "OFFER_CREATED" | "COUNTER_OFFER" | "OFFER_ACCEPTED" | "TERMS_FINALIZED" | "DEAL_CONFIRMED";
  pricePerQuintal: number;
  quantityQuintals: number;
  note: string;
}

export interface BuyerOffer {
  id: string;
  listingId: string;
  cropListing: CropListing;
  buyerId: string;
  buyerProfile: BuyerProfile;
  sellerId: string;
  
  quantityQuintals: number;
  proposedPricePerQuintal: number;
  totalAmount: number;
  
  qualityGrade: QualityGrade;
  maxMoisturePercentage: number;
  pickupPreference: "Buyer Arranged Transport" | "Farmer Delivery" | "Mandi Pickup Point";
  expectedDeliveryDate: string;
  paymentTerms: "Advance Payment" | "Payment on Delivery" | "Escrow / 3-Day Bank Release" | "50% Advance + 50% Delivery" | "Within 48 hours";
  additionalNotes?: string;
  
  status: "AWAITING_RESPONSE" | "ACCEPTED" | "COUNTER_OFFERED" | "REJECTED";
  counterPricePerQuintal?: number;
  messages: OfferMessage[];
  negotiationTimeline: NegotiationTimelineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SmartDealRecord {
  dealId: string; // e.g. AGR-DEAL-2026-004821
  offerId: string;
  listingId: string;
  status: "AWAITING_CONFIRMATION" | "CONFIRMED_LOCKED" | "FULFILLED" | "CANCELLED";
  version: string; // e.g. "Version 1.0"
  createdAt: string;
  lockedAt?: string;
  
  buyerInfo: {
    buyerId: string;
    businessName: string;
    buyerType: string;
    location: string;
    isVerified: boolean;
    verificationId: string;
  };
  
  sellerInfo: {
    farmerId: string;
    displayName: string;
    district: string;
    state: string;
    isVerified: boolean;
    verificationId: string;
  };
  
  produceInfo: {
    cropName: string;
    variety: string;
    quantityQuintals: number;
    qualityGrade: QualityGrade;
    moisturePercentage: number;
    productionMethod: ProductionMethod;
  };
  
  commercialTerms: {
    finalPricePerQuintal: number;
    totalAmount: number;
    paymentTerms: string;
    paymentTimeframe: string;
  };
  
  logisticsInfo: {
    pickupType: string;
    pickupDate: string;
    transportArrangedBy: string;
  };
  
  sellerConfirmed: boolean;
  sellerConfirmedAt?: string;
  buyerConfirmed: boolean;
  buyerConfirmedAt?: string;
  
  timeline: NegotiationTimelineItem[];
}

export interface MarketplaceFilter {
  searchQuery: string;
  cropName: string;
  state: string;
  district: string;
  minQuantity: number | null;
  maxQuantity: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  organicOnly: boolean;
  qualityGrade: string;
  govtVerifiedOnly: boolean;
  sortBy: "LOWEST_PRICE" | "HIGHEST_QUALITY" | "NEWEST" | "BEST_VALUE" | "HIGHEST_TRANSPARENCY";
}

// ==========================================
// 🔒 PAYMENT PROTECTION, 🚚 LOGISTICS & 📦 AGGREGATION TYPES
// ==========================================

export type PaymentStatus =
  | "Pending"
  | "Protection Requested"
  | "Payment Protected"
  | "Awaiting Delivery"
  | "Delivery Submitted"
  | "Delivery Confirmed"
  | "Release Pending"
  | "Payment Released"
  | "Completed"
  | "Disputed"
  | "Cancelled";

export interface PaymentMilestone {
  stage: string;
  title: string;
  timestamp?: string;
  status: "COMPLETED" | "CURRENT" | "PENDING";
  description: string;
}

export interface PaymentRecord {
  id: string;
  dealId: string;
  totalAmount: number;
  protectedAmount: number;
  releasedAmount: number;
  status: PaymentStatus;
  buyerName: string;
  buyerVerified: boolean;
  sellerName: string;
  sellerVerified: boolean;
  cropName: string;
  quantityQuintals: number;
  unitPrice: number;
  nextStep: string;
  updatedAt: string;
  milestones: PaymentMilestone[];
  isAggregatedDeal?: boolean;
  disclaimer: string;
}

export interface DeliverySubmission {
  id: string;
  dealId: string;
  farmerId: string;
  deliveryDate: string;
  quantityQuintals: number;
  receivedQuantityQuintals?: number;
  vehicleNumber: string;
  pickupLocation: string;
  deliveryLocation: string;
  deliveryReceiptUrl?: string;
  weighbridgeReceiptUrl?: string;
  photos: string[];
  qualityGrade?: QualityGrade;
  moisturePercentage?: number;
  status: "SUBMITTED" | "CONFIRMED" | "DISPUTED";
  disputeDetails?: {
    issueType: string;
    expectedQuantity: number;
    receivedQuantity: number;
    details: string;
    statusText: string;
    reportedAt: string;
  };
}

export type PayerOption = "Buyer Pays" | "Seller Pays" | "Shared 50/50" | "Included in Price" | "Negotiable";

export interface TransportOption {
  id: string;
  title: string;
  vehicleType: string;
  capacityTonnes: number;
  estimatedCost: number;
  estimatedDays: string;
  badgeText?: string;
  costPerQuintal: number;
}

export interface PickupRouteStop {
  village: string;
  farmerName: string;
  quantity: number;
  distanceKm: number;
}

export interface LogisticsEstimate {
  dealId: string;
  farmerLocation: string;
  buyerLocation: string;
  distanceKm: number;
  quantityQuintals: number;
  estimatedVehicle: string;
  totalEstimatedCost: number;
  costPerQuintal: number;
  breakdown: {
    baseTransport: number;
    distanceAdjustment: number;
    loading: number;
    unloading: number;
  };
  transportOptions: TransportOption[];
  payer: PayerOption;
  deliveryEstimateDays: string;
  pickupRouteStops?: PickupRouteStop[];
  aggregatedSavings?: {
    individualCost: number;
    aggregatedCost: number;
    savingsAmount: number;
  };
}

export interface NetRealizationData {
  askingPricePerQuintal: number;
  quantityQuintals: number;
  grossValue: number;
  transportationCost: number;
  storageCost: number;
  otherCharges: number;
  expectedNetTotal: number;
  expectedNetPerQuintal: number;
  transportPaidBy: PayerOption;
}

export interface FarmerContribution {
  farmerId: string;
  displayName: string;
  district: string;
  quantityQuintals: number;
  cropName: string;
  variety: string;
  grade: QualityGrade;
  moisturePercentage: number;
  fairPriceRangeMin: number;
  fairPriceRangeMax: number;
  acceptedPricePerQuintal?: number;
  verificationStatus: "VERIFIED" | "PENDING";
  confirmationStatus: "CONFIRMED" | "PENDING" | "REJECTED";
  paymentAllocationAmount: number;
  deliveryLotStatus: "DELIVERED" | "IN_TRANSIT" | "PENDING" | "DISPUTED";
  lotId: string;
}

export interface SupplyPoolMatchBreakdown {
  crop: boolean;
  grade: boolean;
  moisture: boolean;
  quantity: boolean;
  harvestDate: boolean;
  location: boolean;
  verification: boolean;
  organic: boolean;
}

export interface SupplyPool {
  id: string;
  buyerId: string;
  buyerBusinessName: string;
  buyerLocation: string;
  cropName: string;
  variety: string;
  requiredQuantityQuintals: number;
  matchedQuantityQuintals: number;
  qualityGradeRequired: QualityGrade;
  maxMoisturePercentage: number;
  expectedPriceMin: number;
  expectedPriceMax: number;
  buyerOfferPricePerQuintal: number;
  requiredByDate: string;
  matchScorePercentage: number;
  matchBreakdown: SupplyPoolMatchBreakdown;
  farmers: FarmerContribution[];
  logistics: LogisticsEstimate;
  status: "ACTIVE_MATCHING" | "FULFILLED" | "NEGOTIATING" | "DEAL_CONFIRMED";
  combinedQualitySummary: {
    gradeABreakdown: string;
    moistureRange: string;
    averageMoisture: number;
    verificationText: string;
  };
}


