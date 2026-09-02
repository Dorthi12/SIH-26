import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  History,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Star,
  MessageSquare,
  Play,
  CheckCircle2,
  X,
  Sparkles,
  SlidersHorizontal,
  Info,
  Layers,
  ArrowRight,
  Send,
  Calendar,
  MapPin,
  Sprout,
  BarChart3,
  Award,
  BookOpen,
} from "lucide-react";
import { PageContainer } from "../components/ui/PageContainer";
import { Badge } from "../components/ui/Badge";
import { apiRequest } from "../utils/api";

export interface ReviewData {
  reviewer: string;
  role: string;
  rating: number;
  summary: string;
  primaryFactors: string[];
  mitigation: string;
  status: string;
  userRating?: number;
  userNotes?: string;
}

export interface ZeroRiskHistoryItem {
  id: string;
  state: string;
  district: string;
  crop: string;
  season: string;
  area: number;
  calibratedProbability: number;
  riskLevel: "HIGH" | "MODERATE" | "LOW";
  zeroProductionFlag: boolean;
  createdAt: string;
  responsePayload: any;
  review?: ReviewData;
  queryTags?: string[];
  isDemo?: boolean;
}

interface ZeroProductionResult {
  raw_probability: number;
  calibrated_probability: number;
  zero_production_flag: boolean;
  risk_level: string;
  threshold_used: number;
  model_version: string;
}

