import prisma from "../../config/db.js";

// ─────────────────────────────────────────────────────────────────────────────
// COMMODITY ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const getCommodities = async (req, res, next) => {
  try {
    const { season, category, search } = req.query;
    const where = {};

    if (season) where.season = season;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { variety: { contains: search, mode: "insensitive" } },
      ];
    }

    const commodities = await prisma.commodity.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return res.status(200).json({ success: true, data: commodities });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MANDI MARKET ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const getMandiMarkets = async (req, res, next) => {
  try {
    const { state, district, search } = req.query;
    const where = { isActive: true };

    if (state) where.state = { contains: state, mode: "insensitive" };
    if (district) where.district = { contains: district, mode: "insensitive" };
    if (search) where.name = { contains: search, mode: "insensitive" };

    const markets = await prisma.mandiMarket.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return res.status(200).json({ success: true, data: markets });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MANDI PRICE ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const getMandiPrices = async (req, res, next) => {
  try {
    const { commodityId, mandiId, days = 7 } = req.query;
    const where = {};

    if (commodityId) where.commodityId = commodityId;
    if (mandiId) where.mandiId = mandiId;

    // Default to last N days
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - Number(days));
    where.arrivalDate = { gte: fromDate };

    const prices = await prisma.mandiPrice.findMany({
      where,
      include: {
        commodity: { select: { name: true, variety: true, category: true, mspPerQuintal: true } },
        mandi: { select: { name: true, state: true, district: true } },
      },
      orderBy: { arrivalDate: "desc" },
      take: 200,
    });

    return res.status(200).json({ success: true, data: prices });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CROP LISTING ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const getListings = async (req, res, next) => {
  try {
    const { commodityId, grade, organicStatus, page = 1, limit = 20 } = req.query;
    const where = { isActive: true };

    if (commodityId) where.commodityId = commodityId;
    if (grade) where.grade = grade;
    if (organicStatus) where.organicStatus = organicStatus;

    const skip = (Number(page) - 1) * Number(limit);

    const [listings, total] = await Promise.all([
      prisma.mandiCropListing.findMany({
        where,
        include: {
          commodity: { select: { name: true, variety: true, mspPerQuintal: true, category: true } },
          user: { select: { id: true, name: true, city: true, state: true, preSignedUrl: true } },
          _count: { select: { offers: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.mandiCropListing.count({ where }),
    ]);

    // Transform to match frontend's CropListing shape
    const formattedListings = listings.map((l) => ({
      id: l.id,
      farmerId: l.userId,
      farmerName: l.user.name,
      farmerLocation: l.location,
      farmerRating: 4.5 + Math.random() * 0.5, // Placeholder — future reputation system
      farmerCompletedTransactions: Math.floor(20 + Math.random() * 30),
      crop: l.commodity.name,
      variety: l.variety || l.commodity.variety || "",
      quantityQuintals: l.quantityQuintals,
      location: l.location,
      harvestDate: l.harvestDate?.toISOString().split("T")[0] || "",
      productionMethod: l.productionMethod || "Conventional",
      productionCostPerQuintal: l.productionCostPerQuintal || 0,
      grade: l.grade === "GRADE_A" ? "Grade A" : l.grade === "GRADE_B" ? "Grade B" : "Standard",
      moisturePercentage: l.moisturePercentage || 0,
      organicStatus:
        l.organicStatus === "VERIFIED_ORGANIC"
          ? "Verified Organic"
          : l.organicStatus === "CLAIMED_ORGANIC"
            ? "Claimed Organic (Pending Evidence)"
            : "Conventional",
      organicCertificateNo: l.organicCertificateNo || undefined,
      evidenceStatus: l.evidenceStatus || {
        organic: "Not Applicable",
        qualityReport: "Pending",
        productionCost: "Estimated",
        harvestDate: "Pending",
      },
      fairPriceRange: l.fairPriceRange || { min: 0, max: 0, breakdown: {} },
      askingPricePerQuintal: l.askingPricePerQuintal,
      verifiedCrop: l.verifiedCrop,
      verifiedFarmer: l.verifiedFarmer,
      offerCount: l._count.offers,
    }));

    return res.status(200).json({
      success: true,
      data: formattedListings,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (error) {
    next(error);
  }
};

export const getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listing = await prisma.mandiCropListing.findUnique({
      where: { id },
      include: {
        commodity: true,
        user: { select: { id: true, name: true, city: true, state: true, preSignedUrl: true } },
        offers: {
          include: {
            buyerProfile: { select: { name: true, type: true, rating: true, verified: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    return res.status(200).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};

export const createListing = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      commodityId,
      crop,
      variety,
      quantityQuintals,
      askingPricePerQuintal,
      grade,
      moisturePercentage,
      organicStatus,
      organicCertificateNo,
      harvestDate,
      productionMethod,
      productionCostPerQuintal,
      location,
      locationState,
      locationDistrict,
      latitude,
      longitude,
      evidenceStatus,
      fairPriceRange,
    } = req.body;

    let resolvedCommodityId = commodityId;
    if (!resolvedCommodityId || resolvedCommodityId === "placeholder") {
      const cropName = crop || "Wheat";
      let commodity = await prisma.commodity.findFirst({
        where: { name: { contains: cropName, mode: "insensitive" } },
      });
      if (!commodity) {
        commodity = await prisma.commodity.create({
          data: {
            name: cropName,
            variety: variety || null,
            category: "Other",
          },
        });
      }
      resolvedCommodityId = commodity.id;
    }

    const listing = await prisma.mandiCropListing.create({
      data: {
        userId,
        commodityId: resolvedCommodityId,
        variety,
        quantityQuintals,
        askingPricePerQuintal,
        grade: grade || "STANDARD",
        moisturePercentage,
        organicStatus: organicStatus || "CONVENTIONAL",
        organicCertificateNo,
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        productionMethod,
        productionCostPerQuintal,
        location,
        locationState,
        locationDistrict,
        latitude,
        longitude,
        verifiedFarmer: true,
        verifiedCrop: false,
        evidenceStatus,
        fairPriceRange,
      },
      include: {
        commodity: { select: { name: true, variety: true } },
      },
    });

    return res.status(201).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// BUYER PROFILE ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const getBuyerProfiles = async (req, res, next) => {
  try {
    const { type, verified, search } = req.query;
    const where = {};

    if (type) where.type = type;
    if (verified === "true") where.verified = true;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const buyers = await prisma.mandiBuyerProfile.findMany({
      where,
      orderBy: { rating: "desc" },
    });

    // Transform to match frontend's BuyerProfile shape
    const formattedBuyers = buyers.map((b) => ({
      id: b.id,
      name: b.name,
      type: b.type === "FOOD_PROCESSOR"
        ? "Food Processor"
        : b.type === "WHOLESALER"
          ? "Wholesaler"
          : b.type === "EXPORTER"
            ? "Exporter"
            : b.type === "RETAIL_CHAIN"
              ? "Retail Chain"
              : b.type === "INSTITUTIONAL_BUYER"
                ? "Institutional Buyer"
                : "Private Agro Co",
      location: b.location,
      verified: b.verified,
      completedTransactions: b.completedTransactions,
      paymentReliabilityPct: b.paymentReliabilityPct,
      avgPaymentDays: b.avgPaymentDays,
      rating: b.rating,
      transparencyScore: b.transparencyScore,
      activeDisputes: b.activeDisputes,
      resolvedDisputes: b.resolvedDisputes,
      reputationBreakdown: b.reputationBreakdown || {},
      activeRequirementsCount: 0,
      purchaseCategories: b.purchaseCategories,
    }));

    return res.status(200).json({ success: true, data: formattedBuyers });
  } catch (error) {
    next(error);
  }
};

export const getBuyerProfileById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const buyer = await prisma.mandiBuyerProfile.findUnique({
      where: { id },
      include: {
        offers: { take: 10, orderBy: { createdAt: "desc" } },
        deals: { take: 10, orderBy: { createdAt: "desc" } },
      },
    });

    if (!buyer) {
      return res.status(404).json({ success: false, message: "Buyer profile not found" });
    }

    return res.status(200).json({ success: true, data: buyer });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// OFFER ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const getOffers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    const where = { userId };

    if (status) where.status = status;

    const offers = await prisma.mandiOffer.findMany({
      where,
      include: {
        listing: {
          select: { id: true, variety: true, location: true, askingPricePerQuintal: true },
        },
        buyerProfile: {
          select: { id: true, name: true, type: true, rating: true, verified: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to match frontend's Offer shape
    const formattedOffers = offers.map((o) => ({
      id: o.id,
      listingId: o.listingId,
      buyerId: o.buyerProfileId,
      buyerName: o.buyerProfile.name,
      farmerId: o.userId,
      farmerName: req.user.name || "Farmer",
      crop: o.crop,
      quantityQuintals: o.quantityQuintals,
      offeredPricePerQuintal: o.offeredPricePerQuintal,
      qualityCondition: o.qualityCondition || "",
      moistureCondition: o.moistureCondition || "",
      pickupType: o.pickupType || "Buyer Pickup",
      deliveryDate: o.deliveryDate?.toISOString().split("T")[0] || "",
      paymentTermsDays: o.paymentTermsDays,
      transportResponsibility: o.transportResponsibility || "Buyer Pays",
      status: o.status.charAt(0) + o.status.slice(1).toLowerCase(),
      negotiationTimeline: o.negotiationHistory || [],
    }));

    return res.status(200).json({ success: true, data: formattedOffers });
  } catch (error) {
    next(error);
  }
};

export const createOffer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      listingId,
      buyerProfileId,
      crop,
      quantityQuintals,
      offeredPricePerQuintal,
      qualityCondition,
      moistureCondition,
      pickupType,
      deliveryDate,
      paymentTermsDays,
      transportResponsibility,
    } = req.body;

    // Verify listing exists
    const listing = await prisma.mandiCropListing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const offer = await prisma.mandiOffer.create({
      data: {
        listingId,
        buyerProfileId,
        userId: listing.userId,
        crop,
        quantityQuintals,
        offeredPricePerQuintal,
        qualityCondition,
        moistureCondition,
        pickupType,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        paymentTermsDays: paymentTermsDays || 3,
        transportResponsibility,
        status: "PENDING",
        negotiationHistory: [
          {
            version: 1.0,
            by: "buyer",
            price: offeredPricePerQuintal,
            quantity: quantityQuintals,
            notes: "Initial buyer offer",
            timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
          },
        ],
      },
      include: {
        buyerProfile: { select: { name: true } },
      },
    });

    return res.status(201).json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
};

export const counterOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { offeredPricePerQuintal, quantityQuintals, notes } = req.body;

    const existing = await prisma.mandiOffer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    const history = Array.isArray(existing.negotiationHistory) ? existing.negotiationHistory : [];
    const newVersion = Number((history.length * 0.1 + 1.0).toFixed(1));

    const updated = await prisma.mandiOffer.update({
      where: { id },
      data: {
        offeredPricePerQuintal,
        quantityQuintals,
        status: "COUNTERED",
        negotiationHistory: [
          ...history,
          {
            version: newVersion,
            by: "farmer",
            price: offeredPricePerQuintal,
            quantity: quantityQuintals,
            notes: notes || "Counter proposal",
            timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
          },
        ],
      },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const acceptOffer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const offer = await prisma.mandiOffer.findUnique({
      where: { id },
      include: { buyerProfile: true, listing: true },
    });

    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    // Update offer status
    await prisma.mandiOffer.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });

    // Create a deal
    const deal = await prisma.mandiDeal.create({
      data: {
        offerId: offer.id,
        buyerProfileId: offer.buyerProfileId,
        userId: offer.userId,
        crop: offer.crop,
        variety: offer.listing?.variety || "",
        quantityQuintals: offer.quantityQuintals,
        pricePerQuintal: offer.offeredPricePerQuintal,
        totalValue: offer.offeredPricePerQuintal * offer.quantityQuintals,
        qualityGrade: offer.qualityCondition || "Standard",
        moisturePercentage: offer.listing?.moisturePercentage,
        pickupLocation: offer.listing?.location || "",
        deliveryDate: offer.deliveryDate,
        paymentTerms: `Payment within ${offer.paymentTermsDays} days of confirmation`,
        transportResponsibility: offer.transportResponsibility || "Buyer Pays",
        buyerConfirmed: true,
        farmerConfirmed: true,
        termsLocked: true,
        paymentState: "PAYMENT_PROTECTED",
      },
    });

    return res.status(201).json({ success: true, data: deal });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DEAL ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const getDeals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { paymentState } = req.query;
    const where = { userId };

    if (paymentState) where.paymentState = paymentState;

    const deals = await prisma.mandiDeal.findMany({
      where,
      include: {
        buyerProfile: { select: { name: true, type: true } },
        offer: { select: { id: true, negotiationHistory: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to match frontend's SmartDeal shape
    const formattedDeals = deals.map((d) => ({
      id: d.id,
      offerId: d.offerId,
      dealVersion: "Version 2.0 (Final Locked)",
      buyerId: d.buyerProfileId,
      buyerName: d.buyerProfile.name,
      farmerId: d.userId,
      farmerName: req.user.name || "Farmer",
      crop: d.crop,
      variety: d.variety || "",
      quantityQuintals: d.quantityQuintals,
      pricePerQuintal: d.pricePerQuintal,
      totalValue: d.totalValue,
      qualityGrade: d.qualityGrade || "Standard",
      moisturePercentage: d.moisturePercentage || 0,
      pickupLocation: d.pickupLocation || "",
      deliveryDate: d.deliveryDate?.toISOString().split("T")[0] || "",
      paymentTerms: d.paymentTerms || "",
      transportResponsibility: d.transportResponsibility || "",
      buyerConfirmed: d.buyerConfirmed,
      farmerConfirmed: d.farmerConfirmed,
      termsLocked: d.termsLocked,
      paymentProtectionState: d.paymentState
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" "),
    }));

    return res.status(200).json({ success: true, data: formattedDeals });
  } catch (error) {
    next(error);
  }
};

export const getDealById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deal = await prisma.mandiDeal.findUnique({
      where: { id },
      include: {
        buyerProfile: true,
        offer: { include: { listing: true } },
      },
    });

    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    return res.status(200).json({ success: true, data: deal });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HARDCODED ML / ADVISORY ENDPOINTS (Placeholders for future ML integration)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fair Price Engine — returns a computed fair price range for a crop listing.
 * Currently returns hardcoded data. Will be coupled to ML model later.
 */
export const getFairPriceEstimate = async (req, res, next) => {
  try {
    const { crop, location, grade, moisturePercentage, productionCostPerQuintal, organicStatus } = req.query;

    const basePrices = {
      Wheat: 2300, Paddy: 2300, Rice: 3800, "Rice (Basmati)": 4200, Gram: 5200, Potato: 1700,
      Maize: 2200, Soybean: 5000, Cotton: 7100, Onion: 2200, Tomato: 3000,
    };
    const basePrice = basePrices[crop] || 2500;
    const prodCost = Number(productionCostPerQuintal) || basePrice * 0.8;

    const qualityPremium = grade === "Grade A" || grade === "GRADE_A" ? 180 : grade === "Grade B" || grade === "GRADE_B" ? 80 : 0;
    const gradePremium = grade === "Grade A" || grade === "GRADE_A" ? 100 : 50;
    const organicPremium = organicStatus === "VERIFIED_ORGANIC" || organicStatus === "Verified Organic" ? 400 : organicStatus === "CLAIMED_ORGANIC" ? 100 : 0;
    const demandPremium = Math.round(basePrice * 0.05);
    const transportDeduction = Math.round(basePrice * 0.03);
    const storageDeduction = Math.round(basePrice * 0.015);

    const fairMin = basePrice + qualityPremium + gradePremium + organicPremium + demandPremium - transportDeduction - storageDeduction;
    const fairMax = fairMin + Math.round(basePrice * 0.06);

    return res.status(200).json({
      success: true,
      data: {
        fairPriceRange: {
          min: fairMin,
          max: fairMax,
          breakdown: {
            regionalRef: basePrice,
            productionCost: prodCost,
            qualityPremium,
            gradePremium,
            organicPremium,
            demandPremium,
            transportDeduction,
            storageDeduction,
          },
        },
        confidence: 0.78,
        modelName: "fair-price-engine-v1-placeholder",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Selling Advisory — recommends whether to sell now or wait.
 * Currently returns hardcoded data. Will be coupled to ML model later.
 */
export const getSellingAdvisory = async (req, res, next) => {
  try {
    const { crop, askingPrice, productionCost } = req.query;
    const asking = Number(askingPrice) || 2800;
    const prodCost = Number(productionCost) || 2000;
    const margin = asking - prodCost;

    return res.status(200).json({
      success: true,
      data: {
        crop: crop || "Wheat",
        currentBestOfferPerQuintal: asking - 30,
        farmerProductionCostPerQuintal: prodCost,
        estimatedMarginPerQuintal: margin,
        marketTrend: "Increasing",
        storageAvailableDays: 20,
        recommendation: "CONSIDER WAITING 5–10 DAYS",
        confidencePct: 74,
        reasons: [
          "Regional mandi arrivals are currently down by 14%, tightening market supply.",
          "Buyer demand from food processors in nearby hubs is projected to rise next week.",
          `Your current best offer is ₹30/q below the upper Agrisense fair reference range.`,
          "Storage is safely available in your plot shed for up to 20 days.",
        ],
        sellNowScenario: {
          pricePerQuintal: asking - 30,
          expectedNetTotal: (asking - 30) * 250 - 18500,
        },
        waitScenario: {
          expectedNetMin: asking * 250 - 18500 - 4000,
          expectedNetMax: (asking + 120) * 250 - 18500 - 4000,
          estimatedStorageCost: 4000,
          riskLevel: "Medium",
        },
        modelName: "selling-advisory-v1-placeholder",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logistics Quote — estimates transport cost.
 * Currently returns hardcoded data. Will be coupled to ML model later.
 */
export const getLogisticsQuote = async (req, res, next) => {
  try {
    const { origin, destination, quantityQuintals } = req.query;
    const qty = Number(quantityQuintals) || 100;
    const distanceKm = 80 + Math.round(Math.random() * 200);
    const baseCostPerKmPerQuintal = 0.8;
    const totalCost = Math.round(distanceKm * qty * baseCostPerKmPerQuintal);

    return res.status(200).json({
      success: true,
      data: {
        origin: origin || "Farm Gate, Barabanki",
        destination: destination || "ABC Foods, Lucknow",
        distanceKm,
        quantityQuintals: qty,
        vehicleType: qty > 200 ? "Large Truck (14T)" : "Standard Truck (9T)",
        estimatedTransportCost: totalCost,
        estimatedDeliveryDays: distanceKm > 200 ? 3 : distanceKm > 100 ? 2 : 1,
        costPerQuintal: Math.round(totalCost / qty),
        options: [
          { type: "Standard Truck", cost: totalCost, days: 2, savingVsIndividual: 0 },
          { type: "Large Truck", cost: Math.round(totalCost * 0.85), days: 2, savingVsIndividual: Math.round(totalCost * 0.15) },
          { type: "Aggregated Multi-Farmer Truck", cost: Math.round(totalCost * 0.65), days: 3, savingVsIndividual: Math.round(totalCost * 0.35) },
        ],
        modelName: "logistics-quote-v1-placeholder",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crop Rotation Check — validates crop rotation for soil health.
 * Currently returns hardcoded data. Will be coupled to ML model later.
 */
export const getCropRotationCheck = async (req, res, next) => {
  try {
    const { currentCrop, previousCrop, plotName } = req.query;

    const isConsecutive = currentCrop?.toLowerCase() === previousCrop?.toLowerCase();

    if (isConsecutive) {
      return res.status(200).json({
        success: true,
        data: {
          status: "Consecutive Detected",
          isWarning: true,
          message: `⚠ Crop Rotation Alert! ${currentCrop} was grown on ${plotName || "this plot"} previously. Planting ${currentCrop} again violates crop-rotation safeguard for soil health and pest prevention.`,
          recommendedAlternatives: [
            { crop: "Gram / Chickpea", category: "Legume", benefit: "Fixes atmospheric nitrogen & replenishes soil organic carbon" },
            { crop: "Mustard", category: "Oilseed", benefit: "Breaks cereal pest cycles and improves soil bio-fumigation" },
            { crop: "Potato", category: "Tuber", benefit: "High cash yield with quick 90-day maturity cycle" },
          ],
          modelName: "crop-rotation-v1-placeholder",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        status: "Healthy",
        isWarning: false,
        message: `✓ Healthy Rotation. Rotating from ${previousCrop || "previous crop"} to ${currentCrop || "new crop"} maintains soil nitrogen and protects field health.`,
        recommendedAlternatives: [],
        modelName: "crop-rotation-v1-placeholder",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Land Allocation Check — validates private company land allocation limits.
 * Currently returns hardcoded data. Will be coupled to ML model later.
 */
export const getLandAllocationCheck = async (req, res, next) => {
  try {
    const { totalLandAcres, requestedLandAcres } = req.query;
    const total = Number(totalLandAcres) || 8.5;
    const requested = Number(requestedLandAcres) || 2.5;
    const maxPct = 40.0;
    const allocationPct = (requested / total) * 100;
    const isWithinLimit = allocationPct <= maxPct;
    const maxAllowed = total * (maxPct / 100);

    return res.status(200).json({
      success: true,
      data: {
        allocationPercentage: Number(allocationPct.toFixed(1)),
        maxAllowedAcres: Number(maxAllowed.toFixed(1)),
        isWithinLimit,
        remainingProtectedLandAcres: Number((total - requested).toFixed(1)),
        warningMessage: isWithinLimit
          ? null
          : `🔴 LAND PROTECTION LIMIT EXCEEDED! Private company requested ${requested} acres (${allocationPct.toFixed(1)}%). Agrisense platform safeguard limits cash-crop contracting to max 40% (${maxAllowed.toFixed(1)} acres).`,
        modelName: "land-allocation-v1-placeholder",
      },
    });
  } catch (error) {
    next(error);
  }
};
