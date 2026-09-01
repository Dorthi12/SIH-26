import { ShoppingBag, TrendingUp, Award, Scale } from "lucide-react";
import type { BuyerProfile, PurchasingCropCategory } from "../../types/mandi";

interface WhatBuyerPurchasesProps {
  buyer: BuyerProfile;
}

export function WhatBuyerPurchases({ buyer }: WhatBuyerPurchasesProps) {
  const categories: PurchasingCropCategory[] = buyer.purchasingCropCategories || [
    {
      cropName: "Wheat",
      icon: "🌾",
      typicalVolume: "500 – 2,000 q",
      preferredGrade: "Grade A",
      preferredMoisturePercentage: 12.0,
      currentDemandStatus: "High",
      typicalPriceRange: "₹2,700 – ₹2,850 / q",
    },
    {
      cropName: "Rice",
      icon: "🌾",
      typicalVolume: "300 – 800 q",
      preferredGrade: "Grade A",
      preferredMoisturePercentage: 13.0,
      currentDemandStatus: "High",
      typicalPriceRange: "₹3,000 – ₹3,250 / q",
    },
    {
      cropName: "Gram / Chana",
      icon: "🫘",
      typicalVolume: "200 – 500 q",
      preferredGrade: "Grade A",
      preferredMoisturePercentage: 10.0,
      currentDemandStatus: "Moderate",
      typicalPriceRange: "₹5,200 – ₹5,500 / q",
    },
    {
      cropName: "Yellow Maize",
      icon: "🌽",
      typicalVolume: "400 – 1,200 q",
      preferredGrade: "Grade B",
      preferredMoisturePercentage: 14.0,
      currentDemandStatus: "Moderate",
      typicalPriceRange: "₹2,100 – ₹2,300 / q",
    },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-light">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-charcoal dark:text-ivory-100">
              What This Buyer Purchases
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400">
              Target crop commodities, typical purchase volumes, and moisture standards
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((crop) => (
          <div
            key={crop.cropName}
            className="p-5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-3 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{crop.icon}</span>
                <span className="font-extrabold text-sm text-charcoal dark:text-ivory-100">
                  {crop.cropName}
                </span>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-3xs font-extrabold border ${
                  crop.currentDemandStatus === "High"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-blue-100 text-blue-800 border-blue-300"
                }`}
              >
                🟢 {crop.currentDemandStatus} Demand
              </span>
            </div>

            <div className="space-y-1.5 text-2xs">
              <div className="flex items-center justify-between text-charcoal-muted dark:text-ivory-400">
                <span>Typical volume:</span>
                <span className="font-bold text-charcoal dark:text-ivory-200">{crop.typicalVolume}</span>
              </div>

              <div className="flex items-center justify-between text-charcoal-muted dark:text-ivory-400">
                <span>Preferred grade:</span>
                <span className="font-bold text-forest dark:text-emerald-400">{crop.preferredGrade}</span>
              </div>

              <div className="flex items-center justify-between text-charcoal-muted dark:text-ivory-400">
                <span>Preferred moisture:</span>
                <span className="font-bold text-charcoal dark:text-ivory-200">≤ {crop.preferredMoisturePercentage}%</span>
              </div>

              <div className="flex items-center justify-between text-charcoal-muted dark:text-ivory-400 pt-1 border-t border-ivory-200 dark:border-charcoal-light">
                <span>Typical price:</span>
                <span className="font-extrabold text-charcoal dark:text-ivory-100">{crop.typicalPriceRange}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
