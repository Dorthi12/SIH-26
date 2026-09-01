import { ShieldCheck, CheckCircle2, HelpCircle } from "lucide-react";
import type { BuyerProfile } from "../../types/mandi";

interface BuyerTransparencyScoreCardProps {
  buyer: BuyerProfile;
}

export function BuyerTransparencyScoreCard({ buyer }: BuyerTransparencyScoreCardProps) {
  const score = buyer.transparencyScore || 92;
  const checklist = buyer.transparencyChecklist || {
    "Business Verification": true,
    "Transaction History": true,
    "Payment History": true,
    "Buying Requirements": true,
    "Reputation": true,
    "Dispute Information": true,
    "Business Information": true,
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-light">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-forest/10 text-forest dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-charcoal dark:text-ivory-100">
              Buyer Transparency Score
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400">
              Measures completeness of verified information available on the platform
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-2xs font-extrabold bg-forest text-white shadow-xs">
          High Transparency
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left Big Score Hero */}
        <div className="p-6 rounded-2xl bg-forest/10 border border-forest/20 text-center space-y-1">
          <span className="text-4xl sm:text-5xl font-black text-forest dark:text-emerald-400 block tracking-tight">
            {score} <span className="text-xl font-bold text-charcoal-muted">/ 100</span>
          </span>
          <span className="text-xs font-extrabold text-charcoal dark:text-ivory-200 block">
            Transparency Score
          </span>
        </div>

        {/* Right Checklist Grid */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {Object.entries(checklist).map(([key, isAvailable]) => (
            <div
              key={key}
              className="p-2.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex items-center justify-between font-bold"
            >
              <span className="text-charcoal dark:text-ivory-200">{key}</span>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-2xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Available
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip Disclaimer */}
      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-3xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-2xs">Transparency Score Definition:</strong>
          This score measures <em>"How much verified information is available about this buyer"</em> on Agrisense. It is NOT a credit score, financial health guarantee, government rating, or contract warranty.
        </div>
      </div>
    </div>
  );
}
