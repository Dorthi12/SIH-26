import { AlertCircle, RotateCcw, ArrowRight, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

// ── ResultsStatusBanner — "Recommendation Ready" indicator ────────────────

export function RecommendationReadyBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-forest/[0.05] px-3.5 py-1.5 animate-scale-in">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-forest" />
      </span>
      <span className="text-xs font-semibold text-forest">Recommendation Ready</span>
    </div>
  );
}

// ── DecisionInsightCard ───────────────────────────────────────────────────

interface DecisionInsightProps {
  cropName: string;
  suitabilityScore: number;
  yieldDiff: number;
  nextBestCrop: string;
  className?: string;
}

export function DecisionInsightCard({
  cropName,
  suitabilityScore,
  yieldDiff,
  nextBestCrop,
  className,
}: DecisionInsightProps) {
  const isStrong = suitabilityScore >= 80;
  const label    = isStrong ? "Strong recommendation" : "Moderate recommendation";

  return (
    <div
      className={cn(
        "rounded-2xl border border-forest/12 bg-white shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300",
        className
      )}
    >
      {/* Thin accent stripe with gradient */}
      <div className="h-1 w-full bg-gradient-to-r from-forest via-forest/70 to-transparent" />
      <div className="px-6 py-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-2xs font-bold uppercase tracking-widest text-forest/60">
            Decision Insight
          </span>
          <span className="rounded-full border border-forest/15 bg-forest/[0.05] px-2 py-0.5 text-2xs font-semibold text-forest">
            {label}
          </span>
        </div>
        <p className="text-sm text-charcoal-muted leading-relaxed">
          <strong className="text-charcoal">{cropName}</strong> is currently ranked first among the evaluated
          crops, with a suitability score of{" "}
          <strong className="text-charcoal">{suitabilityScore}/100</strong>. Its predicted yield is{" "}
          <strong className="text-forest">+{yieldDiff.toFixed(1)} t/ha</strong> higher than the
          next-ranked option ({nextBestCrop}), based on available data for this farm context.
        </p>
        <p className="text-xs text-charcoal-muted/60">
          This recommendation is based on evaluated signals. Past performance and predictions do not
          guarantee future agricultural outcomes.
        </p>
      </div>
    </div>
  );
}

// ── ResultsSkeletonState ──────────────────────────────────────────────────

export function ResultsSkeletonState() {
  return (
    <div className="space-y-8" aria-label="Loading recommendation…" role="status">
      <div className="h-8 w-48 rounded-xl skeleton-shimmer" />
      <div className="h-24 w-full rounded-2xl skeleton-shimmer" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 rounded-2xl skeleton-shimmer" />
        <div className="h-32 rounded-2xl skeleton-shimmer" />
      </div>
      <div className="h-48 rounded-2xl skeleton-shimmer" />
      <div className="h-40 rounded-2xl skeleton-shimmer" />
    </div>
  );
}

// ── ResultsErrorState ─────────────────────────────────────────────────────

export function ResultsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
        <AlertCircle className="h-8 w-8" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-charcoal">Unable to load the recommendation</h2>
        <p className="text-sm text-charcoal-muted max-w-sm">
          Something went wrong while fetching your crop recommendation. Please try again.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white text-sm font-semibold hover:bg-forest-600 transition-all shadow-sm active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
      >
        <RotateCcw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}

// ── ResultsEmptyState ─────────────────────────────────────────────────────

export function ResultsEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
      {/* Leaf image — agricultural visual for empty state */}
      <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-card mx-auto">
        <img
          src="/leaf-health.jpg"
          alt="Healthy crop leaf"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/40 to-transparent flex items-end justify-center pb-3">
          <Leaf className="h-6 w-6 text-white" strokeWidth={1.5} />
        </div>
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-charcoal">No recommendation yet</h2>
        <p className="text-sm text-charcoal-muted max-w-sm">
          Start by entering your farm context to get a personalised crop recommendation from AgriSense.
        </p>
      </div>
      <button
        type="button"
        onClick={() => navigate("/recommendation")}
        className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white text-sm font-semibold hover:bg-forest-600 transition-all shadow-sm active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
      >
        Start Recommendation
        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
