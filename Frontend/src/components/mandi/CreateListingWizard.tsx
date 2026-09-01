import { useState } from "react";
import {
  Sprout,
  MapPin,
  DollarSign,
  Award,
  Leaf,
  Scale,
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Info,
  Sparkles,
  Search,
} from "lucide-react";
import type {
  CropListing,
  ProductionMethod,
  QualityGrade,
  ProductionCosts,
  CostEvidence,
} from "../../types/mandi";
import { mandiService } from "../../services/mandiService";
import { VerificationBadge } from "./VerificationBadge";
import { PriceVisualization } from "./PriceVisualization";
import { TransparencyScoreCard } from "./TransparencyScoreCard";
import { DocumentUploadDropzone } from "./DocumentUploadDropzone";
import { DemoVerificationModal } from "./DemoVerificationModal";
import { useLanguage } from "../../context/LanguageContext";

interface CreateListingWizardProps {
  onSuccess: (newListing: CropListing) => void;
  onCancel: () => void;
}

export function CreateListingWizard({ onSuccess, onCancel }: CreateListingWizardProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showDemoVerificationModal, setShowDemoVerificationModal] = useState<boolean>(false);

  // Step 1: Crop Info
  const [cropName, setCropName] = useState("Wheat");
  const [variety, setVariety] = useState("HD-2967");
  const [quantityQuintals, setQuantityQuintals] = useState<number>(250);
  const [harvestDate, setHarvestDate] = useState("2026-04-15");
  const [shelfLifeMonths, setShelfLifeMonths] = useState<number>(12);
  const [productionMethod, setProductionMethod] = useState<ProductionMethod>("Organic");

  // Step 2: Location (Address Privacy Protected)
  const [state, setState] = useState("Uttar Pradesh");
  const [district, setDistrict] = useState("Barabanki");
  const [nearestMandi, setNearestMandi] = useState("Barabanki APMC Mandi");
  const [regionVillageName, setRegionVillageName] = useState("Haidergarh Block");

  // Step 3: Production Economics
  const [seedsCost, setSeedsCost] = useState<number>(14500);
  const [seedQuantityKg, setSeedQuantityKg] = useState<number>(250);
  const [fertilizerCost, setFertilizerCost] = useState<number>(18000);
  const [fertilizerType, setFertilizerType] = useState("Vermicompost & Bio-Fertilizer");
  const [pesticidesCost, setPesticidesCost] = useState<number>(9500);
  const [irrigationCost, setIrrigationCost] = useState<number>(12000);
  const [electricityDieselCost, setElectricityDieselCost] = useState<number>(8500);
  const [machineryCost, setMachineryCost] = useState<number>(22000);
  const [labourCost, setLabourCost] = useState<number>(34000);
  const [labourersCount, setLabourersCount] = useState<number>(8);
  const [labourDays, setLabourDays] = useState<number>(14);
  const [landPreparationCost, setLandPreparationCost] = useState<number>(16000);
  const [harvestingCost, setHarvestingCost] = useState<number>(18500);
  const [transportationCost, setTransportationCost] = useState<number>(20000);
  const [storageCost, setStorageCost] = useState<number>(10000);
  const [otherExpensesCost, setOtherExpensesCost] = useState<number>(5000);

  // Manual evidence uploads
  const [costEvidenceList, setCostEvidenceList] = useState<CostEvidence[]>([
    {
      id: "EV-USER-01",
      title: "Labour Payment Receipt",
      category: "Labour",
      fileName: "Labour_Payment_Receipt.pdf",
      uploadDate: "2026-04-20",
      verified: true,
    },
  ]);

  // Step 4: Quality Info
  const [grade, setGrade] = useState<QualityGrade>("Grade A");
  const [moisturePercentage, setMoisturePercentage] = useState<number>(11.8);
  const [physicalQuality, setPhysicalQuality] = useState(
    "Bold amber grain, uniform size, zero pest damage"
  );
  const [damagePercentage, setDamagePercentage] = useState<number>(0.4);
  const [purityPercentage, setPurityPercentage] = useState<number>(99.2);
  const [foreignMatterPercentage, setForeignMatterPercentage] = useState<number>(0.4);
  const [hasLabTest, setHasLabTest] = useState<boolean>(true);
  const [labName, setLabName] = useState("UP State Agricultural Quality Testing Lab");
  const [testCertificateNumber, setTestCertificateNumber] = useState("UP-LAB-2026-8812");

  // Step 5: Organic Verification
  const [isOrganic, setIsOrganic] = useState<boolean>(true);
  const [certificationType, setCertificationType] = useState<"NPOP" | "PGS-India" | "EU Organic" | "USDA Organic" | "Third-Party Certified">("NPOP");
  const [certificateNumber, setCertificateNumber] = useState("ORG-NPOP-UP-2025-9941");
  const [certificationAuthority, setCertificationAuthority] = useState("APEDA NPOP Authorized Agency");
  const [validUntil, setValidUntil] = useState("2027-05-10");

  // Multiple Crop Images State
  const [cropImages, setCropImages] = useState<Array<{ id: string; url: string; fileName: string }>>([
    {
      id: "IMG-01",
      url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
      fileName: "Harvest_Wheat_Grain_Sample.jpg",
    },
    {
      id: "IMG-02",
      url: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80",
      fileName: "Farmgate_Bagging_Produce.jpg",
    },
  ]);

  // 2-Second Price Prediction Model Buffering Window
  const [isEstimatingPrice, setIsEstimatingPrice] = useState<boolean>(false);
  const [estimationProgress, setEstimationProgress] = useState<number>(0);
  const [estimationStatusText, setEstimationStatusText] = useState<string>("Connecting to Agrisense AI Price Prediction Model...");

  const triggerPriceEstimation = () => {
    setIsEstimatingPrice(true);
    setEstimationProgress(0);
    setEstimationStatusText("Connecting to Agrisense AI Price Prediction Model...");

    let current = 0;
    const interval = setInterval(() => {
      current += 5;
      setEstimationProgress(current);

      if (current === 30) {
        setEstimationStatusText(`Evaluating ${grade} quality metrics & ${moisturePercentage}% moisture content...`);
      } else if (current === 60) {
        setEstimationStatusText(`Factoring production cost ₹${costPerQuintal}/q & local ${district} mandi demand...`);
      } else if (current === 90) {
        setEstimationStatusText("Finalizing fair market price range & profit margin forecast...");
      }

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsEstimatingPrice(false);
        }, 200);
      }
    }, 100);
  };

  const handleStepChange = (targetStep: number) => {
    if (targetStep === 6 && currentStep !== 6) {
      triggerPriceEstimation();
    }
    setCurrentStep(targetStep);
  };

  // Step 6: Price Engine & Asking Price
  const [customAskingPrice, setCustomAskingPrice] = useState<number>(2880);

  // Dynamic automatic recalculation for this specific crop posting
  const totalProductionCost =
    seedsCost +
    fertilizerCost +
    pesticidesCost +
    irrigationCost +
    electricityDieselCost +
    machineryCost +
    labourCost +
    landPreparationCost +
    harvestingCost +
    transportationCost +
    storageCost +
    otherExpensesCost;

  const costPerQuintal =
    quantityQuintals > 0 ? Math.round(totalProductionCost / quantityQuintals) : 0;

  // Real-time price engine calculation
  const priceAnalysis = mandiService.calculateFairPriceRange({
    cropName,
    variety,
    quantityQuintals,
    productionCosts: {
      seedsCost,
      seedQuantityKg,
      fertilizerCost,
      fertilizerType,
      pesticidesCost,
      irrigationCost,
      electricityDieselCost,
      machineryCost,
      labourCost,
      labourersCount,
      labourDays,
      landPreparationCost,
      harvestingCost,
      transportationCost,
      storageCost,
      otherExpensesCost,
      totalCost: totalProductionCost,
      costPerQuintal,
      evidenceList: costEvidenceList,
    },
    quality: {
      grade,
      moisturePercentage,
      physicalQuality,
      damagePercentage,
      purityPercentage,
      foreignMatterPercentage,
      hasLabTest,
      labName,
      testCertificateNumber,
      testDate: "2026-04-20",
    },
    organic: {
      isOrganic,
      certificationType,
      certificateNumber,
      certificationAuthority,
      validUntil,
      verificationState: isOrganic ? "VERIFIED" : "NOT_VERIFIED",
    },
    location: { state, district },
  });

  const handleFileUpload = (newDoc: CostEvidence) => {
    setCostEvidenceList((prev) => [...prev, newDoc]);
  };

  const handleFileRemove = (id: string) => {
    setCostEvidenceList((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmitListing = () => {
    const newListing = mandiService.createListing({
      farmerId: "FARMER-LOGGED-IN",
      farmerProfile: {
        id: "FARMER-LOGGED-IN",
        displayName: "Verified Farmer (Your Profile)",
        district,
        state,
        isGovtVerified: true,
        verificationId: "AGR-VER-2026-DEMO99",
        activeListingsCount: 1,
        completedSalesCount: 12,
        averageRating: 4.9,
        memberSinceYear: 2024,
        cropsGrown: [cropName],
      },
      cropName,
      variety,
      quantityQuintals,
      harvestDate,
      expectedShelfLifeMonths: shelfLifeMonths,
      productionMethod,
      location: {
        state,
        district,
        nearestMandi,
        regionVillageName,
      },
      productionCosts: {
        seedsCost,
        seedQuantityKg,
        fertilizerCost,
        fertilizerType,
        pesticidesCost,
        irrigationCost,
        electricityDieselCost,
        machineryCost,
        labourCost,
        labourersCount,
        labourDays,
        landPreparationCost,
        harvestingCost,
        transportationCost,
        storageCost,
        otherExpensesCost,
        totalCost: totalProductionCost,
        costPerQuintal,
        evidenceList: costEvidenceList,
      },
      quality: {
        grade,
        moisturePercentage,
        physicalQuality,
        damagePercentage,
        purityPercentage,
        foreignMatterPercentage,
        hasLabTest,
        labName,
        testCertificateNumber,
        testDate: "2026-04-20",
        labReportFile: hasLabTest
          ? {
              id: "EV-QUAL-FILE",
              title: "Quality Test Certificate",
              category: "Quality",
              fileName: "Quality_Test_Report.pdf",
              uploadDate: "2026-04-20",
              verified: true,
            }
          : undefined,
      },
      organic: {
        isOrganic,
        certificationType: isOrganic ? certificationType : undefined,
        certificateNumber: isOrganic ? certificateNumber : undefined,
        certificationAuthority: isOrganic ? certificationAuthority : undefined,
        validUntil: isOrganic ? validUntil : undefined,
        verificationState: isOrganic ? "VERIFIED" : "NOT_VERIFIED",
        certificateDocument: isOrganic
          ? {
              id: "EV-ORG-FILE",
              title: "NPOP Organic Certificate",
              category: "Organic Certification",
              fileName: "Organic_NPOP_Cert.pdf",
              uploadDate: "2025-05-10",
              verified: true,
            }
          : undefined,
      },
      priceAnalysis,
      askingPricePerQuintal: customAskingPrice || priceAnalysis.suggestedPrice,
      totalAskingPrice:
        (customAskingPrice || priceAnalysis.suggestedPrice) * quantityQuintals,
      verification: {
        isVerified: true,
        verificationStatus: "VERIFIED",
        verifiedByOfficer: "Govt Agriculture Officer (District Agriculture Office)",
        verificationDate: new Date().toISOString().split("T")[0],
        verificationId: "AGR-VER-2026-DEMO99",
        comments: "All entered costs, quality metrics, and organic documentation reviewed.",
      },
      images: [
        "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
      ],
    });

    onSuccess(newListing);
  };

  const steps = [
    { num: 1, label: t("Crop Info", "फसल जानकारी"), icon: Sprout },
    { num: 2, label: t("Location", "स्थान"), icon: MapPin },
    { num: 3, label: t("Production Economics", "उत्पादन लागत"), icon: DollarSign },
    { num: 4, label: t("Quality", "गुणवत्ता"), icon: Award },
    { num: 5, label: t("Organic", "जैविक"), icon: Leaf },
    { num: 6, label: t("Price Engine", "मूल्य इंजन"), icon: Scale },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-charcoal dark:text-ivory-100">
            {t("List Your Crop with Transparent Price", "पारदर्शी मूल्य के साथ अपनी फसल सूचीबद्ध करें")}
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-1">
            {t(
              "Provide production details & upload evidence documents to generate an Agrisense evidence-backed Fair Price Report.",
              "एग्रीसेंस साक्ष्य-आधारित उचित मूल्य रिपोर्ट जनरेट करने के लिए विवरण दर्ज करें व दस्तावेज अपलोड करें।"
            )}
          </p>
        </div>

        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-muted hover:text-charcoal dark:hover:text-ivory-100 hover:bg-ivory-200 dark:hover:bg-charcoal transition-colors"
        >
          {t("Cancel", "रद्द करें")}
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-sm">
        <div className="grid grid-cols-6 gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center gap-1 ${
                  isCurrent
                    ? "border-forest bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 font-bold"
                    : isCompleted
                    ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                    : "border-ivory-200 dark:border-charcoal-light text-charcoal-muted opacity-60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-3xs truncate hidden sm:block">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Form Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
        {/* STEP 1: CROP INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-ivory-200 dark:border-charcoal-light pb-4">
              <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-forest dark:text-emerald-400" />
                Step 1 — {t("Crop Basic Information", "फसल मूल जानकारी")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1.5">
                  {t("Select Crop Name", "फसल का नाम चुनें")}
                </label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                >
                  <option value="Wheat">Wheat (गेहूं)</option>
                  <option value="Basmati Rice">Basmati Rice (बासमती चावल)</option>
                  <option value="Rice">Rice (धान / चावल)</option>
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                  <option value="Red Onion">Red Onion (लाल प्याज)</option>
                  <option value="Mustard">Mustard (सरसों)</option>
                  <option value="Gram / Chana">Gram / Chana (चना)</option>
                  <option value="Maize">Maize (मक्का)</option>
                  <option value="Potato">Potato (आलू)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1.5">
                  {t("Variety / Hybrid", "किस्म / हाइब्रिड")}
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. HD-2967, PB-1121, JS-335"
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1.5">
                  {t("Available Quantity (Quintals)", "उपलब्ध मात्रा (क्विंटल)")}
                </label>
                <input
                  type="number"
                  value={quantityQuintals}
                  onChange={(e) => setQuantityQuintals(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1.5">
                  {t("Harvest Date", "कटाई की तारीख")}
                </label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1.5">
                  {t("Expected Storage Shelf Life (Months)", "भंडारण शेल्फ लाइफ (महीने)")}
                </label>
                <input
                  type="number"
                  value={shelfLifeMonths}
                  onChange={(e) => setShelfLifeMonths(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1.5">
                  {t("Production Method", "उत्पादन विधि")}
                </label>
                <select
                  value={productionMethod}
                  onChange={(e) => setProductionMethod(e.target.value as ProductionMethod)}
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                >
                  <option value="Conventional">Conventional (रासायनिक / पारंपरिक)</option>
                  <option value="Organic">Organic (जैविक / प्रमाणित)</option>
                  <option value="Natural">Natural (प्राकृतिक खेती / ZNFB)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Multiple Crop Produce Photos Upload Section */}
            <div className="p-5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-charcoal dark:text-ivory-100 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-forest dark:text-emerald-400" />
                  {t("Upload Crop Produce Photos (फसल तस्वीरें अपलोड करें)", "Upload Crop Produce Photos")}
                </span>
                <span className="text-3xs font-bold text-charcoal-muted dark:text-ivory-400">
                  {cropImages.length} Photos Attached
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {cropImages.map((img) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border border-ivory-300 dark:border-charcoal-light aspect-square shadow-xs">
                    <img src={img.url} alt={img.fileName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setCropImages((prev) => prev.filter((i) => i.id !== img.id))}
                        className="p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const newImg = {
                      id: `IMG-${Date.now()}`,
                      url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
                      fileName: `Produce_Photo_${cropImages.length + 1}.jpg`,
                    };
                    setCropImages((prev) => [...prev, newImg]);
                  }}
                  className="rounded-xl border-2 border-dashed border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark flex flex-col items-center justify-center p-3 text-charcoal-muted hover:border-forest transition-colors aspect-square text-center"
                >
                  <Upload className="w-5 h-5 text-forest mb-1" />
                  <span className="text-3xs font-bold text-charcoal dark:text-ivory-200">+ Add Produce Photo</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION (PRIVACY PROTECTED) */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-ivory-200 dark:border-charcoal-light pb-4">
              <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-forest dark:text-emerald-400" />
                Step 2 — {t("Location & APMC Mandi", "स्थान व मंडी")}
              </h3>
            </div>

            {/* Privacy Guarantee Banner */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{t("Address Privacy Safeguard", "पता गोपनीयता सुरक्षा")}</p>
                <p className="text-2xs text-blue-800 dark:text-blue-300 mt-0.5">
                  {t(
                    "Your exact village residential address is confidential. Public buyers will only see 'District, State' on marketplace cards.",
                    "आपका सटीक आवासीय पता गोपनीय रहेगा। सार्वजनिक खरीदार केवल 'जिला, राज्य' देखेंगे।"
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1.5">
                  State
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                >
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1.5">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1.5">
                  Nearest APMC Mandi / Market
                </label>
                <input
                  type="text"
                  value={nearestMandi}
                  onChange={(e) => setNearestMandi(e.target.value)}
                  placeholder="e.g. Barabanki Grain APMC"
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1.5">
                  Block / Village Region (Private Record Only)
                </label>
                <input
                  type="text"
                  value={regionVillageName}
                  onChange={(e) => setRegionVillageName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DETAILED PRODUCTION COSTS + MANUAL FILE UPLOAD */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-ivory-200 dark:border-charcoal-light pb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-forest dark:text-emerald-400" />
                Step 3 — {t("Crop Production Economics", "फसल उत्पादन लागत अर्थशास्त्र")}
              </h3>
              <div className="text-right">
                <span className="text-2xs text-charcoal-muted dark:text-ivory-400 block">Total Calculated Cost</span>
                <span className="text-lg font-extrabold text-forest dark:text-emerald-400">
                  ₹{totalProductionCost.toLocaleString()} ({costPerQuintal}/q)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
                <label className="font-bold text-charcoal dark:text-ivory-200 block">Seeds Cost (₹)</label>
                <input
                  type="number"
                  value={seedsCost}
                  onChange={(e) => setSeedsCost(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-bold text-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
                <label className="font-bold text-charcoal dark:text-ivory-200 block">Fertilizer Cost (₹)</label>
                <input
                  type="number"
                  value={fertilizerCost}
                  onChange={(e) => setFertilizerCost(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-bold text-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
                <label className="font-bold text-charcoal dark:text-ivory-200 block">Pesticides / Protection (₹)</label>
                <input
                  type="number"
                  value={pesticidesCost}
                  onChange={(e) => setPesticidesCost(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-bold text-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
                <label className="font-bold text-charcoal dark:text-ivory-200 block">Irrigation & Water (₹)</label>
                <input
                  type="number"
                  value={irrigationCost}
                  onChange={(e) => setIrrigationCost(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-bold text-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
                <label className="font-bold text-charcoal dark:text-ivory-200 block">Electricity / Diesel Fuel (₹)</label>
                <input
                  type="number"
                  value={electricityDieselCost}
                  onChange={(e) => setElectricityDieselCost(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-bold text-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
                <label className="font-bold text-charcoal dark:text-ivory-200 block">Machinery / Tillage (₹)</label>
                <input
                  type="number"
                  value={machineryCost}
                  onChange={(e) => setMachineryCost(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-bold text-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
                <label className="font-bold text-charcoal dark:text-ivory-200 block">Labour Wages Total (₹)</label>
                <input
                  type="number"
                  value={labourCost}
                  onChange={(e) => setLabourCost(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-bold text-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
                <label className="font-bold text-charcoal dark:text-ivory-200 block">Harvesting & Threshing (₹)</label>
                <input
                  type="number"
                  value={harvestingCost}
                  onChange={(e) => setHarvestingCost(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-bold text-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
                <label className="font-bold text-charcoal dark:text-ivory-200 block">Transportation to Mandi (₹)</label>
                <input
                  type="number"
                  value={transportationCost}
                  onChange={(e) => setTransportationCost(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark font-bold text-sm"
                />
              </div>
            </div>

            {/* MANUAL DOCUMENT UPLOAD DROPZONE FOR COST EVIDENCE */}
            <div className="pt-4 border-t border-ivory-200 dark:border-charcoal-light space-y-4">
              <DocumentUploadDropzone
                category="Labour"
                label={t("Upload Labour Payment / Muster Roll Voucher", "श्रम भुगतान / मस्टर रोल वाउचर अपलोड करें")}
                uploadedFiles={costEvidenceList}
                onFileUploaded={handleFileUpload}
                onFileRemoved={handleFileRemove}
              />

              <DocumentUploadDropzone
                category="Transportation"
                label={t("Upload Transport Freight Receipt", "परिवहन माल भाड़ा रसीद अपलोड करें")}
                uploadedFiles={costEvidenceList}
                onFileUploaded={handleFileUpload}
                onFileRemoved={handleFileRemove}
              />
            </div>
          </div>
        )}

        {/* STEP 4: QUALITY INFORMATION + LAB TEST DOCUMENT UPLOAD */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-ivory-200 dark:border-charcoal-light pb-4">
              <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-forest dark:text-emerald-400" />
                Step 4 — {t("Crop Quality & Laboratory Testing", "फसल गुणवत्ता व प्रयोगशाला परीक्षण")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1.5">
                  Quality Grade
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as QualityGrade)}
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                >
                  <option value="Grade A">Grade A (उच्चतम गुणवत्ता)</option>
                  <option value="Grade B">Grade B (मध्यम श्रेणी)</option>
                  <option value="Grade C">Grade C (सामान्य)</option>
                  <option value="Premium Export">Premium Export (निर्यात ग्रेड)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1.5">
                  Moisture Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={moisturePercentage}
                  onChange={(e) => setMoisturePercentage(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1.5">
                  Purity Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={purityPercentage}
                  onChange={(e) => setPurityPercentage(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal dark:text-ivory-200 mb-1.5">
                  Damage / Broken Grain (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={damagePercentage}
                  onChange={(e) => setDamagePercentage(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-sm text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-charcoal dark:text-ivory-100">
                    {t("Laboratory Quality Test Available?", "क्या प्रयोगशाला परीक्षण रिपोर्ट उपलब्ध है?")}
                  </p>
                  <p className="text-2xs text-charcoal-muted dark:text-ivory-400">
                    Lab tested crops receive a +₹70/q verified confidence bonus.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={hasLabTest}
                  onChange={(e) => setHasLabTest(e.target.checked)}
                  className="w-5 h-5 accent-forest rounded"
                />
              </div>

              {hasLabTest && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <input
                      type="text"
                      value={labName}
                      onChange={(e) => setLabName(e.target.value)}
                      placeholder="Lab Name"
                      className="p-2.5 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark text-xs"
                    />
                    <input
                      type="text"
                      value={testCertificateNumber}
                      onChange={(e) => setTestCertificateNumber(e.target.value)}
                      placeholder="Certificate Number"
                      className="p-2.5 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark text-xs"
                    />
                  </div>

                  <DocumentUploadDropzone
                    category="Quality"
                    label={t("Upload Official Quality Lab Certificate", "आधिकारिक गुणवत्ता लैब प्रमाणपत्र अपलोड करें")}
                    uploadedFiles={costEvidenceList}
                    onFileUploaded={handleFileUpload}
                    onFileRemoved={handleFileRemove}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: ORGANIC CROP PREMIUM & VERIFICATION */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-ivory-200 dark:border-charcoal-light pb-4">
              <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Step 5 — {t("Organic Crop Premium & Verification", "जैविक फसल प्रीमियम व सत्यापन")}
              </h3>
            </div>

            {/* Toggle */}
            <div className="p-5 rounded-2xl bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-base text-green-900 dark:text-green-200">
                  {t("Is this crop Organic?", "क्या यह फसल जैविक (Organic) है?")}
                </h4>
                <p className="text-xs text-green-800 dark:text-green-400 mt-0.5">
                  Certified organic crops command a +₹300/q premium in Agrisense price engine.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOrganic(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    !isOrganic
                      ? "bg-charcoal text-white shadow-md"
                      : "bg-white text-charcoal border border-ivory-300"
                  }`}
                >
                  No (पारंपरिक)
                </button>

                <button
                  type="button"
                  onClick={() => setIsOrganic(true)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isOrganic
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-white text-charcoal border border-ivory-300"
                  }`}
                >
                  Yes (जैविक)
                </button>
              </div>
            </div>

            {isOrganic && (
              <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-charcoal border border-green-300 dark:border-green-800/60 shadow-sm animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                      Organic Certification Type
                    </label>
                    <select
                      value={certificationType}
                      onChange={(e) =>
                        setCertificationType(
                          e.target.value as "NPOP" | "PGS-India" | "EU Organic" | "USDA Organic" | "Third-Party Certified"
                        )
                      }
                      className="w-full p-2.5 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark text-xs font-bold"
                    >
                      <option value="NPOP">NPOP (National Programme for Organic Production)</option>
                      <option value="PGS-India">PGS-India (Participatory Guarantee System)</option>
                      <option value="EU Organic">EU Organic Standard</option>
                      <option value="USDA Organic">USDA Organic</option>
                      <option value="Third-Party Certified">Third-Party Accredited Agency</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                      Certificate Number
                    </label>
                    <input
                      type="text"
                      value={certificateNumber}
                      onChange={(e) => setCertificateNumber(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                      Certification Authority
                    </label>
                    <input
                      type="text"
                      value={certificationAuthority}
                      onChange={(e) => setCertificationAuthority(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-charcoal dark:text-ivory-200 block mb-1">
                      Valid Until Date
                    </label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark text-xs"
                    />
                  </div>
                </div>

                <DocumentUploadDropzone
                  category="Organic Certification"
                  label={t("Upload NPOP / Organic Accreditation Certificate", "NPOP / जैविक प्रत्यायन प्रमाणपत्र अपलोड करें")}
                  uploadedFiles={costEvidenceList}
                  onFileUploaded={handleFileUpload}
                  onFileRemoved={handleFileRemove}
                />
              </div>
            )}

            {/* Run Demo Document Verification Trigger Box */}
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-xs text-amber-900 dark:text-amber-200">
                    {t("Run Demo Document OCR Verification Window", "डेमो दस्तावेज़ OCR सत्यापन खिड़की चलाएं")}
                  </h4>
                  <p className="text-3xs text-amber-800 dark:text-amber-300">
                    Scans uploaded documents, retrieves verified values, and calculates price separately for this crop.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDemoVerificationModal(true)}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-amber text-charcoal hover:bg-amber-dark transition-all shadow-sm shrink-0 flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                {t("Verify Documents Now", "दस्तावेजों को अभी सत्यापित करें")}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: FAIR PRICE INTELLIGENCE ENGINE & ASKING PRICE */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-ivory-200 dark:border-charcoal-light pb-4">
              <h3 className="text-lg font-extrabold text-charcoal dark:text-ivory-100 flex items-center gap-2">
                <Scale className="w-6 h-6 text-forest dark:text-emerald-400" />
                Step 6 — Agrisense Fair Price Intelligence Engine
              </h3>
            </div>

            {isEstimatingPrice ? (
              <div className="p-8 sm:p-10 rounded-3xl bg-ivory-50 dark:bg-charcoal border-2 border-forest/40 text-center space-y-6 animate-in fade-in duration-200 shadow-md">
                <div className="w-16 h-16 rounded-full bg-forest/10 border-4 border-forest border-t-transparent animate-spin mx-auto"></div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-charcoal dark:text-ivory-100 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                    🤖 AI Price Prediction Model Estimating Market Price...
                  </h3>
                  <p className="text-xs text-charcoal-muted dark:text-ivory-300 max-w-md mx-auto font-semibold">
                    {estimationStatusText}
                  </p>
                </div>

                <div className="w-full max-w-md mx-auto space-y-1.5">
                  <div className="w-full h-3.5 rounded-full bg-ivory-200 dark:bg-charcoal-dark overflow-hidden p-0.5 border border-ivory-300">
                    <div
                      style={{ width: `${estimationProgress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-forest via-emerald-500 to-amber-400 transition-all duration-100"
                    ></div>
                  </div>
                  <div className="flex justify-between text-3xs font-extrabold text-charcoal-muted">
                    <span>APMC Market Multi-Variable Regression</span>
                    <span>{estimationProgress}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Calculated Fair Price Hero Result */}
                <PriceVisualization priceAnalysis={priceAnalysis} />

                <TransparencyScoreCard priceAnalysis={priceAnalysis} />

                {/* Custom Asking Price Field */}
                <div className="p-5 rounded-2xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-extrabold text-base text-charcoal dark:text-ivory-100 block">
                        {t("Set Your Asking Listing Price", "अपना मांग मूल्य तय करें")}
                      </label>
                      <p className="text-2xs text-charcoal-muted dark:text-ivory-400">
                        Suggested fair price: ₹{priceAnalysis.suggestedPrice}/q. You can set your desired selling price.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-forest dark:text-emerald-400">₹</span>
                      <input
                        type="number"
                        value={customAskingPrice}
                        onChange={(e) => setCustomAskingPrice(Number(e.target.value))}
                        className="w-36 px-4 py-2 rounded-xl border-2 border-forest font-black text-xl text-forest dark:text-emerald-400 bg-white dark:bg-charcoal-dark text-right"
                      />
                      <span className="text-xs font-bold text-charcoal-muted">/ quintal</span>
                    </div>
                  </div>
                </div>

                {/* Government Verification Preview Box */}
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                      {t("Government Review Status: Govt Verified", "सरकारी समीक्षा स्थिति: सरकारी सत्यापित")}
                    </p>
                    <p className="text-3xs text-emerald-700 dark:text-emerald-400">
                      Officer Review ID: AGR-VER-2026-DEMO99 • District Agriculture Officer
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="pt-4 border-t border-ivory-200 dark:border-charcoal-light flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-charcoal dark:text-ivory-200 bg-ivory-100 dark:bg-charcoal hover:bg-ivory-200 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("Previous Step", "पिछला चरण")}
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 5) {
                  setShowDemoVerificationModal(true);
                } else {
                  setCurrentStep((prev) => Math.min(6, prev + 1));
                }
              }}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-forest text-white hover:bg-forest-dark transition-colors shadow-md flex items-center gap-1.5"
            >
              {currentStep === 5 ? t("Verify & Proceed to Price Engine", "सत्यापित करें व मूल्य इंजन देखें") : t("Next Step", "अगला चरण")}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitListing}
              className="px-7 py-3 rounded-xl font-extrabold text-sm bg-gradient-to-r from-forest to-emerald-700 text-white hover:from-forest-dark hover:to-emerald-800 transition-all shadow-xl flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-amber" />
              {t("Generate Report & Publish Listing", "रिपोर्ट जनरेट करें और लिस्टिंग प्रकाशित करें")}
            </button>
          )}
        </div>
      </div>

      {/* Demo Verification Window Modal */}
      <DemoVerificationModal
        isOpen={showDemoVerificationModal}
        onClose={() => setShowDemoVerificationModal(false)}
        cropName={cropName}
        variety={variety}
        quantityQuintals={quantityQuintals}
        productionCosts={{
          seedsCost,
          seedQuantityKg,
          fertilizerCost,
          fertilizerType,
          pesticidesCost,
          irrigationCost,
          electricityDieselCost,
          machineryCost,
          labourCost,
          labourersCount,
          labourDays,
          landPreparationCost,
          harvestingCost,
          transportationCost,
          storageCost,
          otherExpensesCost,
          totalCost: totalProductionCost,
          costPerQuintal,
          evidenceList: costEvidenceList,
        }}
        quality={{
          grade,
          moisturePercentage,
          physicalQuality,
          damagePercentage,
          purityPercentage,
          foreignMatterPercentage,
          hasLabTest,
          labName,
          testCertificateNumber,
        }}
        organic={{
          isOrganic,
          certificationType,
          certificateNumber,
          certificationAuthority,
          validUntil,
          verificationState: isOrganic ? "VERIFIED" : "NOT_VERIFIED",
        }}
        evidenceList={costEvidenceList}
        onConfirmVerification={() => {
          setCurrentStep(6);
        }}
      />
    </div>
  );
}
