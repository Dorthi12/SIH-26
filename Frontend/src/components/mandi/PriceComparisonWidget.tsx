import { TrendingUp, Scale, CheckCircle2, ArrowRight } from "lucide-react";
import type { PriceAnalysis } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface PriceComparisonWidgetProps {
  priceAnalysis: PriceAnalysis;
  askingPrice: number;
  cropName: string;
}

export function PriceComparisonWidget({ priceAnalysis, askingPrice, cropName }: PriceComparisonWidgetProps) {
  const { t } = useLanguage();

  const isWithinRange =
    askingPrice >= priceAnalysis.indicativeMinPrice &&
    askingPrice <= priceAnalysis.indicativeMaxPrice;

  const nearbyMin = Math.round(priceAnalysis.indicativeMinPrice * 0.99);
  const nearbyMax = Math.round(priceAnalysis.indicativeMaxPrice * 1.01);

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-forest dark:text-emerald-400" />
            {t("Market Price Comparison", "बाज़ार मूल्य तुलना")}
          </h3>
          <p className="text-2xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
            {t(
              "How this listing compares against fair price models & nearby markets",
              "यह लिस्टिंग मॉडल और आस-पास के बाजारों से कैसे तुलना करती है"
            )}
          </p>
        </div>

        {isWithinRange ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {t("Fairly Priced", "उचित मूल्य")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300">
            {t("Custom Premium", "कस्टम प्रीमियम")}
          </span>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Agrisense Fair Range */}
        <div className="p-3.5 rounded-xl bg-forest/5 dark:bg-forest/10 border border-forest/20 dark:border-emerald-800/40 space-y-1">
          <span className="text-3xs uppercase font-bold tracking-wider text-forest dark:text-emerald-400">
            {t("Agrisense Fair Range", "एग्रीसेंस उचित सीमा")}
          </span>
          <p className="text-base font-extrabold text-forest dark:text-emerald-400">
            ₹{priceAnalysis.indicativeMinPrice.toLocaleString()} – ₹
            {priceAnalysis.indicativeMaxPrice.toLocaleString()}
          </p>
          <p className="text-3xs text-charcoal-muted dark:text-ivory-400">
            {t("Evidence-calculated range", "साक्ष्य-आधारित सीमा")}
          </p>
        </div>

        {/* 2. Farmer Asking Price */}
        <div className="p-3.5 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-1">
          <span className="text-3xs uppercase font-bold tracking-wider text-charcoal-muted dark:text-ivory-400">
            {t("Farmer Asking Price", "किसान मांग मूल्य")}
          </span>
          <p className="text-base font-extrabold text-charcoal dark:text-ivory-100">
            ₹{askingPrice.toLocaleString()} / q
          </p>
          <p className="text-3xs text-emerald-700 dark:text-emerald-400 font-semibold">
            {isWithinRange
              ? t("Inside indicative range", "उचित सीमा के भीतर")
              : t("Above base reference", "आधार संदर्भ से ऊपर")}
          </p>
        </div>

        {/* 3. Regional APMC Reference */}
        <div className="p-3.5 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-1">
          <span className="text-3xs uppercase font-bold tracking-wider text-charcoal-muted dark:text-ivory-400">
            {t("Regional APMC Base", "क्षेत्रीय APMC आधार")}
          </span>
          <p className="text-base font-extrabold text-charcoal dark:text-ivory-100">
            ₹{priceAnalysis.regionalReferencePrice.toLocaleString()} / q
          </p>
          <p className="text-3xs text-charcoal-muted dark:text-ivory-400">
            {t("Average un-graded mandi rate", "सामान्य अवर्गीकृत मंडी दर")}
          </p>
        </div>

        {/* 4. Nearby Listings */}
        <div className="p-3.5 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-1">
          <span className="text-3xs uppercase font-bold tracking-wider text-charcoal-muted dark:text-ivory-400">
            {t("Nearby Verified Listings", "आस-पास की लिस्टिंग")}
          </span>
          <p className="text-base font-extrabold text-charcoal dark:text-ivory-100">
            ₹{nearbyMin.toLocaleString()} – ₹{nearbyMax.toLocaleString()}
          </p>
          <p className="text-3xs text-charcoal-muted dark:text-ivory-400">
            {t("District peer listings", "जिला समकक्ष लिस्टिंग")}
          </p>
        </div>
      </div>
    </div>
  );
}
