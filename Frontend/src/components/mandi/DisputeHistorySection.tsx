import { Scale, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import type { BuyerProfile } from "../../types/mandi";

interface DisputeHistorySectionProps {
  buyer: BuyerProfile;
}

export function DisputeHistorySection({ buyer }: DisputeHistorySectionProps) {
  const disputes = buyer.disputeRecord;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-light">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-charcoal dark:text-ivory-100">
              Dispute History
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400">
              Transparent log of past disputes and platform resolution outcomes
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-2xs font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
          100% Resolution Rate
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
        <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
          <span className="font-black text-xl text-charcoal dark:text-ivory-100 block">
            {disputes.totalDisputes}
          </span>
          <span className="text-3xs font-extrabold text-charcoal-muted dark:text-ivory-400 uppercase tracking-wider">
            Total Disputes
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-900 dark:text-emerald-200">
          <span className="font-black text-xl block">{disputes.resolvedDisputes}</span>
          <span className="text-3xs font-extrabold uppercase tracking-wider">Resolved</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
          <span className="font-black text-xl text-charcoal dark:text-ivory-100 block">
            {disputes.unresolvedDisputes}
          </span>
          <span className="text-3xs font-extrabold text-charcoal-muted dark:text-ivory-400 uppercase tracking-wider">
            Unresolved
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-blue-900 dark:text-blue-200">
          <span className="font-black text-xl block">100%</span>
          <span className="text-3xs font-extrabold uppercase tracking-wider">Resolution Rate</span>
        </div>
      </div>

      {/* Dispute Records List */}
      <div className="space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 block">
          Privacy-Safe Dispute Logs
        </span>

        {disputes.disputesList.map((disp) => (
          <div
            key={disp.id}
            className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-charcoal dark:text-ivory-100">
                Dispute #{disp.id} • {disp.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-3xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ✓ {disp.status}
              </span>
            </div>

            <p className="text-2xs text-charcoal-muted dark:text-ivory-300 font-medium">
              <strong>Resolution:</strong> {disp.resolution}
            </p>

            <span className="text-3xs text-charcoal-muted block">
              Resolved Date: {disp.completedDate}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
