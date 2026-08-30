import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  email: z.string().email("Please provide a valid email address"),
  password: z
    .string()
    .regex(
      passwordRegex,
      "Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, and one number",
    ),
  role: z.enum(["USER", "LEADER", "ADMINISTRATOR", "REPRESENTATIVE"]),
  dob: z.coerce.date(),
  gender: z.enum(["Male", "Female", "Others", "Prefer not to say"]),
  loggedIn: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password cannot be empty"),
  loggedIn: z.boolean().optional(),
});
