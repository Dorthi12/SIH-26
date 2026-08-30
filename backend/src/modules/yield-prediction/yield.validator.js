import { z } from "zod";

export const yieldPredictSchema = z.object({
  state: z.string().min(1, "state is required"),
  district: z.string().min(1, "district is required"),
  crop: z.string().min(1, "crop is required"),
  season: z.string().min(1, "season is required"),
  crop_year: z.number().int().positive("crop_year must be positive"),
  area: z.number().positive("area must be positive"),
  yield_lag_1: z.number().min(0),
  yield_lag_2: z.number().min(0),
  yield_lag_3: z.number().min(0),
  historical_mean_yield: z.number().min(0),
  historical_median_yield: z.number().min(0),
  historical_std_yield: z.number().min(0),
  yield_change_1: z.number(),
  yield_change_2: z.number(),
  yield_growth_rate: z.number(),
  historical_cv: z.number().min(0),
});

export const fromHistorySchema = z.object({
  state: z.string().optional().default(""),
  district: z.string().optional().default(""),
  crop: z.string().optional().default(""),
  season: z.string().optional().default(""),
  crop_year: z.number().int().optional().default(0),
  area: z.number().optional().default(0),
  historical_yields: z
    .array(z.number())
    .min(3, "at least 3 historical yield values required"),
});
