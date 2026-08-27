import { Sprout, CloudSun, BarChart3 } from "lucide-react";

// Simple decorative farmland visual with ambient float animations and real imagery
export function FarmlandVisual() {
  return (
    <div className="relative w-full h-full min-h-[180px] overflow-hidden rounded-2xl" aria-hidden>
      {/* Real farmland background image */}
      <div className="img-zoom-wrap absolute inset-0">
        <img
          src="/hero-farmland.jpg"
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      {/* Overlay for readability — ivory tinted */}
      <div className="absolute inset-0 bg-gradient-to-br from-ivory/60 via-ivory/30 to-transparent" />

      {/* SVG data overlay — field grid lines on top of photo */}
      <svg
        viewBox="0 0 400 200"
        className="absolute inset-0 w-full h-full opacity-30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Location pin */}
        <circle cx="200" cy="50" r="6" fill="#1a3d2e" fillOpacity="0.6" />
        <line x1="200" y1="56" x2="200" y2="94" stroke="#1a3d2e" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 2" />
        {/* Data nodes */}
        {[[80,60],[320,70],[150,160],[260,155]].map(([cx,cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="8" fill="#1a3d2e" fillOpacity="0.06" stroke="#1a3d2e" strokeOpacity="0.18" strokeWidth="0.8" />
            <circle cx={cx} cy={cy} r="3" fill="#1a3d2e" fillOpacity="0.35" />
          </g>
        ))}
        {/* Contour lines */}
        <path d="M 30 140 Q 200 120 370 140" stroke="#c8922a" strokeWidth="1" strokeOpacity="0.25" fill="none" />
        <path d="M 30 155 Q 200 135 370 155" stroke="#c8922a" strokeWidth="0.8" strokeOpacity="0.15" fill="none" />
      </svg>

      {/* Floating icon badges — staggered float animation */}
      <div
        className="absolute top-4 right-6 flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm border border-ivory-300 shadow-sm animate-float"
        style={{ animationDelay: "0ms" }}
      >
        <Sprout className="h-4 w-4 text-forest" strokeWidth={1.5} />
      </div>
      <div
        className="absolute bottom-6 left-8 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm border border-ivory-300 shadow-sm animate-float"
        style={{ animationDelay: "1400ms" }}
      >
        <CloudSun className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.5} />
      </div>
      <div
        className="absolute top-1/2 left-4 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm border border-ivory-300 shadow-sm animate-float"
        style={{ animationDelay: "700ms" }}
      >
        <BarChart3 className="h-3.5 w-3.5 text-forest/60" strokeWidth={1.5} />
      </div>
    </div>
  );
}
