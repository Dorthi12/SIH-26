/**
 * Assistant.tsx — /assistant route
 *
 * AI Agricultural Assistant page.
 *
 * Architecture:
 *  - All conversation state is React local state (no persistence).
 *  - queryAgricultureAssistant() is called on every send; the stub throws
 *    BACKEND_NOT_CONNECTED which we catch and surface as a clear UI message.
 *  - When the backend is wired up, ONLY assistantService.ts changes.
 *
 * Sections:
 *  1. Page header  — AgriSense AI branding
 *  2. Message list — scrollable conversation
 *  3. Input area   — pinned to bottom
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Sparkles, RotateCcw, Info } from "lucide-react";
import { useScrollReveal } from "../utils/useScrollReveal";

import { AssistantMessage } from "../components/assistant/AssistantMessage";
import { AssistantInput } from "../components/assistant/AssistantInput";
import { AssistantWelcome } from "../components/assistant/AssistantWelcome";

import {
  queryAgricultureAssistant,
  type ChatMessage,
  type AssistantRequest,
} from "../services/assistantService";

// ── ID generator ─────────────────────────────────────────────────────────

function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Page header ────────────────────────────────────────────────────────────

function AssistantHeader({ onClear, hasMessages }: { onClear: () => void; hasMessages: boolean }) {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-ivory-200 shadow-nav">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest shadow-sm ai-glow">
            <Leaf className="h-4.5 w-4.5 text-white" strokeWidth={2} />
            <Sparkles
              className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-amber animate-pulse"
              strokeWidth={2.5}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-charcoal leading-none">
              AgriSense <span className="text-forest">AI</span>
            </p>
            <p className="text-2xs text-charcoal-muted/60 mt-0.5 leading-none">
              Agricultural Assistant
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Backend-not-connected notice */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber/25 bg-amber/8 px-3 py-1">
            <Info className="h-3 w-3 text-amber-600 shrink-0" />
            <span className="text-2xs font-medium text-amber-700">Backend not connected</span>
          </div>
          {hasMessages && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear conversation"
              title="Clear conversation"
              className="flex items-center gap-1.5 rounded-lg border border-ivory-300 bg-white px-3 py-1.5 text-xs font-medium text-charcoal-muted hover:border-forest/20 hover:text-charcoal transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export function Assistant() {
  const navigate = useNavigate();
  const revealRef = useScrollReveal();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isPending, setIsPending] = useState(false);

  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  // Scroll to the newest message
  const scrollToBottom = useCallback(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── Send a message ───────────────────────────────────────────────────────

  const handleSend = useCallback(
    async (text?: string) => {
      const query = (text ?? inputValue).trim();
      if (!query || isPending) return;

      setInputValue("");

      // Add user message
      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        text: query,
        timestamp: new Date(),
      };

      // Add thinking placeholder
      const thinkingId = generateId();
      const thinkingMsg: ChatMessage = {
        id: thinkingId,
        role: "assistant",
        text: "",
        timestamp: new Date(),
        isThinking: true,
      };

      setMessages((prev) => [...prev, userMsg, thinkingMsg]);
      setIsPending(true);

      // ── Call service ───────────────────────────────────────────────────
      const request: AssistantRequest = { farmer_query: query };

      try {
        const response = await queryAgricultureAssistant(request);

        // Replace thinking bubble with real response
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? {
                  ...m,
                  isThinking: false,
                  text: response.answer,
                  response,
                }
              : m
          )
        );
      } catch (err) {
        // Catch BACKEND_NOT_CONNECTED or any other error
        const isNotConnected =
          err instanceof Error && err.message === "BACKEND_NOT_CONNECTED";

        const errorText = isNotConnected
          ? "The AgriSense AI backend isn't connected yet. Once the backend is available at POST /agent/query, your questions will be answered here in real time."
          : "Something went wrong while reaching the AgriSense AI. Please try again.";

        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? {
                  ...m,
                  isThinking: false,
                  text: errorText,
                  response: {
                    answer: errorText,
                    tools_used: [],
                  },
                }
              : m
          )
        );
      } finally {
        setIsPending(false);
      }
    },
    [inputValue, isPending]
  );

  // ── Suggestion selected ──────────────────────────────────────────────────

  const handleSuggestion = useCallback(
    (question: string) => {
      handleSend(question);
    },
    [handleSend]
  );

  // ── Clear conversation ───────────────────────────────────────────────────

  const handleClear = useCallback(() => {
    setMessages([]);
    setInputValue("");
    setIsPending(false);
  }, []);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full min-h-0 bg-ivory">
      {/* ── Header ── */}
      <AssistantHeader onClear={handleClear} hasMessages={hasMessages} />

      {/* ── Scrollable message area ── */}
      <div
        className="flex-1 overflow-y-auto"
        role="log"
        aria-label="Conversation with AgriSense AI"
        aria-live="polite"
      >
        <div
          ref={revealRef as React.RefObject<HTMLDivElement>}
          className="max-w-3xl mx-auto px-4 sm:px-6 py-6"
        >
          {!hasMessages ? (
            // Welcome / empty state
            <AssistantWelcome onSelectSuggestion={handleSuggestion} />
          ) : (
            // Conversation
            <div className="space-y-6">
              {messages.map((msg) => (
                <AssistantMessage
                  key={msg.id}
                  message={msg}
                  onViewRecommendation={() => navigate("/results")}
                />
              ))}
              {/* Scroll anchor */}
              <div ref={scrollAnchorRef} className="h-1" aria-hidden />
            </div>
          )}
        </div>
      </div>

      {/* ── Input area — pinned to bottom ── */}
      <div className="border-t border-ivory-200 bg-white/95 backdrop-blur-sm shadow-[0_-1px_0_rgba(26,61,46,0.06)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 pb-safe">
          <AssistantInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            disabled={isPending}
            placeholder={
              hasMessages
                ? "Ask a follow-up question…"
                : "Ask AgriSense anything about your farm…"
            }
          />
          <p className="mt-2 text-center text-2xs text-charcoal-muted/35">
            Press <kbd className="font-mono">Enter</kbd> to send ·{" "}
            <kbd className="font-mono">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}
