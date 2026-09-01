import { PieChart, TrendingUp, BarChart2 } from "lucide-react";
import type { BuyerProfile } from "../../types/mandi";

interface PurchaseHistorySummaryProps {
  buyer: BuyerProfile;
}

export function PurchaseHistorySummary({ buyer }: PurchaseHistorySummaryProps) {
  const shares = buyer.purchaseShares || [
    { cropName: "Wheat", percentageShare: 42 },
    { cropName: "Rice", percentageShare: 28 },
    { cropName: "Gram", percentageShare: 17 },
    { cropName: "Maize", percentageShare: 13 },
  ];

  const yearlyVolume = buyer.yearlyVolumeGrowth || [
    { year: 2024, volumeQuintals: 3200 },
    { year: 2025, volumeQuintals: 4100 },
    { year: 2026, volumeQuintals: 4800 },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-light">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-forest/10 text-forest dark:text-emerald-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-charcoal dark:text-ivory-100">
              Purchase History Summary
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400">
              Aggregated procurement volume distribution (Individual farmer data strictly redacted)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchases by Crop Bar breakdown */}
        <div className="space-y-3 bg-ivory-50 dark:bg-charcoal p-5 rounded-2xl border border-ivory-200 dark:border-charcoal-light">
          <span className="font-extrabold text-xs text-charcoal dark:text-ivory-100 block">
            Purchases by Crop Share
          </span>

          <div className="space-y-2 text-xs">
            {shares.map((item) => (
              <div key={item.cropName} className="space-y-1">
                <div className="flex items-center justify-between font-bold text-charcoal dark:text-ivory-200">
                  <span>{item.cropName}</span>
                  <span className="text-forest dark:text-emerald-400 font-extrabold">{item.percentageShare}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-ivory-200 dark:bg-charcoal-dark overflow-hidden">
                  <div
                    style={{ width: `${item.percentageShare}%` }}
                    className="h-full rounded-full bg-forest"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Purchase Volume Growth */}
        <div className="space-y-3 bg-ivory-50 dark:bg-charcoal p-5 rounded-2xl border border-ivory-200 dark:border-charcoal-light">
          <span className="font-extrabold text-xs text-charcoal dark:text-ivory-100 block">
            Annual Procurement Volume Growth
          </span>

          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            {yearlyVolume.map((vol) => (
              <div
                key={vol.year}
                className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-1"
              >
                <span className="text-3xs font-extrabold text-charcoal-muted dark:text-ivory-400 block">
                  Year {vol.year}
                </span>
                <span className="text-base font-black text-charcoal dark:text-ivory-100 block">
                  {vol.volumeQuintals.toLocaleString()} q
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
