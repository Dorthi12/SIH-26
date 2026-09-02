import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Star,
  Sprout,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Info,
  Calendar,
  Layers,
  Sparkles,
  UserCheck,
  ChevronRight,
  PieChart,
} from 'lucide-react';
import type {
  LandParcel,
  CropRotationEntry,
  PrivateCompanyContract,
} from '../../types/mandi';
import {
  landProtectionService,
  cropRotationService,
} from '../../services/mandiService';

interface FarmProfileViewProps {
  parcels: LandParcel[];
  cropHistory: CropRotationEntry[];
  contracts: PrivateCompanyContract[];
  onAcceptContract?: (contractId: string) => void;
}

export function FarmProfileView({
  parcels,
  cropHistory,
  contracts,
  onAcceptContract,
}: FarmProfileViewProps) {
  const [privacyMode, setPrivacyMode] = useState<'private' | 'public'>('private');
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [testSimLandAcres, setTestSimLandAcres] = useState<number>(4.5);
  const [consentChecked, setConsentChecked] = useState(false);

  const totalLand = parcels.reduce((sum, p) => sum + p.areaAcres, 0);
  const activeCompanyLand = contracts
    .filter((c) => c.status === 'Active' || c.status === 'Pending Farmer Consent')
    .reduce((sum, c) => sum + c.requestedLandAcres, 0);

  const allocationResult = landProtectionService.checkLandAllocation(totalLand, activeCompanyLand);

  // Rotation status on Plot A (Wheat consecutive test)
  const plotA = parcels.find((p) => p.id === 'plot-a') || parcels[0];
  const plotARotation = cropRotationService.checkCropRotation(plotA, 'Wheat', cropHistory);

  // Land Test Simulation
  const simResult = landProtectionService.checkLandAllocation(totalLand, testSimLandAcres);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Farmer Profile Header ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#17211d] rounded-3xl border border-ivory-300 dark:border-[#26362f] p-6 lg:p-8 shadow-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 flex items-center justify-center font-bold text-2xl border border-forest/20 shrink-0">
              🌾
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-charcoal dark:text-ivory-100">
                  Ramesh Kumar Verma
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Farmer
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-charcoal-muted dark:text-ivory-200/70 font-mono flex-wrap">
                <span>Farmer ID: AGR-F-882190</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-forest" />
                  Barabanki, Uttar Pradesh
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold pt-1">
                <span className="flex items-center gap-1 text-amber">
                  <Star className="w-4 h-4 fill-amber" />
                  4.8 / 5 Rating
                </span>
                <span className="text-charcoal-muted dark:text-ivory-200/70">
                  38 Completed Transactions
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Layer Selector */}
          <div className="flex flex-col items-end gap-2 bg-ivory-100/70 dark:bg-charcoal/40 p-3 rounded-2xl border border-ivory-300 dark:border-[#26362f]">
            <span className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted font-mono">
              Profile View Layer
            </span>
            <div className="flex items-center gap-1 bg-white dark:bg-[#17211d] p-1 rounded-xl border border-ivory-300 dark:border-[#26362f]">
              <button
                type="button"
                onClick={() => setPrivacyMode('private')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  privacyMode === 'private'
                    ? 'bg-forest text-white shadow-sm'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Private View
              </button>
              <button
                type="button"
                onClick={() => setPrivacyMode('public')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  privacyMode === 'public'
                    ? 'bg-forest text-white shadow-sm'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Public Marketplace View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Privacy Boundary Banner ─────────────────────────────────────── */}
      {privacyMode === 'private' ? (
        <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">🔒 Private Farmer Identity View</span>
            Sensitive personal identifiers (Aadhaar, bank account details, private land khatauni documents, phone number) are protected by Agrisense zero-leak privacy rules and visible only to authorized authorities.
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200">
          <Eye className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">👁 Public Marketplace Profile View</span>
            This is exactly how prospective verified buyers see your profile: verified badges, location district, crop availability, quality credentials, and transaction statistics. Personal documents are strictly redacted.
          </div>
        </div>
      )}

      {/* ── Private Information Shielding Cards (Only in Private Mode) ──── */}
      {privacyMode === 'private' && (
        <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-forest" />
              Private Government & Bank Identifiers
            </h3>
            <span className="text-2xs font-mono bg-ivory-200 dark:bg-charcoal/60 px-2 py-1 rounded text-charcoal-muted">
              Hidden from Marketplace Buyers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Aadhaar Number', value: 'XXXX-XXXX-4819', status: 'Identity Verified' },
              { label: 'Bank Account (PM-KISAN)', value: 'SBI •••• 9921', status: 'Bank Verified' },
              { label: 'Private Mobile No.', value: '+91 98XXX X3819', status: 'OTP Verified' },
              { label: 'Exact Farm Address', value: 'Village Rampur, Barabanki', status: 'District Public Only' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-charcoal-muted font-medium">{item.label}</span>
                  <Lock className="w-3 h-3 text-amber" />
                </div>
                <p className="text-sm font-bold font-mono text-charcoal dark:text-ivory-100">{item.value}</p>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                  ✓ {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Farm Overview ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-forest" />
              Farm Overview & Land Capacity
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-ivory-200/70 mt-0.5">
              Verified land parcels and irrigation breakdown.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-forest bg-forest/10 px-3 py-1.5 rounded-xl border border-forest/20">
            Total: {totalLand} Acres
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
          {[
            { label: 'Cultivable Land', val: `${totalLand} acres`, highlight: true },
            { label: 'Owned Land', val: '6.5 acres' },
            { label: 'Leased Land', val: '2.0 acres' },
            { label: 'Irrigated Area', val: '6.0 acres' },
            { label: 'Rainfed Area', val: '2.5 acres' },
            { label: 'Plots / Parcels', val: `${parcels.length}` },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all ${
                stat.highlight
                  ? 'bg-forest/10 dark:bg-forest/20 border-forest/30 text-forest'
                  : 'bg-ivory-100/50 dark:bg-charcoal/40 border-ivory-200 dark:border-[#26362f]'
              }`}
            >
              <span className="text-2xs text-charcoal-muted dark:text-ivory-200/70 font-semibold uppercase block">
                {stat.label}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-charcoal dark:text-ivory-100 mt-1 block">
                {stat.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Plot-Level Land Management ──────────────────────────────────── */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card space-y-6">
        <div>
          <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-forest" />
            My Land Parcels (Plot-Level Management)
          </h3>
          <p className="text-xs text-charcoal-muted dark:text-ivory-200/70 mt-0.5">
            Individual plot tracking prevents blanket crop failures and protects soil health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parcels.map((plot) => {
            const rotCheck = cropRotationService.checkCropRotation(plot, plot.plannedNextCrop, cropHistory);
            return (
              <div
                key={plot.id}
                className="p-5 rounded-2xl bg-ivory-100/40 dark:bg-charcoal/30 border border-ivory-200 dark:border-[#26362f] space-y-4 hover:border-forest/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-forest text-white flex items-center justify-center font-bold text-xs">
                      {plot.id.split('-')[1].toUpperCase()}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-charcoal dark:text-ivory-100">{plot.name}</h4>
                      <p className="text-2xs text-charcoal-muted font-mono">{plot.areaAcres} Acres • {plot.type}</p>
                    </div>
                  </div>

                  <span className="text-2xs px-2.5 py-1 rounded-full bg-white dark:bg-[#17211d] border border-ivory-300 text-charcoal font-semibold">
                    {plot.soilType}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs bg-white dark:bg-[#17211d] p-3 rounded-xl border border-ivory-200 dark:border-[#26362f]">
                  <div>
                    <span className="text-2xs text-charcoal-muted block">Current Crop</span>
                    <span className="font-bold text-forest dark:text-emerald-400">{plot.currentCrop}</span>
                  </div>
                  <div>
                    <span className="text-2xs text-charcoal-muted block">Previous Crop</span>
                    <span className="font-semibold text-charcoal dark:text-ivory-200">{plot.previousCrop}</span>
                  </div>
                  <div>
                    <span className="text-2xs text-charcoal-muted block">Planned Next</span>
                    <span className="font-semibold text-charcoal dark:text-ivory-200">{plot.plannedNextCrop}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-2xs text-charcoal-muted">
                    Method: <strong className="text-charcoal dark:text-ivory-100">{plot.productionMethod}</strong>
                  </span>

                  {rotCheck.isWarning ? (
                    <span className="inline-flex items-center gap-1 text-2xs font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-300">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Consecutive Crop Alert
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Healthy Rotation
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Crop Rotation History & System Safeguard Alert ───────────────── */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-forest" />
              Crop Rotation Safeguard History
            </h3>
            <p className="text-xs text-charcoal-muted dark:text-ivory-200/70 mt-0.5">
              Rule: Same crop should NOT be grown on the same plot in two consecutive years.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowRotationModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ivory-100/70 dark:bg-charcoal/40 text-forest text-xs font-bold border border-forest/20 hover:bg-forest/10 transition-all self-start sm:self-auto"
          >
            <HelpCircle className="w-4 h-4 text-forest" />
            Why does this matter?
          </button>
        </div>

        {/* Rotation Timeline */}
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2 text-xs font-bold text-charcoal-muted border-b border-ivory-200 dark:border-[#26362f] pb-2 font-mono">
            <span>Parcel / Plot</span>
            <span>2024 Crop</span>
            <span>2025 Crop</span>
            <span>2026 Crop & Status</span>
          </div>

          <div className="space-y-2 text-xs font-semibold">
            <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 items-center">
              <span className="font-bold text-charcoal dark:text-ivory-100">Plot A (2.5 ac)</span>
              <span className="text-charcoal-muted">Rice</span>
              <span className="text-charcoal dark:text-ivory-200 font-bold">Wheat</span>
              <div>
                <span className="text-red-700 dark:text-red-300 font-bold block">Wheat</span>
                <span className="text-[10px] text-red-600 font-bold">🔴 Consecutive Crop Warning</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 items-center">
              <span className="font-bold text-charcoal dark:text-ivory-100">Plot B (2.0 ac)</span>
              <span className="text-charcoal-muted">Wheat</span>
              <span className="text-charcoal dark:text-ivory-200 font-bold">Potato</span>
              <div>
                <span className="text-emerald-700 dark:text-emerald-300 font-bold block">Maize</span>
                <span className="text-[10px] text-emerald-600 font-bold">✓ Healthy Rotation</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 items-center">
              <span className="font-bold text-charcoal dark:text-ivory-100">Plot C (2.0 ac)</span>
              <span className="text-charcoal-muted">Mustard</span>
              <span className="text-charcoal dark:text-ivory-200 font-bold">Gram</span>
              <div>
                <span className="text-emerald-700 dark:text-emerald-300 font-bold block">Soybean</span>
                <span className="text-[10px] text-emerald-600 font-bold">✓ Healthy Rotation</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Safeguard Notice box */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            ⚠ Crop Rotation System Safeguard
          </div>
          <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
            {plotARotation.message}
          </p>

          <div className="pt-2">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block mb-2">
              Recommended Alternatives for Plot A in 2026:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {plotARotation.recommendedAlternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-white dark:bg-[#17211d] border border-amber-200 text-xs space-y-0.5"
                >
                  <span className="font-bold text-forest dark:text-emerald-400 block">{alt.crop}</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block">{alt.category}</span>
                  <p className="text-[10px] text-charcoal-muted">{alt.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Private Company Cash-Crop Contracting Safeguard (40% Limit) ────── */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest/10 text-forest text-2xs font-bold font-mono mb-1">
              Agrisense Farmer Protection Rule
            </div>
            <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-forest" />
              Land Allocation & Private Company Contracting Limit
            </h3>
            <p className="text-xs text-charcoal-muted dark:text-ivory-200/70 mt-0.5">
              Rule: A private buyer/company must not contract cash-crop production on more than 40% of the farmer's cultivable land.
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-amber bg-amber/10 px-3 py-1.5 rounded-xl border border-amber/30 self-start sm:self-auto">
            Max Limit: 40% (3.4 Acres)
          </span>
        </div>

        {/* Visual Allocation Progress Bar */}
        <div className="space-y-2 bg-ivory-100/50 dark:bg-charcoal/40 p-4 rounded-xl border border-ivory-200 dark:border-[#26362f]">
          <div className="flex justify-between text-xs font-bold text-charcoal dark:text-ivory-100">
            <span>Current Private Contracting Allocation</span>
            <span className="font-mono text-forest">{activeCompanyLand} / {totalLand} Acres ({allocationResult.allocationPercentage}%)</span>
          </div>

          <div className="w-full bg-ivory-300 dark:bg-[#26362f] h-3.5 rounded-full overflow-hidden relative">
            {/* 40% threshold marker line */}
            <div className="absolute top-0 bottom-0 left-[40%] w-0.5 bg-amber z-10" title="40% Agrisense Safeguard Limit" />

            <div
              className={`h-full transition-all rounded-full ${
                allocationResult.isWithinLimit ? 'bg-forest' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(allocationResult.allocationPercentage, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-2xs text-charcoal-muted font-mono pt-1">
            <span>0%</span>
            <span className="text-amber font-bold">Max 40% Safeguard Threshold ({allocationResult.maxAllowedAcres} ac)</span>
            <span>100% ({totalLand} ac)</span>
          </div>
        </div>

        {/* Active Private Company Contract Details & Consent */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-charcoal dark:text-ivory-100">
            Active Private Company Requirements & Consent Status
          </h4>

          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#17211d] border border-ivory-300 dark:border-[#26362f] space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ivory-200 dark:border-[#26362f] pb-3">
                <div>
                  <span className="text-2xs font-mono font-bold text-forest uppercase block">
                    {contract.companyName}
                  </span>
                  <h5 className="text-base font-bold text-charcoal dark:text-ivory-100">
                    Cash Crop Requirement: {contract.crop}
                  </h5>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Allocation: {contract.allocationPercentage}% ({contract.requestedLandAcres} ac)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-ivory-100/50 dark:bg-charcoal/40 p-3 rounded-xl">
                <div>
                  <span className="text-2xs text-charcoal-muted block">Required Quantity</span>
                  <span className="font-bold text-charcoal dark:text-ivory-100">{contract.requiredQuantityQuintals} q</span>
                </div>
                <div>
                  <span className="text-2xs text-charcoal-muted block">Offered Price</span>
                  <span className="font-bold text-forest font-mono">₹{contract.offeredPricePerQuintal}/q</span>
                </div>
                <div>
                  <span className="text-2xs text-charcoal-muted block">Contract Period</span>
                  <span className="font-bold text-charcoal dark:text-ivory-100">{contract.contractDurationMonths} Months</span>
                </div>
                <div>
                  <span className="text-2xs text-charcoal-muted block">Assigned Parcel</span>
                  <span className="font-bold text-charcoal dark:text-ivory-100">Plot C (2.0 ac)</span>
                </div>
              </div>

              {/* Farmer Consent Checkbox Requirement */}
              <div className="p-4 rounded-xl bg-ivory-100/60 dark:bg-charcoal/50 border border-ivory-200 dark:border-[#26362f] space-y-3">
                <span className="text-xs font-bold text-charcoal dark:text-ivory-100 block">
                  Farmer Explicit Consent Record
                </span>
                <label className="flex items-start gap-2.5 text-xs text-charcoal-muted dark:text-ivory-200/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentChecked || contract.farmerConsentGiven}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-0.5 rounded text-forest focus:ring-forest"
                  />
                  <span>
                    I explicitly approve allocating <strong>Plot C (2.0 acres / 23.5%)</strong> for this private company cash-crop contract. I understand the price terms, duration, and moisture conditions.
                  </span>
                </label>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onAcceptContract && onAcceptContract(contract.id)}
                    disabled={!consentChecked && !contract.farmerConsentGiven}
                    className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold disabled:opacity-50 hover:bg-forest-600 transition-all shadow-sm"
                  >
                    Accept Contract Terms
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive 40% Safeguard Simulation Tester */}
        <div className="p-5 rounded-2xl bg-ivory-100/40 dark:bg-charcoal/30 border border-ivory-200 dark:border-[#26362f] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber" />
              Test Land Protection Rule Calculator
            </h4>
            <span className="text-2xs font-mono text-charcoal-muted">Simulate Company Land Request</span>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-xs font-semibold text-charcoal dark:text-ivory-200 min-w-fit">
              Simulated Requested Land:
            </label>
            <input
              type="range"
              min="1.0"
              max="7.0"
              step="0.5"
              value={testSimLandAcres}
              onChange={(e) => setTestSimLandAcres(parseFloat(e.target.value))}
              className="w-full accent-forest cursor-pointer"
            />
            <span className="text-sm font-bold font-mono text-forest min-w-[60px]">
              {testSimLandAcres} Acres
            </span>
          </div>

          {/* Simulation Output Card */}
          {simResult.isWithinLimit ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
              <span className="font-bold">
                ✓ Within Limit ({simResult.allocationPercentage}% of {totalLand} acres). Maximum allowed is 40% ({simResult.maxAllowedAcres} acres).
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-2xs">
                Eligible
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-xs text-red-900 dark:text-red-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-1.5 text-red-700 dark:text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  🔴 NOT ELIGIBLE — Agrisense 40% Safeguard Limit Exceeded
                </span>
                <span className="px-2.5 py-1 rounded bg-red-600 text-white font-bold text-2xs">
                  Contract Blocked
                </span>
              </div>
              <p className="text-2xs text-red-800/80 dark:text-red-200/80">
                Company requested <strong>{testSimLandAcres} acres ({simResult.allocationPercentage}%)</strong>. Maximum eligible allocation is <strong>{simResult.maxAllowedAcres} acres (40%)</strong>. Requirement must be revised before farmer consent can be requested.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Educational Drawer / Modal for Crop Rotation ──────────────────── */}
      {showRotationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17211d] rounded-3xl max-w-lg w-full p-6 shadow-xl border border-ivory-300 dark:border-[#26362f] space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-ivory-200 dark:border-[#26362f] pb-3">
              <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-forest" />
                Why Crop Rotation Matters for Farmers
              </h3>
              <button
                type="button"
                onClick={() => setShowRotationModal(false)}
                className="w-7 h-7 rounded-full bg-ivory-200 text-charcoal font-bold flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-charcoal-muted dark:text-ivory-200/80 leading-relaxed">
              <p>
                <strong>Soil Health & Nitrogen Restoration:</strong> Planting cereal crops like Wheat continuously depletes deep soil nitrogen and phosphorus. Rotating with pulse legumes (Gram/Chickpea) fixes up to 40 kg N/ha naturally.
              </p>
              <p>
                <strong>Pest & Disease Break:</strong> Soil-borne fungi, nematodes, and specific weeds adapt when the same host crop is planted back-to-back. Rotation starves out species-specific pests.
              </p>
              <p>
                <strong>Market & Risk Diversification:</strong> Multi-crop farms protect farmer income if market prices crash for a single commodity.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRotationModal(false)}
                className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 transition-all"
              >
                Got It, Thank You
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
