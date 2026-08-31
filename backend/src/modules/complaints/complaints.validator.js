import { z } from "zod";

export const createComplaintSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(1000, "Description cannot exceed 1000 characters"),
  category: z.enum([
    "IRRIGATION",
    "CROP_STORAGE",
    "MARKET_MONOPOLY",
    "ORGANISED_CRIME",
    "PANCHAYAT_MISJUDGEMENT",
    "OTHERS",
  ]),
  imageKey: z.string().optional().nullable(),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(["pending", "in_progress", "resolved", "rejected"]),
});

export const uploadUrlSchema = z.object({
  fileName: z.string().min(1, "fileName is required"),
  fileType: z.string().min(1, "fileType is required"),
});
