import { X, FileText, Download, ShieldCheck, Calendar, CheckCircle } from "lucide-react";
import type { CostEvidence } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface DocumentViewerModalProps {
  document: CostEvidence | null;
  onClose: () => void;
}

export function DocumentViewerModal({ document, onClose }: DocumentViewerModalProps) {
  const { t } = useLanguage();

  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ivory-200 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-forest/10 text-forest dark:bg-forest/20 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-charcoal dark:text-ivory-100">
                {document.title}
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
                <span>Category: {document.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {document.uploadDate}
                </span>
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

        {/* Modal Body / PDF Preview Canvas */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Verification Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-emerald-900 dark:text-emerald-200">
                  {t("Verified Agricultural Document Evidence", "सत्यापित कृषि दस्तावेज साक्ष्य")}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  {t(
                    "This document has been reviewed and verified by Agrisense Verification System.",
                    "इस दस्तावेज की समीक्षा और सत्यापन एग्रीसेंस द्वारा किया गया है।"
                  )}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-white dark:bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              {t("AUTHENTIC", "प्रामाणिक")}
            </span>
          </div>

          {/* Document Preview Box */}
          <div className="p-8 rounded-xl bg-ivory-100 dark:bg-charcoal border border-dashed border-ivory-300 dark:border-charcoal-light flex flex-col items-center justify-center text-center space-y-4 min-h-[220px]">
            <div className="w-16 h-20 rounded-lg bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md flex flex-col items-center justify-between p-2 relative">
              <div className="w-full h-2 bg-forest/20 rounded"></div>
              <FileText className="w-8 h-8 text-forest dark:text-emerald-400 my-auto" />
              <div className="w-full space-y-1">
                <div className="w-full h-1 bg-ivory-300 dark:bg-charcoal-light rounded"></div>
                <div className="w-3/4 h-1 bg-ivory-300 dark:bg-charcoal-light rounded"></div>
              </div>
            </div>

            <div>
              <p className="font-semibold text-base text-charcoal dark:text-ivory-100">
                {document.fileName}
              </p>
              <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-1">
                PDF Document • 1.4 MB • Hash: 8f9b...a12c
              </p>
            </div>

            <div className="text-xs text-charcoal/80 dark:text-ivory-300 max-w-md bg-white dark:bg-charcoal-dark p-3 rounded-lg border border-ivory-200 dark:border-charcoal-light">
              <span className="font-semibold text-forest dark:text-emerald-400">
                {t("Extract Summary: ", "अंश सारांश: ")}
              </span>
              {document.category === "Labour" &&
                t(
                  "Verified 14 labour days & worker muster roll for harvest preparation.",
                  "सत्यापित 14 श्रम दिन और फसल तैयारी के लिए श्रमिक मस्टर रोल।"
                )}
              {document.category === "Quality" &&
                t(
                  "Official government agricultural testing laboratory report indicating Grade A specs.",
                  "आधिकारिक सरकारी कृषि परीक्षण प्रयोगशाला रिपोर्ट जो ग्रेड A विनिर्देशों को दर्शाती है।"
                )}
              {document.category === "Organic Certification" &&
                t(
                  "APEDA NPOP Organic accreditation certificate valid through 2027.",
                  "2027 तक वैध APEDA NPOP जैविक प्रत्यायन प्रमाण पत्र।"
                )}
              {document.category !== "Labour" &&
                document.category !== "Quality" &&
                document.category !== "Organic Certification" &&
                t(
                  "Itemized expense voucher submitted by farmer with clear invoice details.",
                  "स्पष्ट चालान विवरण के साथ किसान द्वारा जमा किया गया मदवार व्यय वाउचर।"
                )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-ivory-200 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal/50">
          <span className="text-xs text-charcoal-muted dark:text-ivory-400">
            Doc ID: {document.id}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-charcoal dark:text-ivory-200 hover:bg-ivory-200 dark:hover:bg-charcoal-light transition-colors"
            >
              {t("Close", "बंद करें")}
            </button>
            <button
              onClick={() => alert(`Downloading verified document: ${document.fileName}`)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-forest text-white hover:bg-forest-dark transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              {t("Download Copy", "प्रति डाउनलोड करें")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
