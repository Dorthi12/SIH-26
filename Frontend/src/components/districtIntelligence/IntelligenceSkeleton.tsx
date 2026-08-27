/**
 * IntelligenceSkeleton — shimmer loading state for the district intelligence view.
 *
 * Reuses the project's existing skeleton-shimmer CSS class.
 */

export function IntelligenceSkeleton() {
  return (
    <div
      className="space-y-8 animate-fade-in"
      role="status"
      aria-label="Loading district intelligence…"
    >
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border border-ivory-300 shadow-card p-5 space-y-3">
            <div className="h-4 w-24 rounded-lg skeleton-shimmer" />
            <div className="h-8 w-16 rounded-xl skeleton-shimmer" />
            <div className="h-2 w-full rounded-full skeleton-shimmer" />
          </div>
        ))}
      </div>

      {/* Map skeleton */}
      <div className="w-full aspect-[2/1] rounded-2xl skeleton-shimmer" />

      {/* Table + detail skeleton */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-3">
          {/* Table header */}
          <div className="h-5 w-48 rounded-lg skeleton-shimmer" />
          {/* Table rows */}
          <div className="bg-card rounded-2xl border border-ivory-300 shadow-card overflow-hidden">
            <div className="h-10 skeleton-shimmer rounded-none border-b border-ivory-200" />
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-ivory-200 last:border-0"
              >
                <div className="h-6 w-6 rounded-lg skeleton-shimmer shrink-0" />
                <div className="h-4 flex-1 rounded-lg skeleton-shimmer" />
                <div className="h-4 w-20 rounded-lg skeleton-shimmer" />
                <div className="h-4 w-14 rounded-lg skeleton-shimmer" />
                <div className="h-5 w-16 rounded-full skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
        {/* Detail panel skeleton */}
        <div className="bg-card rounded-2xl border border-ivory-300 shadow-card p-5 space-y-4">
          <div className="h-5 w-32 rounded-lg skeleton-shimmer" />
          <div className="h-8 w-24 rounded-xl skeleton-shimmer" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl skeleton-shimmer" />
            ))}
          </div>
          <div className="h-16 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
