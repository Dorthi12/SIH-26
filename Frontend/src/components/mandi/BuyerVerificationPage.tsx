import { useState } from "react";
import {
  ShieldCheck,
  FileCheck,
  Clock,
  Upload,
  AlertCircle,
  Lock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building2,
} from "lucide-react";
import type { BuyerProfile, BuyerVerificationDoc } from "../../types/mandi";
import { verificationService, REQUIRED_BUYER_DOCS } from "../../services/verificationService";
import { useLanguage } from "../../context/LanguageContext";

interface BuyerVerificationPageProps {
  buyer: BuyerProfile;
  onDocUploaded?: () => void;
}

export function BuyerVerificationPage({ buyer, onDocUploaded }: BuyerVerificationPageProps) {
  const { t } = useLanguage();
  const [docs, setDocs] = useState<BuyerVerificationDoc[]>(buyer.documents);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  const progress = verificationService.calculateProgress(buyer.id);

  const handleSimulateUpload = (docType: BuyerVerificationDoc["docType"]) => {
    setUploadingDocType(docType);
    setTimeout(() => {
      const updatedDoc = verificationService.uploadDocument(buyer.id, docType, `${docType.replace(/\s+/g, "_")}_2026.pdf`);
      setDocs([...verificationService.getBuyerDocs(buyer.id)]);
      setUploadingDocType(null);
      if (onDocUploaded) onDocUploaded();
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* HEADER CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-ivory-200 dark:border-charcoal-light">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              <h1 className="text-2xl font-black text-charcoal dark:text-ivory-100">
                {t("Buyer Verification Portal", "खरीदार सत्यापन पोर्टल")}
              </h1>
            </div>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-1">
              Verify your business registration, premises address, tax filings, and authorized identity to gain farmer trust on Agrisense Mandi.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>{buyer.businessName}</span>
          </div>
        </div>

        {/* VERIFICATION PROGRESS BAR (e.g. 85%) */}
        <div className="p-6 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-3">
          <div className="flex items-center justify-between font-extrabold text-sm">
            <span className="text-charcoal dark:text-ivory-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              {t("Verification Progress", "सत्यापन प्रगति")}
            </span>
            <span className="text-2xl font-black text-forest dark:text-emerald-400">
              {progress}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-ivory-200 dark:bg-charcoal-dark overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-forest to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-3xs font-bold text-charcoal-muted dark:text-ivory-400">
            <span>Minimum 75% required for Business Verified Badge</span>
            <span>Current Status: {progress >= 75 ? "🟢 Verified Buyer" : "🟡 Under Review"}</span>
          </div>
        </div>
      </div>

      {/* DOCUMENT CHECKLIST SECTION */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-charcoal dark:text-ivory-100 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-forest dark:text-emerald-400" />
          {t("Required Business Verification Documents", "आवश्यक व्यावसायिक सत्यापन दस्तावेज")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REQUIRED_BUYER_DOCS.map((reqDoc) => {
            const uploaded = docs.find((d) => d.docType === reqDoc.docType);
            const isUploading = uploadingDocType === reqDoc.docType;

            return (
              <div
                key={reqDoc.docType}
                className="p-5 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-extrabold text-base text-charcoal dark:text-ivory-100">
                      {reqDoc.title}
                    </h3>

                    {/* STATUS BADGES */}
                    {!uploaded ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-ivory-200 dark:bg-charcoal text-charcoal-muted text-3xs font-bold shrink-0">
                        Not uploaded
                      </span>
                    ) : uploaded.status === "VERIFIED" ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-3xs font-extrabold flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ✓ Verified
                      </span>
                    ) : uploaded.status === "UNDER_REVIEW" || uploaded.status === "PENDING" ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-3xs font-extrabold flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-amber-600" />
                        ⏳ Pending / Review
                      </span>
                    ) : uploaded.status === "EXPIRED" ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-3xs font-extrabold shrink-0">
                        Expired
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-3xs font-extrabold shrink-0">
                        Rejected
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-charcoal-muted dark:text-ivory-400">
                    {reqDoc.description}
                  </p>

                  {uploaded && (
                    <div className="p-2.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light text-2xs space-y-0.5 font-mono">
                      <div className="font-bold text-charcoal dark:text-ivory-200 truncate">
                        📄 {uploaded.fileName}
                      </div>
                      <div className="text-charcoal-muted text-3xs">
                        Uploaded on: {uploaded.uploadDate} {uploaded.notes && `• ${uploaded.notes}`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="pt-2 border-t border-ivory-200 dark:border-charcoal-light flex items-center justify-between">
                  <span className="text-3xs font-bold text-charcoal-muted">
                    {reqDoc.mandatory ? "* Mandatory Requirement" : "Optional Additional Doc"}
                  </span>

                  <button
                    onClick={() => handleSimulateUpload(reqDoc.docType)}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploaded ? "Re-upload PDF" : "Upload Document"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DOCUMENT PRIVACY GUARANTEE NOTICE */}
      <div className="p-6 rounded-3xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-3">
        <div className="flex items-center gap-2 text-forest dark:text-emerald-400 font-extrabold text-sm">
          <Lock className="w-5 h-5" />
          <span>Strict Document Privacy Rule</span>
        </div>

        <p className="text-xs text-charcoal-muted dark:text-ivory-300 leading-relaxed">
          <strong>IMPORTANT:</strong> Sensitive verification documents (GST certificates, bank statements, personal identity proofs) are strictly confidential and will <strong>never</strong> be displayed or downloadable by farmers. Farmers on the Agrisense Mandi marketplace will only see verified metadata badges such as <strong className="text-emerald-700 dark:text-emerald-400">"✓ Business Registration Verified"</strong>.
        </p>
      </div>
    </div>
  );
}
