import type {
  SellSmarterCropOption,
  DirectBuyerOfferItem,
  ScenarioSimulationParams,
  ScenarioSimulationResult,
} from "../types/sellSmarter";

export const MOCK_SELL_SMARTER_CROPS: SellSmarterCropOption[] = [
  {
    id: "CROP-WHEAT-250",
    cropName: "Wheat",
    variety: "HD-2967",
    quantityQuintals: 250,
    location: "Barabanki, Uttar Pradesh",
    qualityGrade: "Grade A",
    moisturePercentage: 11.8,
    productionMethod: "Conventional",
    productionCostPerQ: 2180,
    fairPriceRangeMinPerQ: 2820,
    fairPriceRangeMaxPerQ: 2950,
    mandi: {
      marketName: "Barabanki APMC Main Mandi",
      grossPricePerQ: 2550,
      quantityQuintals: 250,
      grossValue: 637500,
      deductions: {
        marketChargesPerQ: 30,
        handlingPerQ: 20,
        loadingUnloadingPerQ: 15,
        otherChargesPerQ: 15,
        totalDeductionsPerQ: 80,
      },
      estimatedNetRealizationPerQ: 2470,
      estimatedNetValue: 617500,
    },
    directBuyers: [
      {
        id: "OFFER-ABC-01",
        buyerId: "BUYER-ABC-01",
        businessName: "ABC Foods & Flour Mills Pvt Ltd",
        verificationBadge: "✓ Business Verified",
        isVerified: true,
        offerPricePerQ: 2720,
        quantityQuintals: 250,
        grossValue: 680000,
        transportCostPerQ: 60,
        transportPaidBy: "Farmer",
        estimatedNetRealizationPerQ: 2660,
        estimatedNetValue: 665000,
        paymentTerms: "Within 48 hours",
        paymentReliabilityPercentage: 96,
        buyerRating: 4.7,
        avgPaymentDays: 2.3,
        distanceKm: 28,
        moistureRequirementMax: 12.0,
        qualityRequirement: "Grade A",
        offerValidityHours: 24,
        priceFairnessCategory: "BELOW_REFERENCE",
        whyThisPriceFactors: [
          "Buyer requires strict Grade A bold grain specification",
          "Current local flour mill processing demand is moderate",
          "Includes buyer-provided quality inspection at gate",
          "Includes 48-hour expedited payment release guarantee",
          "Market benchmark regional mandi price is currently ₹2,550/q",
        ],
      },
      {
        id: "OFFER-XYZ-02",
        buyerId: "BUYER-XYZ-02",
        businessName: "XYZ Agro Processing",
        verificationBadge: "✓ Verified Processor",
        isVerified: true,
        offerPricePerQ: 2690,
        quantityQuintals: 250,
        grossValue: 672500,
        transportCostPerQ: 40,
        transportPaidBy: "Farmer",
        estimatedNetRealizationPerQ: 2650,
        estimatedNetValue: 662500,
        paymentTerms: "Advance 50% + Delivery 50%",
        paymentReliabilityPercentage: 94,
        buyerRating: 4.5,
        avgPaymentDays: 3.0,
        distanceKm: 18,
        moistureRequirementMax: 12.5,
        qualityRequirement: "Grade A",
        offerValidityHours: 48,
        priceFairnessCategory: "BELOW_REFERENCE",
        whyThisPriceFactors: [
          "Slightly lower gross offer but closer proximity reduces transport cost",
          "Flexible moisture acceptance up to 12.5%",
          "50% upfront bank transfer before pickup",
        ],
      },
      {
        id: "OFFER-SHARMA-03",
        buyerId: "BUYER-SHARMA-03",
        businessName: "Sharma Grain Industries",
        verificationBadge: "✓ Verified Wholesaler",
        isVerified: true,
        offerPricePerQ: 2750,
        quantityQuintals: 250,
        grossValue: 687500,
        transportCostPerQ: 90,
        transportPaidBy: "Farmer",
        estimatedNetRealizationPerQ: 2660,
        estimatedNetValue: 665000,
        paymentTerms: "Payment on Delivery",
        paymentReliabilityPercentage: 98,
        buyerRating: 4.8,
        avgPaymentDays: 1.5,
        distanceKm: 52,
        moistureRequirementMax: 11.5,
        qualityRequirement: "Premium Export",
        offerValidityHours: 12,
        priceFairnessCategory: "BELOW_REFERENCE",
        whyThisPriceFactors: [
          "Higher gross offer price due to high export quality demand",
          "Higher transport deduction due to 52 km distance to mill",
          "Strict moisture limit of 11.5%",
        ],
      },
    ],
    storage: {
      available: true,
      availableDays: 20,
      storageCostPerQPerDay: 8,
      capacityQuintals: 300,
      currentUsedQuintals: 250,
      shelfLifeCategory: "Long",
      storageSensitivity: "Low",
      recommendedStorageConditions: "Dry & ventilated grain storage shed, moisture < 12%",
      urgencyText: "Low immediate storage pressure; 20 days buffer available.",
    },
    marketTrend: {
      cropName: "Wheat",
      trend7d: "Increasing",
      percentage7d: 2.4,
      trend30d: "Moderate Increase",
      percentage30d: 3.8,
      currentRegionalPricePerQ: 2750,
      previous30DayAvgPerQ: 2690,
      chartHistory: [
        { date: "Day 1", mandiPrice: 2480, directBuyerPrice: 2610 },
        { date: "Day 5", mandiPrice: 2490, directBuyerPrice: 2630 },
        { date: "Day 10", mandiPrice: 2510, directBuyerPrice: 2650 },
        { date: "Day 15", mandiPrice: 2520, directBuyerPrice: 2670 },
        { date: "Day 20", mandiPrice: 2535, directBuyerPrice: 2690 },
        { date: "Day 25", mandiPrice: 2540, directBuyerPrice: 2705 },
        { date: "Day 30", mandiPrice: 2550, directBuyerPrice: 2720 },
      ],
    },
    forecast: {
      expectedDirection: "↗ Slightly Positive",
      confidencePercentage: 72,
      forecastRangeMinPerQ: 2760,
      forecastRangeMaxPerQ: 2850,
      timeframeDaysText: "Next 7–10 Days",
      isModelEstimate: true,
      disclaimer: "AI/Model Estimate — Not a guaranteed future price.",
    },
    advisor: {
      decisionState: "CONSIDER_WAITING",
      shortRecommendation:
        "Consider waiting 5–10 days, provided your storage remains suitable and storage costs stay manageable.",
      detailedRationale: [
        "Regional wheat prices are trending upward (+2.4% over 7 days).",
        "Buyer demand in Uttar Pradesh flour mills is currently increasing.",
        "Your current best offer (₹2,720/q gross) is below your Agrisense reference range (₹2,820 – ₹2,950/q).",
        "You have 20 days of safe storage capacity available at reasonable daily cost.",
        "Wheat has relatively low short-term storage degradation risk.",
      ],
      confidencePercentage: 72,
      factorsConsidered: [
        "Current regional mandi prices (₹2,550/q)",
        "Historical 30-day price trend (+3.8%)",
        "Direct buyer offer prices & transport charges",
        "Agrisense Fair Price Range (₹2,820–₹2,950/q)",
        "Your production cost (₹2,180/q)",
        "Storage availability (20 days) & cost (₹8/q/day)",
        "Crop shelf life & degradation risk",
        "Buyer payment reliability (96%)",
      ],
      risksAndContingencies: [
        "Sudden increase in regional wheat arrivals could cap prices.",
        "Storage cost over 15+ days reduces net profit margin by ₹120/q.",
        "Current buyer offer from ABC Foods expires in 24 hours.",
      ],
      disclaimer: "This is decision support, not a guarantee of future prices.",
    },
    historicalAvg: {
      transactionCount: 5,
      mandiAveragePerQ: 2490,
      directBuyerAveragePerQ: 2650,
      netRealizationDifferencePerQ: 160,
    },
  },

  {
    id: "CROP-RICE-120",
    cropName: "Rice — Basmati",
    variety: "1121 Basmati",
    quantityQuintals: 120,
    location: "Karnal, Haryana",
    qualityGrade: "Grade A",
    moisturePercentage: 12.2,
    productionMethod: "Conventional",
    productionCostPerQ: 3100,
    fairPriceRangeMinPerQ: 4100,
    fairPriceRangeMaxPerQ: 4400,
    mandi: {
      marketName: "Karnal Grain Market (APMC)",
      grossPricePerQ: 3800,
      quantityQuintals: 120,
      grossValue: 456000,
      deductions: {
        marketChargesPerQ: 40,
        handlingPerQ: 25,
        loadingUnloadingPerQ: 15,
        otherChargesPerQ: 15,
        totalDeductionsPerQ: 95,
      },
      estimatedNetRealizationPerQ: 3705,
      estimatedNetValue: 444600,
    },
    directBuyers: [
      {
        id: "OFFER-HR-01",
        buyerId: "BUYER-HR-01",
        businessName: "Haryana Rice Exports Ltd",
        verificationBadge: "✓ Premium Exporter Verified",
        isVerified: true,
        offerPricePerQ: 4250,
        quantityQuintals: 120,
        grossValue: 510000,
        transportCostPerQ: 70,
        transportPaidBy: "Farmer",
        estimatedNetRealizationPerQ: 4180,
        estimatedNetValue: 501600,
        paymentTerms: "Advance Escrow 100%",
        paymentReliabilityPercentage: 98,
        buyerRating: 4.9,
        avgPaymentDays: 1.0,
        distanceKm: 35,
        moistureRequirementMax: 13.0,
        qualityRequirement: "Grade A",
        offerValidityHours: 36,
        priceFairnessCategory: "WITHIN_REFERENCE",
        whyThisPriceFactors: [
          "High international export demand for 1121 Basmati",
          "Offer is within your Agrisense reference range (₹4,100–₹4,400/q)",
          "100% bank escrow protection before pickup",
        ],
      },
      {
        id: "OFFER-HERITAGE-02",
        buyerId: "BUYER-HERITAGE-02",
        businessName: "Heritage Grain Processors",
        verificationBadge: "✓ Verified Mill",
        isVerified: true,
        offerPricePerQ: 4180,
        quantityQuintals: 120,
        grossValue: 501600,
        transportCostPerQ: 50,
        transportPaidBy: "Farmer",
        estimatedNetRealizationPerQ: 4130,
        estimatedNetValue: 495600,
        paymentTerms: "Within 24 hours",
        paymentReliabilityPercentage: 95,
        buyerRating: 4.6,
        avgPaymentDays: 2.0,
        distanceKm: 22,
        moistureRequirementMax: 12.5,
        qualityRequirement: "Grade A",
        offerValidityHours: 48,
        priceFairnessCategory: "WITHIN_REFERENCE",
        whyThisPriceFactors: [
          "Fair direct offer from local rice mill",
          "Shorter transport distance",
        ],
      },
    ],
    storage: {
      available: true,
      availableDays: 45,
      storageCostPerQPerDay: 10,
      capacityQuintals: 200,
      currentUsedQuintals: 120,
      shelfLifeCategory: "Long",
      storageSensitivity: "Low",
      recommendedStorageConditions: "Dry covered warehouse with pest control",
      urgencyText: "Ample storage time available; no immediate rush.",
    },
    marketTrend: {
      cropName: "Rice — Basmati",
      trend7d: "Increasing",
      percentage7d: 3.1,
      trend30d: "Moderate Increase",
      percentage30d: 5.2,
      currentRegionalPricePerQ: 4150,
      previous30DayAvgPerQ: 3950,
      chartHistory: [
        { date: "Day 1", mandiPrice: 3650, directBuyerPrice: 3950 },
        { date: "Day 10", mandiPrice: 3700, directBuyerPrice: 4050 },
        { date: "Day 20", mandiPrice: 3750, directBuyerPrice: 4150 },
        { date: "Day 30", mandiPrice: 3800, directBuyerPrice: 4250 },
      ],
    },
    forecast: {
      expectedDirection: "↗ Slightly Positive",
      confidencePercentage: 78,
      forecastRangeMinPerQ: 4200,
      forecastRangeMaxPerQ: 4450,
      timeframeDaysText: "Next 10–14 Days",
      isModelEstimate: true,
      disclaimer: "AI/Model Estimate — Not a guaranteed future price.",
    },
    advisor: {
      decisionState: "CONSIDER_SELLING",
      shortRecommendation:
        "Consider selling to Haryana Rice Exports as the current net realization (₹4,180/q) falls within your fair price range with 100% escrow protection.",
      detailedRationale: [
        "Buyer offer (₹4,250/q gross, ₹4,180/q net) is inside your Agrisense reference range (₹4,100–₹4,400/q).",
        "Net realization is ₹475/q higher than APMC mandi realization.",
        "100% escrow protection ensures zero payment default risk.",
      ],
      confidencePercentage: 84,
      factorsConsidered: [
        "Export demand premium for Basmati",
        "Fair price range alignment",
        "100% Bank escrow protection",
        "High margin above production cost (₹3,100/q)",
      ],
      risksAndContingencies: [
        "Currency fluctuations could impact export buyer purchasing budget.",
      ],
      disclaimer: "This is decision support, not a guarantee of future prices.",
    },
    historicalAvg: {
      transactionCount: 4,
      mandiAveragePerQ: 3650,
      directBuyerAveragePerQ: 4120,
      netRealizationDifferencePerQ: 470,
    },
  },

  {
    id: "CROP-CHANA-80",
    cropName: "Chana (Bengal Gram)",
    variety: "Desi Chana",
    quantityQuintals: 80,
    location: "Sagar, Madhya Pradesh",
    qualityGrade: "Grade A",
    moisturePercentage: 10.5,
    productionMethod: "Conventional",
    productionCostPerQ: 3850,
    fairPriceRangeMinPerQ: 5100,
    fairPriceRangeMaxPerQ: 5350,
    mandi: {
      marketName: "Sagar APMC Krishi Upaj Mandi",
      grossPricePerQ: 4850,
      quantityQuintals: 80,
      grossValue: 388000,
      deductions: {
        marketChargesPerQ: 25,
        handlingPerQ: 20,
        loadingUnloadingPerQ: 15,
        otherChargesPerQ: 10,
        totalDeductionsPerQ: 70,
      },
      estimatedNetRealizationPerQ: 4780,
      estimatedNetValue: 382400,
    },
    directBuyers: [
      {
        id: "OFFER-DAL-01",
        buyerId: "BUYER-DAL-01",
        businessName: "Vindhya Dal Mill & Pulse Industries",
        verificationBadge: "✓ Verified Dal Mill Processor",
        isVerified: true,
        offerPricePerQ: 5150,
        quantityQuintals: 80,
        grossValue: 412000,
        transportCostPerQ: 80,
        transportPaidBy: "Farmer",
        estimatedNetRealizationPerQ: 5070,
        estimatedNetValue: 405600,
        paymentTerms: "Within 48 hours",
        paymentReliabilityPercentage: 97,
        buyerRating: 4.8,
        avgPaymentDays: 1.8,
        distanceKm: 42,
        moistureRequirementMax: 11.0,
        qualityRequirement: "Grade A",
        offerValidityHours: 48,
        priceFairnessCategory: "WITHIN_REFERENCE",
        whyThisPriceFactors: [
          "Direct processor purchasing for high festive pulse demand",
          "Offer price is within Agrisense fair reference range",
          "High payment reliability rating (97%)",
        ],
      },
    ],
    storage: {
      available: true,
      availableDays: 30,
      storageCostPerQPerDay: 7,
      capacityQuintals: 150,
      currentUsedQuintals: 80,
      shelfLifeCategory: "Long",
      storageSensitivity: "Low",
      recommendedStorageConditions: "Moisture-free sealed jute bags in dry warehouse",
      urgencyText: "30 days storage capacity available.",
    },
    marketTrend: {
      cropName: "Chana",
      trend7d: "Stable",
      percentage7d: 0.5,
      trend30d: "Moderate Increase",
      percentage30d: 2.1,
      currentRegionalPricePerQ: 4900,
      previous30DayAvgPerQ: 4800,
      chartHistory: [
        { date: "Day 1", mandiPrice: 4750, directBuyerPrice: 4980 },
        { date: "Day 15", mandiPrice: 4800, directBuyerPrice: 5050 },
        { date: "Day 30", mandiPrice: 4850, directBuyerPrice: 5150 },
      ],
    },
    forecast: {
      expectedDirection: "→ Stable",
      confidencePercentage: 68,
      forecastRangeMinPerQ: 5050,
      forecastRangeMaxPerQ: 5200,
      timeframeDaysText: "Next 7 Days",
      isModelEstimate: true,
      disclaimer: "AI/Model Estimate — Not a guaranteed future price.",
    },
    advisor: {
      decisionState: "COMPARE_BUYERS",
      shortRecommendation:
        "Compare Vindhya Dal Mill offer with local APMC mandi. Direct offer gives +₹290/q higher net realization.",
      detailedRationale: [
        "Vindhya Dal Mill offer (₹5,150/q gross) provides ₹5,070/q net realization.",
        "APMC Mandi expected net is ₹4,780/q after ₹70/q deductions.",
        "Total extra profit for 80 quintals: +₹23,200.",
      ],
      confidencePercentage: 76,
      factorsConsidered: [
        "Net realization gap (+₹290/q)",
        "Processor verification status",
        "Low moisture content (10.5%) matching buyer criteria",
      ],
      risksAndContingencies: [
        "Ensure weighbridge slips are cross-verified at delivery gate.",
      ],
      disclaimer: "This is decision support, not a guarantee of future prices.",
    },
    historicalAvg: {
      transactionCount: 3,
      mandiAveragePerQ: 4720,
      directBuyerAveragePerQ: 5010,
      netRealizationDifferencePerQ: 290,
    },
  },

  {
    id: "CROP-TOMATO-150",
    cropName: "Tomato — Hybrid",
    variety: "Abhinav Hybrid",
    quantityQuintals: 150,
    location: "Kolar, Karnataka",
    qualityGrade: "Grade A",
    moisturePercentage: 88.0,
    productionMethod: "Conventional",
    productionCostPerQ: 1100,
    fairPriceRangeMinPerQ: 1800,
    fairPriceRangeMaxPerQ: 2100,
    mandi: {
      marketName: "Kolar APMC Tomato Market",
      grossPricePerQ: 1650,
      quantityQuintals: 150,
      grossValue: 247500,
      deductions: {
        marketChargesPerQ: 45,
        handlingPerQ: 35,
        loadingUnloadingPerQ: 15,
        otherChargesPerQ: 15,
        totalDeductionsPerQ: 110,
      },
      estimatedNetRealizationPerQ: 1540,
      estimatedNetValue: 231000,
    },
    directBuyers: [
      {
        id: "OFFER-FRESH-01",
        buyerId: "BUYER-FRESH-01",
        businessName: "FreshFarm Retail Chains Pvt Ltd",
        verificationBadge: "✓ Retail Supermarket Verified",
        isVerified: true,
        offerPricePerQ: 1950,
        quantityQuintals: 150,
        grossValue: 292500,
        transportCostPerQ: 120,
        transportPaidBy: "Farmer",
        estimatedNetRealizationPerQ: 1830,
        estimatedNetValue: 274500,
        paymentTerms: "Same Day Bank Transfer",
        paymentReliabilityPercentage: 99,
        buyerRating: 4.9,
        avgPaymentDays: 0.5,
        distanceKm: 65,
        moistureRequirementMax: 90.0,
        qualityRequirement: "Grade A",
        offerValidityHours: 12,
        priceFairnessCategory: "WITHIN_REFERENCE",
        whyThisPriceFactors: [
          "Direct procurement for Bengaluru city retail stores",
          "Higher transport cost due to refrigerated van transit",
          "Within Agrisense fair price range (₹1,800–₹2,100/q)",
        ],
      },
    ],
    storage: {
      available: false,
      availableDays: 3,
      storageCostPerQPerDay: 25,
      capacityQuintals: 0,
      currentUsedQuintals: 150,
      shelfLifeCategory: "Short",
      storageSensitivity: "High",
      recommendedStorageConditions: "Cold storage (8–10°C) or immediate dispatch within 48h",
      urgencyText: "⚠️ High perishability risk! Harvested tomatoes require immediate dispatch.",
    },
    marketTrend: {
      cropName: "Tomato",
      trend7d: "Decreasing",
      percentage7d: -4.5,
      trend30d: "Slight Decline",
      percentage30d: -2.0,
      currentRegionalPricePerQ: 1650,
      previous30DayAvgPerQ: 1720,
      chartHistory: [
        { date: "Day 1", mandiPrice: 1750, directBuyerPrice: 1980 },
        { date: "Day 15", mandiPrice: 1700, directBuyerPrice: 1950 },
        { date: "Day 30", mandiPrice: 1650, directBuyerPrice: 1950 },
      ],
    },
    forecast: {
      expectedDirection: "↘ Softening",
      confidencePercentage: 81,
      forecastRangeMinPerQ: 1450,
      forecastRangeMaxPerQ: 1600,
      timeframeDaysText: "Next 3–5 Days",
      isModelEstimate: true,
      disclaimer: "AI/Model Estimate — Not a guaranteed future price.",
    },
    advisor: {
      decisionState: "CONSIDER_SELLING_SOON",
      shortRecommendation:
        "High urgency to sell! Tomato has a short shelf life and regional prices are softening. Accept FreshFarm Retail offer immediately.",
      detailedRationale: [
        "Tomatoes have high perishability and no long-term farm storage is available.",
        "Regional mandi prices are dropping (-4.5% over last 7 days).",
        "FreshFarm offer gives ₹1,830/q net realization vs ₹1,540/q mandi net (+₹290/q extra).",
        "Same-day bank transfer minimizes counterparty risk.",
      ],
      confidencePercentage: 89,
      factorsConsidered: [
        "High perishability risk",
        "No cold storage availability",
        "Softening market price trend",
        "Offer within fair reference range",
      ],
      risksAndContingencies: [
        "Delaying sale by 2 days could lead to 15-20% spoilage loss.",
      ],
      disclaimer: "This is decision support, not a guarantee of future prices.",
    },
    historicalAvg: {
      transactionCount: 6,
      mandiAveragePerQ: 1580,
      directBuyerAveragePerQ: 1810,
      netRealizationDifferencePerQ: 230,
    },
  },
];

