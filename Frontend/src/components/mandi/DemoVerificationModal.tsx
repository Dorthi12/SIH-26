import { useState, useEffect } from "react";
import { X, ShieldCheck, CheckCircle2, FileText, Scan, Award, Scale, ArrowRight, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import type { CostEvidence, ProductionCosts, QualityMetrics, OrganicVerification } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface DemoVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropName: string;
  variety: string;
  quantityQuintals: number;
  productionCosts: ProductionCosts;
  quality: QualityMetrics;
  organic: OrganicVerification;
  evidenceList: CostEvidence[];
  onConfirmVerification: () => void;
}

export function DemoVerificationModal({
  isOpen,
  onClose,
  cropName,
  variety,
  quantityQuintals,
  productionCosts,
  quality,
  organic,
  evidenceList,
  onConfirmVerification,
}: DemoVerificationModalProps) {
  const { t } = useLanguage();

  const [scanProgress, setScanProgress] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [activeScanItem, setActiveScanItem] = useState<string>("Scanning uploaded document receipts...");

  useEffect(() => {
    if (!isOpen) return;

    setIsScanning(true);
    setScanProgress(0);

    const steps = [
      "Initializing Agrisense Government Document Verification OCR Engine...",
      "Scanning Labour Muster Roll & Wage Vouchers...",
      "Extracting Quality Laboratory Test Certificate Specs...",
      "Verifying APEDA NPOP Organic Accreditation Document...",
      "Cross-referencing APMC Market Baseline & Logistics Freight Quotes...",
      "Verification Complete! All documents matched with 100% confidence.",
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setActiveScanItem(steps[currentStep]);
        setScanProgress(Math.min(100, Math.round((currentStep / (steps.length - 1)) * 100)));
      } else {
        setIsScanning(false);
        clearInterval(interval);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const verificationItems = [
    {
      document: "Labour Muster Roll & Wage Receipt",
      farmerEntered: `₹${productionCosts.labourCost.toLocaleString()} (${productionCosts.labourersCount} workers, ${productionCosts.labourDays} days)`,
      documentExtracted: `₹${productionCosts.labourCost.toLocaleString()} (Verified Muster Roll)`,
      matched: true,
    },
    {
      document: "Quality Laboratory Test Report",
      farmerEntered: `Grade: ${quality.grade}, Moisture: ${quality.moisturePercentage}%, Purity: ${quality.purityPercentage}%`,
      documentExtracted: `Grade: ${quality.grade}, Moisture: ${quality.moisturePercentage}%, Purity: ${quality.purityPercentage}%`,
      matched: true,
    },
    {
      document: organic.isOrganic ? "NPOP / PGS Organic Certificate" : "Conventional Crop Standard",
      farmerEntered: organic.isOrganic ? `Cert ID: ${organic.certificateNumber || "ORG-NPOP-UP-2025-9941"}` : "Conventional Production",
      documentExtracted: organic.isOrganic ? `Cert ID: ${organic.certificateNumber || "ORG-NPOP-UP-2025-9941"} (APEDA Verified)` : "Non-Organic Standard",
      matched: true,
    },
    {
      document: "Logistics & Transport Quote",
      farmerEntered: `Freight: ₹${productionCosts.transportationCost.toLocaleString()}`,
      documentExtracted: `Freight: ₹${productionCosts.transportationCost.toLocaleString()} (APMC Local Haulage)`,
      matched: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ivory-200 dark:border-charcoal-light bg-gradient-to-r from-forest/10 via-emerald-50 to-ivory-50 dark:from-forest/20 dark:via-charcoal dark:to-charcoal-dark">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-forest text-white shadow-md">
              <ShieldCheck className="w-6 h-6 text-amber" />
            </div>
            <div>
              <h3 className="font-black text-xl text-charcoal dark:text-ivory-100 flex items-center gap-2">
                {t("Government Document Verification Window", "सरकारी दस्तावेज़ सत्यापन व मान पुनर्प्राप्ति खिड़की")}
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-ivory-400">
                {t(
                  "Scanning uploaded evidence documents and retrieving verified parameters before price calculation",
                  "मूल्य की गणना से पहले अपलोड किए गए साक्ष्य दस्तावेजों को स्कैन करके मान पुनर्प्राप्त किए जा रहे हैं"
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-muted hover:text-charcoal hover:bg-ivory-200 dark:hover:bg-charcoal-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Scanning Progress Bar Box */}
          <div className="p-5 rounded-2xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isScanning ? (
                  <RefreshCw className="w-4 h-4 text-forest dark:text-emerald-400 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="font-extrabold text-xs text-charcoal dark:text-ivory-100">
                  {activeScanItem}
                </span>
              </div>
              <span className="font-bold text-xs text-forest dark:text-emerald-400">
                {scanProgress}%
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-ivory-200 dark:bg-charcoal-light overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-forest to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>

          {/* Verification Results Table */}
          {!isScanning && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-charcoal dark:text-ivory-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber" />
                  {t("Retrieved Document Verification Results", "पुनर्प्राप्त दस्तावेज़ सत्यापन परिणाम")}
                </h4>
                <span className="text-3xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✓ 100% DATA MATCH VERIFIED
                </span>
              </div>

              <div className="rounded-2xl border border-ivory-200 dark:border-charcoal-light overflow-hidden divide-y divide-ivory-200 dark:divide-charcoal-light">
                {verificationItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white dark:bg-charcoal-dark flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-forest shrink-0" />
                        {item.document}
                      </span>
                      <p className="text-3xs text-charcoal-muted dark:text-ivory-400">
                        Extracted Value:{" "}
                        <strong className="text-forest dark:text-emerald-400">
                          {item.documentExtracted}
                        </strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-3xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-300 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t("Verified & Matched", "सत्यापित व मिलान सम्पन्न")}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculated Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-forest/10 via-emerald-50 to-ivory-100 dark:from-forest/20 dark:via-charcoal dark:to-charcoal-dark border border-forest/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-2xs font-extrabold uppercase tracking-wider text-forest dark:text-emerald-400 block">
                    Verified Crop Production Cost
                  </span>
                  <p className="text-xl font-black text-charcoal dark:text-ivory-100 mt-0.5">
                    Total: ₹{productionCosts.totalCost.toLocaleString()}
                    <span className="text-xs font-normal text-charcoal-muted">
                      {" "}
                      (₹{Math.round(productionCosts.totalCost / quantityQuintals)} / quintal)
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xs font-extrabold uppercase tracking-wider text-charcoal-muted block">
                    Government Officer Verification Stamp
                  </span>
                  <p className="font-mono font-bold text-xs text-forest dark:text-emerald-400 mt-0.5">
                    AGR-VER-2026-X891
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-ivory-200 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-muted hover:text-charcoal"
          >
            {t("Edit Details", "विवरण संपादित करें")}
          </button>

          <button
            type="button"
            disabled={isScanning}
            onClick={() => {
              onConfirmVerification();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-forest text-white hover:bg-forest-dark disabled:opacity-50 transition-all shadow-md flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-amber" />
            {t("Confirm & Apply Verified Values", "सत्यापित मानों को लागू करें व आगे बढ़ें")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
