import { CheckCircle2, AlertCircle, Info, ShieldCheck } from "lucide-react";
import type { PriceAnalysis } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface TransparencyScoreCardProps {
  priceAnalysis: PriceAnalysis;
  hasOrganicCert?: boolean;
  hasLabTest?: boolean;
  hasProductionCosts?: boolean;
  hasGovtVerification?: boolean;
  className?: string;
}

export function TransparencyScoreCard({
  priceAnalysis,
  hasOrganicCert = true,
  hasLabTest = true,
  hasProductionCosts = true,
  hasGovtVerification = true,
  className = "",
}: TransparencyScoreCardProps) {
  const { t } = useLanguage();
  const score = priceAnalysis.transparencyScore;

  const getScoreColor = (s: number) => {
    if (s >= 85) return "text-emerald-700 dark:text-emerald-400 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800";
    if (s >= 70) return "text-teal-700 dark:text-teal-400 bg-teal-50 border-teal-300 dark:bg-teal-950/40 dark:border-teal-800";
    return "text-amber-700 dark:text-amber-400 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800";
  };

  const scoreChecks = [
    { label: t("Production Cost Economics", "उत्पादन लागत अर्थशास्त्र"), active: hasProductionCosts },
    { label: t("Lab Quality Certificate", "लैब गुणवत्ता प्रमाणपत्र"), active: hasLabTest },
    { label: t("Organic Certification Proof", "जैविक प्रमाणीकरण प्रमाण"), active: hasOrganicCert },
    { label: t("Government Officer Stamp", "सरकारी अधिकारी मुहर"), active: hasGovtVerification },
    { label: t("APMC Regional Market Baseline", "APMC क्षेत्रीय बाज़ार आधार"), active: true },
    { label: t("Logistics & Transport Estimate", "लॉजिस्टिक्स व परिवहन अनुमान"), active: true },
  ];

  return (
    <div
      className={`p-5 rounded-2xl border bg-white dark:bg-charcoal-dark border-ivory-300 dark:border-charcoal-light shadow-sm space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-forest dark:text-emerald-400" />
            {t("Price Transparency Score", "मूल्य पारदर्शिता स्कोर")}
          </h3>
          <p className="text-2xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
            {t(
              "Measures evidence coverage backing the asking price",
              "मांग मूल्य का समर्थन करने वाले साक्ष्यों का स्तर"
            )}
          </p>
        </div>

        {/* Score Badge */}
        <div className={`px-4 py-2 rounded-xl border text-center ${getScoreColor(score)}`}>
          <span className="block font-extrabold text-2xl leading-none">{score}</span>
          <span className="block text-3xs font-bold uppercase tracking-wider mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Critical Clarification Alert */}
      <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light text-2xs text-charcoal/90 dark:text-ivory-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-forest dark:text-emerald-400">
            {t("Important Note: ", "महत्वपूर्ण टिप्पणी: ")}
          </strong>
          {t(
            "This score rates HOW WELL the asking price is backed by verified evidence. It is NOT a rating of whether the price is 'cheap' or 'expensive'.",
            "यह स्कोर यह आंकता है कि मांग मूल्य को सत्यापित साक्ष्यों का कितना समर्थन प्राप्त है। यह इसका मूल्यांकन नहीं है कि कीमत 'सस्ती' है या 'महंगी'। "
          )}
        </p>
      </div>

      {/* Evidence Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
        {scoreChecks.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2 rounded-lg bg-ivory-50 dark:bg-charcoal/60 border border-ivory-200 dark:border-charcoal-light"
          >
            {item.active ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <span className="text-2xs font-medium text-charcoal dark:text-ivory-200 truncate">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
