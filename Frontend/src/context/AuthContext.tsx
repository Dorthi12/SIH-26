/**
 * AuthContext.tsx — Minimal frontend authentication state.
 *
 * Uses localStorage to persist a simple "isAuthenticated" flag and a
 * demo user object. This is a frontend-only implementation — no real
 * token validation occurs. When a real backend is connected, replace
 * the login/logout implementations here; all consuming components stay unchanged.
 */

import { createContext, useContext, useState, useCallback,useEffect, type ReactNode } from "react";
import { logoutUser } from "../services/authService";

export interface SessionUser {
  id?:      string;
  name:     string;
  email:    string;
  provider: "email" | "google" | "guest";
  role:string,
}

interface AuthState {
  isAuthenticated: boolean;
  user:            SessionUser | null;
  /** Call on successful login/signup. Persists session to localStorage. */
  setSession:      (user: SessionUser) => void;
  /** Clear the session (logout). */
  clearSession:    () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "agrisense_session";

function parseOAuthTokenFromUrl(): { user: SessionUser; token: string } | null {
  try {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("accessToken");
    if (!token) return null;

    // Decode JWT payload (base64url)
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);

    const user: SessionUser = {
      id: decoded.id,
      name: decoded.name || decoded.email?.split("@")[0] || "Google User",
      email: decoded.email || "user@gmail.com",
      role:decoded.role,
      provider: "google",
    };

    // Clean URL query parameters without reloading
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);

    return { user, token };
  } catch (e) {
    console.error("Failed to parse OAuth token from URL:", e);
    return null;
  }
}

function readStorage(): SessionUser | null {
  const oauth = parseOAuthTokenFromUrl();
  if (oauth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oauth.user));
    localStorage.setItem("agrisense_token", oauth.token);
    return oauth.user;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === "undefined" || raw === "null") return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readStorage);

  const setSession = useCallback((u: SessionUser) => {
    if (!u) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const clearSession = useCallback(() => {
    logoutUser().catch((e) => console.error("Logout error:", e));
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("agrisense_token");
    setUser(null);
  }, []);

  // Automatic token refresh is now handled on-demand by apiRequest() in api.ts when a 401 JWT expired occurs.

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, setSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
