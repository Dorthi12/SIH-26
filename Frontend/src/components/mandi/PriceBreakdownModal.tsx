import { useState } from "react";
import { X, HelpCircle, FileText, CheckCircle2, ChevronRight, Scale, Info, Award } from "lucide-react";
import type { PriceAnalysis, CostEvidence } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface PriceBreakdownModalProps {
  priceAnalysis: PriceAnalysis;
  askingPrice: number;
  cropName: string;
  variety: string;
  onClose: () => void;
  onViewEvidence?: (evidence: CostEvidence) => void;
}

export function PriceBreakdownModal({
  priceAnalysis,
  askingPrice,
  cropName,
  variety,
  onClose,
  onViewEvidence,
}: PriceBreakdownModalProps) {
  const { t } = useLanguage();
  const [showMethodNotes, setShowMethodNotes] = useState(false);

  const baseFactors = priceAnalysis.factors.filter((f) => f.category === "BASE");
  const qualityFactors = priceAnalysis.factors.filter((f) => f.category === "QUALITY");
  const organicFactors = priceAnalysis.factors.filter((f) => f.category === "ORGANIC");
  const logisticsFactors = priceAnalysis.factors.filter((f) => f.category === "LOGISTICS");
  const demandFactors = priceAnalysis.factors.filter((f) => f.category === "DEMAND");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ivory-200 dark:border-charcoal-light bg-gradient-to-r from-forest/10 via-emerald-50 to-ivory-50 dark:from-forest/20 dark:via-charcoal dark:to-charcoal-dark">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-forest text-white shadow-sm">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-charcoal dark:text-ivory-100 flex items-center gap-2">
                {t("Why is this price?", "यह कीमत क्यों है?")}
              </h2>
              <p className="text-xs text-charcoal-muted dark:text-ivory-400">
                {t("Transparent price composition for ", "पारदर्शी मूल्य संरचना: ")}
                <span className="font-semibold text-forest dark:text-emerald-400">
                  {cropName} ({variety})
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-charcoal-muted hover:text-charcoal hover:bg-ivory-200 dark:hover:bg-charcoal-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light">
            <div>
              <p className="text-2xs uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 font-bold">
                {t("Indicative Fair Range", "अनुमानित उचित सीमा")}
              </p>
              <p className="text-lg font-extrabold text-forest dark:text-emerald-400 mt-1">
                ₹{priceAnalysis.indicativeMinPrice.toLocaleString()} – ₹
                {priceAnalysis.indicativeMaxPrice.toLocaleString()}
                <span className="text-xs font-normal text-charcoal-muted"> / q</span>
              </p>
            </div>
            <div>
              <p className="text-2xs uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 font-bold">
                {t("Farmer Asking Price", "किसान मांग मूल्य")}
              </p>
              <p className="text-lg font-extrabold text-charcoal dark:text-ivory-100 mt-1">
                ₹{askingPrice.toLocaleString()}
                <span className="text-xs font-normal text-charcoal-muted"> / q</span>
              </p>
            </div>
            <div>
              <p className="text-2xs uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 font-bold">
                {t("Price Confidence", "मूल्य विश्वसनीयता")}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 rounded-full bg-ivory-300 dark:bg-charcoal-light overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${priceAnalysis.confidencePercentage}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {priceAnalysis.confidencePercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Composition Categories */}
          <div className="space-y-5">
            {/* 1. Base Market Conditions */}
            {baseFactors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {t("Base Market Reference", "आधार बाज़ार संदर्भ")}
                </h4>
                <div className="rounded-xl border border-ivory-200 dark:border-charcoal-light overflow-hidden divide-y divide-ivory-200 dark:divide-charcoal-light">
                  {baseFactors.map((factor) => (
                    <div
                      key={factor.id}
                      className="p-3.5 flex items-center justify-between bg-white dark:bg-charcoal-dark hover:bg-ivory-50 dark:hover:bg-charcoal/50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-charcoal dark:text-ivory-100">
                          {factor.name}
                        </p>
                        <p className="text-2xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
                          {factor.description}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-charcoal dark:text-ivory-100 shrink-0">
                        ₹{factor.amountPerQuintal}/q
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Crop Quality Factors */}
            {qualityFactors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  {t("Crop Quality & Grade Premiums", "फसल गुणवत्ता व ग्रेड प्रीमियम")}
                </h4>
                <div className="rounded-xl border border-ivory-200 dark:border-charcoal-light overflow-hidden divide-y divide-ivory-200 dark:divide-charcoal-light">
                  {qualityFactors.map((factor) => (
                    <div
                      key={factor.id}
                      className="p-3.5 flex items-center justify-between bg-white dark:bg-charcoal-dark hover:bg-ivory-50 dark:hover:bg-charcoal/50"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-charcoal dark:text-ivory-100">
                            {factor.name}
                          </p>
                          {factor.evidenceVerified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-3xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {t("Verified", "सत्यापित")}
                            </span>
                          )}
                        </div>
                        <p className="text-2xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
                          {factor.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {factor.evidenceTitle && onViewEvidence && (
                          <button
                            onClick={() =>
                              onViewEvidence({
                                id: factor.id,
                                title: factor.name,
                                category: "Quality",
                                fileName: factor.evidenceTitle!,
                                uploadDate: "2026-04-25",
                                verified: true,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg text-2xs font-medium text-forest hover:bg-forest/10 dark:text-emerald-400 border border-forest/30 flex items-center gap-1 transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            {t("View Proof", "साक्ष्य देखें")}
                          </button>
                        )}
                        <span
                          className={`text-sm font-bold shrink-0 ${
                            factor.amountPerQuintal >= 0
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-rose-600"
                          }`}
                        >
                          {factor.amountPerQuintal >= 0 ? "+" : ""}₹{factor.amountPerQuintal}/q
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Organic Factors */}
            {organicFactors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {t("Organic Certification Premium", "जैविक प्रमाणीकरण प्रीमियम")}
                </h4>
                <div className="rounded-xl border border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-950/20 overflow-hidden divide-y divide-green-200 dark:divide-green-800/40">
                  {organicFactors.map((factor) => (
                    <div key={factor.id} className="p-3.5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-green-900 dark:text-green-200">
                            {factor.name}
                          </p>
                          <span className="px-2 py-0.5 rounded text-3xs font-bold bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200">
                            🌱 Organic
                          </span>
                        </div>
                        <p className="text-2xs text-green-800 dark:text-green-400 mt-0.5">
                          {factor.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {factor.evidenceTitle && onViewEvidence && (
                          <button
                            onClick={() =>
                              onViewEvidence({
                                id: factor.id,
                                title: factor.name,
                                category: "Organic Certification",
                                fileName: factor.evidenceTitle!,
                                uploadDate: "2025-05-12",
                                verified: true,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg text-2xs font-medium text-green-800 bg-white dark:bg-green-900 dark:text-green-200 border border-green-300 flex items-center gap-1 transition-colors shadow-sm"
                          >
                            <FileText className="w-3 h-3" />
                            {t("View Certificate", "प्रमाणपत्र देखें")}
                          </button>
                        )}
                        <span className="text-sm font-extrabold text-green-700 dark:text-green-400">
                          +₹{factor.amountPerQuintal}/q
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Demand & Market Factors */}
            {demandFactors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  {t("Market Demand Adjustment", "बाज़ार मांग समायोजन")}
                </h4>
                <div className="rounded-xl border border-ivory-200 dark:border-charcoal-light overflow-hidden divide-y divide-ivory-200 dark:divide-charcoal-light">
                  {demandFactors.map((factor) => (
                    <div
                      key={factor.id}
                      className="p-3.5 flex items-center justify-between bg-white dark:bg-charcoal-dark"
                    >
                      <div>
                        <p className="text-sm font-semibold text-charcoal dark:text-ivory-100">
                          {factor.name}
                        </p>
                        <p className="text-2xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
                          {factor.description}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        +₹{factor.amountPerQuintal}/q
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Logistics & Handling Deductions */}
            {logisticsFactors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  {t("Logistics & Handling Adjustments", "लॉजिस्टिक्स व हैंडलिंग समायोजन")}
                </h4>
                <div className="rounded-xl border border-ivory-200 dark:border-charcoal-light overflow-hidden divide-y divide-ivory-200 dark:divide-charcoal-light">
                  {logisticsFactors.map((factor) => (
                    <div
                      key={factor.id}
                      className="p-3.5 flex items-center justify-between bg-white dark:bg-charcoal-dark"
                    >
                      <div>
                        <p className="text-sm font-semibold text-charcoal dark:text-ivory-100">
                          {factor.name}
                        </p>
                        <p className="text-2xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
                          {factor.description}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                        -₹{Math.abs(factor.amountPerQuintal)}/q
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Calculation Method Toggle */}
          <div className="pt-2 border-t border-ivory-200 dark:border-charcoal-light">
            <button
              onClick={() => setShowMethodNotes(!showMethodNotes)}
              className="text-xs font-semibold text-forest dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Info className="w-4 h-4" />
              {t("View Calculation Method & Formula", "गणना विधि और फॉर्मूला देखें")}
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${
                  showMethodNotes ? "rotate-90" : ""
                }`}
              />
            </button>

            {showMethodNotes && (
              <div className="mt-3 p-4 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light text-xs text-charcoal dark:text-ivory-200 space-y-2 animate-in fade-in duration-150">
                <p className="font-semibold text-forest dark:text-emerald-400">
                  {t("Agrisense Fair Price Model Formula:", "एग्रीसेंस उचित मूल्य मॉडल फॉर्मूला:")}
                </p>
                <p className="font-mono text-2xs bg-white dark:bg-charcoal-dark p-2.5 rounded border border-ivory-300 dark:border-charcoal-light text-charcoal">
                  Indicative Fair Price = Base APMC Rate + Quality Premium + Organic Premium + Demand Adjustment - Transport/Storage Logistics
                </p>
                <p className="text-charcoal-muted dark:text-ivory-400">
                  {priceAnalysis.calculationMethodNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-ivory-200 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal/50">
          <div className="flex items-center gap-2 text-xs text-charcoal-muted dark:text-ivory-400">
            <Award className="w-4 h-4 text-forest dark:text-emerald-400" />
            <span>{t("Evidence-Backed Pricing", "साक्ष्य-आधारित मूल्य निर्धारण")}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-forest text-white hover:bg-forest-dark transition-colors shadow-sm"
          >
            {t("Got It", "समझ गए")}
          </button>
        </div>
      </div>
    </div>
  );
}
