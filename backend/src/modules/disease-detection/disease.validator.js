import { z } from "zod";

export const diseasePredictSchema = z.object({
  imageUrl: z.string().url("A valid image URL is required"),
});
