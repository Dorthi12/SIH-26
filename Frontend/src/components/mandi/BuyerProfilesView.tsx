import React, { useState } from 'react';
import {
  Building,
  ShieldCheck,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  FileText,
  Plus,
  ArrowRight,
} from 'lucide-react';
import type { BuyerProfile, BuyerRequirement } from '../../types/mandi';
import { landProtectionService } from '../../services/mandiService';

interface BuyerProfilesViewProps {
  buyers: BuyerProfile[];
  requirements: BuyerRequirement[];
  onPostRequirement?: (req: Partial<BuyerRequirement>) => void;
  onContactBuyer?: (buyer: BuyerProfile) => void;
}

export function BuyerProfilesView({
  buyers,
  requirements,
  onPostRequirement,
  onContactBuyer,
}: BuyerProfilesViewProps) {
  const [showReqModal, setShowReqModal] = useState(false);
  const [cropInput, setCropInput] = useState('Maize');
  const [landInput, setLandInput] = useState<number>(4.5); // test value for 40% check
  const [qtyInput, setQtyInput] = useState<number>(400);

  const farmerTotalLand = 8.5; // Farmer's total land benchmark
  const testLandCheck = landProtectionService.checkLandAllocation(farmerTotalLand, landInput);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <Building className="w-5 h-5 text-amber" />
            Verified Buyer Profiles & Procurement Requirements
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-ivory-200/70 mt-0.5">
            Transparent reputation metrics including payment reliability, average settlement days, and dispute history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowReqModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber text-charcoal text-xs font-bold hover:bg-amber-400 transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Post Cash Crop Requirement
        </button>
      </div>

      {/* Verified Buyers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {buyers.map((b) => (
          <div
            key={b.id}
            className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-mono font-bold text-amber uppercase bg-amber/10 px-2.5 py-0.5 rounded-full">
                  {b.type}
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Buyer
                </span>
              </div>

              <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100">{b.name}</h3>

              <div className="flex items-center gap-2 text-xs text-charcoal-muted dark:text-ivory-200/70">
                <MapPin className="w-3.5 h-3.5 text-amber" />
                <span>{b.location}</span>
                <span>•</span>
                <span className="font-semibold text-charcoal dark:text-ivory-100">{b.completedTransactions} Deals</span>
              </div>
            </div>

            {/* Buyer Trust Metrics Bar */}
            <div className="p-3.5 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Payment Reliability:</span>
                <span className="font-extrabold text-emerald-600">{b.paymentReliabilityPct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Avg Payment Time:</span>
                <span className="font-bold text-charcoal dark:text-ivory-100">{b.avgPaymentDays} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Reputation Rating:</span>
                <span className="font-bold text-amber flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber" /> {b.rating} / 5
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onContactBuyer && onContactBuyer(b)}
              className="w-full py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 transition-all shadow-sm"
            >
              View Active Requirements
            </button>
          </div>
        ))}
      </div>

      {/* Buyer Requirement Creation Modal (With 40% Land Safeguard Validation) */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17211d] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-ivory-300 dark:border-[#26362f] space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-ivory-200 dark:border-[#26362f] pb-3">
              <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
                <Building className="w-5 h-5 text-amber" />
                Create Private Company Cash-Crop Requirement
              </h3>
              <button
                type="button"
                onClick={() => setShowReqModal(false)}
                className="w-7 h-7 rounded-full bg-ivory-200 text-charcoal font-bold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-2xs font-semibold text-charcoal-muted block mb-1">Crop Type</label>
                <input
                  type="text"
                  value={cropInput}
                  onChange={(e) => setCropInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-2xs font-semibold text-charcoal-muted block mb-1">Required Quantity (q)</label>
                  <input
                    type="number"
                    value={qtyInput}
                    onChange={(e) => setQtyInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-2xs font-semibold text-charcoal-muted block mb-1">Suggested Land Area (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={landInput}
                    onChange={(e) => setLandInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 font-mono font-bold outline-none"
                  />
                </div>
              </div>

              {/* 40% Land Limit Live Safeguard Check */}
              <div className="p-3 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 space-y-1">
                <span className="text-2xs font-bold text-charcoal dark:text-ivory-100 block">
                  Agrisense Land Safeguard Check (Target Farmer: 8.5 Acres):
                </span>
                <span className="text-2xs font-mono block">
                  Requested: <strong>{landInput} Acres ({testLandCheck.allocationPercentage}%)</strong> | Max Limit: 40% (3.4 Acres)
                </span>

                {testLandCheck.isWithinLimit ? (
                  <span className="text-[10px] text-emerald-700 font-bold block pt-1">
                    ✓ Requirement is eligible under Agrisense land protection rules.
                  </span>
                ) : (
                  <div className="p-2 rounded bg-red-100 text-red-800 text-[10px] font-bold mt-1">
                    🔴 REQUIREMENT BLOCKED: Exceeds 40% land limit ({testLandCheck.allocationPercentage}%). Please reduce requested land area to 3.4 acres or less.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReqModal(false)}
                className="px-4 py-2 rounded-xl border border-ivory-300 text-xs font-semibold text-charcoal-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!testLandCheck.isWithinLimit}
                onClick={() => {
                  alert('Requirement created successfully within Agrisense safeguards!');
                  setShowReqModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-forest text-white text-xs font-bold disabled:opacity-40 hover:bg-forest-600 shadow-sm"
              >
                Post Requirement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
