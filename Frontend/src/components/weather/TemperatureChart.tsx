import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// TemperatureChart — SVG line chart, reveals on scroll entry
// ---------------------------------------------------------------------------

interface DataPoint { label: string; value: number; }

interface TemperatureChartProps {
  series: DataPoint[];
  unit?: string;
  color?: string;
}

export function TemperatureChart({
  series,
  unit = "°C",
  color = "#1a3d2e",
}: TemperatureChartProps) {
  const [revealed, setRevealed] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) { setRevealed(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [prefersReduced]);

  // SVG geometry
  const W = 480, H = 160;
  const padL = 40, padR = 16, padT = 20, padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const vals = series.map((d) => d.value);
  const minV = Math.min(...vals) - 1;
  const maxV = Math.max(...vals) + 1;

  const toX = (i: number) => padL + (i / (series.length - 1)) * chartW;
  const toY = (v: number) => padT + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const pts = series.map((d, i) => ({ x: toX(i), y: toY(d.value), raw: d }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H - padB} L ${pts[0].x} ${H - padB} Z`;

  const steps = 3;
  const yTicks = Array.from({ length: steps + 1 }, (_, i) =>
    minV + ((maxV - minV) / steps) * i
  );

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: "auto", maxHeight: "180px" }}
        aria-label="Temperature trend chart"
        role="img"
      >
        <defs>
          <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.14" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
          <clipPath id="tempReveal">
            <rect
              x={padL} y={0} height={H}
              width={revealed ? chartW : 0}
              style={{ transition: prefersReduced ? "none" : "width 1.1s ease-out" }}
            />
          </clipPath>
        </defs>

        {/* Y gridlines + labels */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={padL} y1={toY(tick)} x2={W - padR} y2={toY(tick)} stroke="#e6ddd0" strokeWidth="1" />
            <text x={padL - 6} y={toY(tick) + 4} textAnchor="end" fontSize="9" fill="#6b6b6e">
              {tick.toFixed(0)}{unit}
            </text>
          </g>
        ))}

        {/* X labels */}
        {series.map((d, i) => (
          <text key={d.label} x={toX(i)} y={H - padB + 14} textAnchor="middle" fontSize="9" fill="#6b6b6e">
            {d.label}
          </text>
        ))}

        {/* Area */}
        <path d={areaPath} fill="url(#tempGrad)" clipPath="url(#tempReveal)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          clipPath="url(#tempReveal)"
        />

        {/* Points + tooltips */}
        {pts.map((p, i) => (
          <g key={i} clipPath="url(#tempReveal)">
            <circle
              cx={p.x} cy={p.y}
              r={hoverIdx === i ? 6 : 4}
              fill="white" stroke={color} strokeWidth="2.5"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
            {hoverIdx === i && (
              <g>
                <rect x={p.x - 26} y={p.y - 33} width={52} height={20} rx={4} fill={color} />
                <text x={p.x} y={p.y - 19} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">
                  {p.raw.value}{unit}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
