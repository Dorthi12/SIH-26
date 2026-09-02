import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Lock,
  Truck,
  FileCheck2,
  Sprout,
  ArrowRight,
  Sparkles,
  DollarSign,
  Scale,
  Award,
  BookOpen,
} from 'lucide-react';
import type { RoleMode, FarmerTab, BuyerTab } from '../../types/mandi';

interface MandiHomeProps {
  role: RoleMode;
  onSetRole: (role: RoleMode) => void;
  onNavigateFarmerTab: (tab: FarmerTab) => void;
  onNavigateBuyerTab: (tab: BuyerTab) => void;
}

export function MandiHome({
  role,
  onSetRole,
  onNavigateFarmerTab,
  onNavigateBuyerTab,
}: MandiHomeProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Top Philosophy Banner ───────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-700 dark:from-[#14261d] dark:to-[#1a382a] text-white rounded-3xl p-6 lg:p-8 shadow-card relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
          <Sprout className="w-80 h-80 text-amber" />
        </div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Farmer-First Agricultural Marketplace
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            🌾 Agrisense Mandi
          </h1>

          <p className="text-lg font-medium text-ivory-100/90 leading-relaxed">
            "A transparent marketplace connecting verified farmers and buyers directly."
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-amber-200">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-amber/20">
              <ShieldCheck className="w-4 h-4 text-amber" />
              Transparent Trade
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-amber/20">
              <TrendingUp className="w-4 h-4 text-amber" />
              Fair Prices
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-amber/20">
              <Lock className="w-4 h-4 text-amber" />
              Protected Farmers
            </span>
          </div>

          <p className="text-xs italic text-ivory-200/80 pt-1">
            "Of the Farmers. For the Farmers. To the Farmers."
          </p>
        </div>

        {/* Role Toggle Switch inside Hero */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => onSetRole('farmer')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                role === 'farmer'
                  ? 'bg-amber text-charcoal shadow-md'
                  : 'text-ivory-200 hover:text-white hover:bg-white/5'
              }`}
            >
              🌾 I am a Farmer
            </button>
            <button
              type="button"
              onClick={() => onSetRole('buyer')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                role === 'buyer'
                  ? 'bg-amber text-charcoal shadow-md'
                  : 'text-ivory-200 hover:text-white hover:bg-white/5'
              }`}
            >
              🏢 I am a Verified Buyer
            </button>
          </div>

          <span className="text-2xs text-ivory-200/70 font-mono">
            Active Mode: {role === 'farmer' ? 'Farmer View' : 'Buyer View'}
          </span>
        </div>
      </div>

      {/* ── Dual Hero Call-to-Actions ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SELL PRODUCE HERO CARD */}
        <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 lg:p-7 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>

            <span className="text-2xs font-bold uppercase tracking-wider text-forest dark:text-emerald-400 font-mono">
              For Farmers
            </span>

            <h2 className="text-2xl font-bold text-charcoal dark:text-ivory-100">
              SELL YOUR PRODUCE
            </h2>

            <p className="text-sm text-charcoal-muted dark:text-ivory-200/70 leading-relaxed">
              Get an evidence-backed fair price range, compare Mandi vs direct buyer realization, and connect directly with verified buyers.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                onSetRole('farmer');
                onNavigateFarmerTab('create_listing');
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 shadow-sm transition-all"
            >
              Create Fair Price Listing
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                onSetRole('farmer');
                onNavigateFarmerTab('create_listing');
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 dark:bg-charcoal/40 text-charcoal text-xs font-semibold hover:border-forest/30 transition-all"
            >
              <Scale className="w-4 h-4 text-forest" />
              Check Fair Price Engine
            </button>
          </div>
        </div>

        {/* BUY PRODUCE HERO CARD */}
        <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 lg:p-7 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber/10 text-amber flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>

            <span className="text-2xs font-bold uppercase tracking-wider text-amber font-mono">
              For Buyers & Processors
            </span>

            <h2 className="text-2xl font-bold text-charcoal dark:text-ivory-100">
              BUY PRODUCE
            </h2>

            <p className="text-sm text-charcoal-muted dark:text-ivory-200/70 leading-relaxed">
              Discover verified farmers, inspect digital crop reports, transparent prices, and contract cash-crops within Agrisense land safeguards.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => {
                onSetRole('buyer');
                onNavigateBuyerTab('marketplace');
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber text-charcoal text-xs font-bold hover:bg-amber-400 shadow-sm transition-all"
            >
              Browse Farmer Listings
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                onSetRole('buyer');
                onNavigateBuyerTab('requirements');
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 dark:bg-charcoal/40 text-charcoal text-xs font-semibold hover:border-amber/30 transition-all"
            >
              Post Requirement
            </button>
          </div>
        </div>
      </div>

      {/* ── Why Agrisense Mandi Features Grid ───────────────────────────── */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 lg:p-8 shadow-card space-y-6">
        <div>
          <h3 className="text-xl font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-forest" />
            Why Agrisense Mandi?
          </h3>
          <p className="text-xs text-charcoal-muted dark:text-ivory-200/70 mt-1">
            Built specifically to solve structural agricultural trade issues in India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: ShieldCheck,
              title: 'Verified Participants',
              desc: 'Every farmer and buyer undergoes identity and farm data verification for trustworthy trading.',
            },
            {
              icon: TrendingUp,
              title: 'Evidence-Backed Fair Pricing',
              desc: 'Fair price ranges calculated from regional ref, quality premiums, moisture %, and production cost.',
            },
            {
              icon: Users,
              title: 'Direct Farmer–Buyer Trade',
              desc: 'Eliminate unnecessary intermediary cuts to maximize net farmer realization.',
            },
            {
              icon: Award,
              title: 'Transparent Buyer Reputation',
              desc: 'Public ratings on payment reliability %, average payment days, and contract adherence.',
            },
            {
              icon: Truck,
              title: 'Logistics Matching',
              desc: 'Calculates transport cost options, distance, vehicle sizing, and aggregated pickup routes.',
            },
            {
              icon: Lock,
              title: 'Demo Payment Protection',
              desc: 'Simulated escrow workflow keeping funds locked until delivery confirmation.',
            },
            {
              icon: Sprout,
              title: 'Farmer Aggregation',
              desc: 'Combines small farmer lots to fulfill bulk buyer requirements without losing lot traceability.',
            },
            {
              icon: FileCheck2,
              title: 'Structured Digital Deals',
              desc: 'Versioned agreements with immutable terms locking both parties before dispatch.',
            },
            {
              icon: BookOpen,
              title: 'Farmer Protection Rules',
              desc: 'Enforces 40% private contracting land limits and crop-rotation soil health warnings.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f] space-y-2 hover:border-forest/30 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 flex items-center justify-center">
                <item.icon className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
                <span className="text-forest text-xs">✓</span>
                {item.title}
              </h4>
              <p className="text-xs text-charcoal-muted dark:text-ivory-200/70 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
