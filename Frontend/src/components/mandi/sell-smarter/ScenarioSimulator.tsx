import { useState } from "react";
import type { SellSmarterCropOption, DirectBuyerOfferItem } from "../../../types/sellSmarter";
import { sellSmarterService } from "../../../services/sellSmarterService";
import { Sliders, RefreshCw, Calendar, AlertTriangle, ShieldCheck } from "lucide-react";

interface ScenarioSimulatorProps {
  crop: SellSmarterCropOption;
  bestBuyer: DirectBuyerOfferItem;
}

export function ScenarioSimulator({ crop, bestBuyer }: ScenarioSimulatorProps) {
  const [waitingDays, setWaitingDays] = useState<number>(10);
  const [priceChangePct, setPriceChangePct] = useState<number>(3);
  const [storageCostPerDay, setStorageCostPerDay] = useState<number>(crop.storage.storageCostPerQPerDay);
  const [transportCostPerQ, setTransportCostPerQ] = useState<number>(bestBuyer.transportCostPerQ);

  const simulation = sellSmarterService.calculateScenario(crop, bestBuyer, {
    waitingDays,
    expectedPriceChangePercentage: priceChangePct,
    storageCostPerQDay: storageCostPerDay,
    transportCostPerQ: transportCostPerQ,
  });

  const handleReset = () => {
    setWaitingDays(10);
    setPriceChangePct(3);
    setStorageCostPerDay(crop.storage.storageCostPerQPerDay);
    setTransportCostPerQ(bestBuyer.transportCostPerQ);
  };

  return (
    <div className="bg-white dark:bg-charcoal-dark p-6 sm:p-8 rounded-3xl border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 dark:border-charcoal-light pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-forest dark:text-emerald-400" />
            <h3 className="font-black text-xl text-charcoal dark:text-ivory-100">
              Selling Scenario Simulator
            </h3>
          </div>
          <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
            Simulate "Sell Today" vs "Wait & Store" outcomes by adjusting holding days and expected price changes.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded-xl text-3xs font-extrabold bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light text-charcoal-muted dark:text-ivory-300 hover:text-charcoal flex items-center gap-1 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Sliders</span>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
        {/* Slider 1: Waiting Days */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-charcoal dark:text-ivory-200">Waiting Period</span>
            <span className="text-forest dark:text-emerald-400 font-black">{waitingDays} Days</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={waitingDays}
            onChange={(e) => setWaitingDays(parseInt(e.target.value))}
            className="w-full accent-forest cursor-pointer"
          />
          <div className="flex justify-between text-4xs font-bold text-charcoal-muted">
            <span>0 days</span>
            <span>30 days</span>
          </div>
        </div>

        {/* Slider 2: Price Change % */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-charcoal dark:text-ivory-200">Expected Price Change</span>
            <span className={`font-black ${priceChangePct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {priceChangePct >= 0 ? `+${priceChangePct}%` : `${priceChangePct}%`}
            </span>
          </div>
          <input
            type="range"
            min="-5"
            max="10"
            step="1"
            value={priceChangePct}
            onChange={(e) => setPriceChangePct(parseInt(e.target.value))}
            className="w-full accent-forest cursor-pointer"
          />
          <div className="flex justify-between text-4xs font-bold text-charcoal-muted">
            <span>-5%</span>
            <span>+10%</span>
          </div>
        </div>

        {/* Slider 3: Storage Cost per Day */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-charcoal dark:text-ivory-200">Storage Cost / q / Day</span>
            <span className="text-amber-700 dark:text-amber-400 font-black">₹{storageCostPerDay}</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={storageCostPerDay}
            onChange={(e) => setStorageCostPerDay(parseInt(e.target.value))}
            className="w-full accent-amber cursor-pointer"
          />
          <div className="flex justify-between text-4xs font-bold text-charcoal-muted">
            <span>₹0</span>
            <span>₹20/q</span>
          </div>
        </div>

        {/* Slider 4: Transport Cost per Quintal */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-charcoal dark:text-ivory-200">Transport Deduction</span>
            <span className="text-charcoal dark:text-ivory-100 font-black">₹{transportCostPerQ}/q</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="10"
            value={transportCostPerQ}
            onChange={(e) => setTransportCostPerQ(parseInt(e.target.value))}
            className="w-full accent-forest cursor-pointer"
          />
          <div className="flex justify-between text-4xs font-bold text-charcoal-muted">
            <span>₹0</span>
            <span>₹200/q</span>
          </div>
        </div>
      </div>

      {/* Dynamic Results Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Sell Today Box */}
        <div className="p-5 rounded-2xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-2 text-center">
          <span className="text-3xs font-black uppercase text-charcoal-muted dark:text-ivory-400 tracking-wider block">
            Sell Today Net Value
          </span>
          <span className="text-2xl font-black text-charcoal dark:text-ivory-100 block">
            ₹{simulation.sellTodayNetTotal.toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-extrabold text-charcoal-muted dark:text-ivory-300 block">
            Net: ₹{simulation.sellTodayNetPerQ}/q
          </span>
        </div>

        {/* Wait Scenario Box */}
        <div className="p-5 rounded-2xl bg-forest/10 dark:bg-emerald-950/40 border border-forest/30 dark:border-emerald-700/50 space-y-2 text-center">
          <span className="text-3xs font-black uppercase text-forest dark:text-emerald-300 tracking-wider block">
            Wait {waitingDays} Days Net Scenario
          </span>
          <span className="text-2xl font-black text-forest dark:text-emerald-400 block">
            ₹{simulation.futureNetTotal.toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-extrabold text-forest dark:text-emerald-300 block">
            Future Net: ₹{simulation.futureNetPerQ}/q
          </span>
        </div>

        {/* Difference & Risk Level */}
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-2 text-center">
          <span className="text-3xs font-black uppercase text-amber-900 dark:text-amber-200 tracking-wider block">
            Simulated Difference
          </span>
          <span className={`text-2xl font-black block ${simulation.netDifferenceTotal >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {simulation.netDifferenceTotal >= 0 ? `+₹${simulation.netDifferenceTotal.toLocaleString("en-IN")}` : `-₹${Math.abs(simulation.netDifferenceTotal).toLocaleString("en-IN")}`}
          </span>
          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block flex items-center justify-center gap-1">
            <span>Risk Level:</span>
            <strong className={`font-black uppercase px-2 py-0.5 rounded ${
              simulation.riskLevel === "Low" ? "bg-emerald-200 text-emerald-900" : simulation.riskLevel === "Medium" ? "bg-amber-200 text-amber-900" : "bg-rose-200 text-rose-900"
            }`}>
              {simulation.riskLevel}
            </strong>
          </span>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light flex items-center gap-2 text-3xs font-extrabold text-charcoal-muted dark:text-ivory-400">
        <AlertTriangle className="w-4 h-4 text-amber shrink-0" />
        <span>
          ℹ️ <strong>Simulation Only:</strong> This scenario calculation is a simulation tool for decision planning and is NOT a guaranteed future price prediction.
        </span>
      </div>
    </div>
  );
}
