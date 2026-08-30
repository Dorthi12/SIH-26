import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  History,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PageContainer } from "../components/ui/PageContainer";
import { Badge } from "../components/ui/Badge";
import { apiRequest } from "../utils/api";

interface ZeroProductionResult {
  raw_probability: number;
  calibrated_probability: number;
  zero_production_flag: boolean;
  risk_level: string;
  threshold_used: number;
  model_version: string;
}

interface ZeroRiskHistoryItem {
  id: string;
  state: string;
  district: string;
  crop: string;
  season: string;
  area: number;
  calibratedProbability: number;
  riskLevel: string;
  zeroProductionFlag: boolean;
  createdAt: string;
  responsePayload: any;
}

export function ZeroProductionRisk() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [crop, setCrop] = useState("");
  const [season, setSeason] = useState("Kharif");
  const [area, setArea] = useState("");

  // Collapsible Advanced Settings panel
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced feature inputs (pre-populated with realistic defaults)
  const [histGlobal, setHistGlobal] = useState("0.04");
  const [histCrop, setHistCrop] = useState("0.03");
  const histState = "0.05";
  const histDistrict = "0.06";
  const histStateCrop = "0.04";
  const histDistrictCrop = "0.05";
  const histCropSeason = "0.03";
  const histDistrictCropSeason = "0.05";

  const recent3YrZero = "0.0";
  const recent5YrZero = "0.2";
  const recent10YrZero = "0.1";

  const cropHistoryCount = "25";
  const stateHistoryCount = "400";
  const districtHistoryCount = "60";
  const stateCropHistoryCount = "120";
  const districtCropHistoryCount = "20";
  const districtCropSeasonHistoryCount = "10";

  const [meanYield, setMeanYield] = useState("2.3");
  const [medianYield, setMedianYield] = useState("2.1");
  const stdYield = "0.6";
  const minYield = "0.0";
  const maxYield = "4.5";

  const meanArea = "110.0";
  const stdArea = "30.0";
  const recent3YrArea = "118.0";
  const recent5YrArea = "115.0";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ZeroProductionResult | null>(null);

  // History list
  const [historyItems, setHistoryItems] = useState<ZeroRiskHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await apiRequest("/zero-production-risk/history?limit=10");
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
    if (!state || !district || !crop || !area) {
      setError("Please fill out all basic details.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Assembly request payload
    const body = {
      state,
      district,
      crop,
      season,
      area: parseFloat(area),
      historical_zero_rate_global: parseFloat(histGlobal),
      historical_crop_zero_rate: parseFloat(histCrop),
      historical_state_zero_rate: parseFloat(histState),
      historical_district_zero_rate: parseFloat(histDistrict),
      historical_state_crop_zero_rate: parseFloat(histStateCrop),
      historical_district_crop_zero_rate: parseFloat(histDistrictCrop),
      historical_crop_season_zero_rate: parseFloat(histCropSeason),
      historical_district_crop_season_zero_rate: parseFloat(histDistrictCropSeason),
      recent_3yr_zero_rate: parseFloat(recent3YrZero),
      recent_5yr_zero_rate: parseFloat(recent5YrZero),
      recent_10yr_zero_rate: parseFloat(recent10YrZero),
      crop_history_count: parseInt(cropHistoryCount),
      state_history_count: parseInt(stateHistoryCount),
      district_history_count: parseInt(districtHistoryCount),
      state_crop_history_count: parseInt(stateCropHistoryCount),
      district_crop_history_count: parseInt(districtCropHistoryCount),
      district_crop_season_history_count: parseInt(districtCropSeasonHistoryCount),
      district_crop_mean_yield: parseFloat(meanYield),
      district_crop_median_yield: parseFloat(medianYield),
      district_crop_std_yield: parseFloat(stdYield),
      district_crop_min_yield: parseFloat(minYield),
      district_crop_max_yield: parseFloat(maxYield),
      district_crop_mean_area: parseFloat(meanArea),
      district_crop_std_area: parseFloat(stdArea),
      recent_3yr_area_mean: parseFloat(recent3YrArea),
      recent_5yr_area_mean: parseFloat(recent5YrArea),
    };

    try {
      const res = await apiRequest("/zero-production-risk/predict", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (res.success && res.data) {
        setResult(res.data);
        loadHistory();
      } else {
        throw new Error(res.message || "Failed to calculate zero production risk.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Calculation failed. Review input constraints.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const getRiskColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "LOW":
        return "text-green-600 bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30";
      case "MODERATE":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30";
      case "HIGH":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30";
      default:
        return "text-red-600 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30";
    }
  };

  return (
    <div className="min-h-screen bg-ivory pb-12">
      <PageContainer maxWidth="xl" className="py-8 space-y-10 animate-fade-in">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-forest/60">
            Model 3 V3 Risk Analysis
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
            Zero-Production Risk
          </h1>
          <p className="text-sm text-charcoal-muted max-w-xl">
            Evaluate the probability of total crop failure (zero yield) under specific farm profiles and district historical patterns.
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="space-y-6">
            {/* Form Container */}
            <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6">
              {!result ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Details */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-charcoal-light uppercase tracking-wider">
                        State
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Bihar"
                        className="w-full rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-forest/40"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-charcoal-light uppercase tracking-wider">
                        District
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Patna"
                        className="w-full rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-forest/40"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-charcoal-light uppercase tracking-wider">
                        Crop
                      </label>
                      <input
                        type="text"
                        value={crop}
                        onChange={(e) => setCrop(e.target.value)}
                        placeholder="e.g. Rice"
                        className="w-full rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-forest/40"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-charcoal-light uppercase tracking-wider">
                        Season
                      </label>
                      <select
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        className="w-full rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-forest/40"
                      >
                        <option value="Kharif">Kharif</option>
                        <option value="Rabi">Rabi</option>
                        <option value="Zaid">Zaid</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-charcoal-light uppercase tracking-wider">
                        Sown Area (Hectares)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. 10.5"
                        className="w-full rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-forest/40"
                        required
                      />
                    </div>
                  </div>

                  {/* Advanced Settings Collapsible Toggle */}
                  <div className="border-t border-ivory-200 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-600 transition-colors uppercase tracking-wider focus-visible:outline-none"
                    >
                      {showAdvanced ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide Advanced Calibration Features
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show Advanced Calibration Features
                        </>
                      )}
                    </button>

                    {showAdvanced && (
                      <div className="grid sm:grid-cols-2 gap-4 mt-4 p-4 border border-ivory-300 rounded-xl bg-ivory/5 animate-slide-up">
                        {/* Global Zero Rate */}
                        <div className="space-y-1">
                          <label className="text-2xs font-semibold text-charcoal-muted uppercase">
                            Global Failure Rate
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={histGlobal}
                            onChange={(e) => setHistGlobal(e.target.value)}
                            className="w-full rounded-lg border border-ivory-300 bg-white px-3 py-1.5 text-xs focus:border-forest/40"
                          />
                        </div>
                        {/* Historical Crop Rate */}
                        <div className="space-y-1">
                          <label className="text-2xs font-semibold text-charcoal-muted uppercase">
                            Crop Failure Rate
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={histCrop}
                            onChange={(e) => setHistCrop(e.target.value)}
                            className="w-full rounded-lg border border-ivory-300 bg-white px-3 py-1.5 text-xs focus:border-forest/40"
                          />
                        </div>
                        {/* District Mean Yield */}
                        <div className="space-y-1">
                          <label className="text-2xs font-semibold text-charcoal-muted uppercase">
                            District Mean Yield (t/ha)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={meanYield}
                            onChange={(e) => setMeanYield(e.target.value)}
                            className="w-full rounded-lg border border-ivory-300 bg-white px-3 py-1.5 text-xs focus:border-forest/40"
                          />
                        </div>
                        {/* District Median Yield */}
                        <div className="space-y-1">
                          <label className="text-2xs font-semibold text-charcoal-muted uppercase">
                            District Median Yield (t/ha)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={medianYield}
                            onChange={(e) => setMedianYield(e.target.value)}
                            className="w-full rounded-lg border border-ivory-300 bg-white px-3 py-1.5 text-xs focus:border-forest/40"
                          />
                        </div>
                      </div>
                    )}
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
                        Analyzing CatBoost Risk Profile...
                      </>
                    ) : (
                      "Calculate Zero-Production Risk"
                    )}
                  </button>
                </form>
              ) : (
                /* Results display */
                <div className="space-y-6 animate-slide-up">
                  <div className="grid sm:grid-cols-2 gap-6 items-center">
                    {/* Gauge circle or percentage display */}
                    <div className="flex flex-col items-center justify-center text-center p-6 border border-ivory-300 rounded-xl bg-ivory/5">
                      <div className="relative flex items-center justify-center h-28 w-28 rounded-full border-4 border-ivory-300">
                        <span className="text-xl font-black text-charcoal">
                          {Math.round(result.calibrated_probability * 100)}%
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-charcoal-light mt-3">
                        Calibrated Risk Probability
                      </h4>
                    </div>

                    {/* Meta details */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted/50">
                          Risk Classification
                        </span>
                        <div className="flex items-center gap-2">
                          <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${getRiskColor(result.risk_level)}`}>
                            {result.risk_level} RISK
                          </div>
                          {result.zero_production_flag ? (
                            <Badge variant="danger" size="sm" dot>
                              Failure Expected
                            </Badge>
                          ) : (
                            <Badge variant="success" size="sm" dot>
                              Safe Threshold
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 p-3.5 border border-ivory-300 rounded-xl bg-ivory/5">
                        <div className="flex items-start gap-2 text-charcoal-light text-xs">
                          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            {result.zero_production_flag
                              ? "The calculated failure likelihood exceeds the decision threshold of " +
                                result.threshold_used +
                                ". Planting of this crop in this season is high-risk."
                              : "The risk level is within standard parameters. Decision flag is safe."}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 transition-all shadow"
                      >
                        Run New Risk Simulation
                      </button>
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
              <h3 className="text-sm font-semibold text-charcoal">Simulation History</h3>
            </div>

            {historyLoading && (
              <div className="py-6 flex items-center justify-center text-charcoal-muted gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-xs">Loading history...</span>
              </div>
            )}

            {!historyLoading && historyItems.length === 0 && (
              <div className="py-8 text-center text-xs text-charcoal-muted">
                No past runs recorded.
              </div>
            )}

            {!historyLoading && historyItems.length > 0 && (
              <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-ivory-300 rounded-xl p-3 bg-ivory/5 hover:border-forest/20 hover:bg-forest/[0.01] transition-all cursor-pointer space-y-1.5"
                    onClick={() => {
                      setResult(item.responsePayload);
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
                      <Badge variant={item.zeroProductionFlag ? "danger" : "success"} size="sm">
                        {item.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-ivory-200 pt-1.5 mt-1.5">
                      <span className="text-[10px] text-charcoal-muted/50">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-bold text-forest">
                        {Math.round(item.calibratedProbability * 100)}% Risk
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
