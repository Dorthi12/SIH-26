import { useState } from "react";
import {
  Building2,
  Upload,
  ShieldCheck,
  CheckCircle2,
  FileText,
  X,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import type { BuyerProfile, BuyerVerificationDoc, QualityGrade } from "../../types/mandi";
import { buyerService } from "../../services/buyerService";
import { useLanguage } from "../../context/LanguageContext";

interface CreateBuyerProfileWizardProps {
  onClose: () => void;
  onBuyerCreated: (newBuyer: BuyerProfile) => void;
}

export function CreateBuyerProfileWizard({ onClose, onBuyerCreated }: CreateBuyerProfileWizardProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Business Info
  const [businessName, setBusinessName] = useState("Purvanchal Agro Mills Pvt Ltd");
  const [buyerType, setBuyerType] = useState<BuyerProfile["buyerType"]>("Food Processor");
  const [industry, setIndustry] = useState("Paddy Milling & Flour Processing");
  const [state, setState] = useState("Uttar Pradesh");
  const [district, setDistrict] = useState("Lucknow");
  const [operatingRegions, setOperatingRegions] = useState("Uttar Pradesh, MP, Bihar");
  const [yearsActive, setYearsActive] = useState<number>(2);
  const [typicalOrderVolume, setTypicalOrderVolume] = useState("200 – 1,500 Quintals");

  // Step 2: Crop Buying Requirement
  const [initialCropName, setInitialCropName] = useState("Wheat");
  const [minQty, setMinQty] = useState<number>(300);
  const [maxQty, setMaxQty] = useState<number>(1500);
  const [priceMin, setPriceMin] = useState<number>(2750);
  const [priceMax, setPriceMax] = useState<number>(2900);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>("Grade A");

  // Step 3: Valid ID Proof Uploads
  const [uploadedDocs, setUploadedDocs] = useState<Array<{
    docType: BuyerVerificationDoc["docType"];
    fileName: string;
    status: BuyerVerificationDoc["status"];
    fileSizeMb?: number;
  }>>([
    {
      docType: "Business Registration",
      fileName: "Purvanchal_Agro_Incorporation_Cert.pdf",
      status: "VERIFIED",
      fileSizeMb: 1.4,
    },
    {
      docType: "GST Certificate",
      fileName: "GSTIN_09AAACP9999K1Z4.pdf",
      status: "VERIFIED",
      fileSizeMb: 0.8,
    },
  ]);

  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  const handleSimulateFileUpload = (docType: BuyerVerificationDoc["docType"]) => {
    setUploadingDocType(docType);
    setTimeout(() => {
      const newDoc = {
        docType,
        fileName: `${docType.replace(/\s+/g, "_")}_Document.pdf`,
        status: "VERIFIED" as const,
        fileSizeMb: 1.2,
      };
      setUploadedDocs((prev) => [...prev.filter((d) => d.docType !== docType), newDoc]);
      setUploadingDocType(null);
    }, 1000);
  };

  const calculateProgress = () => {
    const requiredTypes: BuyerVerificationDoc["docType"][] = [
      "Business Registration",
      "GST Certificate",
      "Business Address Proof",
      "Authorized Rep ID",
    ];
    const uploadedCount = requiredTypes.filter((type) => uploadedDocs.some((d) => d.docType === type)).length;
    return Math.round((uploadedCount / requiredTypes.length) * 100);
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const progress = calculateProgress();

    const newBuyer = buyerService.createBuyerProfile({
      businessName,
      buyerType,
      industry,
      state,
      district,
      operatingRegions: operatingRegions.split(",").map((s) => s.trim()),
      yearsActiveOnPlatform: yearsActive,
      isVerified: true, // Demo Verification
      verificationProgress: Math.max(85, progress),
      documents: uploadedDocs.map((d, idx) => ({
        id: `BD-NEW-${idx}`,
        docType: d.docType,
        fileName: d.fileName,
        uploadDate: new Date().toISOString().split("T")[0],
        status: d.status,
        verifiedDate: new Date().toISOString().split("T")[0],
        notes: "Verified via Platform ID Proof Dropzone",
      })),
      typicalOrderVolume,
      activeRequirements: [`${initialCropName} (${minQty}-${maxQty} q)`],
      detailedRequirements: [
        {
          id: `REQ-${Date.now()}`,
          cropName: initialCropName,
          variety: "Grade A Standard",
          minQuantityQuintals: minQty,
          maxQuantityQuintals: maxQty,
          expectedPriceMin: priceMin,
          expectedPriceMax: priceMax,
          qualityGrade,
          maxMoisturePercentage: 12.0,
          deliveryType: "Buyer Pickup",
          requiredByDate: "2026-10-31",
          status: "ACTIVE",
          notes: "Initial requirement posted during profile creation.",
        },
      ],
    });

    onBuyerCreated(newBuyer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-light">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-charcoal dark:text-ivory-100">
                🏢 {t("Create New Buyer Profile", "नया खरीदार प्रोफ़ाइल बनाएं")}
              </h2>
              <p className="text-xs text-charcoal-muted dark:text-ivory-400">
                Register your food processing mill or trading business with valid government ID proofs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal-muted hover:bg-ivory-100 dark:hover:bg-charcoal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-extrabold">
          <div
            className={`p-2.5 rounded-xl border ${
              currentStep === 1
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-ivory-50 dark:bg-charcoal text-charcoal-muted"
            }`}
          >
            1. Business Info
          </div>
          <div
            className={`p-2.5 rounded-xl border ${
              currentStep === 2
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-ivory-50 dark:bg-charcoal text-charcoal-muted"
            }`}
          >
            2. Requirement Specs
          </div>
          <div
            className={`p-2.5 rounded-xl border ${
              currentStep === 3
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-ivory-50 dark:bg-charcoal text-charcoal-muted"
            }`}
          >
            3. Valid ID Uploads
          </div>
        </div>

        <form onSubmit={handleSubmitProfile} className="space-y-6">
          {/* STEP 1: BUSINESS INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-4 text-xs animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
                  Registered Business / Enterprise Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-extrabold text-charcoal dark:text-ivory-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
                    Buyer Category *
                  </label>
                  <select
                    value={buyerType}
                    onChange={(e) => setBuyerType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-semibold text-charcoal dark:text-ivory-100"
                  >
                    <option value="Food Processor">Food Processor</option>
                    <option value="Exporter">Exporter</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Retail Chain">Retail Chain</option>
                    <option value="Institutional Buyer">Institutional Buyer</option>
                    <option value="Restaurant / Food Service">Restaurant / Food Service</option>
                    <option value="Aggregator">Aggregator</option>
                    <option value="Agri Cooperative">Agri Cooperative</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
                    Industry / Trade Line *
                  </label>
                  <input
                    type="text"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-semibold text-charcoal dark:text-ivory-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-charcoal dark:text-ivory-200 block">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-semibold text-charcoal dark:text-ivory-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-charcoal dark:text-ivory-200 block">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-semibold text-charcoal dark:text-ivory-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
                    Operating Sourcing Regions
                  </label>
                  <input
                    type="text"
                    value={operatingRegions}
                    onChange={(e) => setOperatingRegions(e.target.value)}
                    placeholder="Comma separated states e.g. UP, MP, Punjab"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark text-xs text-charcoal dark:text-ivory-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
                    Typical Order Volume
                  </label>
                  <input
                    type="text"
                    value={typicalOrderVolume}
                    onChange={(e) => setTypicalOrderVolume(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark text-xs text-charcoal dark:text-ivory-100"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-xl font-black text-xs bg-blue-600 text-white shadow-md flex items-center gap-1.5 hover:bg-blue-700"
                >
                  <span>Next: Crop Specs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: INITIAL BUYING REQUIREMENT */}
          {currentStep === 2 && (
            <div className="space-y-4 text-xs animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 font-semibold text-blue-900 dark:text-blue-200">
                Post your initial crop procurement requirement to display on your buyer profile.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-charcoal dark:text-ivory-200 block">Target Crop Name</label>
                  <input
                    type="text"
                    required
                    value={initialCropName}
                    onChange={(e) => setInitialCropName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-extrabold text-charcoal dark:text-ivory-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-charcoal dark:text-ivory-200 block">Quality Grade</label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-semibold text-charcoal dark:text-ivory-100"
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Grade C">Grade C</option>
                    <option value="Premium Export">Premium Export</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-charcoal dark:text-ivory-200 block">Min Quantity (q)</label>
                  <input
                    type="number"
                    value={minQty}
                    onChange={(e) => setMinQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-charcoal dark:text-ivory-200 block">Max Quantity (q)</label>
                  <input
                    type="number"
                    value={maxQty}
                    onChange={(e) => setMaxQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-charcoal dark:text-ivory-200 block">Expected Price Min (₹/q)</label>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white font-bold text-forest"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-extrabold text-charcoal dark:text-ivory-200 block">Expected Price Max (₹/q)</label>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white font-bold text-forest"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-ivory-100 text-charcoal flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 rounded-xl font-black text-xs bg-blue-600 text-white shadow-md flex items-center gap-1.5 hover:bg-blue-700"
                >
                  <span>Next: Valid ID Uploads</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: VALID ID PROOF DOCUMENT UPLOADS */}
          {currentStep === 3 && (
            <div className="space-y-5 text-xs animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-xs block">Government & Business ID Proof Dropzone</span>
                  <span className="text-2xs text-emerald-800 dark:text-emerald-300">
                    Upload official business registration certificates and GST proofs to earn the <strong>✓ Business Verified</strong> badge.
                  </span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex items-center justify-between font-bold">
                <span>Verification Checklist Progress</span>
                <span className="text-forest dark:text-emerald-400 font-black text-sm">{calculateProgress()}%</span>
              </div>

              {/* Document Dropzone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    type: "Business Registration" as const,
                    title: "Business Registration / Incorporation Cert",
                  },
                  {
                    type: "GST Certificate" as const,
                    title: "GSTIN Tax Registration Certificate",
                  },
                  {
                    type: "Business Address Proof" as const,
                    title: "Registered Address Utility / Lease Proof",
                  },
                  {
                    type: "Authorized Rep ID" as const,
                    title: "Authorized Representative Identity Proof",
                  },
                ].map((docItem) => {
                  const uploaded = uploadedDocs.find((d) => d.docType === docItem.type);
                  const isUploading = uploadingDocType === docItem.type;

                  return (
                    <div
                      key={docItem.type}
                      className="p-4 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-2.5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <span className="font-extrabold text-xs text-charcoal dark:text-ivory-100 block">
                          {docItem.title}
                        </span>

                        {uploaded ? (
                          <div className="mt-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-3xs font-mono font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                            <span className="truncate">📄 {uploaded.fileName}</span>
                            <span className="text-emerald-600 shrink-0">✓ Attached</span>
                          </div>
                        ) : (
                          <span className="text-3xs text-amber-600 block mt-1">Upload PDF / Scanned Image Proof</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSimulateFileUpload(docItem.type)}
                        disabled={isUploading}
                        className="w-full py-2 rounded-xl font-extrabold text-xs bg-ivory-100 dark:bg-charcoal text-charcoal dark:text-ivory-200 hover:bg-ivory-200 border border-ivory-300 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>{uploaded ? "Re-upload File" : "Drop / Select File"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Privacy Notice */}
              <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal text-3xs text-charcoal-muted flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Uploaded private documents are encrypted. Farmers only see verified badges on the marketplace.</span>
              </div>

              {/* CTAs */}
              <div className="flex items-center justify-between pt-3 border-t border-ivory-200 dark:border-charcoal-light">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-ivory-100 text-charcoal flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-black text-xs bg-forest hover:bg-forest-dark text-white shadow-lg flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber" />
                  <span>Submit & Activate Buyer Profile</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
