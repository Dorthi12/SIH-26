/**
 * assistantService.ts
 *
 * Frontend abstraction layer for the AgriSense AI Agricultural Assistant.
 *
 * Current state: stub only — no backend calls are made.
 *
 * When the backend is ready, replace the body of `queryAgricultureAssistant()`
 * to call POST /agent/query. The types, component signatures, and all UI
 * code remain unchanged.
 *
 * Backend contract (future):
 *   POST /agent/query
 *   Body:  { farmer_query: string, farmer_id?: string }
 *   Response: AssistantResponse
 */

import type { CropRecommendation } from "../types/recommendation";

// ── Request ────────────────────────────────────────────────────────────────

export interface AssistantRequest {
  farmer_query: string;
  farmer_id?: string;
}

// ── Response ───────────────────────────────────────────────────────────────

export interface AssistantToolUsed {
  id: string;
  label: string;
  description: string;
}

export interface AssistantRecommendationResult {
  crop: string;
  suitability_score: number;
  predicted_yield_t_per_ha: number;
  key_reason: string;
  /** Full recommendation object if available */
  full?: CropRecommendation;
}

/**
 * A single traceable source citation from the RAG backend.
 * Maps to [S1], [S2]... inline references in the answer text.
 * All fields are optional except id and source_title so the component
 * degrades gracefully as the backend evolves.
 */
export interface RAGCitation {
  /** Short label matching inline refs in answer text: "S1", "S2" */
  id: string;
  /** Original chunk ID from Pinecone — for full traceability */
  chunk_id?: string;
  /** Document / scheme title shown to the farmer */
  source_title: string;
  /** Ministry / department / organisation */
  organization?: string;
  /** Section within the document */
  section?: string;
  /** Short relevant passage from the document */
  excerpt?: string;
  page_number?: number;
  government_level?: "central" | "state";
  /** Only true when the backend marks the source as officially verified */
  official_source?: boolean;
  /** Only set when a real, validated URL is available from the backend */
  source_url?: string;
}

/** Status values returned by the RAG backend — mirrors backend enum */
export type RAGStatus =
  | "success"
  | "insufficient_information"
  | "clarification_required"
  | "unsupported_scheme"
  | "error";

export type RAGConfidence = "high" | "medium" | "low";

export type RAGLanguage = "en" | "hi" | "hinglish";

export interface AssistantResponse {
  answer: string;
  tools_used: AssistantToolUsed[];
  recommendation?: AssistantRecommendationResult;
  /** Grounded citations from retrieved government documents */
  citations?: RAGCitation[];
  /** Deterministic confidence based on retrieval quality */
  confidence?: RAGConfidence;
  /** Response status from the RAG pipeline */
  status?: RAGStatus;
  /** Detected language of the query */
  language?: RAGLanguage;
}

// ── Known tool definitions (UI labels) ────────────────────────────────────
// These mirror the tool IDs the backend may return; kept here as the
// single source of truth so the UI can render them without hardcoding
// strings in components.

export const KNOWN_TOOLS: Record<string, Omit<AssistantToolUsed, "id">> = {
  weather_analysis: {
    label: "Weather Analysis",
    description: "Evaluated current and forecast weather conditions for your location.",
  },
  historical_yield: {
    label: "Historical Yield",
    description: "Analysed multi-year crop yield history for your district.",
  },
  crop_knowledge: {
    label: "Crop Knowledge",
    description: "Accessed agronomic knowledge base for crop characteristics.",
  },
  risk_analysis: {
    label: "Risk Analysis",
    description: "Assessed pest, disease, and climate risk factors.",
  },
  soil_analysis: {
    label: "Soil Analysis",
    description: "Reviewed soil compatibility for candidate crops.",
  },
  government_scheme_knowledge: {
    label: "Government Scheme Knowledge",
    description: "Searched verified government scheme documents and official guidelines.",
  },
};

// ── Chat message model (local state only) ─────────────────────────────────

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  /** Only present on assistant messages */
  response?: AssistantResponse;
  /** Whether this message is still being "thought" */
  isThinking?: boolean;
}

// ── Service stub ─────────────────────────────────────────────────────────

/**
 * Query the AgriSense AI assistant.
 *
 * TODO: Replace stub with real fetch:
 *
 *   const res = await fetch("/agent/query", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(request),
 *   });
 *   if (!res.ok) throw new Error(`Assistant query failed: ${res.status}`);
 *   return res.json() as Promise<AssistantResponse>;
 *
 * @throws {Error} When the backend is unavailable or returns an error.
 */
export async function queryAgricultureAssistant(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: AssistantRequest
): Promise<AssistantResponse> {
  // ── STUB: backend not yet connected ──────────────────────────────────────
  // This function intentionally does nothing and never resolves in production.
  // The UI handles the "thinking" state and will display a "backend not
  // connected" message once this rejects, or the real response once connected.
  throw new Error("BACKEND_NOT_CONNECTED");
}
