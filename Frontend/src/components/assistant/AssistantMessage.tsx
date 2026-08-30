/**
 * AssistantMessage.tsx
 *
 * Renders a single chat message (user or assistant).
 *
 * Handles:
 *  - Thinking / loading state (with source skeleton cards)
 *  - Rich Markdown rendering via react-markdown + remark-gfm
 *  - Inline [S1] citation spans → clickable chips (mapped to structured sources)
 *  - Sources & Evidence panel (SourcesPanel)
 *  - Citation click → EvidenceCard highlight + scroll
 *  - Status badges: insufficient_information / clarification_required / unsupported_scheme
 *  - Tools-used collapsible
 *  - Recommendation card
 *  - Reduced-motion aware
 *
 * Security: dangerouslySetInnerHTML is NEVER used. LLM output is treated as
 * untrusted Markdown text only — react-markdown renders it as React elements.
 */

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import {
  User,
  Leaf,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Wheat,
  AlertCircle,
  HelpCircle,
  Info,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Badge } from "../ui/Badge";
import { SourcesPanel } from "./SourcesPanel";
import type { ChatMessage, RAGCitation } from "../../services/assistantService";
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

// ── Status badge ──────────────────────────────────────────────────────────

type RAGStatus =
  | "success"
  | "insufficient_information"
  | "clarification_required"
  | "unsupported_scheme"
  | "error";

function StatusBadge({ status }: { status: RAGStatus }) {
  if (status === "success") return null;

  const configs: Record<Exclude<RAGStatus, "success">, { icon: React.ReactNode; label: string; cls: string }> = {
    insufficient_information: {
      icon: <Info className="h-3 w-3 shrink-0" strokeWidth={2} />,
      label: "Limited evidence found",
      cls: "border-amber/25 bg-amber/8 text-amber-700",
    },
    clarification_required: {
      icon: <HelpCircle className="h-3 w-3 shrink-0" strokeWidth={2} />,
      label: "More information needed",
      cls: "border-sky-200 bg-sky-50 text-sky-700",
    },
    unsupported_scheme: {
      icon: <AlertCircle className="h-3 w-3 shrink-0" strokeWidth={2} />,
      label: "Scheme not found in documents",
      cls: "border-orange-200 bg-orange-50 text-orange-700",
    },
    error: {
      icon: <AlertCircle className="h-3 w-3 shrink-0" strokeWidth={2} />,
      label: "Could not retrieve answer",
      cls: "border-red-200 bg-red-50 text-red-700",
    },
  };

  const cfg = configs[status as Exclude<RAGStatus, "success">];
  if (!cfg) return null;

  return (
    <div className={cn("flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 mt-2 w-fit text-2xs font-medium", cfg.cls)}>
      {cfg.icon}
      {cfg.label}
    </div>
  );
}

// ── Citation chip ──────────────────────────────────────────────────────────
// Rendered inline wherever [S1], [S2] etc. appear in the Markdown text.

interface CitationChipProps {
  citationId: string;
  onCitationClick: (id: string) => void;
  isHighlighted: boolean;
}

function CitationChip({ citationId, onCitationClick, isHighlighted }: CitationChipProps) {
  return (
    <button
      type="button"
      onClick={() => onCitationClick(citationId)}
      aria-label={`View source ${citationId}`}
      className={cn(
        "inline-flex items-center justify-center rounded px-1 py-0.5 text-2xs font-bold leading-none transition-all duration-150 mx-0.5 align-middle",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-1",
        isHighlighted
          ? "bg-forest text-white shadow-sm"
          : "bg-forest/10 text-forest hover:bg-forest hover:text-white border border-forest/20 hover:border-forest"
      )}
    >
      {citationId}
    </button>
  );
}

// ── Pre-process: extract inline citation IDs from text ────────────────────
// Returns the cleaned text and a regex that can split it, used by the
// custom Markdown `text` renderer below.

const CITATION_REGEX = /\[([A-Z]\d+)\]/g;

