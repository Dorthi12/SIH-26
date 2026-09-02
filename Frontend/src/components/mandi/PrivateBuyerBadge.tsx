import { Building2, ShieldCheck } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface PrivateBuyerBadgeProps {
  compact?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export function PrivateBuyerBadge({
  compact = false,
  showSubtitle = true,
  className = "",
}: PrivateBuyerBadgeProps) {
  const { t } = useLanguage();

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-extrabold text-3xs shrink-0 ${className}`}
        title={t("Farmer Protection Rules Apply", "किसान सुरक्षा नियम लागू")}
      >
        <Building2 className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>🏢 {t("Private Buyer", "निजी खरीदार")}</span>
      </span>
    );
  }

  return (
    <div
      className={`inline-flex flex-col p-2 px-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-1.5 font-extrabold text-xs text-amber-900 dark:text-amber-200">
        <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>🏢 {t("Private Buyer", "निजी खरीदार")}</span>
      </div>

      {showSubtitle && (
        <div className="flex items-center gap-1 text-3xs font-extrabold text-amber-700 dark:text-amber-400 mt-0.5">
          <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{t("Farmer Protection Rules Apply", "किसान सुरक्षा नियम लागू")}</span>
        </div>
      )}
    </div>
  );
}
