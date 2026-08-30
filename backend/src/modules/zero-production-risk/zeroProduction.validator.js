import { z } from "zod";

export const zeroProductionPredictSchema = z.object({
  state: z.string().min(1, "state is required"),
  district: z.string().min(1, "district is required"),
  crop: z.string().min(1, "crop is required"),
  season: z.string().min(1, "season is required"),
  area: z.number().positive("area must be positive"),

  historical_zero_rate_global: z.number().min(0).max(1),
  historical_crop_zero_rate: z.number().min(0).max(1),
  historical_state_zero_rate: z.number().min(0).max(1),
  historical_district_zero_rate: z.number().min(0).max(1),
  historical_state_crop_zero_rate: z.number().min(0).max(1),
  historical_district_crop_zero_rate: z.number().min(0).max(1),
  historical_crop_season_zero_rate: z.number().min(0).max(1),
  historical_district_crop_season_zero_rate: z.number().min(0).max(1),

  recent_3yr_zero_rate: z.number().min(0).max(1),
  recent_5yr_zero_rate: z.number().min(0).max(1),
  recent_10yr_zero_rate: z.number().min(0).max(1),

  crop_history_count: z.number().int().nonnegative(),
  state_history_count: z.number().int().nonnegative(),
  district_history_count: z.number().int().nonnegative(),
  state_crop_history_count: z.number().int().nonnegative(),
  district_crop_history_count: z.number().int().nonnegative(),
  district_crop_season_history_count: z.number().int().nonnegative(),

  district_crop_mean_yield: z.number().nonnegative(),
  district_crop_median_yield: z.number().nonnegative(),
  district_crop_std_yield: z.number().nonnegative(),
  district_crop_min_yield: z.number().nonnegative(),
  district_crop_max_yield: z.number().nonnegative(),

  district_crop_mean_area: z.number().nonnegative(),
  district_crop_std_area: z.number().nonnegative(),

  recent_3yr_area_mean: z.number().nonnegative(),
  recent_5yr_area_mean: z.number().nonnegative(),
});

export const batchZeroProductionPredictSchema = z.object({
  records: z.array(zeroProductionPredictSchema).min(1).max(5000),
});
