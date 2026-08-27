/**
 * PredictionExplainability — "Why was this crop recommended?" section.
 *
 * Displays feature contributions from the model explanation API.
 * Handles: loading, idle (not-yet-available), error, and ready states.
 *
 * Backend integration point: fetchPredictionExplanation() in explainabilityService.ts
 * That function calls GET /predictions/{prediction_id}/explain once connected.
 *
 * IMPORTANT: This component does NOT perform any ML calculations.
 * It only visualises the `importance` and `direction` values from the backend.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  HelpCircle, TrendingUp, TrendingDown, Minus,
  ChevronDown, RefreshCw, Sparkles, AlertCircle,
  Info,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { SectionHeader } from "../ui/SectionHeader";
import { fetchPredictionExplanation } from "../../services/explainabilityService";
import type {
  FeatureContribution,
  ExplainabilityStatus,
  FeatureDirection,
} from "../../types/predictionExplainability";

// ── Constants ─────────────────────────────────────────────────────────────

/**
 * How many features to show by default before "View all" expansion.
 * Top 3 are always shown.
 */
const COLLAPSED_COUNT = 3;

// ── Main component ────────────────────────────────────────────────────────

interface PredictionExplainabilityProps {
  /** Prediction ID used to fetch the explanation. */
  predictionId: string;
  /** Crop name used in the section heading. */
  cropName: string;
}

