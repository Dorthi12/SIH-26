import { z } from "zod";

export const postSchema = z.object({
  caption: z
    .string()
    .min(1, "Caption must contain at least 1 character")
    .max(200, "Caption cannot exceed 200 characters"),

  locationName: z
    .string()
    .trim()
    .min(1, "Location name is required")
    .optional()
    .or(z.literal("")),

  latitude: z.coerce
    .number()
    .min(-90, "Latitude must be >= -90")
    .max(90, "Latitude must be <= 90")
    .nullable()
    .optional(),

  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be >= -180")
    .max(180, "Longitude must be <= 180")
    .nullable()
    .optional(),

  mediaKeys: z.array(z.string()).optional(),
});
