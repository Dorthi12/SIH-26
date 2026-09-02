import React from 'react';
import {
  Sparkles,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Scale,
  Calendar,
} from 'lucide-react';
import { sellingAdvisorService } from '../../services/mandiService';

export function SellingAdvisorView() {
  const advisory = sellingAdvisorService.getAdvisory('Wheat', 2880, 2180);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-700 text-white rounded-3xl p-6 lg:p-8 shadow-card space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber text-xs font-bold font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          Agrisense AI Selling Intelligence Advisor
        </div>

        <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
          🧠 "Should I Sell Now or Wait?"
        </h1>

        <p className="text-sm text-ivory-100/90 leading-relaxed max-w-2xl">
          Evaluates local mandi arrival trends, warehouse storage costs, crop perishability, and historical price movements to optimize your sales timing.
        </p>

        <span className="text-[10px] text-ivory-200/70 italic font-mono block">
          ⚠ Decision support only. Not a guaranteed price prediction.
        </span>
      </div>

      {/* Advisory Output Card */}
      <div className="bg-white dark:bg-[#17211d] rounded-3xl border border-ivory-300 dark:border-[#26362f] p-6 lg:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 dark:border-[#26362f] pb-4">
          <div>
            <span className="text-2xs font-mono font-bold text-forest uppercase block">Selling Recommendation</span>
            <h2 className="text-2xl font-extrabold text-amber">
              {advisory.recommendation}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-2xs text-charcoal-muted font-mono block">AI Advisory Confidence</span>
            <span className="text-xl font-bold font-mono text-forest">
              {advisory.confidencePct}% Confidence
            </span>
          </div>
        </div>

        {/* Factors Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-ivory-100/50 dark:bg-charcoal/40 p-4 rounded-xl">
          <div>
            <span className="text-2xs text-charcoal-muted block font-mono">Current Best Offer</span>
            <span className="font-bold font-mono text-forest">₹{advisory.currentBestOfferPerQuintal}/q</span>
          </div>
          <div>
            <span className="text-2xs text-charcoal-muted block font-mono">Production Cost</span>
            <span className="font-bold font-mono text-charcoal dark:text-ivory-100">₹{advisory.farmerProductionCostPerQuintal}/q</span>
          </div>
          <div>
            <span className="text-2xs text-charcoal-muted block font-mono">Estimated Margin</span>
            <span className="font-bold font-mono text-amber">+₹{advisory.estimatedMarginPerQuintal}/q</span>
          </div>
          <div>
            <span className="text-2xs text-charcoal-muted block font-mono">Storage Available</span>
            <span className="font-bold text-charcoal dark:text-ivory-100">{advisory.storageAvailableDays} Days</span>
          </div>
        </div>

        {/* Key Reasons Bullets */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-charcoal dark:text-ivory-100 font-mono">
            Analytical Reasoning Behind Recommendation:
          </h3>
          <div className="space-y-2 text-xs text-charcoal-muted dark:text-ivory-200/80">
            {advisory.reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-forest mt-1.5 shrink-0" />
                <p>{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Simulation Table (Sell Now vs Wait 10 Days) */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card space-y-4">
        <h3 className="text-base font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-forest" />
          Scenario Simulation Matrix (Sell Now vs Wait 10 Days)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* SELL NOW */}
          <div className="p-4 rounded-2xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f] space-y-2">
            <span className="text-xs font-bold text-charcoal dark:text-ivory-100 uppercase block font-sans">
              Option A: SELL NOW
            </span>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Selling Rate:</span>
              <span className="font-bold font-mono text-forest">₹{advisory.sellNowScenario.pricePerQuintal}/q</span>
            </div>
            <div className="flex justify-between border-t border-ivory-200 pt-2 font-extrabold text-sm text-charcoal dark:text-ivory-100">
              <span>Expected Net:</span>
              <span>₹{advisory.sellNowScenario.expectedNetTotal.toLocaleString('en-IN')}</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">✓ Zero price risk & immediate cash flow</span>
          </div>

          {/* WAIT 10 DAYS */}
          <div className="p-4 rounded-2xl bg-forest/5 dark:bg-forest/10 border border-forest/30 space-y-2">
            <span className="text-xs font-bold text-forest uppercase block font-sans">
              Option B: WAIT 10 DAYS (Simulated Range)
            </span>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Scenario Net Range:</span>
              <span className="font-bold font-mono text-amber">
                ₹{advisory.waitScenario.expectedNetMin.toLocaleString('en-IN')}–₹{advisory.waitScenario.expectedNetMax.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Est. Storage Cost:</span>
              <span>-₹{advisory.waitScenario.estimatedStorageCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-t border-forest/20 pt-2 font-bold text-xs text-forest">
              <span>Risk Level:</span>
              <span>{advisory.waitScenario.riskLevel} Risk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
