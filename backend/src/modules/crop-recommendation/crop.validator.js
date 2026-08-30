import { z } from "zod";

export const recommendSchema = z.object({
  state: z.string().min(1, "state is required"),
  district: z.string().min(1, "district is required"),
  season: z.string().min(1, "season is required"),
  top_k: z.number().int().min(1).max(20).optional().default(5),
});

export const scoreCropSchema = z.object({
  state: z.string().min(1, "state is required"),
  district: z.string().min(1, "district is required"),
  season: z.string().min(1, "season is required"),
  crop: z.string().min(1, "crop is required"),
});
