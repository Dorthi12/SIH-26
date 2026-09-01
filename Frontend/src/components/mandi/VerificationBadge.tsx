import { ShieldCheck, CheckCircle2, Leaf, FileText, BarChart3, Building2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export type BadgeType =
  | "GOVT_VERIFIED"
  | "BUSINESS_VERIFIED"
  | "QUALITY_VERIFIED"
  | "ORGANIC_VERIFIED"
  | "ORGANIC_CLAIMED"
  | "EVIDENCE_ATTACHED"
  | "PRICE_REPORT_GENERATED";

interface VerificationBadgeProps {
  type: BadgeType;
  size?: "sm" | "md" | "lg";
  customLabel?: string;
  className?: string;
}

export function VerificationBadge({ type, size = "md", customLabel, className = "" }: VerificationBadgeProps) {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: "px-2 py-0.5 text-3xs gap-1 font-medium rounded-md",
    md: "px-2.5 py-1 text-2xs gap-1.5 font-semibold rounded-lg",
    lg: "px-3 py-1.5 text-xs gap-2 font-bold rounded-xl",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  switch (type) {
    case "GOVT_VERIFIED":
      return (
        <span
          className={`inline-flex items-center bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 ${sizeClasses[size]} ${className}`}
          title={t("Verified by Govt Agriculture Officer", "सरकारी कृषि अधिकारी द्वारा सत्यापित")}
        >
          <ShieldCheck className={`${iconSizes[size]} text-emerald-600 dark:text-emerald-400`} />
          {customLabel || t("Govt Verified", "सरकारी सत्यापित")}
        </span>
      );

    case "BUSINESS_VERIFIED":
      return (
        <span
          className={`inline-flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50 ${sizeClasses[size]} ${className}`}
          title={t("Business entity identity verified", "व्यापारिक पहचान सत्यापित")}
        >
          <Building2 className={`${iconSizes[size]} text-blue-600 dark:text-blue-400`} />
          {customLabel || t("Business Verified", "व्यवसाय सत्यापित")}
        </span>
      );

    case "QUALITY_VERIFIED":
      return (
        <span
          className={`inline-flex items-center bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-300 dark:border-teal-700/50 ${sizeClasses[size]} ${className}`}
          title={t("Laboratory test report attached", "प्रयोगशाला परीक्षण रिपोर्ट संलग्न")}
        >
          <CheckCircle2 className={`${iconSizes[size]} text-teal-600 dark:text-teal-400`} />
          {customLabel || t("Quality Verified", "गुणवत्ता सत्यापित")}
        </span>
      );

    case "ORGANIC_VERIFIED":
      return (
        <span
          className={`inline-flex items-center bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-400 dark:border-green-700/60 ${sizeClasses[size]} ${className}`}
          title={t("NPOP / PGS Certified Organic", "NPOP / PGS प्रमाणित जैविक")}
        >
          <Leaf className={`${iconSizes[size]} text-green-600 dark:text-green-400`} />
          {customLabel || t("Organic — Verified", "जैविक — सत्यापित")}
        </span>
      );

    case "ORGANIC_CLAIMED":
      return (
        <span
          className={`inline-flex items-center bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 ${sizeClasses[size]} ${className}`}
          title={t("Organic claim submitted, pending document verification", "जैविक दावा प्रस्तुत, सत्यापन लंबित")}
        >
          <Leaf className={`${iconSizes[size]} text-amber-600 dark:text-amber-400`} />
          {customLabel || t("Organic Claimed (Pending)", "जैविक दावा (लंबित)")}
        </span>
      );

    case "EVIDENCE_ATTACHED":
      return (
        <span
          className={`inline-flex items-center bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-300 dark:border-purple-700/50 ${sizeClasses[size]} ${className}`}
          title={t("Production evidence uploaded", "उत्पादन साक्ष्य अपलोड किया गया")}
        >
          <FileText className={`${iconSizes[size]} text-purple-600 dark:text-purple-400`} />
          {customLabel || t("Evidence Attached", "साक्ष्य संलग्न")}
        </span>
      );

    case "PRICE_REPORT_GENERATED":
      return (
        <span
          className={`inline-flex items-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700/50 ${sizeClasses[size]} ${className}`}
          title={t("Agrisense Fair Price Report generated", "एग्रीसेंस उचित मूल्य रिपोर्ट जनरेट की गई")}
        >
          <BarChart3 className={`${iconSizes[size]} text-indigo-600 dark:text-indigo-400`} />
          {customLabel || t("Price Report Available", "मूल्य रिपोर्ट उपलब्ध")}
        </span>
      );

    default:
      return null;
  }
}
