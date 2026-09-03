import { apiRequest } from '../utils/api';
import type {
  LandParcel,
  CropRotationEntry,
  PrivateCompanyContract,
  CropListing,
  BuyerProfile,
  BuyerRequirement,
  Offer,
  SmartDeal,
  LogisticsQuote,
  SupplyPool,
  SellingAdvisory,
  VerificationDocument,
} from '../types/mandi';

// ── Mock Initial Data ────────────────────────────────────────────────────────

export const INITIAL_LAND_PARCELS: LandParcel[] = [
  {
    id: 'plot-a',
    name: 'Plot A (North Meadow)',
    areaAcres: 2.5,
    type: 'Irrigated',
    soilType: 'Alluvial Loam',
    currentCrop: 'Wheat',
    previousCrop: 'Rice',
    plannedNextCrop: 'Potato',
    productionMethod: 'Conventional',
  },
  {
    id: 'plot-b',
    name: 'Plot B (River Bend)',
    areaAcres: 2.0,
    type: 'Irrigated',
    soilType: 'Clay Loam',
    currentCrop: 'Potato',
    previousCrop: 'Wheat',
    plannedNextCrop: 'Maize',
    productionMethod: 'In-Transition Organic',
  },
  {
    id: 'plot-c',
    name: 'Plot C (Ridge Field)',
    areaAcres: 2.0,
    type: 'Rainfed',
    soilType: 'Sandy Loam',
    currentCrop: 'Gram (Chickpea)',
    previousCrop: 'Mustard',
    plannedNextCrop: 'Soybean',
    productionMethod: 'Conventional',
  },
  {
    id: 'plot-d',
    name: 'Plot D (South Canal)',
    areaAcres: 2.0,
    type: 'Irrigated',
    soilType: 'Alluvial',
    currentCrop: 'Rice',
    previousCrop: 'Wheat',
    plannedNextCrop: 'Mustard',
    productionMethod: 'Organic (Certified)',
  },
];

export const INITIAL_CROP_HISTORY: CropRotationEntry[] = [
  { plotId: 'plot-a', year: 2024, crop: 'Rice', status: 'Healthy' },
  { plotId: 'plot-a', year: 2025, crop: 'Wheat', status: 'Healthy' },
  { plotId: 'plot-a', year: 2026, crop: 'Wheat', status: 'Consecutive Detected', warningMessage: 'Wheat was grown on Plot A in 2025. Planting Wheat again in 2026 violates Agrisense crop rotation safeguard.' },
  { plotId: 'plot-b', year: 2024, crop: 'Wheat', status: 'Healthy' },
  { plotId: 'plot-b', year: 2025, crop: 'Potato', status: 'Healthy' },
  { plotId: 'plot-b', year: 2026, crop: 'Maize', status: 'Healthy' },
  { plotId: 'plot-c', year: 2024, crop: 'Mustard', status: 'Healthy' },
  { plotId: 'plot-c', year: 2025, crop: 'Gram (Chickpea)', status: 'Healthy' },
  { plotId: 'plot-d', year: 2024, crop: 'Wheat', status: 'Healthy' },
  { plotId: 'plot-d', year: 2025, crop: 'Rice', status: 'Healthy' },
];

export const INITIAL_COMPANY_CONTRACTS: PrivateCompanyContract[] = [
  {
    id: 'contract-101',
    companyId: 'buyer-abc',
    companyName: 'ABC Agro Foods Pvt Ltd',
    crop: 'Maize (Hybrid Grade A)',
    requiredQuantityQuintals: 400,
    requestedLandAcres: 2.5,
    allocationPercentage: 29.4,
    contractDurationMonths: 4,
    offeredPricePerQuintal: 2700,
    affectedPlotIds: ['plot-c'],
    productionConditions: 'Contract farming terms include non-GMO seed usage & moisture < 12%',
    status: 'Active',
    farmerConsentGiven: true,
  },
];

