import { useState } from "react";
import { cn } from "../../utils/cn";
import type { CropHistoricalData } from "../../data/mockHistoricalData";

// ---------------------------------------------------------------------------
// Multi-line SVG historical yield chart with toggleable crops
// ---------------------------------------------------------------------------

interface YieldTrendChartProps {
  crops: CropHistoricalData[];
  recommendedCrop: string;
}

export function YieldTrendChart({ crops, recommendedCrop }: YieldTrendChartProps) {
  // All crops visible by default
  const [visible, setVisible] = useState<Record<string, boolean>>(
    Object.fromEntries(crops.map((c) => [c.crop, true]))
  );
  const [hovered, setHovered] = useState<{ crop: string; year: number; value: number } | null>(null);

  const toggle = (crop: string) =>
    setVisible((v) => ({ ...v, [crop]: !v[crop] }));

  // Chart geometry
  const W = 560, H = 200;
  const padL = 44, padR = 20, padT = 20, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const allYears = crops[0].yearlyYield.map((d) => d.year);
  const allVals  = crops.flatMap((c) => c.yearlyYield.map((d) => d.yield_t_per_ha));
  const minV = Math.floor(Math.min(...allVals) * 10) / 10 - 0.1;
  const maxV = Math.ceil( Math.max(...allVals) * 10) / 10 + 0.1;

  const toX = (i: number) => padL + (i / (allYears.length - 1)) * chartW;
  const toY = (v: number) => padT + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const steps = 4;
  const yTicks = Array.from({ length: steps + 1 }, (_, i) =>
    minV + ((maxV - minV) / steps) * i
  );

  return (
    <div className="space-y-4">
      {/* Legend / toggle */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Toggle crop visibility">
        {crops.map((c) => (
          <button
            key={c.crop}
            type="button"
            onClick={() => toggle(c.crop)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-1",
              visible[c.crop]
                ? "border-transparent text-white shadow-sm"
                : "border-ivory-300 bg-white text-charcoal-muted/60"
            )}
            style={visible[c.crop] ? { backgroundColor: c.color } : {}}
            aria-pressed={visible[c.crop]}
            aria-label={`${visible[c.crop] ? "Hide" : "Show"} ${c.crop}`}
          >
            <span
              className="h-1.5 w-1.5 rounded-full shrink-0"
              style={{ backgroundColor: visible[c.crop] ? "rgba(255,255,255,0.7)" : c.color }}
            />
            {c.crop}
            {c.crop === recommendedCrop && (
              <span className="text-2xs opacity-70">★</span>
            )}
          </button>
        ))}
      </div>

      {/* SVG chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[300px]"
          style={{ height: "auto", maxHeight: "220px" }}
          aria-label="Multi-crop historical yield trend chart"
          role="img"
        >
          {/* Y gridlines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line x1={padL} y1={toY(tick)} x2={W - padR} y2={toY(tick)} stroke="#e6ddd0" strokeWidth="1" />
              <text x={padL - 6} y={toY(tick) + 4} textAnchor="end" fontSize="8" fill="#6b6b6e">
                {tick.toFixed(1)}
              </text>
            </g>
          ))}

          {/* X year labels */}
          {allYears.map((yr, i) => (
            <text key={yr} x={toX(i)} y={H - padB + 14} textAnchor="middle" fontSize="8" fill="#6b6b6e">
              {yr}
            </text>
          ))}

          {/* Y-axis label */}
          <text
            x={10} y={padT + chartH / 2}
            textAnchor="middle" fontSize="7.5" fill="#6b6b6e"
            transform={`rotate(-90, 10, ${padT + chartH / 2})`}
          >
            Yield (t/ha)
          </text>

          {/* Lines per crop */}
          {crops.map((crop) => {
            if (!visible[crop.crop]) return null;
            const pts = crop.yearlyYield.map((d, i) => ({
              x: toX(i), y: toY(d.yield_t_per_ha), raw: d
            }));
            const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
            const isRec = crop.crop === recommendedCrop;

            return (
              <g key={crop.crop}>
                {/* Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={crop.color}
                  strokeWidth={isRec ? 2.5 : 1.5}
                  strokeDasharray={isRec ? undefined : "4 2"}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* Data points + hover targets */}
                {pts.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p.x} cy={p.y}
                      r={hovered?.crop === crop.crop && hovered.year === p.raw.year ? 6 : (isRec ? 4 : 3)}
                      fill="white" stroke={crop.color} strokeWidth="2"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHovered({ crop: crop.crop, year: p.raw.year, value: p.raw.yield_t_per_ha })}
                      onMouseLeave={() => setHovered(null)}
                    />
                  </g>
                ))}
              </g>
            );
          })}

          {/* Tooltip */}
          {hovered && (() => {
            const cropData = crops.find((c) => c.crop === hovered.crop);
            if (!cropData) return null;
            const yearIdx = cropData.yearlyYield.findIndex((d) => d.year === hovered.year);
            const tx = toX(yearIdx);
            const ty = toY(hovered.value);
            const boxW = 80, boxH = 46;
            const bx = Math.min(tx - boxW / 2, W - padR - boxW);
            const by = ty - boxH - 10;

            return (
              <g>
                <rect x={bx} y={by} width={boxW} height={boxH} rx={5} fill="#1a3d2e" />
                <text x={bx + boxW/2} y={by + 13} textAnchor="middle" fontSize="8" fill="white" fontWeight="700">
                  {hovered.crop}
                </text>
                <text x={bx + boxW/2} y={by + 25} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.7)">
                  {hovered.year}
                </text>
                <text x={bx + boxW/2} y={by + 38} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">
                  {hovered.value} t/ha
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Accessible text summary */}
      <p className="sr-only" aria-live="polite">
        {crops.filter((c) => visible[c.crop]).map((c) => {
          const first = c.yearlyYield[0];
          const last  = c.yearlyYield[c.yearlyYield.length - 1];
          return `${c.crop}: increased from ${first.yield_t_per_ha} t/ha in ${first.year} to ${last.yield_t_per_ha} t/ha in ${last.year}.`;
        }).join(" ")}
      </p>

      <p className="text-2xs text-charcoal-muted/50">
        Illustrative historical data. Solid line = recommended crop. Dashed = other candidates.
        Click legend to toggle visibility.
      </p>
    </div>
  );
}
