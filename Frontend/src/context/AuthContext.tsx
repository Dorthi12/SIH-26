/**
 * AuthContext.tsx — Minimal frontend authentication state.
 *
 * Uses localStorage to persist a simple "isAuthenticated" flag and a
 * demo user object. This is a frontend-only implementation — no real
 * token validation occurs. When a real backend is connected, replace
 * the login/logout implementations here; all consuming components stay unchanged.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface SessionUser {
  name:     string;
  email:    string;
  provider: "email" | "google" | "guest";
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

function readStorage(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(readStorage);

  const setSession = useCallback((u: SessionUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

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