export const INITIAL_CROP_LISTINGS: CropListing[] = [
  {
    id: 'lst-wheat-01',
    farmerId: 'AGR-F-882190',
    farmerName: 'Ramesh Kumar Verma',
    farmerLocation: 'Barabanki, Uttar Pradesh',
    farmerRating: 4.8,
    farmerCompletedTransactions: 38,
    crop: 'Wheat',
    variety: 'HD-2967 (Sharbati)',
    quantityQuintals: 250,
    location: 'Barabanki, UP',
    harvestDate: '2026-08-20',
    productionMethod: 'Conventional Good Agricultural Practices',
    productionCostPerQuintal: 2180,
    grade: 'Grade A',
    moisturePercentage: 11.8,
    organicStatus: 'Conventional',
    evidenceStatus: {
      organic: 'Not Applicable',
      qualityReport: 'Verified',
      productionCost: 'Evidence Provided',
      harvestDate: 'Verified',
    },
    fairPriceRange: {
      min: 2820,
      max: 2950,
      breakdown: {
        regionalRef: 2300,
        productionCost: 2180,
        qualityPremium: 180,
        gradePremium: 100,
        organicPremium: 0,
        demandPremium: 120,
        transportDeduction: 80,
        storageDeduction: 40,
      },
    },
    askingPricePerQuintal: 2880,
    verifiedCrop: true,
    verifiedFarmer: true,
  },
  {
    id: 'lst-potato-02',
    farmerId: 'AGR-F-882190',
    farmerName: 'Ramesh Kumar Verma',
    farmerLocation: 'Barabanki, Uttar Pradesh',
    farmerRating: 4.8,
    farmerCompletedTransactions: 38,
    crop: 'Potato',
    variety: 'Kufri Jyoti',
    quantityQuintals: 180,
    location: 'Barabanki, UP',
    harvestDate: '2026-08-28',
    productionMethod: 'In-Transition Organic',
    productionCostPerQuintal: 1450,
    grade: 'Grade A',
    moisturePercentage: 14.0,
    organicStatus: 'Claimed Organic (Pending Evidence)',
    organicCertificateNo: 'ORG-PENDING-991',
    evidenceStatus: {
      organic: 'Pending',
      qualityReport: 'Verified',
      productionCost: 'Evidence Provided',
      harvestDate: 'Verified',
    },
    fairPriceRange: {
      min: 1950,
      max: 2100,
      breakdown: {
        regionalRef: 1700,
        productionCost: 1450,
        qualityPremium: 150,
        gradePremium: 80,
        organicPremium: 100,
        demandPremium: 90,
        transportDeduction: 50,
        storageDeduction: 20,
      },
    },
    askingPricePerQuintal: 2050,
    verifiedCrop: true,
    verifiedFarmer: true,
  },
  {
    id: 'lst-rice-03',
    farmerId: 'AGR-F-542109',
    farmerName: 'Gurpreet Singh',
    farmerLocation: 'Ludhiana, Punjab',
    farmerRating: 4.9,
    farmerCompletedTransactions: 52,
    crop: 'Rice (Basmati)',
    variety: 'Pusa 1121',
    quantityQuintals: 300,
    location: 'Ludhiana, Punjab',
    harvestDate: '2026-08-15',
    productionMethod: 'Certified Organic',
    productionCostPerQuintal: 3100,
    grade: 'Grade A',
    moisturePercentage: 11.2,
    organicStatus: 'Verified Organic',
    organicCertificateNo: 'ORG-IND-2024-8842',
    evidenceStatus: {
      organic: 'Verified',
      qualityReport: 'Verified',
      productionCost: 'Evidence Provided',
      harvestDate: 'Verified',
    },
    fairPriceRange: {
      min: 4400,
      max: 4650,
      breakdown: {
        regionalRef: 3800,
        productionCost: 3100,
        qualityPremium: 300,
        gradePremium: 150,
        organicPremium: 400,
        demandPremium: 200,
        transportDeduction: 100,
        storageDeduction: 50,
      },
    },
    askingPricePerQuintal: 4550,
    verifiedCrop: true,
    verifiedFarmer: true,
  },
  {
    id: 'lst-gram-04',
    farmerId: 'AGR-F-339102',
    farmerName: 'Sunita Devi',
    farmerLocation: 'Ujjain, Madhya Pradesh',
    farmerRating: 4.7,
    farmerCompletedTransactions: 24,
    crop: 'Gram (Chickpea)',
    variety: 'Desi Chana Bold',
    quantityQuintals: 140,
    location: 'Ujjain, MP',
    harvestDate: '2026-08-22',
    productionMethod: 'Natural Farming',
    productionCostPerQuintal: 3800,
    grade: 'Grade B',
    moisturePercentage: 10.5,
    organicStatus: 'Conventional',
    evidenceStatus: {
      organic: 'Not Applicable',
      qualityReport: 'Verified',
      productionCost: 'Estimated',
      harvestDate: 'Verified',
    },
    fairPriceRange: {
      min: 5200,
      max: 5450,
      breakdown: {
        regionalRef: 4900,
        productionCost: 3800,
        qualityPremium: 200,
        gradePremium: 50,
        organicPremium: 0,
        demandPremium: 150,
        transportDeduction: 70,
        storageDeduction: 30,
      },
    },
    askingPricePerQuintal: 5300,
    verifiedCrop: true,
    verifiedFarmer: true,
  },
];

