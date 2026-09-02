import React from 'react';
import {
  Lock,
  FileCheck2,
  CheckCircle2,
  ShieldCheck,
  Building,
  User,
  Truck,
  DollarSign,
  Calendar,
  Layers,
  Printer,
  Download,
} from 'lucide-react';
import type { SmartDeal } from '../../types/mandi';

interface SmartDealsViewProps {
  deals: SmartDeal[];
  onNavigateToPayment?: (deal: SmartDeal) => void;
}

export function SmartDealsView({ deals, onNavigateToPayment }: SmartDealsViewProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-forest" />
            🌾 Agrisense Smart Deals (Digital Agreement Records)
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-ivory-200/70 mt-0.5">
            Immutable, versioned trading contracts mutually locked by verified farmer and buyer.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-300 self-start sm:self-auto flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          {deals.length} Terms Locked Deals
        </span>
      </div>

      <div className="space-y-6">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white dark:bg-[#17211d] rounded-3xl border border-ivory-300 dark:border-[#26362f] p-6 lg:p-8 shadow-card space-y-6 relative overflow-hidden"
          >
            {/* Header / Version Stamp */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 dark:border-[#26362f] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-mono font-bold text-forest uppercase bg-forest/10 px-2.5 py-0.5 rounded-full border border-forest/20">
                    Deal ID: {deal.id}
                  </span>
                  <span className="text-2xs font-mono font-bold text-amber bg-amber/10 px-2.5 py-0.5 rounded-full border border-amber/30">
                    {deal.dealVersion}
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold text-charcoal dark:text-ivory-100">
                  {deal.crop} ({deal.variety})
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  🔒 Terms Locked & Confirmed
                </span>
              </div>
            </div>

            {/* Parties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seller Box */}
              <div className="p-4 rounded-2xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f] space-y-2">
                <span className="text-2xs font-mono font-bold text-charcoal-muted uppercase flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-forest" />
                  Seller (Farmer)
                </span>
                <p className="text-base font-bold text-charcoal dark:text-ivory-100">{deal.farmerName}</p>
                <span className="text-xs font-mono text-charcoal-muted block">Farmer ID: {deal.farmerId}</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Farmer Confirmed (v2.0)
                </span>
              </div>

              {/* Buyer Box */}
              <div className="p-4 rounded-2xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f] space-y-2">
                <span className="text-2xs font-mono font-bold text-charcoal-muted uppercase flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-amber" />
                  Buyer (Processor / Trader)
                </span>
                <p className="text-base font-bold text-charcoal dark:text-ivory-100">{deal.buyerName}</p>
                <span className="text-xs font-mono text-charcoal-muted block">Buyer ID: {deal.buyerId}</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Buyer Confirmed (v2.0)
                </span>
              </div>
            </div>

            {/* Commercial Terms Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-forest/5 dark:bg-forest/10 p-4 rounded-2xl border border-forest/20">
              <div>
                <span className="text-2xs text-charcoal-muted block font-mono">Agreed Quantity</span>
                <span className="text-base font-extrabold text-charcoal dark:text-ivory-100 font-mono">{deal.quantityQuintals} q</span>
              </div>
              <div>
                <span className="text-2xs text-charcoal-muted block font-mono">Locked Price</span>
                <span className="text-base font-extrabold text-forest font-mono">₹{deal.pricePerQuintal}/q</span>
              </div>
              <div>
                <span className="text-2xs text-charcoal-muted block font-mono">Total Transaction Value</span>
                <span className="text-base font-extrabold text-amber font-mono">₹{deal.totalValue.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-2xs text-charcoal-muted block font-mono">Quality Grade & Moisture</span>
                <span className="font-bold text-charcoal dark:text-ivory-100">{deal.qualityGrade} ({deal.moisturePercentage}%)</span>
              </div>
            </div>

            {/* Logistics & Payment Safeguard Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f]">
                <span className="text-2xs text-charcoal-muted block">Pickup Location</span>
                <span className="font-semibold text-charcoal dark:text-ivory-100">{deal.pickupLocation}</span>
              </div>
              <div className="p-3 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f]">
                <span className="text-2xs text-charcoal-muted block">Delivery Date</span>
                <span className="font-semibold text-charcoal dark:text-ivory-100">{deal.deliveryDate}</span>
              </div>
              <div className="p-3 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f]">
                <span className="text-2xs text-charcoal-muted block">Payment Protection State</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{deal.paymentProtectionState}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-ivory-200 dark:border-[#26362f]">
              <span className="text-2xs text-charcoal-muted font-mono">
                Digitally Sealed on Agrisense Mandi ledger.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert('Smart Deal Certificate Downloaded')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-white dark:bg-[#17211d] text-charcoal text-xs font-semibold hover:border-forest/30 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-forest" />
                  Download PDF Deal
                </button>

                {onNavigateToPayment && (
                  <button
                    type="button"
                    onClick={() => onNavigateToPayment(deal)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 transition-all shadow-sm"
                  >
                    Manage Payment Protection Escrow
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