export function PredictionExplainability({
  predictionId,
  cropName,
}: PredictionExplainabilityProps) {
  const [status, setStatus] = useState<ExplainabilityStatus>("idle");
  const [contributions, setContributions] = useState<FeatureContribution[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setContributions([]);
    setExpanded(false);
    try {
      // ── BACKEND INTEGRATION POINT ──────────────────────────────────────
      const result = await fetchPredictionExplanation(predictionId);
      setContributions(result.feature_contributions);
      setStatus("ready");
    } catch (_err) {
      // Stub throws — show idle/unavailable state, not error, until real backend is wired.
      // When the real backend is connected and returns valid data, this will show "ready".
      // If the backend returns an error response, this will show "error".
      setStatus("idle");
    }
  }, [predictionId]);

  // Auto-load on mount
  useEffect(() => {
    load();
  }, [load]);

  // Close tooltip on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!tooltipRef.current?.contains(e.target as Node)) setTooltipOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const visibleContributions = expanded
    ? contributions
    : contributions.slice(0, COLLAPSED_COUNT);

  const hasMore = contributions.length > COLLAPSED_COUNT;

  return (
    <section
      aria-labelledby="explainability-heading"
      className="space-y-5"
      data-reveal
    >
      {/* Section header */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <SectionHeader
            id="explainability-heading"
            title="Why was this crop recommended?"
            subtitle="See the key factors that influenced this recommendation."
          />
        </div>

        {/* Tooltip trigger */}
        <div className="relative shrink-0 mt-0.5" ref={tooltipRef}>
          <button
            type="button"
            aria-label="About model explainability"
            aria-expanded={tooltipOpen}
            onClick={() => setTooltipOpen((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-charcoal-muted/50 hover:text-charcoal hover:bg-ivory-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {tooltipOpen && (
            <div
              role="tooltip"
              className={cn(
                "absolute right-0 top-9 z-40 w-72 rounded-xl border border-ivory-300",
                "bg-white shadow-card-hover p-4 animate-slide-down"
              )}
            >
              <div className="flex items-start gap-2.5">
                <Info className="h-3.5 w-3.5 text-forest/60 shrink-0 mt-0.5" />
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  These factors show which inputs had the greatest influence on the model's recommendation.
                  They indicate model contribution, not guaranteed cause and effect.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Loading state ── */}
      {status === "loading" && <ExplainabilitySkeleton />}

      {/* ── Idle / unavailable state ── */}
      {status === "idle" && <ExplainabilityUnavailable cropName={cropName} />}

      {/* ── Error state ── */}
      {status === "error" && <ExplainabilityError onRetry={load} />}

      {/* ── Ready state ── */}
      {status === "ready" && contributions.length > 0 && (
        <div className="bg-white rounded-2xl border border-ivory-300 shadow-card overflow-hidden">

          {/* Top factors strip */}
          <TopFactorsStrip contributions={contributions.slice(0, COLLAPSED_COUNT)} />

          {/* Feature contribution rows */}
          <div className="divide-y divide-ivory-100">
            {visibleContributions.map((c, idx) => (
              <FeatureRow
                key={c.feature}
                contribution={c}
                maxImportance={Math.max(...contributions.map((x) => x.importance))}
                delay={idx * 60}
              />
            ))}
          </div>

          {/* Expand / collapse */}
          {hasMore && (
            <div className="border-t border-ivory-200 px-5 py-3 bg-ivory-50/60">
              <button
                type="button"
                id="explainability-expand-btn"
                onClick={() => setExpanded((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold text-forest",
                  "hover:text-forest-600 transition-colors focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-forest/30 rounded"
                )}
                aria-expanded={expanded}
              >
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    expanded && "rotate-180"
                  )}
                />
                {expanded
                  ? "Show less"
                  : `View all ${contributions.length} factors`}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ── Top factors strip ─────────────────────────────────────────────────────

function TopFactorsStrip({ contributions }: { contributions: FeatureContribution[] }) {
  return (
    <div className="px-5 py-4 bg-forest/[0.03] border-b border-forest/8">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-3.5 w-3.5 text-forest/70" />
        <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/60">
          Top Factors
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {contributions.map((c) => (
          <TopFactorChip key={c.feature} contribution={c} />
        ))}
      </div>
    </div>
  );
}

function TopFactorChip({ contribution: c }: { contribution: FeatureContribution }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
        directionChipStyle(c.direction)
      )}
    >
      <DirectionIcon direction={c.direction} className="h-3 w-3" />
      {c.feature}
    </div>
  );
}

// ── Feature row ───────────────────────────────────────────────────────────

interface FeatureRowProps {
  contribution: FeatureContribution;
  maxImportance: number;
  delay: number;
}

function FeatureRow({ contribution: c, maxImportance, delay }: FeatureRowProps) {
  const pct = maxImportance > 0 ? (c.importance / maxImportance) * 100 : 0;
  const pctLabel = Math.round(c.importance * 100);

  return (
    <div
      className={cn(
        "group px-5 py-4 transition-colors duration-150",
        "hover:bg-forest/[0.018]"
      )}
    >
      <div className="flex items-center justify-between gap-4 mb-2.5">
        {/* Feature name + direction icon */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
              directionIconBg(c.direction)
            )}
          >
            <DirectionIcon direction={c.direction} className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-semibold text-charcoal truncate">
            {c.feature}
          </span>
        </div>

        {/* Importance % + label */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-charcoal-muted/60 tabular-nums">
            {pctLabel}%
          </span>
          <DirectionLabel direction={c.direction} />
        </div>
      </div>

      {/* Contribution bar */}
      <div className="h-1.5 w-full rounded-full bg-ivory-200 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all ease-out",
            // Reduced motion: skip animation
            "motion-reduce:transition-none",
            directionBarColor(c.direction)
          )}
          style={{
            width: `${pct}%`,
            transitionDuration: "700ms",
            transitionDelay: `${delay}ms`,
          }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${c.feature}: ${pctLabel}% relative importance`}
        />
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────

function ExplainabilitySkeleton() {
  return (
    <div
      className="bg-white rounded-2xl border border-ivory-300 shadow-card overflow-hidden"
      role="status"
      aria-label="Loading model explanation…"
    >
      {/* Top factors skeleton */}
      <div className="px-5 py-4 bg-ivory-100/60 border-b border-ivory-200 space-y-3">
        <div className="h-3 w-24 rounded-full skeleton-shimmer" />
        <div className="flex gap-2">
          {[60, 80, 70].map((w) => (
            <div key={w} className="h-6 rounded-full skeleton-shimmer" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* Row skeletons */}
      {[90, 75, 55].map((barW, i) => (
        <div key={i} className="px-5 py-4 border-b border-ivory-100 last:border-0 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg skeleton-shimmer shrink-0" />
              <div className="h-4 w-28 rounded-lg skeleton-shimmer" />
            </div>
            <div className="h-4 w-20 rounded-full skeleton-shimmer" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-ivory-200 overflow-hidden">
            <div
              className="h-full rounded-full skeleton-shimmer"
              style={{ width: `${barW}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Unavailable (idle) state ──────────────────────────────────────────────

function ExplainabilityUnavailable({ cropName }: { cropName: string }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-ivory-300 shadow-card p-8 flex flex-col items-center justify-center text-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/8 text-forest/40">
        <Sparkles className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <p className="text-sm font-semibold text-charcoal">
          Explanation not available yet
        </p>
        <p className="text-sm text-charcoal-muted leading-relaxed">
          Detailed model insights for{" "}
          <strong>{cropName}</strong> will appear here when available.
        </p>
        <p className="text-2xs text-charcoal-muted/50 font-medium bg-ivory-100 rounded-lg px-3 py-2 mt-3 inline-block">
          Connect{" "}
          <code className="font-mono text-forest/70">
            GET /predictions/&#123;id&#125;/explain
          </code>{" "}
          to activate
        </p>
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────

function ExplainabilityError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6 flex flex-col sm:flex-row items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
        <AlertCircle className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <div className="flex-1 text-center sm:text-left space-y-0.5">
        <p className="text-sm font-semibold text-charcoal">Unable to load model explanation.</p>
        <p className="text-xs text-charcoal-muted">The explainability service could not be reached.</p>
      </div>
      <button
        type="button"
        id="explainability-retry-btn"
        onClick={onRetry}
        className={cn(
          "shrink-0 flex items-center gap-1.5 rounded-xl border border-ivory-300 bg-white",
          "px-4 py-2 text-xs font-semibold text-charcoal shadow-sm",
          "hover:border-forest/30 hover:bg-forest/[0.02] transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
        )}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Try Again
      </button>
    </div>
  );
}

// ── Direction helpers ─────────────────────────────────────────────────────

function DirectionIcon({
  direction,
  className,
}: {
  direction: FeatureDirection;
  className?: string;
}) {
  if (direction === "positive")
    return <TrendingUp className={cn("text-forest-600", className)} />;
  if (direction === "negative")
    return <TrendingDown className={cn("text-red-500", className)} />;
  return <Minus className={cn("text-charcoal-muted/60", className)} />;
}

function DirectionLabel({ direction }: { direction: FeatureDirection }) {
  const map: Record<FeatureDirection, { text: string; style: string }> = {
    positive: { text: "Positive impact", style: "text-forest-600 bg-forest/8" },
    negative: { text: "Against",          style: "text-red-600 bg-red-50" },
    neutral:  { text: "Neutral",          style: "text-charcoal-muted/70 bg-ivory-100" },
  };
  const { text, style } = map[direction];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-2xs font-semibold", style)}>
      {text}
    </span>
  );
}

function directionBarColor(direction: FeatureDirection): string {
  return direction === "positive"
    ? "bg-forest-500"
    : direction === "negative"
    ? "bg-red-400"
    : "bg-charcoal-muted/30";
}

function directionIconBg(direction: FeatureDirection): string {
  return direction === "positive"
    ? "bg-forest/10 text-forest-600"
    : direction === "negative"
    ? "bg-red-50 text-red-500"
    : "bg-ivory-200 text-charcoal-muted/60";
}

function directionChipStyle(direction: FeatureDirection): string {
  return direction === "positive"
    ? "bg-forest/8 border-forest/15 text-forest-700"
    : direction === "negative"
    ? "bg-red-50 border-red-200 text-red-700"
    : "bg-ivory-100 border-ivory-300 text-charcoal-muted";
}
