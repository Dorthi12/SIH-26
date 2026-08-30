/**
 * Assistant.tsx — /assistant route
 *
 * AI Agricultural Assistant page — Government Scheme Assistant.
 *
 * Architecture:
 *  - All conversation state is React local state (no persistence).
 *  - conversationId is maintained across turns so the backend can
 *    keep multi-turn memory for the current session.
 *  - Resetting the conversation clears the ID, starting a fresh session.
 *  - queryAgricultureAssistant() in assistantService.ts owns all
 *    backend communication. This component only manages UI state.
 *
 * Sections:
 *  1. Page header  — AgriSense AI branding
 *  2. Message list — scrollable conversation
 *  3. Follow-up question buttons — rendered after each assistant answer
 *  4. Input area   — pinned to bottom
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Sparkles, RotateCcw, ShieldCheck } from "lucide-react";
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
              Government Scheme Assistant
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Grounded in verified documents notice */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-forest/20 bg-forest/6 px-3 py-1">
            <ShieldCheck className="h-3 w-3 text-forest/70 shrink-0" />
            <span className="text-2xs font-medium text-forest/80">Grounded in govt. documents</span>
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
              <span className="hidden sm:inline">New conversation</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Follow-up question buttons ─────────────────────────────────────────────

function FollowUpQuestions({
  questions,
  onSelect,
  disabled,
}: {
  questions: string[];
  onSelect: (q: string) => void;
  disabled: boolean;
}) {
  if (!questions || questions.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2 px-1">
      {questions.map((q) => (
        <button
          key={q}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(q)}
          className="rounded-full border border-forest/20 bg-forest/6 px-3.5 py-1.5 text-xs font-medium text-forest hover:bg-forest hover:text-white transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-1 active:scale-[0.97]"
        >
          {q}
        </button>
      ))}
    </div>
  );
}

// ── Friendly error text from thrown errors ─────────────────────────────────

function friendlyError(err: unknown): string {
  if (!(err instanceof Error)) {
    return "We're having trouble connecting to the government scheme assistant. Please try again.";
  }
  if (err.message === "TIMEOUT") {
    return "The request took too long. The assistant is still loading — please try again in a moment.";
  }
  if (err.message === "NETWORK_ERROR") {
    return "We're having trouble connecting to the government scheme assistant. Please check your connection and try again.";
  }
  if (err.message.startsWith("RAG_ERROR:503")) {
    return "The assistant is temporarily unavailable. Please try again shortly.";
  }
  if (err.message.startsWith("RAG_ERROR:422")) {
    return "Your question could not be processed. Please rephrase and try again.";
  }
  if (err.message.startsWith("RAG_ERROR:429")) {
    return "Too many requests. Please wait a moment and try again.";
  }
  if (err.message.startsWith("RAG_ERROR:")) {
    return "We're having trouble reaching the government scheme assistant. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

// ── Main page ──────────────────────────────────────────────────────────────

export function Assistant() {
  const navigate = useNavigate();
  const revealRef = useScrollReveal();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isPending, setIsPending] = useState(false);

  /**
   * Conversation ID from the backend.
   * Maintained across turns to preserve multi-turn memory.
   * Reset to undefined when the user starts a new conversation.
   */
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  /**
   * Follow-up questions from the last assistant response.
   * Cleared when the user sends a new message.
   */
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);

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
      setFollowUpQuestions([]); // clear previous follow-ups while loading

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

      // ── Call RAG backend ────────────────────────────────────────────────
      const request: AssistantRequest = { farmer_query: query };

      try {
        const response = await queryAgricultureAssistant(request, conversationId);

        // Persist the conversation ID for subsequent turns
        if (response.conversation_id) {
          setConversationId(response.conversation_id);
        }

        // Surface follow-up questions for the next render
        setFollowUpQuestions(response.follow_up_questions ?? []);

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
        const errorText = friendlyError(err);

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
                    status: "error",
                  },
                }
              : m
          )
        );
      } finally {
        setIsPending(false);
      }
    },
    [inputValue, isPending, conversationId]
  );

  // ── Suggestion / follow-up selected ─────────────────────────────────────

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
    setConversationId(undefined); // start a fresh conversation on next send
    setFollowUpQuestions([]);
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
        aria-label="Conversation with AgriSense Government Scheme Assistant"
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

              {/* Follow-up questions — shown after the latest assistant answer */}
              {!isPending && followUpQuestions.length > 0 && (
                <FollowUpQuestions
                  questions={followUpQuestions}
                  onSelect={handleSuggestion}
                  disabled={isPending}
                />
              )}

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
                : "Ask about PM-KISAN, crop insurance, or any government scheme…"
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
