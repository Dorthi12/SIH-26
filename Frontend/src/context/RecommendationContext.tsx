import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { FarmerInput } from "../types/farmer";
import type { CropRecommendation, RecommendationStatus } from "../types/recommendation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RecommendationContextValue {
  farmerInput: FarmerInput | null;
  recommendations: CropRecommendation[];
  status: RecommendationStatus;
  error: string | null;
  requestedAt: string | null;

  setFarmerInput: (input: FarmerInput) => void;
  setRecommendations: (recs: CropRecommendation[]) => void;
  setStatus: (status: RecommendationStatus) => void;
  setError: (err: string | null) => void;
  clearSession: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const RecommendationContext = createContext<RecommendationContextValue | null>(null);

const SESSION_KEY = "agrisense_session";

interface PersistedSession {
  farmerInput: FarmerInput | null;
  recommendations: CropRecommendation[];
  status: RecommendationStatus;
  error: string | null;
  requestedAt: string | null;
}

function loadSession(): PersistedSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

function saveSession(data: PersistedSession): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage may be unavailable (private browsing, storage full)
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function RecommendationProvider({ children }: { children: ReactNode }) {
  const saved = loadSession();

  const [farmerInput, setFarmerInputState] = useState<FarmerInput | null>(
    saved?.farmerInput ?? null
  );
  const [recommendations, setRecommendationsState] = useState<CropRecommendation[]>(
    saved?.recommendations ?? []
  );
  const [status, setStatusState] = useState<RecommendationStatus>(
    saved?.status ?? "idle"
  );
  const [error, setErrorState] = useState<string | null>(saved?.error ?? null);
  const [requestedAt, setRequestedAt] = useState<string | null>(
    saved?.requestedAt ?? null
  );

  // Persist on every meaningful state change
  useEffect(() => {
    saveSession({ farmerInput, recommendations, status, error, requestedAt });
  }, [farmerInput, recommendations, status, error, requestedAt]);

  const setFarmerInput = useCallback((input: FarmerInput) => {
    setFarmerInputState(input);
    setRequestedAt(new Date().toISOString());
  }, []);

  const setRecommendations = useCallback((recs: CropRecommendation[]) => {
    setRecommendationsState(recs);
  }, []);

  const setStatus = useCallback((s: RecommendationStatus) => {
    setStatusState(s);
  }, []);

  const setError = useCallback((err: string | null) => {
    setErrorState(err);
  }, []);

  const clearSession = useCallback(() => {
    setFarmerInputState(null);
    setRecommendationsState([]);
    setStatusState("idle");
    setErrorState(null);
    setRequestedAt(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <RecommendationContext.Provider
      value={{
        farmerInput,
        recommendations,
        status,
        error,
        requestedAt,
        setFarmerInput,
        setRecommendations,
        setStatus,
        setError,
        clearSession,
      }}
    >
      {children}
    </RecommendationContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRecommendation(): RecommendationContextValue {
  const ctx = useContext(RecommendationContext);
  if (!ctx) {
    throw new Error("useRecommendation must be used inside <RecommendationProvider>");
  }
  return ctx;
}