export const INITIAL_BUYERS: BuyerProfile[] = [
  {
    id: 'buyer-abc',
    name: 'ABC Foods & Flour Mills Pvt Ltd',
    type: 'Food Processor',
    location: 'Lucknow, Uttar Pradesh',
    verified: true,
    completedTransactions: 1284,
    paymentReliabilityPct: 96,
    avgPaymentDays: 2.3,
    rating: 4.7,
    transparencyScore: 94,
    activeDisputes: 0,
    resolvedDisputes: 2,
    reputationBreakdown: {
      paymentReliability: 4.8,
      priceFairness: 4.6,
      behaviour: 4.7,
      contractAdherence: 4.8,
      pickupReliability: 4.6,
      disputeResolution: 4.9,
    },
    activeRequirementsCount: 3,
    purchaseCategories: ['Wheat', 'Maize', 'Rice'],
  },
  {
    id: 'buyer-xyz',
    name: 'XYZ Agro Exports India Ltd',
    type: 'Exporter',
    location: 'Kandla, Gujarat',
    verified: true,
    completedTransactions: 840,
    paymentReliabilityPct: 94,
    avgPaymentDays: 3.1,
    rating: 4.6,
    transparencyScore: 91,
    activeDisputes: 1,
    resolvedDisputes: 3,
    reputationBreakdown: {
      paymentReliability: 4.5,
      priceFairness: 4.7,
      behaviour: 4.6,
      contractAdherence: 4.6,
      pickupReliability: 4.5,
      disputeResolution: 4.4,
    },
    activeRequirementsCount: 5,
    purchaseCategories: ['Rice (Basmati)', 'Soybean', 'Cotton'],
  },
  {
    id: 'buyer-sharma',
    name: 'Sharma Roller Flour Industries',
    type: 'Wholesaler',
    location: 'Kanpur, Uttar Pradesh',
    verified: true,
    completedTransactions: 412,
    paymentReliabilityPct: 98,
    avgPaymentDays: 1.5,
    rating: 4.9,
    transparencyScore: 97,
    activeDisputes: 0,
    resolvedDisputes: 1,
    reputationBreakdown: {
      paymentReliability: 4.9,
      priceFairness: 4.8,
      behaviour: 4.9,
      contractAdherence: 4.9,
      pickupReliability: 4.8,
      disputeResolution: 5.0,
    },
    activeRequirementsCount: 2,
    purchaseCategories: ['Wheat', 'Gram (Chickpea)'],
  },
];

export const INITIAL_BUYER_REQUIREMENTS: BuyerRequirement[] = [
  {
    id: 'req-801',
    buyerId: 'buyer-abc',
    buyerName: 'ABC Foods & Flour Mills Pvt Ltd',
    crop: 'Wheat',
    quantityQuintals: 800,
    expectedQuality: 'Grade A Sharbati',
    maxMoisturePct: 12.0,
    organicRequired: false,
    expectedPricePerQuintal: 2850,
    requiredDate: '2026-09-15',
    pickupType: 'Buyer Pickup',
    paymentTermsDays: 2,
    isCashCropContract: false,
  },
  {
    id: 'req-802',
    buyerId: 'buyer-abc',
    buyerName: 'ABC Foods & Flour Mills Pvt Ltd',
    crop: 'Maize',
    quantityQuintals: 400,
    expectedQuality: 'Hybrid Yellow',
    maxMoisturePct: 12.5,
    organicRequired: false,
    expectedPricePerQuintal: 2700,
    requiredDate: '2026-10-01',
    pickupType: 'Seller Delivery',
    paymentTermsDays: 3,
    isCashCropContract: true,
    suggestedLandAcres: 3.0,
  },
];

