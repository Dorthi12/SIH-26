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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id:    string;
  name:  string;
  email: string;
  role:string;
  provider: "email" | "google" | "guest";
}

export type AuthResult =
  | { ok: true;  user: AuthUser; accessToken?: string; code?: never; message?: never }
  | { ok: false; code: AuthErrorCode; message: string; user?: never; accessToken?: never };

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

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      const errorMessage =
        data.message ??
        (Array.isArray(data.errors) && data.errors[0]?.message) ??
        "Invalid email or password.";

      return {
        ok: false,
        code: res.status === 401 ? "INVALID_CREDENTIALS" : "SERVER_ERROR",
        message: errorMessage,
      };
    }

    if (data.accessToken) {
      localStorage.setItem("agrisense_token", data.accessToken);
    }

    const user: AuthUser = data.user ?? {
      id: "1",
      name: email.split("@")[0],
      email,
      role:"USER",
      provider: "email",
    };

    return {
      ok: true,
      user,
      accessToken: data.accessToken,
    };
  } catch (error) {
    console.error("Login fetch error:", error);

    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the backend server. Please make sure the backend is running on port 5000.",
    };
  }
}

// ── Email Signup ───────────────────────────────────────────────────────────────

export async function signupWithEmail(
  name: string,
  email: string,
  password: string,
  role: string,
  dob: string,
  gender: string
): Promise<AuthResult> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        dob,
        gender,
      }),
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      const errorMessage =
        data.message ??
        (Array.isArray(data.errors) && data.errors[0]?.message) ??
        "Registration failed. Please check the entered details.";

      const code: AuthErrorCode =
        data.message?.toLowerCase().includes("already exists")
          ? "EMAIL_TAKEN"
          : "INVALID_CREDENTIALS";

      return {
        ok: false,
        code,
        message: errorMessage,
      };
    }

    if (data.accessToken) {
      localStorage.setItem("agrisense_token", data.accessToken);
    }

    const user: AuthUser = data.user ?? {
      id: "1",
      name: name || email.split("@")[0],
      email,
      provider: "email",
      role:"USER"
    };

    return {
      ok: true,
      user,
      accessToken: data.accessToken,
    };
  } catch (error) {
    console.error("Signup fetch error:", error);

    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the backend server. Please make sure the backend is running on port 5000.",
    };
  }
}

// ── Google OAuth ───────────────────────────────────────────────────────────────

export async function loginWithGoogle(): Promise<AuthResult> {
  // If backend is running, initiate Google OAuth redirect flow
  try {
    window.location.href = `${BACKEND_URL}/auth/google`;
    return {
      ok: false,
      code: "NOT_IMPLEMENTED",
      message: "Redirecting to Google...",
    };
  } catch {
    return {
      ok: false,
      code: "GOOGLE_ERROR",
      message: "Google authentication could not be initiated.",
    };
  }
}

// ── Logout ─────────────────────────────────────────────────────────────────────

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout request failed:", error);
  } finally {
    localStorage.removeItem("agrisense_session");
    localStorage.removeItem("agrisense_token");
  }
}

// ── Password Reset ─────────────────────────────────────────────────────────────

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      return {
        ok: false,
        code: "SERVER_ERROR",
        message: "Password reset request failed.",
      };
    }

    return {
      ok: true,
      user: { id: "", name: "", email, provider: "email",role:"user" },
    };
  } catch {
    return {
      ok: false,
      code: "NOT_IMPLEMENTED",
      message: "Password reset service is not configured yet.",
    };
  }
}


export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    if (!data.accessToken) {
      return null;
    }

    localStorage.setItem("agrisense_token", data.accessToken);

    return data.accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
}