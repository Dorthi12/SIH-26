import { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Sprout,
  Scale,
  Building2,
  AlertCircle,
  Package,
} from "lucide-react";
import type { BuyerProfile, PrivateBuyerCompliance } from "../../types/mandi";
import { getPrivateBuyerCompliance } from "../../utils/privateBuyerCompliance";
import { useLanguage } from "../../context/LanguageContext";
import { ReportConcernModal } from "./ReportConcernModal";

interface PrivateBuyerComplianceCardProps {
  buyer: BuyerProfile;
  compliance?: PrivateBuyerCompliance;
  onOpenReportModal?: (category?: string) => void;
  className?: string;
}

export function PrivateBuyerComplianceCard({
  buyer,
  compliance: customCompliance,
  onOpenReportModal,
  className = "",
}: PrivateBuyerComplianceCardProps) {
  const { t } = useLanguage();
  const [showReportModalLocal, setShowReportModalLocal] = useState<boolean>(false);
  const [reportCategoryPreFill, setReportCategoryPreFill] = useState<string>("Excessive Land Control");

  const comp = customCompliance || getPrivateBuyerCompliance(buyer);

  if (!comp.isPrivateEntity) {
    return null; // Government / APMC / Cooperative buyers do not need private-body restriction UI
  }

  const handleTriggerReport = (category: string) => {
    setReportCategoryPreFill(category);
    if (onOpenReportModal) {
      onOpenReportModal(category);
    } else {
      setShowReportModalLocal(true);
    }
  };

  return (
    <div
      className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-50/70 via-white to-emerald-50/40 dark:from-charcoal-dark dark:via-charcoal dark:to-charcoal-dark border-2 border-amber-400/40 dark:border-amber-600/40 shadow-lg space-y-6 ${className}`}
    >
      {/* ── CARD HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 dark:border-charcoal-light pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-800 dark:text-amber-300 shrink-0">
            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-3xs uppercase tracking-wider">
                {t("Private Entity Rules Active", "निजी इकाई नियम सक्रिय")}
              </span>
              <span className="text-3xs text-charcoal-muted dark:text-ivory-400 font-bold">
                Agrisense Protection Framework
              </span>
            </div>
            <h3 className="text-xl font-black text-charcoal dark:text-ivory-100 mt-0.5 flex items-center gap-2">
              <span>🛡️ {t("Private Buyer Compliance", "निजी खरीदार अनुपालन")}</span>
            </h3>
            <p className="text-xs text-charcoal-muted dark:text-ivory-300 font-medium">
              {t(
                "Additional safeguards for private agricultural buyers & contract protection",
                "निजी कृषि खरीदारों और अनुबंध सुरक्षा के लिए अतिरिक्त नियम"
              )}
            </p>
          </div>
        </div>

        {/* Overall Status Badge */}
        <div className="shrink-0 self-start sm:self-auto">
          {comp.overallStatus === "BLOCKED" ? (
            <span className="px-3.5 py-1.5 rounded-2xl bg-red-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm">
              <AlertCircle className="w-4 h-4" />
              <span>🔴 {t("Offer Blocked", "प्रस्ताव रोका गया")}</span>
            </span>
          ) : comp.overallStatus === "REVIEW_REQUIRED" ? (
            <span className="px-3.5 py-1.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>🟠 {t("Review Required", "समीक्षा आवश्यक")}</span>
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>🟢 {t("Compliant Buyer", "अनुपालक खरीदार")}</span>
            </span>
          )}
        </div>
      </div>

      {/* ── CHECKS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CHECK 1: Land Control Protection */}
        <div className="p-4.5 rounded-2xl bg-white dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light shadow-2xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-forest dark:text-emerald-400 shrink-0" />
              <h4 className="font-extrabold text-sm text-charcoal dark:text-ivory-100">
                {t("Land Control Protection", "भूमि नियंत्रण सुरक्षा")}
              </h4>
            </div>

            <span className="px-2.5 py-0.5 rounded-lg bg-ivory-100 dark:bg-charcoal-dark text-charcoal dark:text-ivory-200 text-3xs font-black">
              40% Maximum
            </span>
          </div>

          <p className="text-3xs text-charcoal-muted dark:text-ivory-400 leading-relaxed font-medium">
            {t(
              "Maximum 40% contracted farmland for designated cash crops.",
              "नामित नकदी फसलों के लिए अधिकतम 40% अनुबंधित कृषि भूमि सीमा।"
            )}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-ivory-100 dark:border-charcoal-light text-xs font-bold">
            <span className="text-charcoal-muted dark:text-ivory-400 text-3xs">
              {t("Contracted Cash-Crop Area:", "अनुबंधित नकदी फसल क्षेत्र:")}
            </span>
            <span className="font-black text-charcoal dark:text-ivory-100">
              {comp.contractedCashCropLandPercentage || 32}% / 40%
            </span>
          </div>

          {/* Status Indicator */}
          {comp.landControlStatus === "VIOLATION" ? (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-extrabold text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>🔴 {t("Limit Exceeded (>40%)", "सीमा पार हो गई (>40%)")}</span>
            </div>
          ) : comp.landControlStatus === "NEAR_LIMIT" ? (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>🟠 {t("Near Limit (35-40%)", "सीमा के निकट (35-40%)")}</span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>🟢 {t("Within Permitted Limit", "स्वीकृत सीमा के भीतर")}</span>
            </div>
          )}

          <p className="text-3xs text-charcoal-muted dark:text-ivory-400 italic">
            ℹ️ {t(
              "Farmer retains full ownership and control of the remaining farmland.",
              "किसान बची हुई कृषि भूमि का पूर्ण स्वामित्व और नियंत्रण बरकरार रखता है।"
            )}
          </p>
        </div>

        {/* CHECK 2: Crop Rotation Protection */}
        <div className="p-4.5 rounded-2xl bg-white dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light shadow-2xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h4 className="font-extrabold text-sm text-charcoal dark:text-ivory-100">
                🌱 {t("Crop Rotation Safeguard", "फसल चक्र सुरक्षा")}
              </h4>
            </div>

            <span className="px-2.5 py-0.5 rounded-lg bg-ivory-100 dark:bg-charcoal-dark text-charcoal dark:text-ivory-200 text-3xs font-black">
              2 Cycles Max
            </span>
          </div>

          <p className="text-3xs text-charcoal-muted dark:text-ivory-400 leading-relaxed font-medium">
            {t(
              "The same crop should not be continuously cultivated on the same field beyond two consecutive cycles unless an agronomic exception is approved.",
              "एक ही खेत में एक ही फसल की लगातार दो से अधिक फसल-चक्र खेती से बचें।"
            )}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-ivory-100 dark:border-charcoal-light text-xs font-bold">
            <span className="text-charcoal-muted dark:text-ivory-400 text-3xs">
              {t("Consecutive Crop Cycles:", "लगातार फसल चक्र:")}
            </span>
            <span className="font-black text-charcoal dark:text-ivory-100">
              {comp.consecutiveCropCycles || 1} / 2
            </span>
          </div>

          {/* Status Indicator */}
          {comp.cropRotationStatus === "VIOLATION" ? (
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-extrabold text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>🔴 {t("Consecutive Crop Limit Reached", "लगातार फसल सीमा पूरी")}</span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>🟢 {t("Rotation Recommended / Compliant", "फसल चक्र अनुशंसित / अनुपालक")}</span>
            </div>
          )}

          <p className="text-3xs text-charcoal-muted dark:text-ivory-400 italic">
            📌 Agrisense Farmer Protection Rule (Agronomic override permitted with verified soil report)
          </p>
        </div>
      </div>

      {/* ── STOCK TRANSPARENCY & INVENTORY REPORTING ── */}
      <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <span className="font-extrabold text-charcoal dark:text-ivory-100 block">
              📦 {t("Stock Transparency & Commercial Inventory", "स्टॉक पारदर्शिता व वाणिज्यिक इन्वेंट्री")}
            </span>
            <span className="text-3xs text-charcoal-muted dark:text-ivory-400 font-medium">
              Commercial inventory reporting: <strong>Enabled</strong>
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-3xs shrink-0">
          🟢 {t("Transparent Stock Status", "पारदर्शी स्टॉक स्थिति")}
        </span>
      </div>

      {/* ── PROTECTION ENFORCEMENT & STRICT CONSEQUENCES ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
          <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-200">
            ⚖️ {t("Protection Enforcement Policy Framework", "सुरक्षा प्रवर्तन नीति ढांचा")}
          </h4>
        </div>

        <p className="text-3xs text-amber-900 dark:text-amber-300 font-medium leading-relaxed">
          {t(
            "Violations reported through Agrisense may be escalated for regulatory review according to applicable rules and contracts.",
            "एग्रीसेंस के माध्यम से रिपोर्ट किए गए उल्लंघनों की लागू नियमों और अनुबंधों के अनुसार विनियामक समीक्षा के लिए समीक्षा की जा सकती है।"
          )}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-3xs font-extrabold text-amber-900 dark:text-amber-200">
          <div className="p-2 rounded-xl bg-white/80 dark:bg-charcoal/80 border border-amber-200 dark:border-amber-800">
            • Contract Review / Cancellation
          </div>
          <div className="p-2 rounded-xl bg-white/80 dark:bg-charcoal/80 border border-amber-200 dark:border-amber-800">
            • Compensation Assessment
          </div>
          <div className="p-2 rounded-xl bg-white/80 dark:bg-charcoal/80 border border-amber-200 dark:border-amber-800">
            • Financial Penalties
          </div>
          <div className="p-2 rounded-xl bg-white/80 dark:bg-charcoal/80 border border-amber-200 dark:border-amber-800">
            • Buyer Suspension
          </div>
          <div className="p-2 rounded-xl bg-white/80 dark:bg-charcoal/80 border border-amber-200 dark:border-amber-800">
            • Trading Restrictions
          </div>
          <div className="p-2 rounded-xl bg-white/80 dark:bg-charcoal/80 border border-amber-200 dark:border-amber-800">
            • Regulatory Investigation
          </div>
        </div>

        <span className="text-3xs font-bold text-amber-700 dark:text-amber-400 block pt-1">
          📌 {t("Proposed Agrisense safeguards / policy framework", "प्रस्तावित एग्रीसेंस सुरक्षा / नीति ढांचा")}
        </span>
      </div>

      {/* ── REPORT A VIOLATION & ACTION BUTTONS ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-amber-200 dark:border-charcoal-light">
        <div className="flex items-center gap-2 text-xs font-bold text-charcoal-muted dark:text-ivory-400">
          <Building2 className="w-4 h-4 text-amber-600" />
          <span>{buyer.businessName} ({buyer.buyerType})</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleTriggerReport("Excessive Land Control")}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>⚠️ {t("Report a Violation", "उल्लंघन की रिपोर्ट करें")}</span>
          </button>
        </div>
      </div>

      {/* Local Report Concern Modal */}
      {showReportModalLocal && (
        <ReportConcernModal
          buyerName={buyer.businessName}
          onClose={() => setShowReportModalLocal(false)}
          onSubmitReport={() => setShowReportModalLocal(false)}
        />
      )}
    </div>
  );
}