// ── Demo Pre-populated History Items ──────────────────────────────────────
const DEMO_HISTORY_ITEMS: ZeroRiskHistoryItem[] = [
  {
    id: "demo-sim-1",
    state: "Bihar",
    district: "Patna",
    crop: "Rice",
    season: "Kharif",
    area: 12.5,
    calibratedProbability: 0.68,
    riskLevel: "HIGH",
    zeroProductionFlag: true,
    createdAt: "2026-08-28T14:30:00Z",
    isDemo: true,
    responsePayload: {
      raw_probability: 0.72,
      calibrated_probability: 0.68,
      zero_production_flag: true,
      risk_level: "HIGH",
      threshold_used: 0.35,
      model_version: "CatBoost-Isotonic-v3.2",
    },
    review: {
      reviewer: "Dr. R. K. Varma",
      role: "Senior Risk Agronomist, Bihar Ag University",
      rating: 4.8,
      summary:
        "CatBoost model identifies critical drought anomaly combined with 3-year consecutive flood damage patterns in low-lying tracts of Patna district. Soil moisture deficit during panicle initiation stage creates high zero-yield risk.",
      primaryFactors: [
        "Monsoon Onset Delay (+18 days)",
        "Low Water Table Index",
        "Historical 3-Yr Failure Rate (0.24)",
        "High Soil Saline Stress",
      ],
      mitigation:
        "Shift to short-duration Swarna Sub-1 rice or drought-resistant pulses. Apply for PMFBY crop insurance cover before July 15. Adopt alternate wetting & drying (AWD) irrigation.",
      status: "Reviewed & Verified",
      userRating: 5,
      userNotes: "Observed severe water scarcity last Kharif. Switching to drip irrigation for next cycle.",
    },
    queryTags: ["bihar", "patna", "rice", "high risk", "kharif", "drought", "insurance"],
  },
  {
    id: "demo-sim-2",
    state: "Punjab",
    district: "Ludhiana",
    crop: "Wheat",
    season: "Rabi",
    area: 25.0,
    calibratedProbability: 0.12,
    riskLevel: "LOW",
    zeroProductionFlag: false,
    createdAt: "2026-08-25T09:15:00Z",
    isDemo: true,
    responsePayload: {
      raw_probability: 0.1,
      calibrated_probability: 0.12,
      zero_production_flag: false,
      risk_level: "LOW",
      threshold_used: 0.35,
      model_version: "CatBoost-Isotonic-v3.2",
    },
    review: {
      reviewer: "Prof. S. Singh",
      role: "PAU Ludhiana Agronomy Cell",
      rating: 4.9,
      summary:
        "Excellent groundwater availability, stable thermal profile, and reliable canal irrigation ensure minimal risk of total failure. District historical failure rate is under 0.8%.",
      primaryFactors: [
        "Canal Irrigation Access (98%)",
        "Optimal Winter Thermal Hours",
        "Low Failure Variance (<1%)",
      ],
      mitigation:
        "Maintain standard NPK fertilizer schedule (120:60:40 kg/ha). Monitor for early yellow rust warnings in late January.",
      status: "Verified Safe",
      userRating: 5,
      userNotes: "High yield expected based on current canal water discharge and winter outlook.",
    },
    queryTags: ["punjab", "ludhiana", "wheat", "low risk", "rabi", "safe", "canal"],
  },
  {
    id: "demo-sim-3",
    state: "Gujarat",
    district: "Rajkot",
    crop: "Cotton",
    season: "Kharif",
    area: 18.2,
    calibratedProbability: 0.54,
    riskLevel: "HIGH",
    zeroProductionFlag: true,
    createdAt: "2026-08-20T16:45:00Z",
    isDemo: true,
    responsePayload: {
      raw_probability: 0.58,
      calibrated_probability: 0.54,
      zero_production_flag: true,
      risk_level: "HIGH",
      threshold_used: 0.35,
      model_version: "CatBoost-Isotonic-v3.2",
    },
    review: {
      reviewer: "AgriSense AI Risk Engine & Junagadh Expert Team",
      role: "Regional Pest & Weather Audit",
      rating: 4.6,
      summary:
        "Elevated risk driven by erratic rainfall distribution and pink bollworm infestation likelihood in Saurashtra region. Standard yield variation is high (±0.8 t/ha).",
      primaryFactors: [
        "Pink Bollworm Vulnerability",
        "Dry Spell Duration >14 days",
        "High Historical Area Variance",
      ],
      mitigation:
        "Deploy pheromone traps at 12/ha. Consider intercropping with green gram (mung) to buffer income risk. Spray neem-based bio-pesticide during early squaring stage.",
      status: "Action Recommended",
      userRating: 4,
      userNotes: "Pest outbreak experienced last season. Installing pheromone traps as suggested.",
    },
    queryTags: ["gujarat", "rajkot", "cotton", "high risk", "kharif", "pest", "bollworm"],
  },
  {
    id: "demo-sim-4",
    state: "Andhra Pradesh",
    district: "Anantapur",
    crop: "Groundnut",
    season: "Kharif",
    area: 8.0,
    calibratedProbability: 0.42,
    riskLevel: "MODERATE",
    zeroProductionFlag: false,
    createdAt: "2026-08-15T11:20:00Z",
    isDemo: true,
    responsePayload: {
      raw_probability: 0.44,
      calibrated_probability: 0.42,
      zero_production_flag: false,
      risk_level: "MODERATE",
      threshold_used: 0.35,
      model_version: "CatBoost-Isotonic-v3.2",
    },
    review: {
      reviewer: "Dr. M. Lakshmi",
      role: "AP Rayalaseema Dryland Institute",
      rating: 4.7,
      summary:
        "Dryland farming area with high dry spell probability. Calibrated probability of failure is near threshold (0.42 vs 0.35 threshold). Crop sensitivity is moderate.",
      primaryFactors: [
        "Coarse Sandy Soil Moisture Deficit",
        "Mid-Season Dry Spell Vulnerability",
        "Recent 5-Yr Area Shrinkage",
      ],
      mitigation:
        "Adopt protective sprinkler irrigation during pod development. Mulching with crop residues recommended to preserve soil moisture.",
      status: "Under Monitoring",
      userRating: 4,
      userNotes: "Applying protective irrigation with farm pond water during dry spells.",
    },
    queryTags: ["andhra pradesh", "anantapur", "groundnut", "moderate risk", "kharif", "dryland"],
  },
  {
    id: "demo-sim-5",
    state: "Karnataka",
    district: "Gulbarga",
    crop: "Arhar (Pigeon Pea)",
    season: "Kharif",
    area: 15.0,
    calibratedProbability: 0.22,
    riskLevel: "LOW",
    zeroProductionFlag: false,
    createdAt: "2026-08-10T10:05:00Z",
    isDemo: true,
    responsePayload: {
      raw_probability: 0.2,
      calibrated_probability: 0.22,
      zero_production_flag: false,
      risk_level: "LOW",
      threshold_used: 0.35,
      model_version: "CatBoost-Isotonic-v3.2",
    },
    review: {
      reviewer: "Dr. K. N. Rao",
      role: "UAS Raichur Pulses Specialist",
      rating: 4.5,
      summary:
        "Black cotton soil retains moisture well during late Kharif dry spells. Historical zero-production rate in Gulbarga district for Arhar is low (2.1%).",
      primaryFactors: [
        "High Soil Clay Moisture Capacity",
        "Deep Root System Resilience",
        "Low Failure Rate History",
      ],
      mitigation:
        "Perform seed treatment with Rhizobium and PSB culture before sowing. Ensure proper field drainage to avoid fusarium wilt.",
      status: "Verified Safe",
      userRating: 5,
      userNotes: "Good crop condition. Followed recommended Rhizobium seed treatment.",
    },
    queryTags: ["karnataka", "gulbarga", "arhar", "pigeon pea", "low risk", "kharif", "pulses"],
  },
  {
    id: "demo-sim-6",
    state: "Maharashtra",
    district: "Nashik",
    crop: "Onion",
    season: "Rabi",
    area: 6.5,
    calibratedProbability: 0.38,
    riskLevel: "MODERATE",
    zeroProductionFlag: false,
    createdAt: "2026-08-04T13:50:00Z",
    isDemo: true,
    responsePayload: {
      raw_probability: 0.36,
      calibrated_probability: 0.38,
      zero_production_flag: false,
      risk_level: "MODERATE",
      threshold_used: 0.35,
      model_version: "CatBoost-Isotonic-v3.2",
    },
    review: {
      reviewer: "AgriSense Regional Risk Audit",
      role: "Horticulture Risk Evaluator",
      rating: 4.6,
      summary:
        "Unseasonal rainfall during harvest window poses disease and post-harvest rot risk. CatBoost model flags weather variance during bulb maturity.",
      primaryFactors: [
        "Unseasonal Harvest Rainfall Risk",
        "Fungal Purple Blotch Sensitivity",
        "Post-Harvest Storage Loss",
      ],
      mitigation:
        "Construct raised nursery beds and prepare well-ventilated storage sheds (Kanda Chawl). Apply protective fungicide spray 15 days pre-harvest.",
      status: "Action Recommended",
      userRating: 4,
      userNotes: "Prepared ventilated storage structures in advance to prevent moisture rot.",
    },
    queryTags: ["maharashtra", "nashik", "onion", "moderate risk", "rabi", "horticulture"],
  },
];

