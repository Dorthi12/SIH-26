import { TrendingUp, Scale, Clock, ShieldCheck, CheckCircle2, Award } from "lucide-react";
import type { BuyerProfile } from "../../types/mandi";

interface TransactionPerformanceSectionProps {
  buyer: BuyerProfile;
}

export function TransactionPerformanceSection({ buyer }: TransactionPerformanceSectionProps) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-light">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-charcoal dark:text-ivory-100">
              Transaction Performance
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400">
              Verified platform procurement statistics and payment metrics
            </p>
          </div>
        </div>
      </div>

      {/* 4 Major Statistic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light text-center space-y-1">
          <span className="text-2xl sm:text-3xl font-black text-charcoal dark:text-ivory-100 block">
            {buyer.completedTransactionsCount.toLocaleString()}
          </span>
          <span className="text-xs font-extrabold text-charcoal-muted dark:text-ivory-400 block">
            Completed Transactions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light text-center space-y-1">
          <span className="text-2xl sm:text-3xl font-black text-forest dark:text-emerald-400 block">
            {buyer.totalQuantityPurchasedQuintals.toLocaleString()} q
          </span>
          <span className="text-xs font-extrabold text-charcoal-muted dark:text-ivory-400 block">
            Total Produce Purchased
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light text-center space-y-1">
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 block">
            {buyer.onTimePaymentPercentage}%
          </span>
          <span className="text-xs font-extrabold text-charcoal-muted dark:text-ivory-400 block">
            On-Time Payments
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light text-center space-y-1">
          <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 block">
            {buyer.averagePaymentDays} Days
          </span>
          <span className="text-xs font-extrabold text-charcoal-muted dark:text-ivory-400 block">
            Average Payment Time
          </span>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
        <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="font-extrabold text-charcoal dark:text-ivory-100 block">98% Success Rate</span>
            <span className="text-3xs text-charcoal-muted">Transactions completed cleanly</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light flex items-center gap-2.5">
          <Award className="w-4 h-4 text-amber-500 shrink-0" />
          <div>
            <span className="font-extrabold text-charcoal dark:text-ivory-100 block">{buyer.farmerRating} / 5 Rating</span>
            <span className="text-3xs text-charcoal-muted">Average farmer satisfaction</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
          <div>
            <span className="font-extrabold text-charcoal dark:text-ivory-100 block">{buyer.disputeRecord.totalDisputes} Total Disputes</span>
            <span className="text-3xs text-charcoal-muted">Recorded platform disputes</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="font-extrabold text-charcoal dark:text-ivory-100 block">100% Resolved</span>
            <span className="text-3xs text-charcoal-muted">All disputes settled amicably</span>
          </div>
        </div>
      </div>
    </div>
  );
}
