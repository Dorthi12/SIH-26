import { Clock, TrendingUp, CheckCircle2, MessageSquare, Handshake } from "lucide-react";
import type { BuyerProfile } from "../../types/mandi";

interface MarketplaceActivityCardProps {
  buyer: BuyerProfile;
}

export function MarketplaceActivityCard({ buyer }: MarketplaceActivityCardProps) {
  const act = buyer.activity || {
    activeRequirementsCount: 3,
    offersReceivedCount: 18,
    offersAcceptedCount: 7,
    completedDealsCount: 128,
    lastActiveText: "Today",
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-light">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-charcoal dark:text-ivory-100">
              Marketplace Activity
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400">
              Live engagement status and active deal participation
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-2xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
          🟢 Last Active: {act.lastActiveText}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
        <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
          <span className="text-2xl font-black text-charcoal dark:text-ivory-100 block">
            {act.activeRequirementsCount}
          </span>
          <span className="text-3xs font-extrabold text-charcoal-muted dark:text-ivory-400 uppercase tracking-wider">
            Active Requirements
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">
            {act.offersReceivedCount}
          </span>
          <span className="text-3xs font-extrabold text-charcoal-muted dark:text-ivory-400 uppercase tracking-wider">
            Offers Received
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
          <span className="text-2xl font-black text-amber-500 block">
            {act.offersAcceptedCount}
          </span>
          <span className="text-3xs font-extrabold text-charcoal-muted dark:text-ivory-400 uppercase tracking-wider">
            Offers Accepted
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
            {act.completedDealsCount}
          </span>
          <span className="text-3xs font-extrabold text-charcoal-muted dark:text-ivory-400 uppercase tracking-wider">
            Completed Deals
          </span>
        </div>
      </div>
    </div>
  );
}
