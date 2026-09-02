import type { SellSmarterCropOption } from "../../../types/sellSmarter";
import { TrendingUp, Sparkles, AlertCircle, Calendar } from "lucide-react";

interface MarketTrendOutlookProps {
  crop: SellSmarterCropOption;
}

export function MarketTrendOutlook({ crop }: MarketTrendOutlookProps) {
  const trend = crop.marketTrend;
  const forecast = crop.forecast;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* MARKET TREND CARD */}
      <div className="bg-white dark:bg-charcoal-dark p-6 rounded-3xl border border-ivory-300 dark:border-charcoal-light shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-forest dark:text-emerald-400" />
            <h3 className="font-black text-base text-charcoal dark:text-ivory-100">
              Regional Market Trend — {crop.cropName}
            </h3>
          </div>

          <span className="text-3xs font-extrabold px-2.5 py-1 rounded-full bg-forest/10 dark:bg-emerald-950 text-forest dark:text-emerald-400">
            Mock Regional Benchmark
          </span>
        </div>

        {/* Trend Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
            <span className="text-3xs font-bold uppercase text-charcoal-muted dark:text-ivory-400 block">
              7-Day Regional Trend
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                ↗ {trend.trend7d}
              </span>
              <span className="text-3xs font-extrabold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                +{trend.percentage7d}%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
            <span className="text-3xs font-bold uppercase text-charcoal-muted dark:text-ivory-400 block">
              30-Day Regional Trend
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                ↗ {trend.trend30d}
              </span>
              <span className="text-3xs font-extrabold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                +{trend.percentage30d}%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-0.5">
            <span className="text-3xs font-bold uppercase text-charcoal-muted dark:text-ivory-400 block">
              Current Regional Price
            </span>
            <span className="text-base font-black text-charcoal dark:text-ivory-100">
              ₹{trend.currentRegionalPricePerQ.toLocaleString("en-IN")}/q
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-0.5">
            <span className="text-3xs font-bold uppercase text-charcoal-muted dark:text-ivory-400 block">
              Previous 30-Day Avg
            </span>
            <span className="text-base font-black text-charcoal-muted dark:text-ivory-300">
              ₹{trend.previous30DayAvgPerQ.toLocaleString("en-IN")}/q
            </span>
          </div>
        </div>

        {/* Simple Sparkline Representation */}
        <div className="p-4 rounded-2xl bg-ivory-100/70 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-2">
          <span className="text-3xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400 block">
            30-Day Price Progression (Mock Trend)
          </span>
          <div className="flex items-end justify-between h-16 pt-2 px-2 border-b border-ivory-300 dark:border-charcoal-light">
            {trend.chartHistory.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 group">
                <div
                  className="w-4 bg-forest dark:bg-emerald-500 rounded-t transition-all group-hover:bg-amber"
                  style={{ height: `${Math.round((item.directBuyerPrice / 3000) * 50)}px` }}
                  title={`${item.date}: ₹${item.directBuyerPrice}`}
                />
                <span className="text-4xs text-charcoal-muted dark:text-ivory-400">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SHORT-TERM OUTLOOK CARD */}
      <div className="bg-white dark:bg-charcoal-dark p-6 rounded-3xl border border-ivory-300 dark:border-charcoal-light shadow-sm flex flex-col justify-between space-y-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber" />
              <h3 className="font-black text-base text-charcoal dark:text-ivory-100">
                Short-Term Market Outlook
              </h3>
            </div>

            {/* MANDATORY AI/MODEL ESTIMATE LABEL */}
            <span className="text-3xs font-black px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              AI / Model Estimate
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-amber-900 dark:text-amber-200">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                Timeframe: {forecast.timeframeDaysText}
              </span>
              <span className="text-3xs font-black px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900">
                Confidence: {forecast.confidencePercentage}%
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-3xs font-bold uppercase text-amber-800 dark:text-amber-300 block">
                Expected Regional Direction
              </span>
              <span className="text-xl font-black text-amber-950 dark:text-amber-100 block">
                {forecast.expectedDirection}
              </span>
            </div>

            <div className="space-y-1 pt-1 border-t border-amber-200/80 dark:border-amber-900/60">
              <span className="text-3xs font-bold uppercase text-amber-800 dark:text-amber-300 block">
                Estimated Price Range
              </span>
              <span className="text-lg font-black text-forest dark:text-emerald-400 block">
                ₹{forecast.forecastRangeMinPerQ.toLocaleString("en-IN")} – ₹{forecast.forecastRangeMaxPerQ.toLocaleString("en-IN")} / q
              </span>
            </div>
          </div>
        </div>

        {/* MANDATORY DISCLAIMER NOTE */}
        <div className="p-3.5 rounded-2xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light flex items-start gap-2 text-3xs font-bold text-charcoal-muted dark:text-ivory-300">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            ⚠️ <strong>Important Notice:</strong> {forecast.disclaimer} Market predictions use historical patterns and simulated regional inputs. The farmer remains the final decision maker.
          </span>
        </div>
      </div>
    </div>
  );
}
