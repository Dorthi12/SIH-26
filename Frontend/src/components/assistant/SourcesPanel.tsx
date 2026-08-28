/**
 * SourcesPanel.tsx
 *
 * "Sources & Evidence" section rendered beneath a grounded AI answer.
 *
 * Design principles:
 *  - Visually secondary to the answer — clearly labelled but not dominant.
 *  - "Grounded in verified sources" badge communicates trust without jargon.
 *  - Receives `highlightedId` from parent to pulse a specific EvidenceCard
 *    when a farmer clicks an inline [S1] citation reference.
 *  - Skeleton mode: shows shimmer cards while the answer is still loading.
 *  - Never fabricates citations — renders nothing if citations array is empty.
 */

import { ShieldCheck } from "lucide-react";
import { EvidenceCard } from "./EvidenceCard";
import type { RAGCitation } from "../../services/assistantService";

// ── Skeleton card ──────────────────────────────────────────────────────────

function EvidenceSkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="rounded-xl border border-ivory-200 bg-white overflow-hidden"
      style={{ animationDelay: `${index * 120}ms` }}
      aria-hidden
    >
      <div className="h-0.5 skeleton-shimmer" />
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-start gap-3">
          <div className="h-6 w-8 rounded-lg skeleton-shimmer shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded skeleton-shimmer" />
            <div className="h-2.5 w-1/2 rounded skeleton-shimmer" />
          </div>
        </div>
        <div className="h-2.5 w-full rounded skeleton-shimmer" />
        <div className="h-2.5 w-5/6 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}

// ── Sources panel ──────────────────────────────────────────────────────────

interface SourcesPanelProps {
  citations: RAGCitation[];
  /** ID of the citation that is currently highlighted (from inline click) */
  highlightedId: string | null;
  /** Show skeleton loading state */
  loading?: boolean;
}

export function SourcesPanel({
  citations,
  highlightedId,
  loading = false,
}: SourcesPanelProps) {
  // Skeleton state — shown during thinking
  if (loading) {
    return (
      <div className="mt-3 space-y-3" aria-hidden>
        {/* Section header skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-28 rounded skeleton-shimmer" />
          <div className="h-4 w-24 rounded-full skeleton-shimmer" />
        </div>
        {/* Two shimmer cards */}
        {[0, 1].map((i) => (
          <EvidenceSkeletonCard key={i} index={i} />
        ))}
      </div>
    );
  }

  // Don't render anything if no citations provided
  if (!citations || citations.length === 0) return null;

  return (
    <section
      aria-label="Sources and Evidence"
      className="mt-3 space-y-2.5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <ShieldCheck
            className="h-3.5 w-3.5 text-forest/70 shrink-0"
            strokeWidth={2}
          />
          <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/50">
            Sources & Evidence
          </p>
        </div>
        {/* Grounding trust pill */}
        <span className="inline-flex items-center gap-1 rounded-full border border-forest/15 bg-forest/5 px-2 py-0.5 text-2xs font-medium text-forest/70">
          Grounded in verified sources
        </span>
      </div>

      {/* Evidence cards */}
      <div className="space-y-2">
        {citations.map((citation, i) => (
          <EvidenceCard
            key={citation.id}
            citation={citation}
            highlighted={highlightedId === citation.id}
            index={i}
          />
        ))}
      </div>

      {/* Subtle disclaimer */}
      <p className="text-2xs text-charcoal-muted/35 leading-relaxed">
        Sources are retrieved from verified government documents. Always
        confirm details with official portals.
      </p>
    </section>
  );
}