export function ZeroProductionRisk() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [crop, setCrop] = useState("");
  const [season, setSeason] = useState("Kharif");
  const [area, setArea] = useState("");

  // Collapsible Advanced Settings panel
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced feature inputs
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

  // History list state
  const [historyItems, setHistoryItems] = useState<ZeroRiskHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Query Window State ──────────────────────────────────────────────────
  const [showQueryWindow, setShowQueryWindow] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [seasonFilter, setSeasonFilter] = useState<string>("ALL");
  const [stateFilter, setStateFilter] = useState<string>("ALL");

  // ── Review Window Modal State ──────────────────────────────────────────
  const [selectedReviewItem, setSelectedReviewItem] = useState<ZeroRiskHistoryItem | null>(null);
  const [userRatingInput, setUserRatingInput] = useState<number>(5);
  const [userNotesInput, setUserNotesInput] = useState<string>("");
  const [reviewSavedSuccess, setReviewSavedSuccess] = useState<boolean>(false);

  // Fetch backend history & merge with demo history
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await apiRequest("/zero-production-risk/history?limit=10");
      if (res.success && res.data && res.data.length > 0) {
        // Merge real items with demo items (avoid duplicate IDs)
        const realIds = new Set(res.data.map((i: any) => i.id));
        const filteredDemos = DEMO_HISTORY_ITEMS.filter((d) => !realIds.has(d.id));
        setHistoryItems([...res.data, ...filteredDemos]);
      } else {
        setHistoryItems(DEMO_HISTORY_ITEMS);
      }
    } catch (err: any) {
      console.error("Failed to load backend history, loading demo dataset:", err);
      setHistoryItems(DEMO_HISTORY_ITEMS);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Open review modal for a specific history item
  const openReviewModal = (item: ZeroRiskHistoryItem) => {
    setSelectedReviewItem(item);
    setUserRatingInput(item.review?.userRating || item.review?.rating || 5);
    setUserNotesInput(item.review?.userNotes || "");
    setReviewSavedSuccess(false);
  };

  // Save updated user rating and notes
  const handleSaveUserReview = () => {
    if (!selectedReviewItem) return;

    const updatedItems = historyItems.map((item) => {
      if (item.id === selectedReviewItem.id) {
        const existingReview = item.review || {
          reviewer: "AgriSense Field Audit",
          role: "Farmer & Field Reviewer",
          rating: 4.5,
          summary: "Simulation output reviewed against ground truth observation.",
          primaryFactors: ["Local Climate Condition"],
          mitigation: "Follow standard agronomic advisory.",
          status: "Verified",
        };
        return {
          ...item,
          review: {
            ...existingReview,
            userRating: userRatingInput,
            userNotes: userNotesInput,
          },
        };
      }
      return item;
    });

    setHistoryItems(updatedItems);
    if (selectedReviewItem.review) {
      setSelectedReviewItem({
        ...selectedReviewItem,
        review: {
          ...selectedReviewItem.review,
          userRating: userRatingInput,
          userNotes: userNotesInput,
        },
      });
    }
    setReviewSavedSuccess(true);
    setTimeout(() => setReviewSavedSuccess(false), 3000);
  };

  // Re-run simulation in form
  const handleRerunInForm = (item: ZeroRiskHistoryItem) => {
    setState(item.state);
    setDistrict(item.district);
    setCrop(item.crop);
    setSeason(item.season);
    setArea(String(item.area));
    setResult(item.responsePayload || null);
    setSelectedReviewItem(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filtered History Calculation for Query Window
  const filteredHistory = useMemo(() => {
    return historyItems.filter((item) => {
      // Risk filter
      if (riskFilter !== "ALL" && item.riskLevel.toUpperCase() !== riskFilter) {
        return false;
      }
      // Season filter
      if (seasonFilter !== "ALL" && item.season.toLowerCase() !== seasonFilter.toLowerCase()) {
        return false;
      }
      // State filter
      if (stateFilter !== "ALL" && item.state.toLowerCase() !== stateFilter.toLowerCase()) {
        return false;
      }
      // Search query string search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCrop = item.crop.toLowerCase().includes(q);
        const matchesDistrict = item.district.toLowerCase().includes(q);
        const matchesState = item.state.toLowerCase().includes(q);
        const matchesRisk = item.riskLevel.toLowerCase().includes(q);
        const matchesSeason = item.season.toLowerCase().includes(q);
        const matchesTags = item.queryTags?.some((t) => t.toLowerCase().includes(q));
        const matchesSummary = item.review?.summary.toLowerCase().includes(q);
        if (
          !matchesCrop &&
          !matchesDistrict &&
          !matchesState &&
          !matchesRisk &&
          !matchesSeason &&
          !matchesTags &&
          !matchesSummary
        ) {
          return false;
        }
      }
      return true;
    });
  }, [historyItems, riskFilter, seasonFilter, stateFilter, searchQuery]);

  const resetQueryFilters = () => {
    setSearchQuery("");
    setRiskFilter("ALL");
    setSeasonFilter("ALL");
    setStateFilter("ALL");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state || !district || !crop || !area) {
      setError("Please fill out all basic details.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

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
        // Prepend new run to history list
        const newRunItem: ZeroRiskHistoryItem = {
          id: "sim-run-" + Date.now(),
          state,
          district,
          crop,
          season,
          area: parseFloat(area),
          calibratedProbability: res.data.calibrated_probability,
          riskLevel: (res.data.risk_level || "LOW").toUpperCase() as any,
          zeroProductionFlag: res.data.zero_production_flag,
          createdAt: new Date().toISOString(),
          responsePayload: res.data,
          review: {
            reviewer: "AgriSense CatBoost Engine",
            role: "Live Model Predictor",
            rating: 4.9,
            summary: `Automated zero-production risk assessment computed for ${crop} in ${district}, ${state} (${season}). Calibrated risk probability: ${Math.round(
              res.data.calibrated_probability * 100
            )}%.`,
            primaryFactors: [
              "Isotonic Risk Calibration",
              `Decision Threshold ${res.data.threshold_used}`,
            ],
            mitigation: res.data.zero_production_flag
              ? "High risk of yield failure. Explore alternate crop options or crop insurance."
              : "Standard risk parameters. Follow normal agricultural practices.",
            status: "Live Simulation",
          },
          queryTags: [state.toLowerCase(), district.toLowerCase(), crop.toLowerCase(), season.toLowerCase()],
        };

        setHistoryItems((prev) => [newRunItem, ...prev]);
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
        return "text-green-600 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30";
      case "MODERATE":
        return "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30";
      case "HIGH":
        return "text-rose-600 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30";
      default:
        return "text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30";
    }
  };

  return (
    <div className="min-h-screen bg-ivory pb-12">
      <PageContainer maxWidth="xl" className="py-8 space-y-8 animate-fade-in">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-300/60 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-forest/70 bg-forest/10 px-2.5 py-0.5 rounded-full">
                Model 3 V3 Risk Analysis
              </span>
              <span className="text-xs font-semibold text-charcoal-muted">CatBoost + Isotonic</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
              Zero-Production Risk
            </h1>
            <p className="text-sm text-charcoal-muted max-w-2xl">
              Evaluate the probability of total crop failure (zero yield) under specific farm profiles, district historical patterns, and weather anomalies.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowQueryWindow(!showQueryWindow)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
                showQueryWindow
                  ? "bg-forest text-white border-forest shadow-md"
                  : "bg-white text-charcoal border-ivory-300 hover:border-forest/40"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Query Window</span>
              {filteredHistory.length < historyItems.length && (
                <span className="ml-1 bg-amber-400 text-charcoal-dark px-1.5 py-0.2 rounded-full text-[10px]">
                  {filteredHistory.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setHistoryItems(DEMO_HISTORY_ITEMS)}
              className="px-3.5 py-2 rounded-xl border border-ivory-300 bg-white hover:bg-ivory/20 text-charcoal-light text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Reset and reload default demo simulation history dataset"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Reset Demo Values</span>
            </button>
          </div>
        </header>

        {/* Query Window Drawer / Panel */}
        {showQueryWindow && (
          <div className="bg-white rounded-2xl border border-forest/20 shadow-lg p-5 space-y-4 animate-slide-down">
            <div className="flex items-center justify-between border-b border-ivory-200 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-forest" />
                <h3 className="text-sm font-bold text-charcoal">Simulation Query & Filter Window</h3>
                <span className="text-2xs bg-forest/10 text-forest font-bold px-2 py-0.5 rounded-md">
                  Demo Query Engine
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowQueryWindow(false)}
                className="p-1 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-ivory/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history by crop, district, state, risk level or query tags (e.g. 'Rice Patna High Risk')..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-300 bg-ivory/10 text-sm text-charcoal focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-charcoal-muted hover:text-charcoal"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-charcoal-muted uppercase">Risk Level</label>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full rounded-xl border border-ivory-300 bg-white px-3 py-1.5 text-xs text-charcoal"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="HIGH">High Risk (&gt;50%)</option>
                  <option value="MODERATE">Moderate Risk (30-50%)</option>
                  <option value="LOW">Low Risk (&lt;30%)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-charcoal-muted uppercase">Season</label>
                <select
                  value={seasonFilter}
                  onChange={(e) => setSeasonFilter(e.target.value)}
                  className="w-full rounded-xl border border-ivory-300 bg-white px-3 py-1.5 text-xs text-charcoal"
                >
                  <option value="ALL">All Seasons</option>
                  <option value="Kharif">Kharif</option>
                  <option value="Rabi">Rabi</option>
                  <option value="Zaid">Zaid</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-charcoal-muted uppercase">State</label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full rounded-xl border border-ivory-300 bg-white px-3 py-1.5 text-xs text-charcoal"
                >
                  <option value="ALL">All States</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetQueryFilters}
                  className="w-full py-1.5 px-3 rounded-xl border border-ivory-300 bg-ivory/20 hover:bg-ivory/50 text-xs font-semibold text-charcoal-light transition-all"
                >
                  Reset Query
                </button>
              </div>
            </div>

            {/* Quick Demo Query Preset Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-ivory-200">
              <span className="text-[11px] font-bold text-charcoal-muted flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" /> Demo Query Shortcuts:
              </span>
              <button
                type="button"
                onClick={() => {
                  setRiskFilter("HIGH");
                  setSeasonFilter("ALL");
                  setStateFilter("ALL");
                  setSearchQuery("");
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all"
              >
                🔴 High Risk Runs (&gt;50%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRiskFilter("LOW");
                  setSeasonFilter("ALL");
                  setStateFilter("ALL");
                  setSearchQuery("");
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-all"
              >
                🟢 Safe Threshold (&lt;30%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSeasonFilter("Kharif");
                  setRiskFilter("ALL");
                  setStateFilter("ALL");
                  setSearchQuery("");
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-all"
              >
                🌾 Kharif Season
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("Patna");
                  setRiskFilter("ALL");
                  setSeasonFilter("ALL");
                  setStateFilter("ALL");
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all"
              >
                📍 Patna District
              </button>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          <div className="space-y-6">
            {/* Calculator Form Container */}
            <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-6 space-y-6">
              {!result ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-ivory-200 pb-3">
                    <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                      <Sprout className="h-5 w-5 text-forest" />
                      Farm & District Risk Calculator
                    </h3>
                    <span className="text-xs text-charcoal-muted">Input farm profile below</span>
                  </div>

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
                    <div className="space-y-1.5 sm:col-span-2">
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
                    <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-3 rounded-xl border border-red-100">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-5 py-3.5 rounded-xl bg-forest text-white text-sm font-bold hover:bg-forest-600 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Analyzing CatBoost Risk Profile...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4" />
                        Calculate Zero-Production Risk
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Results display */
                <div className="space-y-6 animate-slide-up">
                  <div className="flex items-center justify-between border-b border-ivory-200 pb-3">
                    <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                      <Award className="h-5 w-5 text-forest" />
                      Simulation Risk Result
                    </h3>
                    <Badge variant={result.zero_production_flag ? "danger" : "success"} size="sm">
                      {result.risk_level} RISK
                    </Badge>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 items-center">
                    {/* Gauge circle display */}
                    <div className="flex flex-col items-center justify-center text-center p-6 border border-ivory-300 rounded-2xl bg-ivory/10 shadow-xs">
                      <div className="relative flex items-center justify-center h-32 w-32 rounded-full border-8 border-forest/20 bg-white shadow-inner">
                        <span className="text-2xl font-black text-charcoal">
                          {Math.round(result.calibrated_probability * 100)}%
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-charcoal-light mt-3 uppercase tracking-wider">
                        Calibrated Risk Probability
                      </h4>
                      <p className="text-[11px] text-charcoal-muted mt-1">
                        Raw CatBoost prob: {Math.round(result.raw_probability * 100)}%
                      </p>
                    </div>

                    {/* Meta details */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted">
                          Risk Status
                        </span>
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-3 py-1 rounded-xl border text-xs font-bold ${getRiskColor(
                              result.risk_level
                            )}`}
                          >
                            {result.risk_level} RISK CLASSIFICATION
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 p-4 border border-ivory-300 rounded-xl bg-white shadow-2xs">
                        <div className="flex items-start gap-2.5 text-charcoal-light text-xs">
                          <ShieldAlert className="h-4 w-4 text-forest shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            {result.zero_production_flag
                              ? `The calculated failure likelihood (${Math.round(
                                  result.calibrated_probability * 100
                                )}%) exceeds the critical decision threshold of ${
                                  result.threshold_used
                                }. Planting ${crop} in ${district} this ${season} season is high-risk.`
                              : "The risk level is within safe agronomic parameters. Decision flag is optimal."}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleReset}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 transition-all shadow-xs"
                        >
                          Run New Simulation
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
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-forest" />
                <h3 className="text-sm font-bold text-charcoal">Simulation History</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-md">
                  {filteredHistory.length} runs
                </span>
              </div>
            </div>

            {/* Quick Query Bar trigger inside sidebar */}
            <button
              type="button"
              onClick={() => setShowQueryWindow(!showQueryWindow)}
              className="w-full p-2.5 rounded-xl border border-dashed border-forest/30 bg-forest/[0.03] hover:bg-forest/[0.07] text-forest text-xs font-bold flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5" />
                {showQueryWindow ? "Close Query Window" : "Open Query & Search Window"}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showQueryWindow ? "rotate-180" : ""}`}
              />
            </button>

            {historyLoading && (
              <div className="py-8 flex items-center justify-center text-charcoal-muted gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-forest" />
                <span className="text-xs">Loading simulation history...</span>
              </div>
            )}

            {!historyLoading && filteredHistory.length === 0 && (
              <div className="py-10 text-center space-y-2">
                <BookOpen className="h-8 w-8 text-charcoal-muted/40 mx-auto" />
                <p className="text-xs font-semibold text-charcoal-muted">No simulation history matches query.</p>
                <button
                  type="button"
                  onClick={resetQueryFilters}
                  className="text-xs text-forest underline font-bold hover:text-forest-600"
                >
                  Reset filters
                </button>
              </div>
            )}

            {!historyLoading && filteredHistory.length > 0 && (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="border border-ivory-300 rounded-xl p-3.5 bg-white hover:border-forest/40 hover:shadow-xs transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between min-w-0 gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-charcoal truncate group-hover:text-forest transition-colors">
                            {item.crop}
                          </h4>
                          {item.isDemo && (
                            <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                              DEMO
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-charcoal-muted truncate">
                          {item.district}, {item.state} • {item.season} ({item.area} Ha)
                        </p>
                      </div>
                      <Badge variant={item.zeroProductionFlag ? "danger" : "success"} size="sm">
                        {item.riskLevel}
                      </Badge>
                    </div>

                    {/* Summary note snippet */}
                    {item.review && (
                      <p className="text-[11px] text-charcoal-light line-clamp-2 bg-ivory/20 p-2 rounded-lg border border-ivory-200/50">
                        "{item.review.summary}"
                      </p>
                    )}

                    <div className="flex items-center justify-between border-t border-ivory-200 pt-2 mt-2">
                      <span className="text-[10px] text-charcoal-muted">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-forest">
                          {Math.round(item.calibratedProbability * 100)}% Risk
                        </span>
                        <button
                          type="button"
                          onClick={() => openReviewModal(item)}
                          className="px-2.5 py-1 rounded-lg bg-forest/10 hover:bg-forest text-forest hover:text-white text-[11px] font-bold transition-all flex items-center gap-1"
                        >
                          <BookOpen className="h-3 w-3" />
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </PageContainer>

      {/* ── SIMULATION REVIEW WINDOW MODAL ────────────────────────────────────── */}
      {selectedReviewItem && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-ivory-300 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 border-b border-ivory-200 bg-ivory/10 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-forest bg-forest/10 px-2.5 py-0.5 rounded-full">
                    Simulation Review & Diagnostic Window
                  </span>
                  {selectedReviewItem.isDemo && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                      Demo Dataset Run
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
                  {selectedReviewItem.crop} — {selectedReviewItem.district}, {selectedReviewItem.state}
                </h2>
                <p className="text-xs text-charcoal-muted">
                  Season: <strong className="text-charcoal">{selectedReviewItem.season}</strong> • Area:{" "}
                  <strong className="text-charcoal">{selectedReviewItem.area} Hectares</strong> • Date:{" "}
                  {new Date(selectedReviewItem.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReviewItem(null)}
                className="p-1.5 rounded-full text-charcoal-muted hover:text-charcoal hover:bg-ivory-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Risk Gauge Bar */}
              <div className="p-4 rounded-2xl border border-ivory-300 bg-ivory/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-forest" />
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                      Calibrated Failure Risk Probability
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-charcoal">
                      {Math.round(selectedReviewItem.calibratedProbability * 100)}%
                    </span>
                    <Badge variant={selectedReviewItem.zeroProductionFlag ? "danger" : "success"} size="sm">
                      {selectedReviewItem.riskLevel} RISK
                    </Badge>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-3 w-full bg-ivory-300 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedReviewItem.calibratedProbability > 0.5
                        ? "bg-rose-500"
                        : selectedReviewItem.calibratedProbability > 0.3
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.round(selectedReviewItem.calibratedProbability * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-charcoal-muted">
                  <span>Isotonic Calibrated Threshold: 35%</span>
                  <span>
                    Status:{" "}
                    <strong className="text-charcoal">
                      {selectedReviewItem.zeroProductionFlag ? "High Risk of Failure" : "Safe Operating Margin"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Agronomist Review Report */}
              {selectedReviewItem.review && (
                <div className="space-y-4 border-t border-ivory-200 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-charcoal flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-forest" />
                      Agronomic Diagnostic & Expert Review
                    </h3>
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-amber-900">
                        {selectedReviewItem.review.rating} / 5.0
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-ivory-300 bg-white space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-ivory-200 pb-2">
                      <span className="font-bold text-charcoal">{selectedReviewItem.review.reviewer}</span>
                      <span className="text-charcoal-muted">{selectedReviewItem.review.role}</span>
                    </div>

                    <p className="text-xs text-charcoal-light leading-relaxed">
                      "{selectedReviewItem.review.summary}"
                    </p>

                    {/* Primary risk factors chips */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase text-charcoal-muted tracking-wider">
                        Key Risk Factors Evaluated:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedReviewItem.review.primaryFactors.map((factor, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium bg-ivory-200/60 text-charcoal-dark px-2.5 py-0.5 rounded-lg border border-ivory-300/80"
                          >
                            • {factor}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Agronomic Mitigation Advisory */}
                    <div className="p-3 rounded-lg bg-forest/[0.04] border border-forest/20 space-y-1">
                      <span className="text-[10px] font-bold text-forest uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Recommended Tactical Countermeasures:
                      </span>
                      <p className="text-xs text-charcoal leading-relaxed">
                        {selectedReviewItem.review.mitigation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive User Review & Field Feedback Section */}
              <div className="space-y-3 border-t border-ivory-200 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-charcoal flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-forest" />
                    Field Observation & Custom User Feedback
                  </h3>
                  {reviewSavedSuccess && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Saved to review log!
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-ivory-300 bg-ivory/5 space-y-3">
                  {/* Rating Selector */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-charcoal">Your Field Confidence Rating:</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRatingInput(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= userRatingInput
                                ? "text-amber-500 fill-amber-500"
                                : "text-ivory-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes Textarea */}
                  <div className="space-y-1">
                    <label className="text-2xs font-bold text-charcoal-muted uppercase">
                      Ground Truth Notes / Observation:
                    </label>
                    <textarea
                      rows={3}
                      value={userNotesInput}
                      onChange={(e) => setUserNotesInput(e.target.value)}
                      placeholder="Add custom notes about your farm condition, weather changes, or actual yield outcome..."
                      className="w-full p-3 rounded-xl border border-ivory-300 bg-white text-xs text-charcoal focus:border-forest/40 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveUserReview}
                    className="w-full py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Save Field Review & Notes
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-ivory-200 bg-ivory/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedReviewItem(null)}
                className="px-4 py-2 rounded-xl border border-ivory-300 bg-white text-charcoal text-xs font-bold hover:bg-ivory/30 transition-all"
              >
                Close Window
              </button>

              <button
                type="button"
                onClick={() => handleRerunInForm(selectedReviewItem)}
                className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Play className="h-3.5 w-3.5" />
                Re-run in Risk Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
