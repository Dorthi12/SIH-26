import { useState } from "react";
import type { SellSmarterCropOption } from "../../../types/sellSmarter";
import { History, TrendingUp, CheckCircle2 } from "lucide-react";

interface PriceHistoryCardProps {
  crop: SellSmarterCropOption;
}

export function PriceHistoryCard({ crop }: PriceHistoryCardProps) {
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D">("30D");
  const hist = crop.historicalAvg;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 30-DAY REGIONAL PRICE CONTEXT */}
      <div className="bg-white dark:bg-charcoal-dark p-6 rounded-3xl border border-ivory-300 dark:border-charcoal-light shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-forest dark:text-emerald-400" />
            <h3 className="font-black text-base text-charcoal dark:text-ivory-100">
              Your Crop Price Context
            </h3>
          </div>

          {/* Timeframe selector buttons */}
          <div className="flex items-center gap-1 bg-ivory-100 dark:bg-charcoal p-1 rounded-xl border border-ivory-200 dark:border-charcoal-light">
            {(["7D", "30D", "90D"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-3xs font-extrabold transition-all cursor-pointer ${
                  timeframe === tf
                    ? "bg-forest text-white shadow-2xs"
                    : "text-charcoal-muted hover:text-charcoal dark:text-ivory-400"
                }`}
              >
                {tf === "7D" ? "7 Days" : tf === "30D" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
        </div>

        {/* Price History Visualization */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-2">
            <span className="text-3xs font-bold uppercase text-charcoal-muted dark:text-ivory-400 block">
              Regional Price Movement ({timeframe})
            </span>

            <div className="font-mono text-2xs space-y-1 bg-white dark:bg-charcoal-dark p-3 rounded-xl border border-ivory-200 dark:border-charcoal-light text-charcoal dark:text-ivory-200">
              <div className="flex justify-between">
                <span>Peak Regional Price:</span>
                <span className="font-black text-emerald-600">₹{crop.fairPriceRangeMaxPerQ}/q</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Regional Reference:</span>
                <span className="font-black text-charcoal dark:text-ivory-100">₹{crop.marketTrend.currentRegionalPricePerQ}/q</span>
              </div>
              <div className="flex justify-between">
                <span>Lowest APMC Floor:</span>
                <span className="font-black text-amber-600">₹{crop.mandi.grossPricePerQ}/q</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MANDI VS DIRECT BUYER TRANSACTION HISTORY */}
      <div className="bg-white dark:bg-charcoal-dark p-6 rounded-3xl border border-ivory-300 dark:border-charcoal-light shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-forest dark:text-emerald-400" />
            <h3 className="font-black text-base text-charcoal dark:text-ivory-100">
              Mandi vs Direct Buyer History
            </h3>
          </div>
          <span className="text-3xs font-extrabold px-2.5 py-1 rounded-full bg-forest/10 dark:bg-emerald-950 text-forest dark:text-emerald-400">
            Last {hist.transactionCount} Transactions
          </span>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs font-bold">
            <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-0.5">
              <span className="text-3xs font-bold uppercase text-charcoal-muted dark:text-ivory-400 block">
                Mandi Realized Average
              </span>
              <span className="text-lg font-black text-charcoal dark:text-ivory-100">
                ₹{hist.mandiAveragePerQ.toLocaleString("en-IN")}/q
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 space-y-0.5">
              <span className="text-3xs font-bold uppercase text-emerald-800 dark:text-emerald-300 block">
                Direct Buyer Average
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                ₹{hist.directBuyerAveragePerQ.toLocaleString("en-IN")}/q
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-1 text-center">
            <span className="text-3xs font-black uppercase text-amber-800 dark:text-amber-300 block">
              Historical Realization Advantage
            </span>
            <span className="text-xl font-black text-amber-950 dark:text-amber-100 block">
              +₹{hist.netRealizationDifferencePerQ} / quintal
            </span>
            <span className="text-4xs font-bold text-charcoal-muted dark:text-ivory-400 block">
              Based on recorded Agrisense transactions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
