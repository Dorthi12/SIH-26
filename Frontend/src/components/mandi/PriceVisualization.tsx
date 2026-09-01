import { useState } from "react";
import { ArrowDown, CheckCircle2, Leaf, ShieldCheck, Scale, FileText } from "lucide-react";
import type { PriceAnalysis, CostEvidence } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface PriceVisualizationProps {
  priceAnalysis: PriceAnalysis;
  onViewEvidence?: (evidence: CostEvidence) => void;
}

export function PriceVisualization({ priceAnalysis, onViewEvidence }: PriceVisualizationProps) {
  const { t } = useLanguage();
  const [selectedFactorId, setSelectedFactorId] = useState<string | null>(null);

  const baseFactor = priceAnalysis.factors.find((f) => f.category === "BASE");
  const additions = priceAnalysis.factors.filter(
    (f) => f.category !== "BASE" && f.amountPerQuintal > 0
  );
  const deductions = priceAnalysis.factors.filter(
    (f) => f.category !== "BASE" && f.amountPerQuintal < 0
  );

  const activeFactor = priceAnalysis.factors.find((f) => f.id === selectedFactorId);

  return (
    <div className="space-y-6 p-6 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-forest/10 text-forest dark:bg-forest/20 dark:text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-charcoal dark:text-ivory-100">
              {t("Price Formation Flow", "मूल्य निर्माण प्रवाह")}
            </h3>
            <p className="text-2xs text-charcoal-muted dark:text-ivory-400">
              {t(
                "Click any factor chip to inspect supporting evidence",
                "साक्ष्य देखने के लिए किसी भी कारक पर क्लिक करें"
              )}
            </p>
          </div>
        </div>

        <span className="text-2xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300">
          {t("Evidence-Backed", "साक्ष्य-आधारित")}
        </span>
      </div>

      {/* Visual Flow Diagram */}
      <div className="space-y-4 max-w-xl mx-auto">
        {/* Step 1: Base Regional Price Card */}
        {baseFactor && (
          <div
            onClick={() => setSelectedFactorId(baseFactor.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedFactorId === baseFactor.id
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-md"
                : "border-ivory-300 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                  {t("Step 1 • Base Reference", "चरण 1 • आधार संदर्भ")}
                </span>
                <h4 className="font-bold text-sm text-charcoal dark:text-ivory-100">
                  {baseFactor.name}
                </h4>
              </div>
              <span className="text-base font-extrabold text-charcoal dark:text-ivory-100">
                ₹{baseFactor.amountPerQuintal}/q
              </span>
            </div>
          </div>
        )}

        {/* Down Arrow */}
        <div className="flex justify-center my-1">
          <div className="p-1 rounded-full bg-ivory-200 dark:bg-charcoal text-charcoal-muted">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Step 2: Additions / Premiums */}
        {additions.length > 0 && (
          <div className="space-y-2">
            <p className="text-3xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 px-1">
              {t("Step 2 • Additive Premiums & Quality Bonusses (+)", "चरण 2 • प्रीमियम और गुणवत्ता बोनस (+)")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {additions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedFactorId(item.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedFactorId === item.id
                      ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-sm"
                      : "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-semibold text-charcoal dark:text-ivory-200 truncate pr-2">
                      {item.name}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                      +₹{item.amountPerQuintal}
                    </span>
                  </div>
                  {item.evidenceVerified && (
                    <div className="flex items-center gap-1 mt-1 text-3xs text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{t("Proof Verified", "सत्यापित साक्ष्य")}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Down Arrow */}
        <div className="flex justify-center my-1">
          <div className="p-1 rounded-full bg-ivory-200 dark:bg-charcoal text-charcoal-muted">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Step 3: Deductions */}
        {deductions.length > 0 && (
          <div className="space-y-2">
            <p className="text-3xs uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 px-1">
              {t("Step 3 • Logistics & Freight Adjustments (-)", "चरण 3 • लॉजिस्टिक्स व माल ढुलाई समायोजन (-)")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {deductions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedFactorId(item.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedFactorId === item.id
                      ? "border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 shadow-sm"
                      : "border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10 hover:border-rose-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-semibold text-charcoal dark:text-ivory-200 truncate pr-2">
                      {item.name}
                    </span>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0">
                      -₹{Math.abs(item.amountPerQuintal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Down Arrow */}
        <div className="flex justify-center my-1">
          <div className="p-1 rounded-full bg-forest text-white shadow-sm">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>

        {/* Result Card: Indicative Fair Range */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-forest via-forest-dark to-emerald-900 text-white shadow-lg text-center space-y-2">
          <span className="text-3xs font-extrabold uppercase tracking-widest text-amber">
            {t("Calculated Fair Price Range", "अनुमानित उचित मूल्य सीमा")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            ₹{priceAnalysis.indicativeMinPrice.toLocaleString()} – ₹
            {priceAnalysis.indicativeMaxPrice.toLocaleString()}
            <span className="text-sm font-normal text-ivory-200"> / quintal</span>
          </h2>
          <p className="text-2xs text-ivory-200/90 max-w-md mx-auto">
            {t(
              "Justified based on farmer production economics, lab-certified quality, and regional mandi parameters.",
              "उत्पादन लागत, प्रयोगशाला-सत्यापित गुणवत्ता और क्षेत्रीय मंडी मापदंडों पर आधारित।"
            )}
          </p>
        </div>
      </div>

      {/* Detail Inspector Box for selected factor */}
      {activeFactor && (
        <div className="p-4 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-charcoal dark:text-ivory-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest dark:text-emerald-400" />
              {activeFactor.name}
            </span>
            <span className="font-bold text-sm text-forest dark:text-emerald-400">
              {activeFactor.amountPerQuintal >= 0 ? "+" : ""}₹{activeFactor.amountPerQuintal}/q
            </span>
          </div>
          <p className="text-xs text-charcoal-muted dark:text-ivory-400">
            {activeFactor.description}
          </p>

          {activeFactor.evidenceTitle && onViewEvidence && (
            <button
              onClick={() =>
                onViewEvidence({
                  id: activeFactor.id,
                  title: activeFactor.name,
                  category: activeFactor.category,
                  fileName: activeFactor.evidenceTitle!,
                  uploadDate: "2026-04-25",
                  verified: true,
                })
              }
              className="mt-2 text-xs font-semibold text-forest hover:underline flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              {t("Inspect Attached Evidence Document: ", "संलग्न साक्ष्य दस्तावेज़ का निरीक्षण करें: ")}
              <span className="underline">{activeFactor.evidenceTitle}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
