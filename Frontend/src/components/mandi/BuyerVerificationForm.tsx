import { useState } from "react";
import { Building2, Upload, ShieldCheck, CheckCircle2, Clock, FileText } from "lucide-react";
import type { BuyerVerificationDoc, VerificationState } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

export function BuyerVerificationForm() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<BuyerVerificationDoc[]>([
    {
      id: "DOC-01",
      docType: "Business Registration",
      fileName: "ABC_Foods_Incorporation_Cert.pdf",
      uploadDate: "2025-01-15",
      status: "VERIFIED",
    },
    {
      id: "DOC-02",
      docType: "GST Certificate",
      fileName: "GSTIN_09AAACA1234F1Z5.pdf",
      uploadDate: "2025-01-15",
      status: "VERIFIED",
    },
    {
      id: "DOC-03",
      docType: "Trade License",
      fileName: "FSSAI_Central_License_2025.pdf",
      uploadDate: "2025-01-16",
      status: "VERIFIED",
    },
    {
      id: "DOC-04",
      docType: "Authorized Rep ID",
      fileName: "Rep_Aadhaar_AlokVerma.pdf",
      uploadDate: "2025-01-18",
      status: "PENDING",
    },
  ]);

  const handleMockUpload = (docType: BuyerVerificationDoc["docType"]) => {
    const newDoc: BuyerVerificationDoc = {
      id: `DOC-${Date.now()}`,
      docType,
      fileName: `${docType.replace(/\s+/g, "_")}_Upload.pdf`,
      uploadDate: new Date().toISOString().split("T")[0],
      status: "PENDING",
    };
    setDocuments((prev) => [...prev.filter((d) => d.docType !== docType), newDoc]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-ivory-200 dark:border-charcoal-light pb-4">
          <div className="p-3 rounded-2xl bg-blue-500 text-white shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-charcoal dark:text-ivory-100">
              {t("Buyer Business Verification Onboarding", "खरीदार व्यवसाय सत्यापन ओंबॉर्डिंग")}
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400">
              {t(
                "Upload required / applicable verification documents to obtain verified buyer status",
                "सत्यापित खरीदार दर्जा प्राप्त करने के लिए आवश्यक सत्यापन दस्तावेज अपलोड करें"
              )}
            </p>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-bold text-sm text-blue-900 dark:text-blue-200">
                {t("Status: Business Verified Participant", "स्थिति: व्यवसाय सत्यापित प्रतिभागी")}
              </p>
              <p className="text-3xs text-blue-800 dark:text-blue-300">
                Verification ID: AGR-BUY-2026-UP001 • Approved by Agrisense Verification Desk
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
            🔵 Business Verified
          </span>
        </div>

        {/* Required Documents Upload Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400">
            {t("Required / Applicable Verification Documents", "आवश्यक / लागू सत्यापन दस्तावेज़")}
          </h3>

          <div className="space-y-2.5">
            {[
              "Business Registration",
              "GST Certificate",
              "Trade License",
              "Authorized Rep ID",
            ].map((typeStr) => {
              const existing = documents.find((d) => d.docType === typeStr);

              return (
                <div
                  key={typeStr}
                  className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-forest dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-charcoal dark:text-ivory-100">
                        {typeStr}
                      </p>
                      {existing ? (
                        <p className="text-3xs text-charcoal-muted dark:text-ivory-400">
                          {existing.fileName} • Uploaded {existing.uploadDate}
                        </p>
                      ) : (
                        <p className="text-3xs text-amber-600">Document upload required</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {existing ? (
                      <span
                        className={`inline-flex items-center gap-1 text-3xs font-bold px-2.5 py-1 rounded-lg border ${
                          existing.status === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        {existing.status === "VERIFIED" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Review
                          </>
                        )}
                      </span>
                    ) : null}

                    <button
                      onClick={() =>
                        handleMockUpload(typeStr as BuyerVerificationDoc["docType"])
                      }
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light text-forest dark:text-emerald-400 hover:bg-ivory-100 transition-colors flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {existing ? t("Re-upload", "पुनः अपलोड करें") : t("Upload PDF", "PDF अपलोड करें")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
