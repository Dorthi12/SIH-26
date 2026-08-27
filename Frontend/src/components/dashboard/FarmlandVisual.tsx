import { Sprout, CloudSun, BarChart3 } from "lucide-react";

// Simple decorative farmland SVG — "data + agriculture" visual cue
export function FarmlandVisual() {
  return (
    <div className="relative w-full h-full min-h-[180px] flex items-center justify-center" aria-hidden>
      <svg
        viewBox="0 0 400 200"
        className="w-full max-w-sm opacity-60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ground plane perspective lines */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={`h${i}`}
            x1={40} y1={80 + i * 20}
            x2={360} y2={80 + i * 20}
            stroke="#1a3d2e" strokeWidth="0.6" strokeOpacity="0.15"
          />
        ))}
        {/* Vertical field rows */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line
            key={`v${i}`}
            x1={60 + i * 40} y1={75}
            x2={60 + i * 40} y2={175}
            stroke="#1a3d2e" strokeWidth="0.6" strokeOpacity="0.12"
          />
        ))}
        {/* Crop dot grid */}
        {[0,1,2,3,4,5,6].map((col) =>
          [0,1,2,3].map((row) => (
            <circle
              key={`d${col}${row}`}
              cx={75 + col * 40}
              cy={95 + row * 20}
              r="2"
              fill="#1a3d2e"
              fillOpacity={row === 0 ? "0.5" : "0.2"}
            />
          ))
        )}
        {/* Central crop icon area */}
        <circle cx="200" cy="120" r="28" fill="#1a3d2e" fillOpacity="0.06" stroke="#1a3d2e" strokeOpacity="0.2" strokeWidth="1" />
        {/* Location pin */}
        <circle cx="200" cy="50" r="6" fill="#1a3d2e" fillOpacity="0.5" />
        <line x1="200" y1="56" x2="200" y2="94" stroke="#1a3d2e" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 2" />
        {/* Data points with pulse rings */}
        {[[80,60],[320,70],[150,160],[260,155]].map(([cx,cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="8" fill="#1a3d2e" fillOpacity="0.04" stroke="#1a3d2e" strokeOpacity="0.12" strokeWidth="0.8" />
            <circle cx={cx} cy={cy} r="3" fill="#1a3d2e" fillOpacity="0.25" />
          </g>
        ))}
        {/* Contour lines */}
        <path d="M 30 140 Q 200 120 370 140" stroke="#c8922a" strokeWidth="1" strokeOpacity="0.18" fill="none" />
        <path d="M 30 155 Q 200 135 370 155" stroke="#c8922a" strokeWidth="0.8" strokeOpacity="0.12" fill="none" />
      </svg>

      {/* Floating icon badges */}
      <div className="absolute top-4 right-6 flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-ivory-300 shadow-sm">
        <Sprout className="h-4 w-4 text-forest" strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-6 left-8 flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-ivory-300 shadow-sm">
        <CloudSun className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.5} />
      </div>
      <div className="absolute top-1/2 left-4 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-ivory-300 shadow-sm">
        <BarChart3 className="h-3.5 w-3.5 text-forest/60" strokeWidth={1.5} />
      </div>
    </div>
  );
}
