/**
 * AssistantWelcome.tsx
 *
 * Empty / welcome state shown before any messages are sent.
 *
 * Features:
 *  - AgriSense AI branding with animated icon
 *  - "Get trusted agricultural guidance grounded in verified sources" subtitle
 *  - Categorised suggestion cards: Government Schemes / Crop Decisions / Farming Guidance
 *  - Reduced-motion aware (handled via CSS)
 */

import { Leaf, Sparkles, Landmark, Wheat, Cloud } from "lucide-react";
import { cn } from "../../utils/cn";

// ── Suggestion categories ──────────────────────────────────────────────────

interface SuggestionCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  accentClass: string;
  questions: string[];
}

const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    id: "schemes",
    label: "Government Schemes",
    icon: <Landmark className="h-3.5 w-3.5" strokeWidth={2} />,
    accentClass: "text-forest border-forest/20 bg-forest/6",
    questions: [
      "Which government schemes can I apply for?",
      "Am I eligible for PM-KISAN?",
      "What documents do I need to apply?",
    ],
  },
  {
    id: "crops",
    label: "Crop Decisions",
    icon: <Wheat className="h-3.5 w-3.5" strokeWidth={2} />,
    accentClass: "text-amber-700 border-amber/25 bg-amber/6",
    questions: [
      "Which crop is best for my district and soil?",
      "Why is this crop recommended for me?",
      "How can I improve my expected yield?",
    ],
  },
  {
    id: "guidance",
    label: "Farming Guidance",
    icon: <Cloud className="h-3.5 w-3.5" strokeWidth={2} />,
    accentClass: "text-sky-700 border-sky-200 bg-sky-50",
    questions: [
      "What weather risks should I watch for?",
      "How can I protect my crop from disease?",
      "Are there government subsidies for equipment?",
    ],
  },
];

// ── Question card ──────────────────────────────────────────────────────────

interface QuestionCardProps {
  question: string;
  onClick: (q: string) => void;
  animationIndex: number;
}

function QuestionCard({ question, onClick, animationIndex }: QuestionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(question)}
      data-reveal
      data-delay={String(Math.min(animationIndex * 60, 500))}
      className={cn(
        "group flex items-start gap-2.5 rounded-xl border border-ivory-300 bg-white shadow-sm p-3 text-left w-full",
        "hover:border-forest/25 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200",
        "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
      )}
    >
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-forest/8 text-forest group-hover:bg-forest group-hover:text-white transition-all duration-150">
        <Leaf className="h-2.5 w-2.5" strokeWidth={2.5} />
      </span>
      <span className="text-xs text-charcoal leading-snug group-hover:text-forest transition-colors duration-150">
        {question}
      </span>
    </button>
  );
}

// ── Category group ─────────────────────────────────────────────────────────

interface CategoryGroupProps {
  category: SuggestionCategory;
  onClick: (q: string) => void;
  baseIndex: number;
}

function CategoryGroup({ category, onClick, baseIndex }: CategoryGroupProps) {
  return (
    <div className="space-y-2" data-reveal data-delay={String(baseIndex * 80)}>
      {/* Category label */}
      <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1", category.accentClass)}>
        {category.icon}
        <span className="text-2xs font-bold">{category.label}</span>
      </div>

      {/* Questions */}
      <div className="grid grid-cols-1 gap-1.5">
        {category.questions.map((q, i) => (
          <QuestionCard
            key={q}
            question={q}
            onClick={onClick}
            animationIndex={baseIndex + i}
          />
        ))}
      </div>
    </div>
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
            Get trusted agricultural guidance grounded in verified government
            sources and agricultural knowledge.
          </p>
        </div>
      </div>

      {/* Categorised suggestion grid */}
      <div className="w-full space-y-4">
        <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/50 text-center">
          Suggested questions
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SUGGESTION_CATEGORIES.map((cat, ci) => (
            <CategoryGroup
              key={cat.id}
              category={cat}
              onClick={onSelectSuggestion}
              baseIndex={ci * 3}
            />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-2xs text-charcoal-muted/40 text-center max-w-xs leading-relaxed">
        Answers are grounded in official government documents. Always verify
        important decisions with a local agricultural expert.
      </p>
    </div>
  );
}

// Kept for backward compat if imported elsewhere
export const SUGGESTED_QUESTIONS = SUGGESTION_CATEGORIES.flatMap((c) => c.questions);
