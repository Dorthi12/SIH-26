/**
 * AssistantMessage.tsx
 *
 * Renders a single chat message (user or assistant).
 * Handles the thinking/loading state and the full response layout.
 */

import { useState } from "react";
import { User, Leaf, ChevronDown, ChevronUp, ExternalLink, Wheat } from "lucide-react";
import { cn } from "../../utils/cn";
import { Badge } from "../ui/Badge";
import type { ChatMessage } from "../../services/assistantService";
import { KNOWN_TOOLS } from "../../services/assistantService";

// ── Thinking indicator ────────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5" aria-label="AgriSense is thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-forest/40 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "1s" }}
        />
      ))}
    </div>
  );
}

// ── Tools-used collapsible ────────────────────────────────────────────────

function ToolsUsedPanel({ toolIds }: { toolIds: string[] }) {
  const [open, setOpen] = useState(false);

  const tools = toolIds.map((id) => ({
    id,
    ...(KNOWN_TOOLS[id] ?? { label: id, description: "Analysis tool used." }),
  }));

  if (tools.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-ivory-200 bg-ivory-50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left hover:bg-ivory-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-inset"
        aria-expanded={open}
      >
        <span className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/60">
          Analysis used · {tools.length} signal{tools.length !== 1 ? "s" : ""}
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-charcoal-muted/50 shrink-0" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-charcoal-muted/50 shrink-0" />
        )}
      </button>
      {open && (
        <div className="border-t border-ivory-200 divide-y divide-ivory-200">
          {tools.map((tool) => (
            <div key={tool.id} className="flex items-start gap-3 px-3.5 py-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-forest/50 shrink-0 mt-1.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-charcoal">{tool.label}</p>
                <p className="text-2xs text-charcoal-muted/70 leading-snug">{tool.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Recommendation card ───────────────────────────────────────────────────

interface RecommendationCardProps {
  crop: string;
  suitabilityScore: number;
  predictedYield: number;
  keyReason: string;
  onViewDetails: () => void;
}

export function AssistantRecommendationCard({
  crop,
  suitabilityScore,
  predictedYield,
  keyReason,
  onViewDetails,
}: RecommendationCardProps) {
  return (
    <div className="mt-3 rounded-xl border border-forest/15 bg-white shadow-card overflow-hidden">
      {/* Top accent stripe */}
      <div className="h-0.5 bg-gradient-to-r from-forest via-forest/70 to-transparent" />
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white shadow-sm ai-glow shrink-0">
            <Wheat className="h-4.5 w-4.5" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-2xs font-bold uppercase tracking-widest text-forest/60">
              Recommendation
            </p>
            <p className="text-base font-bold text-charcoal leading-none">{crop}</p>
          </div>
          <Badge variant="default" size="sm" className="ml-auto shrink-0">
            {suitabilityScore}/100
          </Badge>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-ivory-50 border border-ivory-200 px-3 py-2">
            <p className="text-2xs text-charcoal-muted/60">Suitability</p>
            <p className="text-sm font-bold text-charcoal">{suitabilityScore}%</p>
          </div>
          <div className="rounded-lg bg-ivory-50 border border-ivory-200 px-3 py-2">
            <p className="text-2xs text-charcoal-muted/60">Predicted Yield</p>
            <p className="text-sm font-bold text-charcoal">{predictedYield} t/ha</p>
          </div>
        </div>

        {/* Key reason */}
        <p className="text-xs text-charcoal-muted leading-relaxed border-t border-ivory-100 pt-3">
          {keyReason}
        </p>

        {/* CTA */}
        <button
          type="button"
          onClick={onViewDetails}
          className="flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-600 transition-colors group"
        >
          View detailed recommendation
          <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// ── Message body — renders answer text with basic formatting ──────────────

function MessageBody({ text }: { text: string }) {
  // Split by newline-separated paragraphs/bullets
  const lines = text.split("\n").filter(Boolean);

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const isBullet = line.trimStart().startsWith("-") || line.trimStart().startsWith("•");
        const cleanLine = isBullet ? line.replace(/^[\s\-•]+/, "") : line;

        if (isBullet) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-forest/50 shrink-0" />
              <p className="text-sm text-charcoal leading-relaxed">{cleanLine}</p>
            </div>
          );
        }
        return (
          <p key={i} className="text-sm text-charcoal leading-relaxed">
            {cleanLine}
          </p>
        );
      })}
    </div>
  );
}

// ── Main message component ────────────────────────────────────────────────

interface AssistantMessageProps {
  message: ChatMessage;
  onViewRecommendation: () => void;
}

export function AssistantMessage({ message, onViewRecommendation }: AssistantMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3 animate-slide-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      style={{ animationFillMode: "both" }}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold mt-0.5",
          isUser
            ? "bg-charcoal/80"
            : "bg-forest shadow-sm ai-glow"
        )}
        aria-hidden
      >
        {isUser ? (
          <User className="h-4 w-4" strokeWidth={1.75} />
        ) : (
          <Leaf className="h-4 w-4" strokeWidth={2} />
        )}
      </div>

      {/* Bubble */}
      <div className={cn("flex flex-col gap-1.5 max-w-[80%] min-w-0", isUser && "items-end")}>
        {/* Sender label */}
        <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/50 px-1">
          {isUser ? "You" : "AgriSense AI"}
        </p>

        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-charcoal/[0.07] border border-charcoal/[0.08] rounded-tr-sm"
              : "bg-white border border-ivory-300 shadow-card rounded-tl-sm"
          )}
        >
          {/* Thinking state */}
          {message.isThinking ? (
            <div className="flex items-center gap-2 py-1">
              <ThinkingDots />
              <span className="text-xs text-charcoal-muted italic">
                AgriSense is thinking…
              </span>
            </div>
          ) : (
            <MessageBody text={message.text} />
          )}
        </div>

        {/* Tools used — only for completed assistant messages */}
        {!isUser && !message.isThinking && message.response && (
          <>
            {message.response.tools_used.length > 0 && (
              <ToolsUsedPanel toolIds={message.response.tools_used.map((t) => t.id)} />
            )}
            {message.response.recommendation && (
              <AssistantRecommendationCard
                crop={message.response.recommendation.crop}
                suitabilityScore={message.response.recommendation.suitability_score}
                predictedYield={message.response.recommendation.predicted_yield_t_per_ha}
                keyReason={message.response.recommendation.key_reason}
                onViewDetails={onViewRecommendation}
              />
            )}
          </>
        )}

        {/* Timestamp */}
        {!message.isThinking && (
          <time
            dateTime={message.timestamp.toISOString()}
            className="text-2xs text-charcoal-muted/40 px-1"
          >
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </time>
        )}
      </div>
    </div>
  );
}