export const INITIAL_OFFERS: Offer[] = [
  {
    id: 'ofr-001',
    listingId: 'lst-wheat-01',
    buyerId: 'buyer-abc',
    buyerName: 'ABC Foods & Flour Mills Pvt Ltd',
    farmerId: 'AGR-F-882190',
    farmerName: 'Ramesh Kumar Verma',
    crop: 'Wheat (HD-2967)',
    quantityQuintals: 100,
    offeredPricePerQuintal: 2850,
    qualityCondition: 'Grade A, Moisture <= 12%',
    moistureCondition: '12.0%',
    pickupType: 'Buyer Pickup',
    deliveryDate: '2026-09-10',
    paymentTermsDays: 2,
    transportResponsibility: 'Buyer Pays',
    status: 'Countered',
    negotiationTimeline: [
      { version: 1.0, by: 'buyer', price: 2820, quantity: 100, notes: 'Initial buyer offer', timestamp: '2026-08-30 10:30' },
      { version: 1.1, by: 'farmer', price: 2900, quantity: 100, notes: 'Counter offer based on fair price range', timestamp: '2026-08-30 14:15' },
      { version: 1.2, by: 'buyer', price: 2850, quantity: 100, notes: 'Final buyer proposal with immediate pickup', timestamp: '2026-08-31 09:00' },
    ],
  },
];

export const INITIAL_SMART_DEALS: SmartDeal[] = [
  {
    id: 'deal-9901',
    offerId: 'ofr-001',
    dealVersion: 'Version 2.0 (Final Locked)',
    buyerId: 'buyer-sharma',
    buyerName: 'Sharma Roller Flour Industries',
    farmerId: 'AGR-F-882190',
    farmerName: 'Ramesh Kumar Verma',
    crop: 'Wheat',
    variety: 'HD-2967',
    quantityQuintals: 150,
    pricePerQuintal: 2870,
    totalValue: 430500,
    qualityGrade: 'Grade A',
    moisturePercentage: 11.8,
    pickupLocation: 'Farm Gate, Barabanki Plot A',
    deliveryDate: '2026-09-08',
    paymentTerms: 'Payment within 48h of delivery confirmation',
    transportResponsibility: 'Buyer Pays (Sharma Trucking)',
    buyerConfirmed: true,
    farmerConfirmed: true,
    termsLocked: true,
    paymentProtectionState: 'Payment Protected',
  },
];

