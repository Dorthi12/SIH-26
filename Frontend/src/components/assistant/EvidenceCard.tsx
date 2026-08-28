/**
 * EvidenceCard.tsx
 *
 * Reusable expandable evidence card for a single RAG citation.
 *
 * Design principles:
 *  - Evidence is visually SECONDARY to the answer — compact by default.
 *  - Expands on user request for those who want to inspect the source.
 *  - "View source" only rendered when source_url is a real URL from backend.
 *  - Official/government badges only shown when the backend provides metadata.
 *  - Highlight ring appears when the card is focused via an inline citation click.
 *  - Fully keyboard-accessible. Respects prefers-reduced-motion.
 */

import { useState, useRef, useEffect, forwardRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Shield,
  Building2,
  FileText,
} from "lucide-react";
import { cn } from "../../utils/cn";
import type { RAGCitation } from "../../services/assistantService";

// ── Helpers ────────────────────────────────────────────────────────────────

function truncate(text: string, maxLen = 120): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

// ── Badges ─────────────────────────────────────────────────────────────────

function OfficialBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-forest/8 border border-forest/15 px-2 py-0.5 text-2xs font-semibold text-forest">
      <Shield className="h-2.5 w-2.5" strokeWidth={2.5} />
      Official
    </span>
  );
}

function GovLevelBadge({ level }: { level: "central" | "state" }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber/8 border border-amber/20 px-2 py-0.5 text-2xs font-medium text-amber-700">
      <Building2 className="h-2.5 w-2.5" strokeWidth={2} />
      {level === "central" ? "Central Govt." : "State Govt."}
    </span>
  );
}

// ── Main EvidenceCard ──────────────────────────────────────────────────────

export interface EvidenceCardProps {
  citation: RAGCitation;
  /** Whether this card is currently highlighted via an inline citation click */
  highlighted?: boolean;
  /** Index for stagger animation */
  index?: number;
}

export const EvidenceCard = forwardRef<HTMLDivElement, EvidenceCardProps>(
  function EvidenceCard({ citation, highlighted = false, index = 0 }, ref) {
    const [expanded, setExpanded] = useState(false);
    const expandRef = useRef<HTMLDivElement>(null);

    // Focus card when highlighted
    const cardRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (highlighted && cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        cardRef.current.focus({ preventScroll: true });
      }
    }, [highlighted]);

    const hasExcerpt = Boolean(citation.excerpt);
    const hasUrl = Boolean(citation.source_url);

    return (
      <div
        ref={(el) => {
          cardRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        tabIndex={-1}
        data-citation-id={citation.id}
        style={{ animationDelay: `${index * 80}ms` }}
        className={cn(
          "rounded-xl border bg-white overflow-hidden transition-all duration-300 outline-none",
          "focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-1",
          highlighted
            ? "border-forest/40 shadow-[0_0_0_2px_rgba(26,61,46,0.15)] evidence-highlight"
            : "border-ivory-200 shadow-sm hover:border-ivory-300"
        )}
        aria-label={`Source ${citation.id}: ${citation.source_title}`}
      >
        {/* Accent stripe */}
        <div
          className={cn(
            "h-0.5 transition-colors duration-300",
            highlighted
              ? "bg-gradient-to-r from-forest to-forest/50"
              : "bg-gradient-to-r from-forest/30 to-transparent"
          )}
        />

        {/* Card header */}
        <div className="flex items-start gap-3 p-3.5">
          {/* Citation number badge */}
          <div
            className={cn(
              "flex h-6 w-8 shrink-0 items-center justify-center rounded-lg text-2xs font-bold transition-colors duration-200",
              highlighted
                ? "bg-forest text-white"
                : "bg-forest/8 text-forest border border-forest/15"
            )}
            aria-hidden
          >
            {citation.id}
          </div>

          {/* Title + meta */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-charcoal leading-snug">
                {citation.source_title}
              </p>
              {/* Badges — only when metadata is available */}
              <div className="flex items-center gap-1 shrink-0">
                {citation.official_source && <OfficialBadge />}
                {citation.government_level && (
                  <GovLevelBadge level={citation.government_level} />
                )}
              </div>
            </div>

            {/* Organization */}
            {citation.organization && (
              <p className="text-2xs text-charcoal-muted/70 leading-none">
                {citation.organization}
              </p>
            )}

            {/* Section + page */}
            <div className="flex items-center gap-2 flex-wrap">
              {citation.section && (
                <span className="inline-flex items-center gap-1 text-2xs text-charcoal-muted/60">
                  <FileText className="h-2.5 w-2.5" strokeWidth={2} />
                  {citation.section}
                </span>
              )}
              {citation.page_number != null && (
                <span className="text-2xs text-charcoal-muted/40">
                  · p.{citation.page_number}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Collapsed excerpt preview */}
        {hasExcerpt && !expanded && (
          <div className="px-3.5 pb-2 -mt-1">
            <p className="text-2xs text-charcoal-muted/60 leading-relaxed italic border-l-2 border-forest/20 pl-2">
              "{truncate(citation.excerpt!, 100)}"
            </p>
          </div>
        )}

        {/* Expanded content */}
        {expanded && (
          <div
            ref={expandRef}
            className="border-t border-ivory-100 px-3.5 py-3 space-y-2.5 animate-slide-up"
            style={{ animationFillMode: "both" }}
          >
            {hasExcerpt && (
              <div className="space-y-1">
                <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/40">
                  Relevant excerpt
                </p>
                <p className="text-xs text-charcoal leading-relaxed italic border-l-2 border-forest/25 pl-3 bg-forest/[0.02] py-2 rounded-r-lg">
                  "{citation.excerpt}"
                </p>
              </div>
            )}

            {/* View source — ONLY when a real URL is available */}
            {hasUrl && (
              <a
                href={citation.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-2xs font-semibold text-forest hover:text-forest/80 transition-colors group"
                aria-label={`View source for ${citation.source_title}`}
              >
                View source document
                <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </div>
        )}

        {/* Expand / collapse toggle */}
        {hasExcerpt && (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            aria-expanded={expanded}
            aria-controls={`evidence-body-${citation.id}`}
            className="flex w-full items-center justify-center gap-1 border-t border-ivory-100 py-2 text-2xs font-medium text-charcoal-muted/50 hover:text-charcoal-muted hover:bg-ivory-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-inset"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" strokeWidth={2.5} />
                Hide evidence
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" strokeWidth={2.5} />
                Show evidence
              </>
            )}
          </button>
        )}
      </div>
    );
  }
);