export const sellSmarterService = {
  getCropOptions(): SellSmarterCropOption[] {
    return MOCK_SELL_SMARTER_CROPS;
  },

  getCropById(id: string): SellSmarterCropOption {
    const found = MOCK_SELL_SMARTER_CROPS.find((c) => c.id === id);
    return found || MOCK_SELL_SMARTER_CROPS[0];
  },

  calculateScenario(
    crop: SellSmarterCropOption,
    bestBuyer: DirectBuyerOfferItem,
    params: ScenarioSimulationParams
  ): ScenarioSimulationResult {
    const sellTodayNetPerQ = bestBuyer.estimatedNetRealizationPerQ;
    const sellTodayNetTotal = bestBuyer.estimatedNetValue;

    // Price change impact
    const priceMultiplier = 1 + params.expectedPriceChangePercentage / 100;
    const futureGrossPricePerQ = Math.round(bestBuyer.offerPricePerQ * priceMultiplier);

    // Storage cost
    const totalStorageCostPerQ = params.waitingDays * params.storageCostPerQDay;
    const totalStorageCost = totalStorageCostPerQ * crop.quantityQuintals;

    // Transport cost override or calculated
    const transportPerQ = params.transportCostPerQ;

    // Future Net
    const futureNetPerQ = Math.max(0, futureGrossPricePerQ - totalStorageCostPerQ - transportPerQ);
    const futureNetTotal = futureNetPerQ * crop.quantityQuintals;

    const netDifferenceTotal = futureNetTotal - sellTodayNetTotal;

    let riskLevel: "Low" | "Medium" | "High" = "Low";
    if (params.waitingDays > 14 || crop.storage.shelfLifeCategory === "Short") {
      riskLevel = "High";
    } else if (params.waitingDays > 7 || params.expectedPriceChangePercentage < 0) {
      riskLevel = "Medium";
    }

    return {
      sellTodayNetPerQ,
      sellTodayNetTotal,
      futureGrossPricePerQ,
      totalStorageCost,
      futureNetPerQ,
      futureNetTotal,
      netDifferenceTotal,
      riskLevel,
    };
  },

  getSuggestedAdvisorQuestions(): string[] {
    return [
      "Should I sell my wheat now or wait?",
      "Which buyer gives me the best net price?",
      "Is this offer below my fair price?",
      "Should I store my crop?",
      "What happens to my profit if transport costs increase?",
    ];
  },

  getAIAdvisorResponse(
    crop: SellSmarterCropOption,
    question: string
  ): {
    headerSummary: string;
    bestNetPriceText: string;
    recommendationText: string;
    whyBullets: string[];
    confidence: number;
    disclaimer: string;
  } {
    const bestBuyer = crop.directBuyers[0];
    const mandiNet = crop.mandi.estimatedNetRealizationPerQ;
    const buyerNet = bestBuyer.estimatedNetRealizationPerQ;
    const diff = buyerNet - mandiNet;

    const qLower = question.toLowerCase();

    if (qLower.includes("fair price") || qLower.includes("fair")) {
      const isBelow = bestBuyer.offerPricePerQ < crop.fairPriceRangeMinPerQ;
      return {
        headerSummary: `Fair Price Analysis for ${crop.cropName}`,
        bestNetPriceText: `Current Best Offer: ₹${bestBuyer.offerPricePerQ}/q (Net: ₹${buyerNet}/q)`,
        recommendationText: isBelow
          ? `Your best direct buyer offer (₹${bestBuyer.offerPricePerQ}/q) is currently below your Agrisense Fair Price Range (₹${crop.fairPriceRangeMinPerQ}–₹${crop.fairPriceRangeMaxPerQ}/q). However, its net realization (₹${buyerNet}/q) is still ₹${diff}/q higher than your APMC Mandi net (₹${mandiNet}/q).`
          : `Your best offer (₹${bestBuyer.offerPricePerQ}/q) falls squarely within your Agrisense reference range (₹${crop.fairPriceRangeMinPerQ}–₹${crop.fairPriceRangeMaxPerQ}/q).`,
        whyBullets: [
          `Fair Price Range: ₹${crop.fairPriceRangeMinPerQ} – ₹${crop.fairPriceRangeMaxPerQ}/q`,
          `Current Mandi Expected Net: ₹${mandiNet}/q`,
          `Direct Buyer Net: ₹${buyerNet}/q (+₹${diff}/q higher than mandi)`,
        ],
        confidence: 82,
        disclaimer: "Decision support reference only — not a binding market price guarantee.",
      };
    }

    if (qLower.includes("buyer") || qLower.includes("best net")) {
      return {
        headerSummary: `Best Buyer Realization Analysis`,
        bestNetPriceText: `Top Buyer: ${bestBuyer.businessName} (₹${buyerNet}/q Net)`,
        recommendationText: `${bestBuyer.businessName} provides the highest net realization of ₹${buyerNet}/q after subtracting ₹${bestBuyer.transportCostPerQ}/q estimated transport. They have a ${bestBuyer.paymentReliabilityPercentage}% payment reliability score and payout within ${bestBuyer.paymentTerms}.`,
        whyBullets: [
          `Gross Offer: ₹${bestBuyer.offerPricePerQ}/q`,
          `Estimated Transport: ₹${bestBuyer.transportCostPerQ}/q`,
          `Expected Net Value: ₹${bestBuyer.estimatedNetValue.toLocaleString("en-IN")}`,
          `Payment terms: ${bestBuyer.paymentTerms} (${bestBuyer.paymentReliabilityPercentage}% reliability rating)`,
        ],
        confidence: 88,
        disclaimer: "Transport costs are estimated based on regional logistics rates.",
      };
    }

    if (qLower.includes("store") || qLower.includes("storage")) {
      return {
        headerSummary: `Storage Feasibility Analysis`,
        bestNetPriceText: `Storage Status: ${crop.storage.availableDays} Days Available (₹${crop.storage.storageCostPerQPerDay}/q/day)`,
        recommendationText: crop.storage.available
          ? `You have ${crop.storage.availableDays} days of storage capacity at ₹${crop.storage.storageCostPerQPerDay}/q/day. Storing for 10 days will cost approx ₹${10 * crop.storage.storageCostPerQPerDay * crop.quantityQuintals} for ${crop.quantityQuintals} quintals.`
          : `No farm storage available for ${crop.cropName}. High urgency to complete sale to prevent quality degradation.`,
        whyBullets: [
          `Available Days: ${crop.storage.availableDays} days`,
          `Storage Cost: ₹${crop.storage.storageCostPerQPerDay}/q/day`,
          `Crop Shelf Life Category: ${crop.storage.shelfLifeCategory}`,
        ],
        confidence: 79,
        disclaimer: "Storage costs exclude potential moisture loss shrinkage.",
      };
    }

    // Default response matching crop advisor
    return {
      headerSummary: `Agrisense Selling Advisor View for ${crop.cropName}`,
      bestNetPriceText: `Best Current Net Realization: ₹${buyerNet}/q (${bestBuyer.businessName})`,
      recommendationText: crop.advisor.shortRecommendation,
      whyBullets: crop.advisor.detailedRationale,
      confidence: crop.advisor.confidencePercentage,
      disclaimer: crop.advisor.disclaimer,
    };
  },
};