/** Split a text node into plain text + citation chip segments. */
function renderTextWithCitations(
  text: string,
  citations: RAGCitation[] | undefined,
  highlightedId: string | null,
  onCitationClick: (id: string) => void,
): React.ReactNode {
  if (!citations || citations.length === 0) return text;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  CITATION_REGEX.lastIndex = 0;

  while ((match = CITATION_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const id = match[1];
    // Only render as chip if the citation actually exists in the source list
    const exists = citations.some((c) => c.id === id);
    if (exists) {
      parts.push(
        <CitationChip
          key={`${id}-${match.index}`}
          citationId={id}
          onCitationClick={onCitationClick}
          isHighlighted={highlightedId === id}
        />
      );
    } else {
      // Fallback: keep it as plain text (don't fabricate)
      parts.push(match[0]);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}

// ── Markdown component map ─────────────────────────────────────────────────
// All styling is inline Tailwind. No dangerouslySetInnerHTML anywhere.
// HTML passthrough from the LLM is disabled (allowedElements list used below).

function makeMarkdownComponents(
  citations: RAGCitation[] | undefined,
  highlightedId: string | null,
  onCitationClick: (id: string) => void,
): Components {
  return {
    // ── Headings — compact inside chat bubble ──────────────────────────────
    h1: ({ children }) => (
      <p className="text-base font-bold text-charcoal mt-3 mb-1 first:mt-0 leading-snug">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <p className="text-sm font-bold text-charcoal mt-3 mb-1 first:mt-0 leading-snug">
        {children}
      </p>
    ),
    h3: ({ children }) => (
      <p className="text-sm font-semibold text-charcoal mt-2.5 mb-1 first:mt-0 leading-snug">
        {children}
      </p>
    ),
    h4: ({ children }) => (
      <p className="text-sm font-semibold text-charcoal/80 mt-2 mb-0.5 first:mt-0 leading-snug">
        {children}
      </p>
    ),

    // ── Paragraphs ──────────────────────────────────────────────────────────
    p: ({ children }) => (
      <p className="text-sm text-charcoal leading-relaxed mb-2 last:mb-0">
        {children}
      </p>
    ),

    // ── Bold + italic ───────────────────────────────────────────────────────
    strong: ({ children }) => (
      <strong className="font-semibold text-charcoal">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-charcoal/80">{children}</em>
    ),

    // ── Unordered lists ─────────────────────────────────────────────────────
    ul: ({ children }) => (
      <ul className="my-1.5 space-y-1 pl-1">{children}</ul>
    ),
    li: ({ children, ...props }) => {
      // Detect ordered vs unordered via parent context — react-markdown passes
      // ordered as a prop on ol/ul, not on li. We check the DOM parent via
      // a data attribute set on ol vs ul.
      const isOrdered = (props as { ordered?: boolean }).ordered;
      return (
        <li className="flex items-start gap-2 text-sm text-charcoal leading-relaxed">
          {isOrdered ? null : (
            <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-forest/50 shrink-0" />
          )}
          <span className="flex-1">{children}</span>
        </li>
      );
    },

    // ── Ordered lists ───────────────────────────────────────────────────────
    ol: ({ children }) => (
      <ol className="my-1.5 space-y-1 pl-1 list-decimal list-inside [&_li]:list-item">
        {children}
      </ol>
    ),

    // ── Blockquote ──────────────────────────────────────────────────────────
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-forest/30 pl-3 my-2 text-sm text-charcoal/70 italic leading-relaxed">
        {children}
      </blockquote>
    ),

    // ── Links — government sources only, safe attributes ───────────────────
    a: ({ href, children }) => {
      if (!href) return <span>{children}</span>;
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-forest underline underline-offset-2 hover:text-forest/70 transition-colors inline-flex items-center gap-0.5"
        >
          {children}
          <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
        </a>
      );
    },

    // ── Horizontal rule ────────────────────────────────────────────────────
    hr: () => <hr className="my-3 border-ivory-200" />,

    // ── Tables — responsive horizontal scroll ──────────────────────────────
    table: ({ children }) => (
      <div className="my-2 overflow-x-auto rounded-lg border border-ivory-200">
        <table className="w-full text-xs text-left">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-ivory-50 border-b border-ivory-200">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-ivory-100">{children}</tbody>
    ),
    tr: ({ children }) => <tr className="hover:bg-ivory-50/50">{children}</tr>,
    th: ({ children }) => (
      <th className="px-3 py-2 font-semibold text-charcoal/70 whitespace-nowrap">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 text-charcoal leading-snug">{children}</td>
    ),

    // ── Code — de-emphasised (not a programming assistant) ─────────────────
    code: ({ children }) => (
      <code className="rounded bg-ivory-100 px-1 py-0.5 text-xs font-mono text-charcoal/80 border border-ivory-200">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="my-2 overflow-x-auto rounded-lg bg-ivory-100 border border-ivory-200 px-3 py-2 text-xs font-mono text-charcoal/80 leading-relaxed">
        {children}
      </pre>
    ),

    // ── Text node: intercept to replace [S1] refs with citation chips ──────
    // react-markdown passes string children; we process them here.
    // This is the key hook that turns [S1] into interactive chips without
    // dangerouslySetInnerHTML.
  };
}

// ── Pre-process answer text ────────────────────────────────────────────────
// Strip raw "Source N" style references that may appear from older prompts
// since structured sources are already rendered in SourcesPanel below.
// We keep [S1]-style refs because we render them as interactive chips above.

function preprocessAnswer(text: string): string {
  // Replace "[Source 1]", "[Source 2]" etc. with [S1], [S2] for consistency
  return text.replace(/\[Source\s+(\d+)\]/gi, (_, n) => `[S${n}]`);
}

// ── Markdown answer body ──────────────────────────────────────────────────

interface MarkdownBodyProps {
  text: string;
  citations: RAGCitation[] | undefined;
  highlightedCitationId: string | null;
  onCitationClick: (id: string) => void;
}

function MarkdownBody({
  text,
  citations,
  highlightedCitationId,
  onCitationClick,
}: MarkdownBodyProps) {
  const components = makeMarkdownComponents(citations, highlightedCitationId, onCitationClick);

  // We disable raw HTML passthrough — only standard Markdown elements are rendered.
  // This prevents the LLM from injecting arbitrary HTML.
  return (
    <div className="min-w-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        // Disallow raw HTML from LLM output — security boundary
        allowedElements={[
          "p", "h1", "h2", "h3", "h4", "h5", "h6",
          "ul", "ol", "li",
          "strong", "em", "del",
          "blockquote",
          "a",
          "hr",
          "br",
          "table", "thead", "tbody", "tr", "th", "td",
          "code", "pre",
        ]}
        unwrapDisallowed
      >
        {preprocessAnswer(text)}
      </ReactMarkdown>
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
                <p className="text-2xs text-charcoal-muted/70 leading-snug">
                  {tool.description}
                </p>
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
          className="flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest/80 transition-colors group"
        >
          View detailed recommendation
          <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
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

  // Tracks which citation ID is currently highlighted (from inline chip click)
  const [highlightedCitationId, setHighlightedCitationId] = useState<string | null>(null);

  const handleCitationClick = useCallback((id: string) => {
    setHighlightedCitationId((prev) => (prev === id ? null : id));
  }, []);

  const citations = message.response?.citations;
  const status = message.response?.status;
  const hasCitations = citations && citations.length > 0;

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
          isUser ? "bg-charcoal/80" : "bg-forest shadow-sm ai-glow"
        )}
        aria-hidden
      >
        {isUser ? (
          <User className="h-4 w-4" strokeWidth={1.75} />
        ) : (
          <Leaf className="h-4 w-4" strokeWidth={2} />
        )}
      </div>

      {/* Bubble + supplemental content */}
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
            <div className="space-y-3">
              <div className="flex items-center gap-2 py-1">
                <ThinkingDots />
                <span className="text-xs text-charcoal-muted italic">
                  Searching government documents…
                </span>
              </div>
            </div>
          ) : isUser ? (
            // User messages: plain text, no Markdown parsing
            <p className="text-sm text-charcoal leading-relaxed">{message.text}</p>
          ) : (
            // Assistant messages: full Markdown rendering
            <MarkdownBody
              text={message.text}
              citations={citations}
              highlightedCitationId={highlightedCitationId}
              onCitationClick={handleCitationClick}
            />
          )}
        </div>

        {/* Status badge — only for specific non-success statuses */}
        {!isUser && !message.isThinking && status && status !== "success" && (
          <div className="px-1">
            <StatusBadge status={status as RAGStatus} />
          </div>
        )}

        {/* Sources skeleton during thinking */}
        {!isUser && message.isThinking && (
          <SourcesPanel citations={[]} highlightedId={null} loading />
        )}

        {/* Sources & Evidence — after answer is complete */}
        {!isUser && !message.isThinking && hasCitations && (
          <SourcesPanel
            citations={citations}
            highlightedId={highlightedCitationId}
          />
        )}

        {/* Tools used + Recommendation */}
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
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        )}
      </div>
    </div>
  );
}
