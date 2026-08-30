import express from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  oAuthSuccess,
  verifyEmail,
} from "./auth.controller.js";
import { registerSchema, loginSchema } from "./auth.validator.js";
import passport from "passport";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.get("/verify-email", verifyEmail);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  oAuthSuccess,
);

export default router;
