import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  DollarSign,
  Calculator,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Info,
} from 'lucide-react';
import type { LogisticsQuote } from '../../types/mandi';

export function LogisticsView() {
  const [origin, setOrigin] = useState('Barabanki / Lucknow');
  const [destination, setDestination] = useState('Kanpur, UP');
  const [quantity, setQuantity] = useState(250);
  const [askingPrice, setAskingPrice] = useState(2880);
  const [transportPayer, setTransportPayer] = useState<'Buyer Pays' | 'Seller Pays' | 'Shared'>('Buyer Pays');

  // Simulated estimates
  const distanceKm = 185;
  const standardTruckCost = 18500;
  const largeTruckCost = 31000;
  const aggregatedTruckCost = 12800;

  // Net Realization
  const grossValue = askingPrice * quantity;
  const transportCostToSeller = transportPayer === 'Seller Pays' ? standardTruckCost : transportPayer === 'Shared' ? standardTruckCost / 2 : 0;
  const storageDeduction = 5000;
  const handlingDeduction = 2500;

  const netRealization = grossValue - transportCostToSeller - storageDeduction - handlingDeduction;
  const netPerQuintal = netRealization / quantity;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-forest" />
            🚚 Logistics Matching & Transport Sizing
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-ivory-200/70 mt-0.5">
            Calculates transport vehicle requirements, distance estimates, and net realization after deductions.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-forest bg-forest/10 px-3 py-1.5 rounded-xl border border-forest/20 self-start sm:self-auto">
          Estimated Quotes Only
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Route & Quantity Inputs */}
        <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-forest" />
            Logistics Route Parameters
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-2xs font-semibold text-charcoal-muted block mb-1">Origin (Farm Gate)</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 dark:bg-charcoal/40 font-semibold text-charcoal dark:text-ivory-100 outline-none"
              />
            </div>

            <div>
              <label className="text-2xs font-semibold text-charcoal-muted block mb-1">Destination (Buyer Warehouse)</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 dark:bg-charcoal/40 font-semibold text-charcoal dark:text-ivory-100 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-2xs font-semibold text-charcoal-muted block mb-1">Quantity (Quintals)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 dark:bg-charcoal/40 font-mono font-bold text-charcoal dark:text-ivory-100 outline-none"
                />
              </div>

              <div>
                <label className="text-2xs font-semibold text-charcoal-muted block mb-1">Selling Price (₹/q)</label>
                <input
                  type="number"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 dark:bg-charcoal/40 font-mono font-bold text-charcoal dark:text-ivory-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-2xs font-semibold text-charcoal-muted block mb-1">Transport Payer Responsibility</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-ivory-100 dark:bg-charcoal/40 rounded-xl border border-ivory-200 text-2xs font-bold">
                {(['Buyer Pays', 'Seller Pays', 'Shared'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTransportPayer(mode)}
                    className={`py-1.5 rounded-lg transition-all ${
                      transportPayer === mode
                        ? 'bg-forest text-white shadow-sm'
                        : 'text-charcoal-muted hover:text-charcoal'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle & Right: Transport Options & Net Realization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transport Sizing Options */}
          <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-forest" />
              Available Vehicle Options ({distanceKm} km Route)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f] space-y-2">
                <span className="font-bold text-charcoal dark:text-ivory-100 block">Standard 10-Ton Truck</span>
                <span className="text-base font-extrabold font-mono text-forest">₹{standardTruckCost.toLocaleString()}</span>
                <span className="text-[10px] text-charcoal-muted block font-mono">₹74/quintal • 1 Day</span>
              </div>

              <div className="p-4 rounded-2xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f] space-y-2">
                <span className="font-bold text-charcoal dark:text-ivory-100 block">Large 20-Ton Trailer</span>
                <span className="text-base font-extrabold font-mono text-charcoal dark:text-ivory-100">₹{largeTruckCost.toLocaleString()}</span>
                <span className="text-[10px] text-charcoal-muted block font-mono">₹124/quintal • 1 Day</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">Aggregated Transport</span>
                  <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">SAVINGS</span>
                </div>
                <span className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-300">₹{aggregatedTruckCost.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-800/80 font-mono block">₹51.2/quintal • Multi-pickup</span>
              </div>
            </div>
          </div>

          {/* Gross vs Net Realization Breakdown Box */}
          <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card space-y-4">
            <h3 className="text-base font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-forest" />
              Net Farmer Realization Breakdown (Gross vs Net)
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-3 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40">
                <span>Gross Selling Value ({quantity} q @ ₹{askingPrice}/q)</span>
                <span className="font-bold text-charcoal dark:text-ivory-100">₹{grossValue.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-300">
                <span>(-) Transport Deduction ({transportPayer})</span>
                <span className="font-bold">-₹{transportCostToSeller.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-300">
                <span>(-) Storage & Warehouse Handling</span>
                <span className="font-bold">-₹{storageDeduction.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-300">
                <span>(-) Weighment & Mandi Cess</span>
                <span className="font-bold">-₹{handlingDeduction.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between p-4 rounded-xl bg-forest-900 text-white font-extrabold text-sm pt-3">
                <span>Expected Net Realization</span>
                <span className="text-amber">₹{netRealization.toLocaleString('en-IN')} (₹{netPerQuintal.toFixed(0)}/q)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
