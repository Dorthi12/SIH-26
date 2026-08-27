import { cn } from "../../utils/cn";

/**
 * AnalysisVisualization — abstract decorative farmland-grid pattern.
 * Purely visual; communicates "data from multiple sources is being combined."
 * No real map data.
 */
export function AnalysisVisualization({ activeStage }: { activeStage: number }) {
  return (
    <div
      className="relative w-full h-full min-h-[260px] flex items-center justify-center overflow-hidden rounded-2xl border border-forest/8 bg-gradient-to-br from-forest/[0.04] to-olive/[0.03]"
      aria-hidden="true"
    >
      {/* ── Grid / field rows ── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.12]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#1a3d2e" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* ── Contour-ish arcs ── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 260"
        preserveAspectRatio="xMidYMid slice"
      >
        {[60, 90, 120, 150, 180].map((r) => (
          <ellipse key={r} cx="200" cy="130" rx={r} ry={r * 0.55} fill="none" stroke="#1a3d2e" strokeWidth="1" />
        ))}
      </svg>

      {/* ── Central cluster ── */}
      <div className="relative flex flex-col items-center gap-4 z-10">

        {/* Pulsing outer ring */}
        <div className="relative flex items-center justify-center">
          <div
            className={cn(
              "absolute rounded-full border transition-all duration-700",
              activeStage < 8
                ? "h-24 w-24 border-forest/20 animate-ping opacity-20"
                : "h-24 w-24 border-forest/30 opacity-30"
            )}
          />
          <div
            className={cn(
              "absolute rounded-full border transition-all duration-700",
              "h-16 w-16 border-forest/25"
            )}
          />

          {/* Core dot */}
          <div
            className={cn(
              "relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-500",
              activeStage >= 8 ? "bg-forest" : "bg-forest/80"
            )}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M8 12h8M12 8v8" />
            </svg>
          </div>
        </div>

        {/* Floating signal dots */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { x: "-52px", y: "-32px", delay: "0s",    size: "h-2 w-2",   color: "bg-forest/50" },
            { x: "48px",  y: "-40px", delay: "0.4s",  size: "h-1.5 w-1.5", color: "bg-amber/60" },
            { x: "-44px", y: "36px",  delay: "0.8s",  size: "h-2 w-2",   color: "bg-olive/50" },
            { x: "50px",  y: "28px",  delay: "1.2s",  size: "h-1.5 w-1.5", color: "bg-forest/40" },
            { x: "0px",   y: "-52px", delay: "0.6s",  size: "h-1.5 w-1.5", color: "bg-forest/30" },
            { x: "-60px", y: "0px",   delay: "1.0s",  size: "h-2 w-2",   color: "bg-amber/40" },
            { x: "62px",  y: "-4px",  delay: "0.2s",  size: "h-1.5 w-1.5", color: "bg-olive/40" },
          ].map((dot, i) => (
            <span
              key={i}
              className={cn(
                "absolute top-1/2 left-1/2 rounded-full animate-pulse",
                dot.size,
                dot.color
              )}
              style={{
                transform: `translate(calc(-50% + ${dot.x}), calc(-50% + ${dot.y}))`,
                animationDelay: dot.delay,
              }}
            />
          ))}
        </div>

        {/* Stage label */}
        <div className="flex flex-col items-center gap-1 mt-2">
          <p className="text-xs font-semibold text-forest/70 uppercase tracking-widest">
            {activeStage >= 8 ? "Analysis Complete" : "Processing"}
          </p>
          <div className="h-px w-16 bg-forest/15" />
          <p className="text-2xs text-charcoal-muted/60 text-center max-w-[140px]">
            {activeStage >= 8
              ? "All signals evaluated"
              : "Combining agricultural signals"}
          </p>
        </div>
      </div>
    </div>
  );
}