export const INITIAL_SUPPLY_POOLS: SupplyPool[] = [
  {
    id: 'pool-wheat-800',
    crop: 'Wheat',
    buyerRequirementId: 'req-801',
    buyerName: 'ABC Foods & Flour Mills Pvt Ltd',
    targetQuantityQuintals: 800,
    matchedQuantityQuintals: 800,
    matchScorePct: 94,
    status: 'Matched',
    aggregatedTransportCost: 21500,
    individualTransportCost: 32000,
    estimatedSavings: 10500,
    lots: [
      {
        lotId: 'lot-a',
        farmerId: 'AGR-F-882190',
        farmerName: 'Ramesh Kumar Verma',
        farmerLocation: 'Barabanki',
        quantityQuintals: 120,
        qualityGrade: 'Grade A',
        moisturePct: 11.8,
        fairPriceRange: { min: 2820, max: 2950 },
        askingPrice: 2880,
        deliveryStatus: 'In Transit',
        paymentState: 'Payment Protected',
      },
      {
        lotId: 'lot-b',
        farmerId: 'AGR-F-110293',
        farmerName: 'Sita Devi',
        farmerLocation: 'Dewas',
        quantityQuintals: 80,
        qualityGrade: 'Grade A',
        moisturePct: 11.5,
        fairPriceRange: { min: 2800, max: 2920 },
        askingPrice: 2850,
        deliveryStatus: 'Delivered',
        paymentState: 'Payment Released',
      },
      {
        lotId: 'lot-c',
        farmerId: 'AGR-F-774012',
        farmerName: 'Mahesh Chandra',
        farmerLocation: 'Unnao',
        quantityQuintals: 150,
        qualityGrade: 'Grade A',
        moisturePct: 11.9,
        fairPriceRange: { min: 2830, max: 2940 },
        askingPrice: 2870,
        deliveryStatus: 'In Transit',
        paymentState: 'Payment Protected',
      },
      {
        lotId: 'lot-d',
        farmerId: 'AGR-F-994120',
        farmerName: 'Vijay Patel',
        farmerLocation: 'Barabanki',
        quantityQuintals: 100,
        qualityGrade: 'Grade A',
        moisturePct: 11.6,
        fairPriceRange: { min: 2810, max: 2930 },
        askingPrice: 2860,
        deliveryStatus: 'Delivered',
        paymentState: 'Payment Released',
      },
      {
        lotId: 'lot-e',
        farmerId: 'AGR-F-338291',
        farmerName: 'Rajesh Tiwari',
        farmerLocation: 'Rae Bareli',
        quantityQuintals: 160,
        qualityGrade: 'Grade A',
        moisturePct: 11.7,
        fairPriceRange: { min: 2820, max: 2950 },
        askingPrice: 2880,
        deliveryStatus: 'In Transit',
        paymentState: 'Payment Protected',
      },
      {
        lotId: 'lot-f',
        farmerId: 'AGR-F-661029',
        farmerName: 'Anil Yadav',
        farmerLocation: 'Lucknow',
        quantityQuintals: 190,
        qualityGrade: 'Grade A',
        moisturePct: 11.8,
        fairPriceRange: { min: 2840, max: 2960 },
        askingPrice: 2890,
        deliveryStatus: 'In Transit',
        paymentState: 'Payment Protected',
      },
    ],
  },
];

export const INITIAL_DOCUMENTS: VerificationDocument[] = [
  { id: 'doc-1', category: 'Identity', name: 'Aadhaar Card (Kyc Verified)', status: 'Verified', isPrivate: true, uploadDate: '2026-01-15' },
  { id: 'doc-2', category: 'Land', name: '7/12 Land Khatauni Extract (Plot A-D)', status: 'Verified', isPrivate: true, uploadDate: '2026-01-16' },
  { id: 'doc-3', category: 'Land', name: 'Lease Agreement Plot B', status: 'Verified', isPrivate: true, uploadDate: '2026-02-01' },
  { id: 'doc-4', category: 'Crop', name: 'Soil & Water Testing Lab Report', status: 'Verified', isPrivate: false, uploadDate: '2026-07-10' },
  { id: 'doc-5', category: 'Organic', name: 'NPOP Organic Transition Audit', status: 'Under Review', isPrivate: false, uploadDate: '2026-08-01' },
  { id: 'doc-6', category: 'Quality', name: 'Government Grain Moisture Certificate', status: 'Verified', isPrivate: false, uploadDate: '2026-08-21' },
];

// ── Rule Engine Services ─────────────────────────────────────────────────────

export const landProtectionService = {
  MAX_ALLOWED_COMPANY_ALLOCATION_PCT: 40.0,

  checkLandAllocation(totalCultivableLandAcres: number, requestedLandAcres: number) {
    const allocationPercentage = (requestedLandAcres / totalCultivableLandAcres) * 100;
    const isWithinLimit = allocationPercentage <= this.MAX_ALLOWED_COMPANY_ALLOCATION_PCT;
    const maxAllowedAcres = totalCultivableLandAcres * (this.MAX_ALLOWED_COMPANY_ALLOCATION_PCT / 100);

    return {
      allocationPercentage: Number(allocationPercentage.toFixed(1)),
      maxAllowedAcres: Number(maxAllowedAcres.toFixed(1)),
      isWithinLimit,
      remainingProtectedLandAcres: Number((totalCultivableLandAcres - requestedLandAcres).toFixed(1)),
      warningMessage: isWithinLimit
        ? undefined
        : `🔴 LAND PROTECTION LIMIT EXCEEDED! Private company requested ${requestedLandAcres} acres (${allocationPercentage.toFixed(
            1
          )}%). Agrisense platform safeguard limits cash-crop contracting to max 40% (${maxAllowedAcres.toFixed(1)} acres).`,
    };
  },
};

