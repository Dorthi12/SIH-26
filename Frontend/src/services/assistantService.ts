/**
 * assistantService.ts
 *
 * Frontend service layer for the AgriSense Government Scheme AI Assistant.
 *
 * Connects to:  POST /api/rag/chat  (RAG backend, port 8001)
 *
 * Architecture:
 *  - queryAgricultureAssistant() sends the farmer's query to the backend.
 *  - The backend owns all retrieval, generation, citations, and safety.
 *  - This module only transforms the backend JSON into the UI-facing types.
 *  - No backend secrets (Pinecone, Groq) are ever stored here.
 *
 * Backend response fields intentionally NOT exposed to the UI:
 *  - chunk_id, source_id, request_id (internal tracing)
 *  - latency_ms (performance metric)
 *  - retrieval scores / embeddings
 *  - farmer_profile (backend state, not displayed)
 *  - intent (internal classification)
 */

import type { CropRecommendation } from "../types/recommendation";

// ── Config ─────────────────────────────────────────────────────────────────
// VITE_RAG_API_URL is set in .env — no secrets, only the base URL.

const RAG_API_BASE: string = (
  import.meta.env.VITE_RAG_API_URL as string | undefined ?? "http://localhost:8001"
).replace(/\/$/, "");

const RAG_CHAT_ENDPOINT = `${RAG_API_BASE}/api/rag/chat`;

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
  /** Original chunk ID from Pinecone — for full traceability (not displayed) */
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
  /**
   * Follow-up questions suggested by the backend.
   * Rendered as clickable buttons below the answer.
   */
  follow_up_questions?: string[];
  /**
   * Conversation ID from the backend.
   * Passed back on subsequent turns to maintain memory.
   * Not displayed in the UI.
   */
  conversation_id?: string;
}

// ── Known tool definitions (UI labels) ────────────────────────────────────

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

// ── Backend raw response types ─────────────────────────────────────────────
// These mirror the backend ChatResponse schema exactly.
// They are used only in this file and never leak to UI components.

interface BackendSource {
  source_id: string;
  citation_id: string;
  chunk_id: string;
  document_title: string;
  scheme_name: string;
  scheme_id: string;
  page_number: number;
  section: string;
  source_url: string;
  official_source: boolean;
  government_level: string;
  published_date?: string;
  document_version?: string;
}

interface BackendChatResponse {
  conversation_id: string;
  answer: string;
  language: string;
  intent?: string;
  farmer_profile: Record<string, unknown>;
  schemes: Array<{
    scheme_id: string;
    scheme_name: string;
    relevance?: string;
    reason?: string;
  }>;
  sources: BackendSource[];
  follow_up_questions: string[];
  is_disambiguation: boolean;
  latency_ms: number;
  confidence?: string;
  status?: string;
  request_id?: string;
}

// ── Mapping: backend → frontend ───────────────────────────────────────────

function mapSource(src: BackendSource): RAGCitation {
  return {
    // Use citation_id ("S1", "S2") as the display label — never chunk_id
    id: src.citation_id || src.source_id,
    // chunk_id is available for traceability but never rendered to the farmer
    chunk_id: src.chunk_id,
    source_title: src.document_title || src.scheme_name,
    organization: src.scheme_name !== src.document_title ? src.scheme_name : undefined,
    section: src.section || undefined,
    page_number: src.page_number ?? undefined,
    government_level:
      src.government_level === "state" ? "state"
      : src.government_level === "central" ? "central"
      : undefined,
    official_source: src.official_source,
    // Only expose source_url if it is a real non-empty URL
    source_url: src.source_url && src.source_url.startsWith("http") ? src.source_url : undefined,
  };
}

function mapBackendResponse(
  raw: BackendChatResponse,
): AssistantResponse {
  const citations = raw.sources
    .filter((s) => s.citation_id || s.source_id) // skip sources without any ID
    .map(mapSource);

  return {
    answer: raw.answer,
    // No tools_used from this backend — return empty array for UI compat
    tools_used: [],
    citations: citations.length > 0 ? citations : undefined,
    confidence: (raw.confidence as RAGConfidence | undefined) ?? undefined,
    status: (raw.status as RAGStatus | undefined) ?? "success",
    language: (raw.language as RAGLanguage | undefined) ?? "en",
    follow_up_questions: raw.follow_up_questions ?? [],
    // Passed back so the page can maintain conversation continuity
    conversation_id: raw.conversation_id,
  };
}

// ── Service ────────────────────────────────────────────────────────────────

/**
 * Query the AgriSense Government Scheme AI assistant.
 *
 * Sends the farmer's query to the RAG backend's /api/rag/chat endpoint and
 * returns a structured response for the UI to render.
 *
 * @param request  - The farmer's query string.
 * @param conversationId - Optional existing conversation ID for multi-turn memory.
 *                         Pass undefined to start a new conversation.
 * @throws {Error} On network failures, timeouts, or backend errors.
 */
export async function queryAgricultureAssistant(
  request: AssistantRequest,
  conversationId?: string,
): Promise<AssistantResponse> {
  const body: Record<string, unknown> = {
    query: request.farmer_query,
  };

  if (conversationId) {
    body.conversation_id = conversationId;
  }

  let response: Response;
  try {
    response = await fetch(RAG_CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // 35s — slightly longer than the backend's own 30s generation timeout
      signal: AbortSignal.timeout(35_000),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error("TIMEOUT");
    }
    throw new Error("NETWORK_ERROR");
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const json = (await response.json()) as { detail?: { error?: string } | string };
      if (typeof json.detail === "object" && json.detail?.error) {
        detail = json.detail.error;
      } else if (typeof json.detail === "string") {
        detail = json.detail;
      }
    } catch {
      // ignore parse error — use the status text
    }
    throw new Error(`RAG_ERROR:${response.status}:${detail}`);
  }

  const raw = (await response.json()) as BackendChatResponse;
  return mapBackendResponse(raw);
}
