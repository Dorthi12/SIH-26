import { useNavigate } from "react-router-dom";
import { ChevronRight, Leaf, Sparkles, ArrowRight } from "lucide-react";

/**
 * Home — Hero landing page for the AgriSense farmer-facing app shell.
 * Features entrance animations, agricultural imagery, and polished CTAs.
 */
export function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[85vh] flex items-center overflow-hidden">

      {/* ── Background: real farmland imagery ── */}
      <div className="absolute inset-0 z-0">
        <div className="img-zoom-wrap absolute inset-0">
          <img
            src="/hero-farmland.jpg"
            alt=""
            className="w-full h-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
        </div>
        {/* Multi-layer overlay: preserve readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-ivory/95 via-ivory/85 to-ivory/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-ivory/80 via-transparent to-transparent" />
      </div>

      {/* ── Subtle grid pattern on top of image ── */}
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.04]" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="home-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#1a3d2e" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#home-grid)" />
        </svg>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="max-w-xl">

          {/* Icon mark with glow */}
          <div className="animate-slide-up mb-8" style={{ animationDelay: "0ms", animationFillMode: "both" }}>
            <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-forest shadow-card ai-glow">
              <Leaf className="h-8 w-8 text-white" strokeWidth={2} />
              <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-amber animate-pulse" strokeWidth={2} />
              {/* Ambient ring */}
              <div className="absolute -inset-1 rounded-3xl border border-forest/15 animate-pulse" style={{ animationDuration: "3s" }} />
            </div>
          </div>

          {/* Eye brow label */}
          <div className="animate-slide-up mb-3" style={{ animationDelay: "80ms", animationFillMode: "both" }}>
            <p className="text-xs font-bold uppercase tracking-widest text-forest/70">
              AgriSense Application
            </p>
          </div>

          {/* Headline */}
          <div className="animate-slide-up" style={{ animationDelay: "150ms", animationFillMode: "both" }}>
            <h1 className="text-4xl sm:text-5xl font-bold text-charcoal leading-tight tracking-tight mb-4">
              Agricultural<br />
              <span className="text-forest relative">
                Intelligence
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-forest/60 to-transparent rounded-full" />
              </span>{" "}
              Platform
            </h1>
          </div>

          {/* Description */}
          <div className="animate-fade-in" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
            <p className="text-charcoal-muted leading-relaxed max-w-sm mb-8 text-base">
              AI-powered crop recommendations using real weather, historical data, and machine learning — designed for Indian farmers.
            </p>
          </div>

          {/* CTA buttons */}
          <div
            className="animate-fade-in flex flex-wrap gap-3"
            style={{ animationDelay: "420ms", animationFillMode: "both" }}
          >
            <button
              type="button"
              onClick={() => navigate("/recommendation")}
              className="group flex items-center gap-2 px-6 py-3.5 rounded-xl bg-forest text-white text-sm font-bold hover:bg-forest-600 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
            >
              Get Crop Recommendation
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="group flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/80 backdrop-blur-sm border border-ivory-300 text-sm font-semibold text-charcoal hover:border-forest/30 hover:bg-white transition-all duration-200 shadow-sm active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
            >
              View Dashboard
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform text-forest/60" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Floating stats pill (bottom of hero) ── */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-fade-in hidden sm:flex items-center gap-6 bg-white/80 backdrop-blur-sm rounded-full border border-ivory-300 shadow-card px-6 py-3"
        style={{ animationDelay: "600ms", animationFillMode: "both" }}
        aria-hidden="true"
      >
        {[
          { label: "Crops Evaluated", value: "15+" },
          { label: "Districts", value: "700+" },
          { label: "Data Signals", value: "3" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-sm font-bold text-charcoal">{s.value}</p>
            <p className="text-2xs text-charcoal-muted">{s.label}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
