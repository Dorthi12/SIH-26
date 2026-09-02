import { ShieldCheck, AlertCircle, AlertTriangle, CheckCircle2, X } from "lucide-react";
import type { BuyerProfile, PrivateBuyerCompliance } from "../../types/mandi";
import { getPrivateBuyerCompliance } from "../../utils/privateBuyerCompliance";
import { useLanguage } from "../../context/LanguageContext";

interface PrivateBuyerContractWarningModalProps {
  buyer: BuyerProfile;
  compliance?: PrivateBuyerCompliance;
  cropName?: string;
  onClose: () => void;
  onConfirmReview: () => void;
  onContinueAnyway?: () => void;
}

export function PrivateBuyerContractWarningModal({
  buyer,
  compliance: customCompliance,
  cropName = "Crop",
  onClose,
  onConfirmReview,
  onContinueAnyway,
}: PrivateBuyerContractWarningModalProps) {
  const { t } = useLanguage();
  const comp = customCompliance || getPrivateBuyerCompliance(buyer);

  const isBlocked = comp.landControlStatus === "VIOLATION" || comp.overallStatus === "BLOCKED";
  const isRotationWarning = comp.cropRotationStatus === "VIOLATION";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white dark:bg-charcoal-dark border-2 border-amber-400/50 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300">
              <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-3xs uppercase tracking-wider">
                🏢 {t("Private Buyer Safeguard", "निजी खरीदार सुरक्षा")}
              </span>
              <h3 className="text-lg font-black text-charcoal dark:text-ivory-100 mt-1">
                {t("Before accepting this private-buyer offer", "निजी खरीदार का प्रस्ताव स्वीकार करने से पहले")}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal-muted hover:bg-ivory-100 dark:hover:bg-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Blocking Banner if > 40% Land Concentration */}
        {isBlocked && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500 text-xs font-extrabold text-red-800 dark:text-red-300 space-y-2">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-black text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>🔴 {t("Offer Blocked", "प्रस्ताव रोका गया")}</span>
            </div>
            <p className="leading-relaxed">
              {t(
                "This agreement exceeds the Agrisense 40% private-buyer land-control safeguard.",
                "यह समझौता एग्रीसेंस की 40% निजी खरीदार भूमि-सुरक्षा सीमा से अधिक है।"
              )}
            </p>
            <p className="text-3xs text-red-600 dark:text-red-400 italic">
              {t(
                "The contracted land area percentage must be reduced to ≤ 40% before you can proceed.",
                "आगे बढ़ने से पहले अनुबंधित भूमि क्षेत्र का प्रतिशत ≤ 40% तक कम किया जाना चाहिए।"
              )}
            </p>
          </div>
        )}

        {/* Rotation Warning Banner if consecutive crop limit reached */}
        {!isBlocked && isRotationWarning && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 text-xs font-extrabold text-amber-900 dark:text-amber-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>🟠 {t("Crop Rotation Required", "फसल चक्र आवश्यक")}</span>
            </div>
            <p className="leading-relaxed">
              {t(
                "This field has reached the recommended consecutive-crop limit. A different crop should be considered for the next cycle.",
                "इस खेत में लगातार फसल की अनुशंसित सीमा पूरी हो गई है। अगले चक्र में दूसरी फसल पर विचार करें।"
              )}
            </p>
          </div>
        )}

        {/* Compliance Checklist */}
        <div className="space-y-3">
          <span className="text-xs font-extrabold text-charcoal dark:text-ivory-200 block uppercase tracking-wider">
            {t("Farmer Protection Verification Checklist:", "किसान सुरक्षा सत्यापन चेकलिस्ट:")}
          </span>

          <div className="space-y-2 text-xs font-semibold text-charcoal dark:text-ivory-200">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t("Farmer land ownership remains protected", "किसान की भूमि का स्वामित्व पूरी तरह सुरक्षित")}</span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {t(
                  `Contracted cash-crop area is within permitted limit (${comp.contractedCashCropLandPercentage || 32}% / 40%)`,
                  `अनुबंधित नकदी फसल क्षेत्र स्वीकृत सीमा के भीतर है (${comp.contractedCashCropLandPercentage || 32}% / 40%)`
                )}
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t("Crop rotation safeguard checked", "फसल चक्र सुरक्षा जांची गई")}</span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t("Price and quantity are clearly specified", "मूल्य और मात्रा स्पष्ट रूप से निर्दिष्ट हैं")}</span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t("Payment terms are visible & escrow protected", "भुगतान शर्तें दृश्यमान और एस्क्रौ सुरक्षित हैं")}</span>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t("Dispute & violation reporting mechanism available", "विवाद और उल्लंघन रिपोर्टिंग तंत्र उपलब्ध")}</span>
            </div>
          </div>
        </div>

        {/* Buyer Summary */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between">
          <span>🏢 {buyer.businessName} ({buyer.buyerType})</span>
          <span className="text-3xs uppercase px-2 py-0.5 bg-amber-400 text-slate-950 rounded-lg">Verified Private Buyer</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            disabled={isBlocked}
            onClick={onConfirmReview}
            className={`w-full py-3 rounded-2xl font-black text-xs text-white shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              isBlocked
                ? "bg-gray-400 cursor-not-allowed opacity-60"
                : "bg-forest hover:bg-forest-dark"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t("Review Protected Deal", "सुरक्षित सौदे की समीक्षा करें")}</span>
          </button>

          {onContinueAnyway && !isBlocked && (
            <button
              type="button"
              onClick={onContinueAnyway}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl font-extrabold text-xs bg-ivory-100 dark:bg-charcoal text-charcoal-muted dark:text-ivory-300 border border-ivory-300 dark:border-charcoal-light hover:bg-ivory-200 transition-colors"
            >
              {t("Continue Anyway", "फिर भी जारी रखें")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