export const cropRotationService = {
  checkCropRotation(plot: LandParcel, newCrop: string, cropHistory: CropRotationEntry[]) {
    const lastYearEntry = cropHistory.find(
      (h) => h.plotId === plot.id && h.year === 2025
    );
    const prevCrop = lastYearEntry ? lastYearEntry.crop : plot.previousCrop;

    const isConsecutiveSameCrop =
      prevCrop.toLowerCase().trim() === newCrop.toLowerCase().trim();

    if (isConsecutiveSameCrop) {
      return {
        status: 'Consecutive Detected' as const,
        isWarning: true,
        message: `⚠ Crop Rotation Alert! ${newCrop} was grown on ${plot.name} in 2025. Planting ${newCrop} again on the same plot in 2026 violates Agrisense crop-rotation safeguard for soil health and pest prevention.`,
        recommendedAlternatives: this.getAlternativesFor(newCrop),
      };
    }

    return {
      status: 'Healthy' as const,
      isWarning: false,
      message: `✓ Healthy Rotation. Rotating from ${prevCrop} to ${newCrop} maintains soil nitrogen and protects field health.`,
      recommendedAlternatives: [],
    };
  },

  getAlternativesFor(currentCrop: string): Array<{ crop: string; category: string; benefit: string }> {
    const c = currentCrop.toLowerCase();
    if (c.includes('wheat') || c.includes('rice')) {
      return [
        { crop: 'Gram / Chickpea', category: 'Legume', benefit: 'Fixes atmospheric nitrogen & replenishes soil organic carbon' },
        { crop: 'Mustard', category: 'Oilseed', benefit: 'Breaks cereal pest cycles and improves soil bio-fumigation' },
        { crop: 'Potato', category: 'Tuber', benefit: 'High cash yield with quick 90-day maturity cycle' },
      ];
    }
    return [
      { crop: 'Pulses (Lentils/Moong)', category: 'Legume', benefit: 'Restores nitrogen and enriches microbial biomass' },
      { crop: 'Vegetables', category: 'Short-duration', benefit: 'High quick returns and zero pest overlap' },
    ];
  },
};

// ── Speech & Voice-to-Text Mock Service ──────────────────────────────────────

export const speechService = {
  async transcribe(audioBlob?: Blob, languagePreference: 'hi' | 'en' = 'hi'): Promise<string> {
    // Simulated Speech-to-Text latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const hindiPhrases = [
      'मेरे पास 250 क्विंटल ग्रेड-A गेहूं उपलब्ध है, क्या आप ₹2880 प्रति क्विंटल देंगे?',
      'भुगतान डिलीवरी के 24 घंटे के भीतर एस्क्रो खाते में जमा होना चाहिए।',
      'हमारी आलू की फसल कुफरी ज्योति किस्म की है और नमी 14% से कम है।',
      'अगर ट्रांसपोर्ट आपकी तरफ से रहेगा तो हम रेट थोड़ा कम कर सकते हैं।',
    ];

    const englishPhrases = [
      'I have 250 quintals of Grade A Wheat available for immediate pickup.',
      'Can you confirm if buyer payment protection escrow is enabled?',
      'Our farm plot is located near Barabanki mandi highway.',
      'We can agree to ₹2,850 per quintal provided pickup happens this week.',
    ];

    const pool = languagePreference === 'hi' ? hindiPhrases : englishPhrases;
    return pool[Math.floor(Math.random() * pool.length)];
  },
};

// ── AI Communication Assistant ─────────────────────────────────────────────

