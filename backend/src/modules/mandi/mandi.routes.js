import express from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createListingSchema,
  createOfferSchema,
  counterOfferSchema,
} from "./mandi.validator.js";

import {
  // Commodity
  getCommodities,
  // Mandi Markets
  getMandiMarkets,
  // Mandi Prices
  getMandiPrices,
  // Crop Listings
  getListings,
  getListingById,
  createListing,
  // Buyer Profiles
  getBuyerProfiles,
  getBuyerProfileById,
  // Offers
  getOffers,
  createOffer,
  counterOffer,
  acceptOffer,
  // Deals
  getDeals,
  getDealById,
  // ML / Advisory (hardcoded placeholders)
  getFairPriceEstimate,
  getSellingAdvisory,
  getLogisticsQuote,
  getCropRotationCheck,
  getLandAllocationCheck,
} from "./mandi.controller.js";

const router = express.Router();

// ── Reference Data ──────────────────────────────────────────────────────────
router.get("/commodities", getCommodities);
router.get("/markets", getMandiMarkets);
router.get("/prices", getMandiPrices);

// ── Crop Listings ───────────────────────────────────────────────────────────
router.get("/listings", getListings);
router.get("/listings/:id", getListingById);
router.post("/listings", validate(createListingSchema), createListing);

// ── Buyer Profiles ──────────────────────────────────────────────────────────
router.get("/buyers", getBuyerProfiles);
router.get("/buyers/:id", getBuyerProfileById);

// ── Offers & Negotiation ────────────────────────────────────────────────────
router.get("/offers", getOffers);
router.post("/offers", validate(createOfferSchema), createOffer);
router.patch("/offers/:id/counter", validate(counterOfferSchema), counterOffer);
router.patch("/offers/:id/accept", acceptOffer);

// ── Deals ───────────────────────────────────────────────────────────────────
router.get("/deals", getDeals);
router.get("/deals/:id", getDealById);

// ── ML / Advisory Endpoints (hardcoded placeholders) ────────────────────────
router.get("/advisory/fair-price", getFairPriceEstimate);
router.get("/advisory/selling", getSellingAdvisory);
router.get("/advisory/logistics", getLogisticsQuote);
router.get("/advisory/crop-rotation", getCropRotationCheck);
router.get("/advisory/land-allocation", getLandAllocationCheck);

export default router;
