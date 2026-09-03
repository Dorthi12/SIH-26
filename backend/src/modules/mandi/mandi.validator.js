import { z } from "zod";

export const createListingSchema = z.object({
  commodityId: z.string().optional(),
  crop: z.string().trim().optional(),

  variety: z.string().trim().max(100).optional(),

  quantityQuintals: z.coerce
    .number()
    .min(1, "Quantity must be at least 1 quintal")
    .max(100000, "Quantity cannot exceed 100,000 quintals"),

  askingPricePerQuintal: z.coerce
    .number()
    .min(1, "Asking price must be positive")
    .max(1000000, "Price seems too high"),

  grade: z.enum(["GRADE_A", "GRADE_B", "STANDARD"]).optional().default("STANDARD"),

  moisturePercentage: z.coerce.number().min(0).max(100).optional().nullable(),

  organicStatus: z
    .enum(["VERIFIED_ORGANIC", "CLAIMED_ORGANIC", "CONVENTIONAL"])
    .optional()
    .default("CONVENTIONAL"),

  organicCertificateNo: z.string().trim().max(100).optional().nullable(),

  harvestDate: z.string().optional().nullable(),

  productionMethod: z.string().trim().max(200).optional().nullable(),

  productionCostPerQuintal: z.coerce.number().min(0).optional().nullable(),

  location: z
    .string()
    .trim()
    .min(1, "Location is required")
    .max(200),

  locationState: z.string().trim().max(100).optional().nullable(),

  locationDistrict: z.string().trim().max(100).optional().nullable(),

  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),

  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),

  evidenceStatus: z.any().optional().nullable(),

  fairPriceRange: z.any().optional().nullable(),
});

export const createOfferSchema = z.object({
  listingId: z.string().uuid("Invalid listing ID"),

  buyerProfileId: z.string().uuid("Invalid buyer profile ID"),

  crop: z.string().trim().min(1, "Crop name is required"),

  quantityQuintals: z.coerce
    .number()
    .min(1, "Quantity must be at least 1 quintal"),

  offeredPricePerQuintal: z.coerce
    .number()
    .min(1, "Offered price must be positive"),

  qualityCondition: z.string().trim().optional().nullable(),

  moistureCondition: z.string().trim().optional().nullable(),

  pickupType: z.string().trim().optional().nullable(),

  deliveryDate: z.string().optional().nullable(),

  paymentTermsDays: z.coerce.number().min(0).max(90).optional().default(3),

  transportResponsibility: z.string().trim().optional().nullable(),
});

export const counterOfferSchema = z.object({
  offeredPricePerQuintal: z.coerce
    .number()
    .min(1, "Counter price must be positive"),

  quantityQuintals: z.coerce
    .number()
    .min(1, "Quantity must be at least 1 quintal"),

  notes: z.string().trim().max(500).optional().nullable(),
});
