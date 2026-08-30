import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { PageContainer } from "../components/ui/PageContainer";
import { Badge } from "../components/ui/Badge";
import { apiRequest } from "../utils/api";

interface YieldForecastResult {
  prediction: {
    value: number;
    crop_year: number;
  };
  context: {
    state: string;
    district: string;
    crop: string;
    season: string;
    area: number;
  };
  warnings?: string[];
  model?: {
    name: string;
    version: string;
  };
}

interface YieldHistoryItem {
  id: string;
  state: string;
  district: string;
  crop: string;
  season: string;
  cropYear: number;
  area: number;
  predictedYield: number;
  requestPayload: any;
  createdAt: string;
}

export function YieldForecast() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [crop, setCrop] = useState("");
  const [season, setSeason] = useState("Kharif");
  const [area, setArea] = useState("");
  
  // Historical Yields inputs
  const [yield2025, setYield2025] = useState("");
  const [yield2024, setYield2024] = useState("");
  const [yield2023, setYield2023] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<YieldForecastResult | null>(null);

  // History list
  const [historyItems, setHistoryItems] = useState<YieldHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await apiRequest("/yield-prediction/history?limit=10");
      if (res.success && res.data) {
        setHistoryItems(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state || !district || !crop || !area || !yield2025 || !yield2024 || !yield2023) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const historicalYields = [
      parseFloat(yield2023),
      parseFloat(yield2024),
      parseFloat(yield2025),
    ];

    try {
      const res = await apiRequest("/yield-prediction/predict/from-history", {
        method: "POST",
        body: JSON.stringify({
          state,
          district,
          crop,
          season,
          crop_year: 2026,
          area: parseFloat(area),
          historical_yields: historicalYields,
        }),
      });

      if (res.success && res.data) {
        setResult(res.data);
        loadHistory();
      } else {
        throw new Error(res.message || "Failed to predict yield.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Prediction failed. Check your input values.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setState("");
    setDistrict("");
    setCrop("");
    setSeason("Kharif");
    setArea("");
    setYield2025("");
    setYield2024("");
    setYield2023("");
    setResult(null);
    setError(null);
  };

  // Generate SVG Line Chart coords
  const renderChart = () => {
    if (!result) return null;

    const histValues = [
      parseFloat(yield2023),
      parseFloat(yield2024),
      parseFloat(yield2025),
    ];
    const forecastVal = result.prediction.value;
    const allPoints = [...histValues, forecastVal];
    const years = [2023, 2024, 2025, 2026];

    const W = 500, H = 180;
    const padL = 40, padR = 20, padT = 20, padB = 30;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const minVal = Math.min(...allPoints) * 0.9;
    const maxVal = Math.max(...allPoints) * 1.1;

    const toX = (i: number) => padL + (i / 3) * chartW;
    const toY = (v: number) => padT + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

    const points = allPoints.map((v, i) => ({ x: toX(i), y: toY(i === 3 ? forecastVal : v), val: v, yr: years[i] }));

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Y Gridlines */}
        {[0.25, 0.5, 0.75, 1].map((p, i) => {
          const val = minVal + (maxVal - minVal) * p;
          return (
            <g key={i}>
              <line x1={padL} y1={toY(val)} x2={W - padR} y2={toY(val)} stroke="#e6ddd0" strokeDasharray="3 3" />
              <text x={padL - 6} y={toY(val) + 3} textAnchor="end" fontSize="8" fill="#6b6b6e">
                {val.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {points.map((p) => (
          <text key={p.yr} x={p.x} y={H - 10} textAnchor="middle" fontSize="8" fill="#6b6b6e">
            {p.yr}
          </text>
        ))}

        {/* Historical Line */}
        <path
          d={points.slice(0, 3).map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
          fill="none"
          stroke="#1a3d2e"
          strokeWidth="2"
        />

        {/* Forecast Line */}
        <path
          d={`M ${points[2].x} ${points[2].y} L ${points[3].x} ${points[3].y}`}
          fill="none"
          stroke="#ca8a04"
          strokeWidth="2.5"
          strokeDasharray="4 2"
        />

        {/* Draw Points */}
        {points.map((p, i) => (
          <g key={p.yr}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill={i === 3 ? "#ca8a04" : "#1a3d2e"}
              stroke="white"
              strokeWidth="1.5"
            />
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fontWeight="600" fill={i === 3 ? "#b45309" : "#1a3d2e"}>
              {p.val.toFixed(2)}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-ivory pb-12">
      <PageContainer maxWidth="xl" className="py-8 space-y-10 animate-fade-in">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-forest/60">
            Yield Forecast Model
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
            Future Yield Prediction
          </h1>
          <p className="text-sm text-charcoal-muted max-w-xl">
            Input crop type, farm area, and recent years yield history to forecast next season's output using CatBoost.
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="space-y-6">
            {/* Form & Result Box */}
            <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6">
              {!result ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* State */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-charcoal-light uppercase tracking-wider">
                        State
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Bihar"
                        className="w-full rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-forest/40 focus:ring-1 focus:ring-forest/40"
                        required
                      />
                    </div>

                    {/* District */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-charcoal-light uppercase tracking-wider">
                        District
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Gaya"
                        className="w-full rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-forest/40 focus:ring-1 focus:ring-forest/40"
                        required
                      />
                    </div>

                    {/* Crop */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-charcoal-light uppercase tracking-wider">
                        Crop
                      </label>
                      <input
                        type="text"
                        value={crop}
                        onChange={(e) => setCrop(e.target.value)}
                        placeholder="e.g. Wheat"
                        className="w-full rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-forest/40 focus:ring-1 focus:ring-forest/40"
                        required
                      />
                    </div>

                    {/* Season */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-charcoal-light uppercase tracking-wider">
                        Season
                      </label>
                      <select
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        className="w-full rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-forest/40 focus:ring-1 focus:ring-forest/40"
                      >
                        <option value="Kharif">Kharif</option>
                        <option value="Rabi">Rabi</option>
                        <option value="Zaid">Zaid</option>
                      </select>
                    </div>

                    {/* Area (Acres) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-charcoal-light uppercase tracking-wider">
                        Farm Area (Acres)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. 2.5"
                        className="w-full rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-forest/40 focus:ring-1 focus:ring-forest/40"
                        required
                      />
                    </div>
                  </div>

                  {/* Historical Yield Sections */}
                  <div className="border-t border-ivory-200 pt-5 space-y-4">
                    <h3 className="text-xs font-bold text-charcoal-light uppercase tracking-wider">
                      Recent Year Yields (t/ha)
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {/* 2023 */}
                      <div className="space-y-1.5">
                        <label className="text-2xs font-semibold text-charcoal-muted uppercase">
                          2023 Yield
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={yield2023}
                          onChange={(e) => setYield2023(e.target.value)}
                          placeholder="e.g. 3.1"
                          className="w-full rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-forest/40"
                          required
                        />
                      </div>

                      {/* 2024 */}
                      <div className="space-y-1.5">
                        <label className="text-2xs font-semibold text-charcoal-muted uppercase">
                          2024 Yield
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={yield2024}
                          onChange={(e) => setYield2024(e.target.value)}
                          placeholder="e.g. 3.3"
                          className="w-full rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-forest/40"
                          required
                        />
                      </div>

                      {/* 2025 */}
                      <div className="space-y-1.5">
                        <label className="text-2xs font-semibold text-charcoal-muted uppercase">
                          2025 Yield
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={yield2025}
                          onChange={(e) => setYield2025(e.target.value)}
                          placeholder="e.g. 3.5"
                          className="w-full rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-forest/40"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-xs">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-5 py-3 rounded-xl bg-forest text-white text-sm font-bold hover:bg-forest-600 shadow transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Running Forecast Models...
                      </>
                    ) : (
                      "Calculate Future Yield"
                    )}
                  </button>
                </form>
              ) : (
                /* Yield Result Display */
                <div className="space-y-6 animate-slide-up">
                  <div className="grid sm:grid-cols-2 gap-6 items-center">
                    {/* SVG Line Chart rendering */}
                    <div className="bg-ivory/5 border border-ivory-300 rounded-xl p-4 flex flex-col justify-center">
                      <h4 className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted/70 mb-3 text-center">
                        Yield Trend Chart (2023 - 2026)
                      </h4>
                      {renderChart()}
                    </div>

                    {/* Numerical summary details */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted/50">
                          CatBoost Forecasting Result
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="amber" size="sm" dot>
                            Forecasted
                          </Badge>
                          <span className="text-xs font-semibold text-charcoal-light">
                            Season: {result.context.season}
                          </span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-charcoal">
                          {result.prediction.value.toFixed(3)} t/ha
                        </h2>
                        <p className="text-xs text-charcoal-muted">
                          Predicted yield for crop year {result.prediction.crop_year} ({result.context.crop} in {result.context.district}, {result.context.state})
                        </p>
                      </div>

                      {result.warnings && result.warnings.length > 0 && (
                        <div className="space-y-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-3 rounded-xl">
                          <h4 className="text-2xs font-bold text-amber-700 uppercase">Warnings</h4>
                          <p className="text-[10px] text-amber-600 leading-normal">{result.warnings[0]}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleReset}
                          className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 shadow transition-all"
                        >
                          Forecast New Crop
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* History Sidebar */}
          <aside className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-ivory-200">
              <History className="h-4 w-4 text-forest/70" />
              <h3 className="text-sm font-semibold text-charcoal">Prediction History</h3>
            </div>

            {historyLoading && (
              <div className="py-6 flex items-center justify-center text-charcoal-muted gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-xs">Loading history...</span>
              </div>
            )}

            {!historyLoading && historyItems.length === 0 && (
              <div className="py-8 text-center text-xs text-charcoal-muted">
                No past predictions recorded.
              </div>
            )}

            {!historyLoading && historyItems.length > 0 && (
              <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-ivory-300 rounded-xl p-3 bg-ivory/5 hover:border-forest/20 hover:bg-forest/[0.01] transition-all cursor-pointer space-y-1.5"
                    onClick={() => {
                      setResult({
                        prediction: { value: item.predictedYield, crop_year: item.cropYear },
                        context: {
                          state: item.state,
                          district: item.district,
                          crop: item.crop,
                          season: item.season,
                          area: item.area,
                        },
                      });
                      // Bind yields from original payload
                      if (item.requestPayload && item.requestPayload.historical_yields) {
                        setYield2023(String(item.requestPayload.historical_yields[0]));
                        setYield2024(String(item.requestPayload.historical_yields[1]));
                        setYield2025(String(item.requestPayload.historical_yields[2]));
                      }
                      setState(item.state);
                      setDistrict(item.district);
                      setCrop(item.crop);
                      setSeason(item.season);
                      setArea(String(item.area));
                    }}
                  >
                    <div className="flex items-start justify-between min-w-0">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-charcoal truncate">
                          {item.crop}
                        </h4>
                        <p className="text-[10px] text-charcoal-muted truncate">
                          {item.district}, {item.state}
                        </p>
                      </div>
                      <Badge variant="default" size="sm">
                        {item.season}
                      </Badge>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-ivory-200 pt-1.5 mt-1.5">
                      <span className="text-[10px] text-charcoal-muted/50">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-bold text-forest">
                        {item.predictedYield.toFixed(2)} t/ha
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </PageContainer>
    </div>
  );
}
