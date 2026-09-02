import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Scale,
  Clock,
  PieChart,
  Sprout,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface MandiDecisionCenterModalProps {
  onClose: () => void;
}

export function MandiDecisionCenterModal({ onClose }: MandiDecisionCenterModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#17211d] rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl border border-ivory-300 dark:border-[#26362f] space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ivory-200 dark:border-[#26362f] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest/10 text-forest flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-charcoal dark:text-ivory-100">
                🌾 Mandi Central Decision Hub
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-ivory-200/70">
                Consolidated selling metrics, fair price position, net realization, and land protection status.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-ivory-200 text-charcoal font-bold flex items-center justify-center text-xs hover:bg-ivory-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dashboard Grid Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-2xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 space-y-1">
            <span className="text-2xs text-charcoal-muted block uppercase font-sans">Current Produce</span>
            <span className="text-sm font-bold text-charcoal dark:text-ivory-100 block">Wheat (HD-2967)</span>
            <span className="text-[10px] text-forest font-bold">250 Quintals</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-forest/5 dark:bg-forest/10 border border-forest/20 space-y-1">
            <span className="text-2xs text-charcoal-muted block uppercase font-sans">Agrisense Fair Range</span>
            <span className="text-sm font-bold text-forest block">₹2,820–₹2,950/q</span>
            <span className="text-[10px] text-forest">Evidence-backed</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 space-y-1">
            <span className="text-2xs text-charcoal-muted block uppercase font-sans">Best Buyer Offer</span>
            <span className="text-sm font-bold text-amber block">₹2,720/q</span>
            <span className="text-[10px] text-charcoal-muted">ABC Foods</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 space-y-1">
            <span className="text-2xs text-emerald-800 dark:text-emerald-300 block uppercase font-sans font-bold">Best Direct Net</span>
            <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 block">₹2,660/q</span>
            <span className="text-[10px] text-emerald-600 font-bold">+₹190/q vs Mandi</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 space-y-1">
            <span className="text-2xs text-charcoal-muted block uppercase font-sans">APMC Mandi Net</span>
            <span className="text-sm font-bold text-charcoal dark:text-ivory-100 block">₹2,470/q</span>
            <span className="text-[10px] text-red-600 font-bold">-₹80/q deductions</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 space-y-1">
            <span className="text-2xs text-charcoal-muted block uppercase font-sans">Storage Available</span>
            <span className="text-sm font-bold text-charcoal dark:text-ivory-100 block">20 Days</span>
            <span className="text-[10px] text-emerald-600 font-bold">Safe In Shed</span>
          </div>
        </div>

        {/* AI Advisory Summary & Protection Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 space-y-2">
            <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 font-sans text-sm">
              <TrendingUp className="w-4 h-4 text-amber-600" /> AI Selling Advisory
            </span>
            <p className="text-amber-900/80 dark:text-amber-200/80">
              <strong>Recommendation: CONSIDER WAITING 5–10 DAYS</strong>. Mandi arrivals are down 14% and demand is rising.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 space-y-2">
            <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 font-sans text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Agrisense Protection Status
            </span>
            <div className="space-y-1 text-2xs text-emerald-800 dark:text-emerald-300">
              <span>✓ Land Protection: 29.4% / 40% (Safe)</span>
              <span className="block">✓ Payment Protection: Escrow Ready</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 transition-all shadow-sm"
          >
            Close Decision Center
          </button>
        </div>
      </div>
    </div>
  );
}