export const aiCommunicationAssistant = {
  explainBuyerQuery(buyerMessage: string): string {
    if (buyerMessage.toLowerCase().includes('moisture')) {
      return 'The buyer is asking whether your grain moisture level is below 12% to ensure long-term warehouse storage quality.';
    }
    if (buyerMessage.toLowerCase().includes('rate') || buyerMessage.toLowerCase().includes('price')) {
      return 'The buyer is proposing a price negotiation and wants to know your lowest acceptable rate per quintal.';
    }
    return 'The buyer is requesting transaction details regarding pickup logistics and payment terms.';
  },

  suggestResponse(intent: string, askingPrice: number): string {
    return `Our asking price is ₹${askingPrice}/quintal. We would prefer not to go below this price given our verified Grade-A quality and evidence-backed production cost.`;
  },
};

// ── AI Selling Advisor Service ────────────────────────────────────────────────

export const sellingAdvisorService = {
  getAdvisory(cropName: string, askingPrice: number, prodCost: number): SellingAdvisory {
    const margin = askingPrice - prodCost;
    return {
      crop: cropName,
      currentBestOfferPerQuintal: askingPrice - 30,
      farmerProductionCostPerQuintal: prodCost,
      estimatedMarginPerQuintal: margin,
      marketTrend: 'Increasing',
      storageAvailableDays: 20,
      recommendation: 'CONSIDER WAITING 5–10 DAYS',
      confidencePct: 74,
      reasons: [
        'Regional mandi arrivals are currently down by 14%, tightening market supply.',
        'Buyer demand from food processors in nearby hubs is projected to rise next week.',
        'Your current best offer is ₹30/q below the upper Agrisense fair reference range.',
        'Storage is safely available in your plot shed for up to 20 days.',
      ],
      sellNowScenario: {
        pricePerQuintal: askingPrice - 30,
        expectedNetTotal: (askingPrice - 30) * 250 - 18500,
      },
      waitScenario: {
        expectedNetMin: askingPrice * 250 - 18500 - 4000,
        expectedNetMax: (askingPrice + 120) * 250 - 18500 - 4000,
        estimatedStorageCost: 4000,
        riskLevel: 'Medium',
      },
    };
  },
};

// ── Backend API Client Functions ─────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: { page: number; limit: number; total: number };
}

// ── Commodity API ────────────────────────────────────────────────────────────

export interface CommodityRecord {
  id: string;
  name: string;
  variety: string | null;
  category: string;
  season: string;
  mspPerQuintal: number | null;
  imageUrl: string | null;
}

export async function fetchCommodities(params?: {
  season?: string;
  category?: string;
  search?: string;
}): Promise<CommodityRecord[]> {
  try {
    const query = new URLSearchParams();
    if (params?.season) query.set('season', params.season);
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    const res = await apiRequest<ApiResponse<CommodityRecord[]>>(
      `/mandi/commodities${qs ? `?${qs}` : ''}`
    );
    return res.data;
  } catch {
    return [];
  }
}

// ── Mandi Market API ─────────────────────────────────────────────────────────

export interface MandiMarketRecord {
  id: string;
  name: string;
  state: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
}

export async function fetchMandiMarkets(params?: {
  state?: string;
  search?: string;
}): Promise<MandiMarketRecord[]> {
  try {
    const query = new URLSearchParams();
    if (params?.state) query.set('state', params.state);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    const res = await apiRequest<ApiResponse<MandiMarketRecord[]>>(
      `/mandi/markets${qs ? `?${qs}` : ''}`
    );
    return res.data;
  } catch {
    return [];
  }
}

// ── Mandi Price API ──────────────────────────────────────────────────────────

export interface MandiPriceRecord {
  id: string;
  commodityId: string;
  mandiId: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  arrivalTonnes: number | null;
  arrivalDate: string;
  commodity: { name: string; variety: string | null; category: string; mspPerQuintal: number | null };
  mandi: { name: string; state: string; district: string };
}

export async function fetchMandiPrices(params?: {
  commodityId?: string;
  mandiId?: string;
  days?: number;
}): Promise<MandiPriceRecord[]> {
  try {
    const query = new URLSearchParams();
    if (params?.commodityId) query.set('commodityId', params.commodityId);
    if (params?.mandiId) query.set('mandiId', params.mandiId);
    if (params?.days) query.set('days', String(params.days));
    const qs = query.toString();
    const res = await apiRequest<ApiResponse<MandiPriceRecord[]>>(
      `/mandi/prices${qs ? `?${qs}` : ''}`
    );
    return res.data;
  } catch {
    return [];
  }
}

