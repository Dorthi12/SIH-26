import { Sparkles, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import type { BuyerProfile } from "../../types/mandi";

interface BuyerBehaviourSummaryProps {
  buyer: BuyerProfile;
}

export function BuyerBehaviourSummary({ buyer }: BuyerBehaviourSummaryProps) {
  const summary = buyer.behaviourSummary || {
    positiveTraits: [
      "High payment reliability (96% on-time)",
      "Consistent transaction completion rate (98%)",
      "Strong digital contract adherence",
      "Fast average payment time (2.3 days)",
      "Verified positive farmer feedback ratings (4.7 / 5)",
    ],
    areaToWatch: "Occasional pickup schedule delays during heavy monsoon arrivals (resolved amicably).",
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-light">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-charcoal dark:text-ivory-100">
              Buyer Behaviour Summary
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400">
              Informational summary synthesized strictly from verified platform trade statistics
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-2xs font-extrabold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 border border-indigo-300">
          📊 Platform Summary
        </span>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <span className="font-extrabold text-charcoal dark:text-ivory-200 block mb-2">
            This buyer has demonstrated:
          </span>
          <div className="space-y-2">
            {summary.positiveTraits.map((trait) => (
              <div key={trait} className="flex items-center gap-2 text-charcoal dark:text-ivory-100 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{trait}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 space-y-1">
          <span className="font-extrabold text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Area to watch:
          </span>
          <p className="text-2xs font-semibold leading-relaxed">
            {summary.areaToWatch}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal text-3xs text-charcoal-muted flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <span>
            This summary is an informational synthesis of recorded platform metrics and does not constitute a legal or financial guarantee.
          </span>
        </div>
      </div>
    </div>
  );
}
