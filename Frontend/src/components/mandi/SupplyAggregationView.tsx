import React from 'react';
import {
  Sprout,
  Users,
  ShieldCheck,
  Truck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Layers,
  MapPin,
} from 'lucide-react';
import type { SupplyPool } from '../../types/mandi';

interface SupplyAggregationViewProps {
  pools: SupplyPool[];
}

export function SupplyAggregationView({ pools }: SupplyAggregationViewProps) {
  const activePool = pools[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-forest" />
            📦 Small Farmer Supply Aggregation Ecosystem
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-ivory-200/70 mt-0.5">
            Combines compatible produce from smallholders for bulk buyers while preserving lot traceability & individual pricing.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-300 self-start sm:self-auto">
          {activePool.matchScorePct}% Aggregation Match
        </span>
      </div>

      {activePool && (
        <div className="space-y-6">
          {/* Pool Summary Box */}
          <div className="bg-white dark:bg-[#17211d] rounded-3xl border border-ivory-300 dark:border-[#26362f] p-6 lg:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 dark:border-[#26362f] pb-4">
              <div>
                <span className="text-2xs font-mono font-bold text-forest uppercase block">
                  Bulk Buyer Requirement: {activePool.buyerName}
                </span>
                <h3 className="text-2xl font-extrabold text-charcoal dark:text-ivory-100">
                  {activePool.crop} Supply Aggregation Pool
                </h3>
              </div>

              <div className="text-right">
                <span className="text-2xs text-charcoal-muted font-mono block">Matched Volume</span>
                <span className="text-xl font-extrabold font-mono text-forest">
                  {activePool.matchedQuantityQuintals} / {activePool.targetQuantityQuintals} Quintals
                </span>
              </div>
            </div>

            {/* Aggregated Logistics Savings Bar */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-sm flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  Aggregated Multi-Farmer Route Transport Savings
                </span>
                <p className="text-emerald-800/80 dark:text-emerald-300/80">
                  Individual separate transport: ₹{activePool.individualTransportCost.toLocaleString()} → Multi-pickup aggregated truck: ₹{activePool.aggregatedTransportCost.toLocaleString()}
                </p>
              </div>

              <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs font-mono whitespace-nowrap">
                Save ₹{activePool.estimatedSavings.toLocaleString()}
              </span>
            </div>

            {/* Lot Traceability & Individual Farmer Pricing Matrix */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted font-mono flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-forest" />
                Lot-Level Traceability & Individual Farmer Pricing
              </h4>

              <div className="space-y-2">
                {activePool.lots.map((lot) => (
                  <div
                    key={lot.lotId}
                    className="p-4 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-charcoal dark:text-ivory-100">{lot.farmerName}</span>
                        <span className="text-2xs font-mono text-charcoal-muted">({lot.farmerLocation})</span>
                        <span className="text-[10px] font-mono bg-forest/10 text-forest px-2 py-0.5 rounded font-bold">
                          Lot {lot.lotId.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-2xs text-charcoal-muted block">
                        Volume: <strong className="text-charcoal dark:text-ivory-100">{lot.quantityQuintals} q</strong> | Grade: {lot.qualityGrade} ({lot.moisturePct}% moisture)
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-2xs text-charcoal-muted font-mono block">Individual Fair Range</span>
                        <span className="font-bold font-mono text-amber">
                          ₹{lot.fairPriceRange.min}–₹{lot.fairPriceRange.max}/q
                        </span>
                      </div>

                      <span
                        className={`text-2xs font-bold px-2.5 py-1 rounded-full ${
                          lot.deliveryStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {lot.deliveryStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Isolated Dispute Handling Note */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Isolated Lot Dispute Safeguard:</strong>
                If one farmer's lot exhibits quality discrepancies during warehouse inspection, Agrisense isolates that specific lot without freezing payment releases for all other verified lots in the supply pool.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
