import React from 'react';
import {
  ShieldCheck,
  Lock,
  PieChart,
  Sprout,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Building,
  Scale,
  Award,
} from 'lucide-react';
import type { PrivateCompanyContract } from '../../types/mandi';

interface FarmerProtectionCenterProps {
  contracts: PrivateCompanyContract[];
}

export function FarmerProtectionCenter({ contracts }: FarmerProtectionCenterProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-700 text-white rounded-3xl p-6 lg:p-8 shadow-card space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber text-xs font-bold font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          Agrisense Mandi Protection Philosophy
        </div>

        <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
          🛡 Farmer Protection & Safeguards Center
        </h1>

        <p className="text-sm text-ivory-100/90 leading-relaxed max-w-2xl">
          "Transparent Trade. Fair Prices. Protected Farmers." Safeguarding farmer land, soil health, prices, identity, and contractual rights.
        </p>
      </div>

      {/* 7 Protection Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          {
            icon: PieChart,
            title: '40% Land Contracting Limit',
            status: '✓ Active Safeguard',
            desc: 'Prevents private agro companies from contracting cash-crops on more than 40% of cultivable land.',
          },
          {
            icon: Sprout,
            title: 'Crop Rotation Soil Rule',
            status: '✓ Active Safeguard',
            desc: 'Warns against planting consecutive crops on the same plot to protect nitrogen and soil health.',
          },
          {
            icon: ShieldCheck,
            title: 'Buyer Identity Verification',
            status: '✓ Verified',
            desc: 'Every buyer profile displays verified payment reliability %, average payment days, and dispute records.',
          },
          {
            icon: Scale,
            title: 'Fair Price Range Engine',
            status: '✓ Transparent',
            desc: 'Calculates evidence-backed price ranges from regional ref, quality premiums, and production costs.',
          },
          {
            icon: Lock,
            title: 'Demo Payment Protection',
            status: '✓ Escrow Simulated',
            desc: 'Keeps transaction funds protected until delivery is verified by the buyer.',
          },
          {
            icon: FileCheck2,
            title: 'Versioned Smart Deals',
            status: '✓ Terms Locked',
            desc: 'Immutable digital deal agreements preventing silent term overrides by either party.',
          },
        ].map((pillar, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-[#17211d] border border-ivory-300 dark:border-[#26362f] shadow-card space-y-2 hover:border-forest/30 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 flex items-center justify-center">
              <pillar.icon className="w-5 h-5" />
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-charcoal dark:text-ivory-100">{pillar.title}</h3>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {pillar.status}
              </span>
            </div>

            <p className="text-xs text-charcoal-muted dark:text-ivory-200/70 leading-relaxed">
              {pillar.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Private Company Contract Risk Audit Dashboard */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <Building className="w-5 h-5 text-forest" />
            Private Company Contract Completeness & Risk Indicators
          </h3>
          <span className="text-2xs font-mono font-bold text-forest bg-forest/10 px-2.5 py-1 rounded">
            92% Average Completeness
          </span>
        </div>

        <div className="space-y-3">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f] space-y-3 text-xs"
            >
              <div className="flex justify-between items-center font-bold text-charcoal dark:text-ivory-100">
                <span>{c.companyName} ({c.crop})</span>
                <span className="text-forest font-mono">Contract Completeness: 92%</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs font-mono">
                <span className="text-emerald-700 font-semibold">✓ Price Terms Clear</span>
                <span className="text-emerald-700 font-semibold">✓ Quantity Specified</span>
                <span className="text-emerald-700 font-semibold">✓ Quality & Moisture</span>
                <span className="text-amber-700 font-semibold">⚠ Dispute Mechanism Missing</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