// ── Crop Listing API ─────────────────────────────────────────────────────────

export async function fetchListings(params?: {
  commodityId?: string;
  grade?: string;
  page?: number;
  limit?: number;
}): Promise<{ listings: CropListing[]; total: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.commodityId) query.set('commodityId', params.commodityId);
    if (params?.grade) query.set('grade', params.grade);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    const res = await apiRequest<ApiResponse<CropListing[]>>(
      `/mandi/listings${qs ? `?${qs}` : ''}`
    );
    return { listings: res.data, total: res.pagination?.total ?? res.data.length };
  } catch {
    return { listings: INITIAL_CROP_LISTINGS, total: INITIAL_CROP_LISTINGS.length };
  }
}

export async function fetchListingById(id: string): Promise<CropListing | null> {
  try {
    const res = await apiRequest<ApiResponse<CropListing>>(`/mandi/listings/${id}`);
    return res.data;
  } catch {
    return INITIAL_CROP_LISTINGS.find((l) => l.id === id) ?? null;
  }
}

export async function createListingApi(data: Record<string, unknown>): Promise<unknown> {
  const res = await apiRequest<ApiResponse<unknown>>('/mandi/listings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

// ── Buyer Profile API ────────────────────────────────────────────────────────

export async function fetchBuyerProfiles(params?: {
  type?: string;
  search?: string;
}): Promise<BuyerProfile[]> {
  try {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    const res = await apiRequest<ApiResponse<BuyerProfile[]>>(
      `/mandi/buyers${qs ? `?${qs}` : ''}`
    );
    return res.data;
  } catch {
    return INITIAL_BUYERS;
  }
}

// ── Offer API ────────────────────────────────────────────────────────────────

export async function fetchOffers(params?: {
  status?: string;
}): Promise<Offer[]> {
  try {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    const res = await apiRequest<ApiResponse<Offer[]>>(
      `/mandi/offers${qs ? `?${qs}` : ''}`
    );
    return res.data;
  } catch {
    return INITIAL_OFFERS;
  }
}

export async function createOfferApi(data: Record<string, unknown>): Promise<unknown> {
  const res = await apiRequest<ApiResponse<unknown>>('/mandi/offers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function counterOfferApi(
  offerId: string,
  data: { offeredPricePerQuintal: number; quantityQuintals: number; notes?: string }
): Promise<unknown> {
  const res = await apiRequest<ApiResponse<unknown>>(`/mandi/offers/${offerId}/counter`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function acceptOfferApi(offerId: string): Promise<unknown> {
  const res = await apiRequest<ApiResponse<unknown>>(`/mandi/offers/${offerId}/accept`, {
    method: 'PATCH',
  });
  return res.data;
}

// ── Deal API ─────────────────────────────────────────────────────────────────

export async function fetchDeals(): Promise<SmartDeal[]> {
  try {
    const res = await apiRequest<ApiResponse<SmartDeal[]>>('/mandi/deals');
    return res.data;
  } catch {
    return INITIAL_SMART_DEALS;
  }
}

// ── ML Advisory API (backend placeholders) ──────────────────────────────────

export async function fetchFairPriceEstimate(params: {
  crop: string;
  location?: string;
  grade?: string;
  moisturePercentage?: number;
  productionCostPerQuintal?: number;
  organicStatus?: string;
}): Promise<unknown> {
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null) query.set(k, String(v)); });
    const res = await apiRequest<ApiResponse<unknown>>(`/mandi/advisory/fair-price?${query}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function fetchSellingAdvisory(params: {
  crop: string;
  askingPrice: number;
  productionCost: number;
}): Promise<SellingAdvisory | null> {
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => query.set(k, String(v)));
    const res = await apiRequest<ApiResponse<SellingAdvisory>>(`/mandi/advisory/selling?${query}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function fetchLogisticsQuote(params: {
  origin: string;
  destination: string;
  quantityQuintals: number;
}): Promise<unknown> {
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => query.set(k, String(v)));
    const res = await apiRequest<ApiResponse<unknown>>(`/mandi/advisory/logistics?${query}`);
    return res.data;
  } catch {
    return null;
  }
}
