import React from 'react';
import {
  Scale,
  TrendingUp,
  CheckCircle2,
  Building,
  Store,
  DollarSign,
  Star,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { INITIAL_BUYERS } from '../../services/mandiService';

export function SellingComparisonView() {
  const quantity = 250;

  // APMC Mandi metrics
  const mandiGrossPrice = 2550;
  const mandiDeductionPerQ = 80;
  const mandiNetPerQ = mandiGrossPrice - mandiDeductionPerQ;
  const mandiTotalNet = mandiNetPerQ * quantity;

  // Direct Buyer metrics
  const directGrossPrice = 2720;
  const directDeductionPerQ = 60;
  const directNetPerQ = directGrossPrice - directDeductionPerQ;
  const directTotalNet = directNetPerQ * quantity;

  const diffPerQ = directNetPerQ - mandiNetPerQ;
  const diffTotal = directTotalNet - mandiTotalNet;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-forest" />
            🧮 Selling Options Comparison (Mandi vs Direct Buyer)
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-ivory-200/70 mt-0.5">
            Compare net income realization between local APMC mandi sales vs direct verified buyer offers.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-forest bg-forest/10 px-3 py-1.5 rounded-xl border border-forest/20 self-start sm:self-auto">
          Decision Support Tool
        </span>
      </div>

      {/* Side-by-Side Options Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* APMC / Mandi Card */}
        <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-ivory-200 dark:border-[#26362f] pb-3">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-charcoal-muted" />
              <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100">APMC / Local Mandi</h3>
            </div>
            <span className="text-2xs font-mono bg-ivory-200 text-charcoal-muted px-2 py-0.5 rounded">
              Traditional Channel
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Gross Price Rate:</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">₹{mandiGrossPrice}/quintal</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>(-) Estimated Deductions (Cess/Arhat):</span>
              <span className="font-bold">-₹{mandiDeductionPerQ}/quintal</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-ivory-200 font-extrabold text-sm text-charcoal dark:text-ivory-100">
              <span>Expected Net Realization:</span>
              <span>₹{mandiNetPerQ}/quintal</span>
            </div>
            <p className="text-[10px] text-charcoal-muted text-right">
              Total for {quantity} q: ₹{mandiTotalNet.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Direct Buyer Card */}
        <div className="bg-white dark:bg-[#17211d] rounded-2xl border-2 border-forest p-6 shadow-card space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-forest text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase font-mono">
            Recommended Channel
          </div>

          <div className="flex items-center justify-between border-b border-ivory-200 dark:border-[#26362f] pb-3">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-forest" />
              <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100">Direct Verified Buyer</h3>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Direct Buyer Offer Rate:</span>
              <span className="font-bold text-forest">₹{directGrossPrice}/quintal</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>(-) Freight & Logistics Share:</span>
              <span className="font-bold">-₹{directDeductionPerQ}/quintal</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-ivory-200 font-extrabold text-sm text-forest">
              <span>Expected Net Realization:</span>
              <span>₹{directNetPerQ}/quintal</span>
            </div>
            <p className="text-[10px] text-forest font-bold text-right">
              Total for {quantity} q: ₹{directTotalNet.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Potential Difference Highlight Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-forest-900 to-forest-800 text-white rounded-3xl p-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-2xs font-mono font-bold text-amber uppercase">Direct Trade Profit Advantage</span>
          <h3 className="text-2xl font-extrabold text-white">
            +₹{diffPerQ}/quintal Extra Income Realization
          </h3>
          <p className="text-xs text-ivory-100/90">
            Selling 250 quintals directly to verified buyers yields an extra <strong className="text-amber">₹{diffTotal.toLocaleString('en-IN')}</strong> net profit compared to traditional APMC Mandi deductions.
          </p>
        </div>
      </div>

      {/* Multiple Buyer Comparison Matrix */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card space-y-4">
        <h3 className="text-base font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
          <Building className="w-5 h-5 text-forest" />
          Multiple Verified Buyer Offer Comparison Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-ivory-300 dark:border-[#26362f] text-charcoal-muted uppercase font-mono">
                <th className="py-2.5 px-3">Buyer Company</th>
                <th className="py-2.5 px-3">Gross Offer</th>
                <th className="py-2.5 px-3">Transport Share</th>
                <th className="py-2.5 px-3">Expected Net</th>
                <th className="py-2.5 px-3">Payment Reliability</th>
                <th className="py-2.5 px-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200 dark:divide-[#26362f]">
              <tr className="hover:bg-ivory-100/50">
                <td className="py-3 px-3 font-bold font-sans text-charcoal dark:text-ivory-100">ABC Foods & Flour Mills</td>
                <td className="py-3 px-3 font-bold text-forest">₹2,720/q</td>
                <td className="py-3 px-3 text-red-600">₹60/q</td>
                <td className="py-3 px-3 font-extrabold text-charcoal dark:text-ivory-100">₹2,660/q</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">96% (2.3 days)</td>
                <td className="py-3 px-3 text-amber font-bold">⭐ 4.7</td>
              </tr>
              <tr className="hover:bg-ivory-100/50">
                <td className="py-3 px-3 font-bold font-sans text-charcoal dark:text-ivory-100">XYZ Agro Exports Ltd</td>
                <td className="py-3 px-3 font-bold text-forest">₹2,690/q</td>
                <td className="py-3 px-3 text-red-600">₹40/q</td>
                <td className="py-3 px-3 font-extrabold text-charcoal dark:text-ivory-100">₹2,650/q</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">94% (3.1 days)</td>
                <td className="py-3 px-3 text-amber font-bold">⭐ 4.6</td>
              </tr>
              <tr className="hover:bg-ivory-100/50">
                <td className="py-3 px-3 font-bold font-sans text-charcoal dark:text-ivory-100">Sharma Roller Flour Mills</td>
                <td className="py-3 px-3 font-bold text-forest">₹2,750/q</td>
                <td className="py-3 px-3 text-red-600">₹90/q</td>
                <td className="py-3 px-3 font-extrabold text-charcoal dark:text-ivory-100">₹2,660/q</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">98% (1.5 days)</td>
                <td className="py-3 px-3 text-amber font-bold">⭐ 4.9</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
