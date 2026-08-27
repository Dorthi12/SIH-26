import { useEffect, useRef, useState } from "react";
import type { HistoricalYieldPoint } from "../../data/mockRecommendation";
import { Badge } from "../ui/Badge";

interface HistoricalYieldChartProps {
  data: HistoricalYieldPoint[];
  cropName: string;
}

export function HistoricalYieldChart({ data, cropName }: HistoricalYieldChartProps) {
  const [revealed, setRevealed] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) { setRevealed(true); return; }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) { setRevealed(true); observer.disconnect(); }
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [prefersReduced]);

  // Chart geometry
  const W = 500, H = 180;
  const padL = 48, padR = 20, padT = 16, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const yields = data.map((d) => d.yield_t_per_ha);
  const minY = Math.floor(Math.min(...yields) * 10) / 10 - 0.2;
  const maxY = Math.ceil(Math.max(...yields) * 10) / 10 + 0.2;

  const toX = (i: number) => padL + (i / (data.length - 1)) * chartW;
  const toY = (y: number) => padT + chartH - ((y - minY) / (maxY - minY)) * chartH;

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.yield_t_per_ha), raw: d }));

  // SVG line path
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  // Area fill
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H - padB} L ${points[0].x} ${H - padB} Z`;

  // Y-axis gridlines
  const steps = 4;
  const yTicks = Array.from({ length: steps + 1 }, (_, i) => minY + ((maxY - minY) / steps) * i);

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60">
              Historical Yield — {cropName}
            </p>
            <p className="text-2xs text-charcoal-muted/50 mt-0.5">Illustrative data · t/ha</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Badge variant="success" size="sm">Historical Stability: High</Badge>
            <Badge variant="success" size="sm">Trend: Improving</Badge>
          </div>
        </div>

        {/* SVG chart */}
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ height: "auto", maxHeight: "220px" }}
            aria-label={`Historical yield chart for ${cropName}`}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a3d2e" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#1a3d2e" stopOpacity="0.01" />
              </linearGradient>
              <clipPath id="revealClip">
                <rect
                  x={padL} y={0} height={H}
                  width={revealed ? chartW : 0}
                  style={{ transition: prefersReduced ? "none" : "width 1.2s ease-out" }}
                />
              </clipPath>
            </defs>

            {/* Gridlines + Y labels */}
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={padL} y1={toY(tick)} x2={W - padR} y2={toY(tick)}
                  stroke="#e6ddd0" strokeWidth="1"
                />
                <text
                  x={padL - 6} y={toY(tick) + 4}
                  textAnchor="end" fontSize="9" fill="#6b6b6e"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            ))}

            {/* X labels */}
            {data.map((d, i) => (
              <text
                key={d.year}
                x={toX(i)} y={H - padB + 16}
                textAnchor="middle" fontSize="9" fill="#6b6b6e"
              >
                {d.year}
              </text>
            ))}

            {/* Y-axis label */}
            <text
              x={10} y={padT + chartH / 2}
              textAnchor="middle" fontSize="8" fill="#6b6b6e"
              transform={`rotate(-90, 10, ${padT + chartH / 2})`}
            >
              Yield (t/ha)
            </text>

            {/* Area */}
            <path d={areaPath} fill="url(#areaGrad)" clipPath="url(#revealClip)" />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#1a3d2e"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              clipPath="url(#revealClip)"
            />

            {/* Data points + hover */}
            {points.map((p, i) => (
              <g key={i} style={{ clipPath: "url(#revealClip)" }}>
                <circle
                  cx={p.x} cy={p.y} r={hoverIdx === i ? 6 : 4}
                  fill="white" stroke="#1a3d2e" strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                />
                {/* Tooltip */}
                {hoverIdx === i && (
                  <g>
                    <rect
                      x={p.x - 28} y={p.y - 34}
                      width={56} height={22}
                      rx={5} fill="#1a3d2e"
                    />
                    <text x={p.x} y={p.y - 19} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">
                      {p.raw.yield_t_per_ha} t/ha
                    </text>
                    <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="7" fill="white" opacity="0.7">
                      {p.raw.year}
                    </text>
                  </g>
                )}
              </g>
            ))}
          </svg>
        </div>

        <p className="text-2xs text-charcoal-muted/50 mt-2">
          Historical performance is presented as supporting evidence for the recommendation.
        </p>
      </div>
    </div>
  );
}
