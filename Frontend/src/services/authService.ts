/**
 * authService.ts — AgriSense Authentication Integration Boundary
 *
 * This file defines the authentication contract for AgriSense.
 * Currently returns structured results without hitting a real backend.
 *
 * TO CONNECT A REAL BACKEND:
 *   1. Replace the stub implementations below with real API calls.
 *   2. Wire Google OAuth: set VITE_GOOGLE_CLIENT_ID and call the real provider.
 *   3. Store the returned JWT/session token in localStorage or a secure cookie.
 *   4. The component API (AuthResult, AuthUser) stays the same — no UI changes needed.
 *
 * DO NOT add any secrets (client_secret, API keys) to this file.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id:    string;
  name:  string;
  email: string;
  provider: "email" | "google";
}

export type AuthResult =
  | { ok: true;  user: AuthUser }
  | { ok: false; code: AuthErrorCode; message: string };

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_TAKEN"
  | "WEAK_PASSWORD"
  | "NETWORK_ERROR"
  | "GOOGLE_CANCELLED"
  | "GOOGLE_ERROR"
  | "SERVER_ERROR"
  | "NOT_IMPLEMENTED";

// ── Email Login ────────────────────────────────────────────────────────────────

/**
 * Sign in with email + password.
 * Replace body with: POST /api/v1/auth/login
 */
export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  // ── Integration boundary ──────────────────────────────────────────────────
  // When backend is ready, uncomment and adapt:
  //
  // const res = await fetch("/api/v1/auth/login", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ email, password }),
  // });
  // const data = await res.json();
  // if (!res.ok) return { ok: false, code: "INVALID_CREDENTIALS", message: data.message ?? "Invalid credentials." };
  // return { ok: true, user: data.user };
  // ─────────────────────────────────────────────────────────────────────────

  void email; void password;
  return {
    ok: false,
    code: "NOT_IMPLEMENTED",
    message: "Authentication backend not yet connected. This is a frontend preview.",
  };
}

// ── Email Signup ───────────────────────────────────────────────────────────────

/**
 * Create a new account with email + password.
 * Replace body with: POST /api/v1/auth/signup
 */
export async function signupWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  void name; void email; void password;
  return {
    ok: false,
    code: "NOT_IMPLEMENTED",
    message: "Authentication backend not yet connected. This is a frontend preview.",
  };
}

// ── Google OAuth ───────────────────────────────────────────────────────────────

/**
 * Initiate Google OAuth sign-in.
 *
 * When backend/OAuth is ready:
 *   Option A (Firebase): import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
 *   Option B (GIS):      use window.google.accounts.oauth2.initTokenClient(...)
 *   Option C (Supabase): supabase.auth.signInWithOAuth({ provider: "google" })
 *
 * NEVER put GOOGLE_CLIENT_SECRET here. Client ID is safe in an env var.
 *   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
 */
export async function loginWithGoogle(): Promise<AuthResult> {
  // const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  // if (!clientId) console.warn("VITE_GOOGLE_CLIENT_ID not set");
  //
  // ... initiate Google flow here ...

  return {
    ok: false,
    code: "NOT_IMPLEMENTED",
    message: "Google authentication not yet configured.",
  };
}

// ── Password Reset ─────────────────────────────────────────────────────────────

/**
 * Request a password reset email.
 * Replace body with: POST /api/v1/auth/forgot-password
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  void email;
  return {
    ok: false,
    code: "NOT_IMPLEMENTED",
    message: "Password reset is not yet available.",
  };
}
