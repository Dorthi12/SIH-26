/**
 * AssistantWelcome.tsx
 *
 * Empty / welcome state shown before any messages are sent.
 * Features:
 *  - AgriSense AI branding with animated icon
 *  - Brief explainer subtitle
 *  - Suggested question cards
 */

import { Leaf, Sparkles } from "lucide-react";
import { cn } from "../../utils/cn";

// ── Suggested questions ───────────────────────────────────────────────────

export const SUGGESTED_QUESTIONS = [
  "Why is this crop recommended for my farm?",
  "How can I improve my expected yield?",
  "What weather conditions should I watch for?",
  "What are the major risks for my crop?",
  "Which crop is most suitable for my land?",
  "How does historical yield affect my recommendation?",
];

interface SuggestionCardProps {
  question: string;
  onClick: (q: string) => void;
  index: number;
}

function SuggestionCard({ question, onClick, index }: SuggestionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(question)}
      data-reveal
      data-delay={String(index * 60)}
      className={cn(
        "group flex items-start gap-2.5 rounded-xl border border-ivory-300 bg-white shadow-sm p-3.5 text-left",
        "hover:border-forest/25 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200",
        "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
      )}
    >
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-forest/8 text-forest group-hover:bg-forest group-hover:text-white transition-all duration-150">
        <Leaf className="h-3 w-3" strokeWidth={2} />
      </span>
      <span className="text-xs text-charcoal leading-snug group-hover:text-forest transition-colors duration-150">
        {question}
      </span>
    </button>
  );
}

// ── Welcome screen ─────────────────────────────────────────────────────────

interface AssistantWelcomeProps {
  onSelectSuggestion: (question: string) => void;
}

export function AssistantWelcome({ onSelectSuggestion }: AssistantWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-start pt-8 pb-4 gap-8 w-full max-w-2xl mx-auto">

      {/* AI icon mark */}
      <div className="flex flex-col items-center gap-4 animate-scale-in">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-forest shadow-md ai-glow">
          <Leaf className="h-9 w-9 text-white" strokeWidth={2} />
          <Sparkles
            className="absolute -top-2 -right-2 h-5 w-5 text-amber animate-pulse"
            strokeWidth={2}
          />
          {/* Ambient outer ring */}
          <div
            className="absolute -inset-1.5 rounded-[1.75rem] border border-forest/15 animate-pulse"
            style={{ animationDuration: "3s" }}
          />
        </div>

        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold text-charcoal tracking-tight">
            Ask <span className="text-forest">AgriSense</span>
          </h2>
          <p className="text-sm text-charcoal-muted max-w-sm leading-relaxed">
            Get intelligent, agriculture-specific guidance based on your crops,
            weather, soil, and farm conditions.
          </p>
        </div>
      </div>

      {/* Suggested question grid */}
      <div className="w-full space-y-3">
        <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/50 text-center">
          Suggested questions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <SuggestionCard
              key={q}
              question={q}
              onClick={onSelectSuggestion}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-2xs text-charcoal-muted/40 text-center max-w-xs leading-relaxed">
        AgriSense provides data-driven agricultural guidance. Always consult a
        local agricultural expert before major decisions.
      </p>
    </div>
  );
}
