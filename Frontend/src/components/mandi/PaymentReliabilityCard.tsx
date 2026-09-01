import { CreditCard, HelpCircle, CheckCircle2, Clock } from "lucide-react";
import type { BuyerProfile } from "../../types/mandi";

interface PaymentReliabilityCardProps {
  buyer: BuyerProfile;
}

export function PaymentReliabilityCard({ buyer }: PaymentReliabilityCardProps) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-light">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-charcoal dark:text-ivory-100">
              Payment Reliability
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400">
              Historical payment speed & clearance consistency
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
          Excellent
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Big Percentage & Progress Bar */}
        <div className="space-y-4">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {buyer.paymentReliabilityPercentage}%
            </span>
            <span className="text-sm font-extrabold text-charcoal dark:text-ivory-200">
              Payment Reliability Score
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3 rounded-full bg-ivory-200 dark:bg-charcoal overflow-hidden flex">
              <div
                style={{ width: `${buyer.onTimePaymentPercentage}%` }}
                className="bg-emerald-500 h-full rounded-l-full"
                title={`On-time payments: ${buyer.onTimePaymentPercentage}%`}
              ></div>
              <div
                style={{ width: `${buyer.delayedPaymentPercentage}%` }}
                className="bg-amber-500 h-full rounded-r-full"
                title={`Delayed payments: ${buyer.delayedPaymentPercentage}%`}
              ></div>
            </div>

            <div className="flex items-center justify-between text-3xs font-extrabold text-charcoal-muted dark:text-ivory-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                On-time Payments: {buyer.onTimePaymentPercentage}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Delayed Payments: {buyer.delayedPaymentPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Stats Breakdown */}
        <div className="space-y-3 text-xs bg-ivory-50 dark:bg-charcoal p-4 rounded-2xl border border-ivory-200 dark:border-charcoal-light">
          <div className="flex items-center justify-between">
            <span className="text-charcoal-muted dark:text-ivory-400 font-bold">Average Payment Clearance:</span>
            <span className="font-extrabold text-charcoal dark:text-ivory-100">{buyer.averagePaymentDays} Days</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-charcoal-muted dark:text-ivory-400 font-bold">Fastest Recorded Payment:</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">Same Day (Under 4 hours)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-charcoal-muted dark:text-ivory-400 font-bold">Standard Payment Terms:</span>
            <span className="font-extrabold text-charcoal dark:text-ivory-100">Within 48 hours of delivery</span>
          </div>
        </div>
      </div>

      {/* Tooltip Explanation */}
      <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal text-3xs text-charcoal-muted flex items-start gap-2 border border-ivory-200 dark:border-charcoal-light">
        <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <span>
          Payment reliability is calculated from completed verified transactions recorded on Agrisense. Payment clearance times reflect actual bank transfers following digital agreement locking.
        </span>
      </div>
    </div>
  );
}
