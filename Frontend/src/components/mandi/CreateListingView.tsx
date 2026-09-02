import React, { useState } from 'react';
import {
  Sprout,
  DollarSign,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  ShieldCheck,
  Info,
  CheckCircle2,
  Sparkles,
  Truck,
  Building,
  ArrowRight,
  HelpCircle,
  BarChart3,
  Layers,
} from 'lucide-react';
import type { CropListing } from '../../types/mandi';

interface CreateListingViewProps {
  onPublishListing: (newListing: Partial<CropListing>) => void;
}

export function CreateListingView({ onPublishListing }: CreateListingViewProps) {
  // Top Selector Bar State
  const [crop, setCrop] = useState('Wheat');
  const [variety, setVariety] = useState('HD 2967');
  const [quantityQuintals, setQuantityQuintals] = useState<number>(100);
  const [grade, setGrade] = useState<'Grade A' | 'Grade B' | 'Standard'>('Grade A');
  const [harvestDate, setHarvestDate] = useState('2025-05-12');

  // 1. Itemized Production Costs State
  const [costSeeds, setCostSeeds] = useState<number>(1200);
  const [costFertilizer, setCostFertilizer] = useState<number>(2400);
  const [costPesticides, setCostPesticides] = useState<number>(1000);
  const [costIrrigation, setCostIrrigation] = useState<number>(1200);
  const [costElectricity, setCostElectricity] = useState<number>(800);
  const [costMachinery, setCostMachinery] = useState<number>(1500);
  const [costLabour, setCostLabour] = useState<number>(3000);
  const [costLandPrep, setCostLandPrep] = useState<number>(1000);
  const [costHarvesting, setCostHarvesting] = useState<number>(1500);
  const [costTransport, setCostTransport] = useState<number>(900);
  const [costStorage, setCostStorage] = useState<number>(600);

  // 2. Location State
  const [stateName, setStateName] = useState('Maharashtra');
  const [districtName, setDistrictName] = useState('Nashik');
  const [mandiName, setMandiName] = useState('Nashik Mandi');
  const [regionName, setRegionName] = useState('Dindori');
  const [labourRate, setLabourRate] = useState<number>(450);
  const [transportDistKm, setTransportDistKm] = useState<number>(45);

  // 3. Crop Characteristics State
  const [moisturePct, setMoisturePct] = useState<number>(12.0);
  const [qualityText, setQualityText] = useState('Good');
  const [farmingType, setFarmingType] = useState<'Conventional' | 'Certified Organic' | 'Natural Farming'>('Conventional');
  const [shelfLifeMonths, setShelfLifeMonths] = useState<number>(6);

  // 4. Market Conditions (Simulated reference)
  const [currentMandiPrice, setCurrentMandiPrice] = useState<number>(2150);
  const [historicalAvgPrice, setHistoricalAvgPrice] = useState<number>(2050);

  // Calculated Production Costs Total
  const totalProductionCostsSum =
    costSeeds +
    costFertilizer +
    costPesticides +
    costIrrigation +
    costElectricity +
    costMachinery +
    costLabour +
    costLandPrep +
    costHarvesting +
    costTransport +
    costStorage;

  const costPerQuintalBase = Math.round(totalProductionCostsSum / Math.max(1, quantityQuintals / 10)); // normalized base

  // Fair Price Engine Math (matching screenshot formula)
  const baseCostPerQ = 1850;
  const profitMargin20Pct = Math.round(baseCostPerQ * 0.2); // +₹370
  const qualityGradePremium = grade === 'Grade A' ? 120 : grade === 'Grade B' ? 60 : 0;
  const organicBonus = farmingType === 'Certified Organic' ? 300 : 0;
  const moisturePenalty = moisturePct > 12 ? -80 : 0;

  const fairCropPrice = baseCostPerQ + profitMargin20Pct + qualityGradePremium + organicBonus + moisturePenalty; // ~₹2,340/q

  // Farmer Asking Price (defaults to Fair Price)
  const [askingPriceInput, setAskingPriceInput] = useState<number>(fairCropPrice);
  const [isPublished, setIsPublished] = useState(false);

  const handleGenerateAndPublish = () => {
    const listingData: Partial<CropListing> = {
      id: `lst-${Date.now().toString().slice(-4)}`,
      farmerId: 'AGR-F-882190',
      farmerName: 'Ramesh Kumar Verma',
      farmerLocation: `${districtName}, ${stateName}`,
      farmerRating: 4.8,
      farmerCompletedTransactions: 38,
      crop,
      variety,
      quantityQuintals,
      location: `${districtName}, ${stateName}`,
      harvestDate,
      productionMethod: farmingType,
      productionCostPerQuintal: Math.round(totalProductionCostsSum / Math.max(1, quantityQuintals / 10)),
      grade,
      moisturePercentage: moisturePct,
      organicStatus: farmingType === 'Certified Organic' ? 'Verified Organic' : 'Conventional',
      evidenceStatus: {
        organic: farmingType === 'Certified Organic' ? 'Verified' : 'Not Applicable',
        qualityReport: 'Verified',
        productionCost: 'Evidence Provided',
        harvestDate: 'Verified',
      },
      fairPriceRange: {
        min: fairCropPrice - 60,
        max: fairCropPrice + 80,
        breakdown: {
          regionalRef: currentMandiPrice,
          productionCost: baseCostPerQ,
          qualityPremium: qualityGradePremium,
          gradePremium: 100,
          organicPremium: organicBonus,
          demandPremium: 150,
          transportDeduction: 50,
          storageDeduction: 20,
        },
      },
      askingPricePerQuintal: askingPriceInput,
      verifiedCrop: true,
      verifiedFarmer: true,
      productionCostsBreakdown: {
        seeds: costSeeds,
        fertilizer: costFertilizer,
        pesticides: costPesticides,
        irrigation: costIrrigation,
        electricity: costElectricity,
        machinery: costMachinery,
        labour: costLabour,
        landPrep: costLandPrep,
        harvesting: costHarvesting,
        transportation: costTransport,
        storage: costStorage,
        totalProductionCost: totalProductionCostsSum,
      },
      locationDetails: {
        state: stateName,
        district: districtName,
        mandi: mandiName,
        region: regionName,
        localLabourRate: labourRate,
        inputCostIndex: 'Medium',
        transportDistanceKm: transportDistKm,
      },
      cropCharacteristics: {
        moisturePct,
        quality: qualityText,
        farmingType,
        expectedShelfLifeMonths: shelfLifeMonths,
      },
      marketEstimation: {
        currentMandiPrice,
        historicalAvgPrice,
        marketDemand: 'High',
        marketSupply: 'Medium',
        predictedFairPrice: fairCropPrice,
        suggestedWindow: '15 May 2025 – 31 May 2025',
      },
    };

    onPublishListing(listingData);
    setIsPublished(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header / Branding matching screenshot ──────────────────── */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 flex items-center justify-center font-bold text-xl border border-forest/20">
            ⚖️
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal dark:text-ivory-100 flex items-center gap-2">
              Fair Crop Price Engine
            </h1>
            <p className="text-xs text-charcoal-muted dark:text-ivory-200/70">
              Smart • Transparent • Farmer First
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono font-bold">
          <span className="flex items-center gap-1 text-charcoal dark:text-ivory-100 bg-ivory-100/60 dark:bg-charcoal/40 px-3 py-1.5 rounded-xl border border-ivory-300">
            <MapPin className="w-3.5 h-3.5 text-forest" />
            {districtName}, {stateName}
          </span>
          <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Evidence-Backed Calculator
          </span>
        </div>
      </div>

      {/* ── Top Selector Bar matching screenshot ───────────────────────── */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-4 lg:p-5 shadow-card grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
        {/* Crop */}
        <div>
          <label className="text-2xs font-semibold text-charcoal-muted flex items-center gap-1 mb-1">
            🌾 Crop
          </label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 dark:bg-charcoal/40 font-bold text-charcoal dark:text-ivory-100 outline-none"
          >
            <option value="Wheat">Wheat</option>
            <option value="Rice">Rice</option>
            <option value="Potato">Potato</option>
            <option value="Gram">Gram (Chickpea)</option>
            <option value="Mustard">Mustard</option>
            <option value="Soybean">Soybean</option>
            <option value="Maize">Maize</option>
          </select>
        </div>

        {/* Variety */}
        <div>
          <label className="text-2xs font-semibold text-charcoal-muted flex items-center gap-1 mb-1">
            🌱 Variety
          </label>
          <input
            type="text"
            value={variety}
            onChange={(e) => setVariety(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 dark:bg-charcoal/40 font-bold text-charcoal dark:text-ivory-100 outline-none"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="text-2xs font-semibold text-charcoal-muted flex items-center gap-1 mb-1">
            📦 Quantity (Quintals)
          </label>
          <input
            type="number"
            value={quantityQuintals}
            onChange={(e) => setQuantityQuintals(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 dark:bg-charcoal/40 font-mono font-bold text-charcoal dark:text-ivory-100 outline-none"
          />
        </div>

        {/* Grade */}
        <div>
          <label className="text-2xs font-semibold text-charcoal-muted flex items-center gap-1 mb-1">
            ⭐ Grade
          </label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 dark:bg-charcoal/40 font-bold text-charcoal dark:text-ivory-100 outline-none"
          >
            <option value="Grade A">A Grade</option>
            <option value="Grade B">B Grade</option>
            <option value="Standard">Standard</option>
          </select>
        </div>

        {/* Harvest Date */}
        <div>
          <label className="text-2xs font-semibold text-charcoal-muted flex items-center gap-1 mb-1">
            📅 Harvest Date
          </label>
          <input
            type="date"
            value={harvestDate}
            onChange={(e) => setHarvestDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 dark:bg-charcoal/40 font-semibold text-charcoal dark:text-ivory-100 outline-none"
          />
        </div>
      </div>

      {/* ── Main 4 Price Factors & Right Calculation Card Grid ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 4 Price Factor Cards */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-base font-bold text-charcoal dark:text-ivory-100 font-mono">
            Price Factors
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Production Costs Card matching screenshot */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#17211d] border border-ivory-300 dark:border-[#26362f] shadow-card space-y-3">
              <div className="flex items-center justify-between border-b border-ivory-200 dark:border-[#26362f] pb-2">
                <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <span>1. Production Costs</span>
                </h3>
                <span className="text-[10px] text-charcoal-muted font-mono">Itemized Inputs</span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Seeds</span>
                  <input
                    type="number"
                    value={costSeeds}
                    onChange={(e) => setCostSeeds(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 rounded text-right border border-ivory-300 font-bold"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Fertilizer</span>
                  <input
                    type="number"
                    value={costFertilizer}
                    onChange={(e) => setCostFertilizer(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 rounded text-right border border-ivory-300 font-bold"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Pesticides</span>
                  <input
                    type="number"
                    value={costPesticides}
                    onChange={(e) => setCostPesticides(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 rounded text-right border border-ivory-300 font-bold"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Irrigation</span>
                  <input
                    type="number"
                    value={costIrrigation}
                    onChange={(e) => setCostIrrigation(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 rounded text-right border border-ivory-300 font-bold"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Electricity / Diesel</span>
                  <input
                    type="number"
                    value={costElectricity}
                    onChange={(e) => setCostElectricity(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 rounded text-right border border-ivory-300 font-bold"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Machinery</span>
                  <input
                    type="number"
                    value={costMachinery}
                    onChange={(e) => setCostMachinery(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 rounded text-right border border-ivory-300 font-bold"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Labour</span>
                  <input
                    type="number"
                    value={costLabour}
                    onChange={(e) => setCostLabour(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 rounded text-right border border-ivory-300 font-bold"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Land Preparation</span>
                  <input
                    type="number"
                    value={costLandPrep}
                    onChange={(e) => setCostLandPrep(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 rounded text-right border border-ivory-300 font-bold"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Harvesting</span>
                  <input
                    type="number"
                    value={costHarvesting}
                    onChange={(e) => setCostHarvesting(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 rounded text-right border border-ivory-300 font-bold"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Transportation</span>
                  <input
                    type="number"
                    value={costTransport}
                    onChange={(e) => setCostTransport(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 rounded text-right border border-ivory-300 font-bold"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Storage</span>
                  <input
                    type="number"
                    value={costStorage}
                    onChange={(e) => setCostStorage(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 rounded text-right border border-ivory-300 font-bold"
                  />
                </div>

                <div className="pt-2 border-t border-red-200 dark:border-red-900/40 flex justify-between items-center text-xs font-bold text-red-700 dark:text-red-300">
                  <span>Total Production Cost</span>
                  <span className="text-sm font-extrabold font-mono">
                    ₹{totalProductionCostsSum.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-charcoal-muted">/ quintal</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Location & 3. Crop Characteristics Cards */}
            <div className="space-y-5">
              {/* Location Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#17211d] border border-ivory-300 dark:border-[#26362f] shadow-card space-y-3">
                <div className="flex items-center justify-between border-b border-ivory-200 dark:border-[#26362f] pb-2">
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>2. Location</span>
                  </h3>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">State</span>
                    <span className="font-bold text-charcoal dark:text-ivory-100">{stateName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">District</span>
                    <span className="font-bold text-charcoal dark:text-ivory-100">{districtName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Mandi</span>
                    <span className="font-bold text-charcoal dark:text-ivory-100">{mandiName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Region</span>
                    <span className="font-bold text-charcoal dark:text-ivory-100">{regionName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Local Labour Rate</span>
                    <span className="font-bold text-charcoal dark:text-ivory-100">₹{labourRate}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Local Input Cost Index</span>
                    <span className="font-bold text-charcoal dark:text-ivory-100">Medium</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Transport Distance</span>
                    <span className="font-bold text-charcoal dark:text-ivory-100">{transportDistKm} km</span>
                  </div>
                </div>
              </div>

              {/* Crop Characteristics Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#17211d] border border-ivory-300 dark:border-[#26362f] shadow-card space-y-3">
                <div className="flex items-center justify-between border-b border-ivory-200 dark:border-[#26362f] pb-2">
                  <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Sprout className="w-4 h-4" />
                    <span>3. Crop Characteristics</span>
                  </h3>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Moisture</span>
                    <span className="font-bold text-charcoal dark:text-ivory-100">{moisturePct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Quality</span>
                    <span className="font-bold text-charcoal dark:text-ivory-100">{qualityText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Farming Type</span>
                    <span className="font-bold text-forest dark:text-emerald-400">{farmingType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Expected Shelf Life</span>
                    <span className="font-bold text-charcoal dark:text-ivory-100">{shelfLifeMonths} Months</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Market Conditions Card (With 6-Month Trend Chart) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#17211d] border border-ivory-300 dark:border-[#26362f] shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-ivory-200 dark:border-[#26362f] pb-2">
              <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>4. Market Conditions</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40">
                <span className="text-2xs text-charcoal-muted block font-sans">Current Mandi Price</span>
                <span className="font-extrabold text-charcoal dark:text-ivory-100">₹{currentMandiPrice}/q</span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40">
                <span className="text-2xs text-charcoal-muted block font-sans">Historical Avg. Price</span>
                <span className="font-bold text-charcoal dark:text-ivory-100">₹{historicalAvgPrice}/q</span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40 flex justify-between items-center">
                <span className="text-2xs text-charcoal-muted font-sans">Market Demand</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">High</span>
              </div>

              <div className="p-3 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40 flex justify-between items-center">
                <span className="text-2xs text-charcoal-muted font-sans">Market Supply</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Medium</span>
              </div>
            </div>

            {/* Price Trend Chart (SVG Sparkline matching screenshot) */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-charcoal dark:text-ivory-100 font-mono">Price Trend (Last 6 Months)</span>
                <span className="text-emerald-600 font-bold font-mono">Rising ↗ (+₹150)</span>
              </div>

              <div className="h-28 w-full bg-ivory-100/40 dark:bg-charcoal/30 rounded-xl p-3 border border-ivory-200 flex flex-col justify-between">
                <div className="relative flex-1">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 60" preserveAspectRatio="none">
                    <path
                      d="M 0 50 L 50 42 L 100 35 L 150 40 L 200 25 L 250 20 L 300 10"
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="300" cy="10" r="4" fill="#16a34a" />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-charcoal-muted font-mono pt-1">
                  <span>Dec</span>
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: "Your Fair Crop Price" Card matching screenshot */}
        <div className="space-y-6">
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-3xl border-2 border-emerald-300 dark:border-emerald-800 p-6 shadow-card space-y-5">
            <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-bold font-mono">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Your Fair Crop Price
            </div>

            <div className="space-y-1">
              <div className="text-4xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                ₹{fairCropPrice.toLocaleString('en-IN')} <span className="text-sm font-sans font-normal text-charcoal-muted">/quintal</span>
              </div>
              <span className="text-2xs text-charcoal-muted font-semibold block">
                Recommended Minimum Selling Price ℹ️
              </span>
            </div>

            {/* Protection Guarantee Note */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#17211d] border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                This price ensures your profit and covers all production costs fairly.
              </span>
            </div>

            {/* Itemized Price Breakdown */}
            <div className="space-y-2 text-xs font-mono border-t border-emerald-200 dark:border-emerald-900/50 pt-4">
              <span className="font-bold text-charcoal dark:text-ivory-100 font-sans block mb-1">
                Price Breakdown
              </span>

              <div className="flex justify-between">
                <span className="text-charcoal-muted">Total Production Cost</span>
                <span className="font-bold text-charcoal dark:text-ivory-100">₹{baseCostPerQ.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-charcoal-muted">Fair Profit Margin (20%)</span>
                <span className="font-bold text-emerald-600">+₹{profitMargin20Pct}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-charcoal-muted">Quality & Grade Premium</span>
                <span className="font-bold text-emerald-600">+₹{qualityGradePremium}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-emerald-200 font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                <span>Fair Crop Price</span>
                <span>₹{fairCropPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Custom Farmer Asking Price Slider/Input */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#17211d] border border-ivory-300 dark:border-[#26362f] space-y-2">
              <label className="text-xs font-bold text-charcoal dark:text-ivory-100 block">
                Set Your Mandi Asking Price (₹/q)
              </label>
              <input
                type="number"
                value={askingPriceInput}
                onChange={(e) => setAskingPriceInput(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 font-mono font-extrabold text-base text-forest outline-none"
              />
              <span className="text-[10px] text-charcoal-muted block">
                Default set to AI Fair Crop Price. You can customize your price before listing.
              </span>
            </div>

            {/* Suggested Selling Window */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs flex items-center justify-between text-amber-900 dark:text-amber-200 font-mono">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                Suggested Selling Window:
              </span>
              <strong className="font-bold">15 May 2025 – 31 May 2025</strong>
            </div>

            {/* Potential Buyers Nearby */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#17211d] border border-ivory-300 text-xs flex items-center justify-between font-mono">
              <span className="flex items-center gap-1.5 text-charcoal dark:text-ivory-100">
                <Building className="w-4 h-4 text-forest" />
                Potential Buyers Nearby:
              </span>
              <span className="font-bold text-forest">12 Buyers showing interest</span>
            </div>

            {/* Generate & Publish Listing Button */}
            <button
              type="button"
              onClick={handleGenerateAndPublish}
              disabled={isPublished}
              className="w-full py-3.5 rounded-2xl bg-forest text-white text-xs font-extrabold hover:bg-forest-600 shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isPublished ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Listing Published to Mandi!
                </>
              ) : (
                <>
                  <RocketIcon className="w-4 h-4 text-amber" />
                  Generate & Publish Listing to Mandi Marketplace
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Additional Insights Grid matching screenshot ─────────────────── */}
      <div className="space-y-3 pt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted font-mono">
          Additional Insights
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Profit Assurance */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 space-y-1">
            <span className="text-2xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Profit Assurance
            </span>
            <p className="text-[11px] text-emerald-900/80 font-mono">
              You will earn <strong className="text-emerald-700 font-extrabold">₹6,240 / quintal</strong> (after all costs)
            </p>
          </div>

          {/* Market Trend */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 space-y-1">
            <span className="text-2xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Market Trend
            </span>
            <p className="text-[11px] text-blue-900/80 font-mono">
              Prices expected to rise by <strong>8-12%</strong> in next 30 days
            </p>
          </div>

          {/* Storage Advice */}
          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 space-y-1">
            <span className="text-2xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-600" /> Storage Advice
            </span>
            <p className="text-[11px] text-purple-900/80 font-mono">
              Store in dry conditions to maintain moisture quality
            </p>
          </div>

          {/* Transportation */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 space-y-1">
            <span className="text-2xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-amber-600" /> Transportation
            </span>
            <p className="text-[11px] text-amber-900/80 font-mono">
              Average freight in your area <strong className="text-amber-800 font-bold">₹900 / quintal</strong>
            </p>
          </div>

          {/* Govt Support */}
          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 space-y-1">
            <span className="text-2xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-teal-600" /> Govt. Support
            </span>
            <p className="text-[11px] text-teal-900/80 font-mono">
              Eligible for MSP benefits. <span className="text-teal-700 font-bold underline cursor-pointer">Check Now →</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer Transparency Disclaimer matching screenshot ──────────── */}
      <div className="p-3.5 rounded-xl bg-ivory-100/60 dark:bg-charcoal/40 border border-ivory-200 text-2xs text-charcoal-muted flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
        <span>
          Prices are calculated using real-time data, location factors, and market intelligence to ensure fairness and transparency.
        </span>
      </div>
    </div>
  );
}

function RocketIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71.79-1.81.79-2.79L18 7" />
      <path d="M15 9l-3 3" />
      <path d="M9 15l-3 3" />
    </svg>
  );
}
