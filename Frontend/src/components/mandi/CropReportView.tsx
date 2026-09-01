import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Scale,
  Printer,
  ArrowLeft,
  MapPin,
  Calendar,
  Award,
  Leaf,
  Info,
  DollarSign,
  Download,
  Building2,
  UserCheck,
} from "lucide-react";
import type { CropListing, CostEvidence } from "../../types/mandi";
import { VerificationBadge } from "./VerificationBadge";
import { PriceBreakdownModal } from "./PriceBreakdownModal";
import { PriceVisualization } from "./PriceVisualization";
import { TransparencyScoreCard } from "./TransparencyScoreCard";
import { PriceComparisonWidget } from "./PriceComparisonWidget";
import { DocumentViewerModal } from "./DocumentViewerModal";
import { useLanguage } from "../../context/LanguageContext";

interface CropReportViewProps {
  listing: CropListing;
  onBack: () => void;
  onMakeOffer: (listing: CropListing) => void;
}

export function CropReportView({ listing, onBack, onMakeOffer }: CropReportViewProps) {
  const { t } = useLanguage();
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CostEvidence | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-charcoal dark:text-ivory-200 bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light hover:bg-ivory-100 dark:hover:bg-charcoal transition-colors flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("Back to Marketplace", "मंडी में वापस जाएं")}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-charcoal dark:text-ivory-200 bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light hover:bg-ivory-100 dark:hover:bg-charcoal transition-colors flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4 text-forest dark:text-emerald-400" />
            {t("Print / Download PDF", "प्रिंट / PDF डाउनलोड")}
          </button>

          <button
            onClick={() => onMakeOffer(listing)}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-forest hover:bg-forest-dark transition-colors shadow-md flex items-center gap-2"
          >
            {t("Express Interest / Make Offer", "रुचि व्यक्त करें / प्रस्ताव भेजें")}
          </button>
        </div>
      </div>

      {/* Main Report Paper Document Container */}
      <div className="rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-xl p-6 sm:p-10 space-y-8">
        {/* Report Header Stamp & Brand */}
        <div className="pb-6 border-b border-ivory-300 dark:border-charcoal-light flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xs uppercase tracking-widest font-extrabold text-forest dark:text-emerald-400 bg-forest/10 px-3 py-1 rounded-md">
                AGRISENSE MANDI • OFFICIAL CROP REPORT
              </span>
              <span className="text-2xs font-mono text-charcoal-muted dark:text-ivory-400">
                Ref: {listing.id}
              </span>
            </div>
            <h1 className="text-3xl font-black text-charcoal dark:text-ivory-100 tracking-tight">
              {listing.cropName} — {listing.variety}
            </h1>
            <p className="text-sm text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>
                {listing.location.district}, {listing.location.state}
              </span>
              <span>•</span>
              <Calendar className="w-4 h-4 text-forest" />
              <span>
                {t("Harvested: ", "कटाई तिथि: ")} {listing.harvestDate}
              </span>
            </p>
          </div>

          {/* Government Verification Stamp */}
          {listing.verification.isVerified && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex items-center gap-3 shrink-0">
              <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-md">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-3xs uppercase font-extrabold tracking-wider text-emerald-800 dark:text-emerald-300 block">
                  {t("GOVERNMENT VERIFIED", "सरकारी सत्यापित")}
                </span>
                <p className="font-bold text-xs text-emerald-900 dark:text-emerald-100">
                  {listing.verification.verificationId}
                </p>
                <p className="text-3xs text-emerald-700 dark:text-emerald-400">
                  {listing.verification.verifiedByOfficer}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Asking Price & Fair Range Hero Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-gradient-to-br from-ivory-100 via-emerald-50/40 to-ivory-50 dark:from-charcoal dark:via-charcoal dark:to-charcoal-dark border border-ivory-300 dark:border-charcoal-light">
          <div>
            <span className="text-3xs uppercase font-bold tracking-wider text-charcoal-muted dark:text-ivory-400 block">
              {t("Farmer Asking Price", "किसान मांग मूल्य")}
            </span>
            <p className="text-3xl font-black text-forest dark:text-emerald-400 mt-1">
              ₹{listing.askingPricePerQuintal.toLocaleString()}
              <span className="text-sm font-normal text-charcoal-muted"> / quintal</span>
            </p>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-1">
              {t("Total Quantity: ", "कुल मात्रा: ")}
              <strong className="text-charcoal dark:text-ivory-100">
                {listing.quantityQuintals} Quintals
              </strong>{" "}
              (₹{(listing.askingPricePerQuintal * listing.quantityQuintals).toLocaleString()})
            </p>
          </div>

          <div>
            <span className="text-3xs uppercase font-bold tracking-wider text-charcoal-muted dark:text-ivory-400 block">
              {t("Indicative Fair Price Range", "अनुमानित उचित मूल्य सीमा")}
            </span>
            <p className="text-2xl font-black text-charcoal dark:text-ivory-100 mt-1">
              ₹{listing.priceAnalysis.indicativeMinPrice.toLocaleString()} – ₹
              {listing.priceAnalysis.indicativeMaxPrice.toLocaleString()}
              <span className="text-sm font-normal text-charcoal-muted"> / q</span>
            </p>
            <button
              onClick={() => setShowPriceBreakdown(true)}
              className="mt-2 text-xs font-bold text-forest hover:underline dark:text-emerald-400 flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              {t("Why is this price? View full breakdown →", "यह कीमत क्यों है? पूरा विवरण देखें →")}
            </button>
          </div>

          <div>
            <span className="text-3xs uppercase font-bold tracking-wider text-charcoal-muted dark:text-ivory-400 block">
              {t("Price Transparency Score", "पारदर्शिता स्कोर")}
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                {listing.priceAnalysis.transparencyScore}
                <span className="text-sm font-normal text-charcoal-muted">/100</span>
              </span>
              <div className="flex flex-col text-3xs text-emerald-700 dark:text-emerald-400 font-semibold">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t("Verified Evidence", "सत्यापित साक्ष्य")}
                </span>
                <span>{t("High Confidence Rating", "उच्च विश्वसनीयता")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Farmer Confidential Public Profile */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2 border-b border-ivory-200 dark:border-charcoal-light pb-2">
            <UserCheck className="w-5 h-5 text-forest dark:text-emerald-400" />
            {t("Verified Farmer Profile", "सत्यापित किसान प्रोफ़ाइल")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light text-xs">
            <div>
              <span className="text-2xs text-charcoal-muted dark:text-ivory-400 block">
                {t("Farmer Identity", "किसान पहचान")}
              </span>
              <p className="font-bold text-charcoal dark:text-ivory-100 text-sm mt-0.5">
                {listing.farmerProfile.displayName}
              </p>
              <span className="inline-flex items-center gap-1 text-3xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                <ShieldCheck className="w-3 h-3" /> Govt Verified Participant
              </span>
            </div>

            <div>
              <span className="text-2xs text-charcoal-muted dark:text-ivory-400 block">
                {t("Public Location", "सार्वजनिक स्थान")}
              </span>
              <p className="font-semibold text-charcoal dark:text-ivory-100 mt-0.5">
                {listing.farmerProfile.district}, {listing.farmerProfile.state}
              </p>
              <p className="text-3xs text-charcoal-muted dark:text-ivory-400 mt-1">
                (Sensitive residential address confidential)
              </p>
            </div>

            <div>
              <span className="text-2xs text-charcoal-muted dark:text-ivory-400 block">
                {t("Marketplace History", "मंडी इतिहास")}
              </span>
              <p className="font-semibold text-charcoal dark:text-ivory-100 mt-0.5">
                {listing.farmerProfile.completedSalesCount} Completed Direct Sales
              </p>
              <p className="text-3xs text-amber-600 font-bold mt-1">
                ★ {listing.farmerProfile.averageRating} / 5.0 Rating
              </p>
            </div>

            <div>
              <span className="text-2xs text-charcoal-muted dark:text-ivory-400 block">
                {t("Verification Certificate", "सत्यापन प्रमाण पत्र")}
              </span>
              <p className="font-mono text-2xs font-bold text-forest dark:text-emerald-400 mt-0.5">
                {listing.farmerProfile.verificationId}
              </p>
              <p className="text-3xs text-charcoal-muted dark:text-ivory-400 mt-1">
                Member since {listing.farmerProfile.memberSinceYear}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Crop Quality Specs */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2 border-b border-ivory-200 dark:border-charcoal-light pb-2">
            <Award className="w-5 h-5 text-forest dark:text-emerald-400" />
            {t("Crop Quality & Laboratory Test", "फसल गुणवत्ता व प्रयोगशाला परीक्षण")}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400">
                {t("Quality Grade", "गुणवत्ता ग्रेड")}
              </span>
              <p className="font-extrabold text-sm text-charcoal dark:text-ivory-100 mt-1">
                {listing.quality.grade}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400">
                {t("Moisture Percentage", "नमी का प्रतिशत")}
              </span>
              <p className="font-extrabold text-sm text-charcoal dark:text-ivory-100 mt-1">
                {listing.quality.moisturePercentage}%
              </p>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400">
                {t("Purity Percentage", "शुद्धता प्रतिशत")}
              </span>
              <p className="font-extrabold text-sm text-charcoal dark:text-ivory-100 mt-1">
                {listing.quality.purityPercentage}%
              </p>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400">
                {t("Shelf Life", "शेल्फ लाइफ")}
              </span>
              <p className="font-extrabold text-sm text-charcoal dark:text-ivory-100 mt-1">
                {listing.expectedShelfLifeMonths} Months
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light text-xs space-y-1">
            <span className="font-bold text-charcoal dark:text-ivory-100">
              {t("Physical Parameters: ", "भौतिक मापदंड: ")}
            </span>
            <span className="text-charcoal-muted dark:text-ivory-300">
              {listing.quality.physicalQuality}
            </span>
          </div>

          {listing.quality.hasLabTest && (
            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs text-teal-900 dark:text-teal-200">
                    {t("Official Quality Lab Certificate: ", "आधिकारिक गुणवत्ता लैब प्रमाण पत्र: ")}
                    {listing.quality.testCertificateNumber}
                  </p>
                  <p className="text-3xs text-teal-700 dark:text-teal-400">
                    Issued by {listing.quality.labName} on {listing.quality.testDate}
                  </p>
                </div>
              </div>

              {listing.quality.labReportFile && (
                <button
                  onClick={() => setSelectedDoc(listing.quality.labReportFile!)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-700 text-white hover:bg-teal-800 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {t("View Certificate", "प्रमाणपत्र देखें")}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Section 3: Organic Certification (If organic) */}
        {listing.organic.isOrganic && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2 border-b border-ivory-200 dark:border-charcoal-light pb-2">
              <Leaf className="w-5 h-5 text-green-600" />
              {t("Organic Verification Status", "जैविक सत्यापन स्थिति")}
            </h2>

            <div className="p-5 rounded-2xl bg-green-50/70 dark:bg-green-950/40 border border-green-300 dark:border-green-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-2xs font-extrabold bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200">
                    🌱 ORGANIC CLAIM VERIFIED
                  </span>
                  <span className="text-2xs font-mono font-bold text-green-800 dark:text-green-300">
                    ID: {listing.organic.certificateNumber}
                  </span>
                </div>
                <p className="text-xs text-green-900 dark:text-green-200 font-semibold">
                  Certification: {listing.organic.certificationType} ({listing.organic.certificationAuthority})
                </p>
                <p className="text-3xs text-green-700 dark:text-green-400">
                  Valid Through: {listing.organic.validUntil}
                </p>
              </div>

              {listing.organic.certificateDocument && (
                <button
                  onClick={() => setSelectedDoc(listing.organic.certificateDocument!)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-green-700 text-white hover:bg-green-800 transition-colors flex items-center gap-2 shadow-sm shrink-0"
                >
                  <FileText className="w-4 h-4" />
                  {t("View NPOP Certificate", "NPOP प्रमाणपत्र देखें")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Section 4: Detailed Production Cost Economics Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2 border-b border-ivory-200 dark:border-charcoal-light pb-2">
            <DollarSign className="w-5 h-5 text-forest dark:text-emerald-400" />
            {t("Crop Production Cost Economics", "फसल उत्पादन लागत अर्थशास्त्र")}
          </h2>

          <div className="overflow-x-auto rounded-xl border border-ivory-200 dark:border-charcoal-light">
            <table className="w-full text-xs text-left text-charcoal dark:text-ivory-200">
              <thead className="bg-ivory-100 dark:bg-charcoal text-2xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 border-b border-ivory-200 dark:border-charcoal-light">
                <tr>
                  <th className="px-4 py-3">{t("Cost Category", "लागत श्रेणी")}</th>
                  <th className="px-4 py-3">{t("Quantity / Input Details", "मात्रा / इनपुट विवरण")}</th>
                  <th className="px-4 py-3 text-right">{t("Total Expense", "कुल व्यय")}</th>
                  <th className="px-4 py-3 text-right">{t("Cost / Quintal", "लागत / क्विंटल")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200 dark:divide-charcoal-light bg-white dark:bg-charcoal-dark">
                <tr>
                  <td className="px-4 py-2.5 font-semibold">Seeds</td>
                  <td className="px-4 py-2.5">{listing.productionCosts.seedQuantityKg} kg seeds</td>
                  <td className="px-4 py-2.5 text-right font-bold">₹{listing.productionCosts.seedsCost.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-charcoal-muted">₹{Math.round(listing.productionCosts.seedsCost / listing.quantityQuintals)}/q</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold">Fertilizer</td>
                  <td className="px-4 py-2.5">{listing.productionCosts.fertilizerType}</td>
                  <td className="px-4 py-2.5 text-right font-bold">₹{listing.productionCosts.fertilizerCost.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-charcoal-muted">₹{Math.round(listing.productionCosts.fertilizerCost / listing.quantityQuintals)}/q</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold">Crop Protection</td>
                  <td className="px-4 py-2.5">Bio-pesticides & neem spray</td>
                  <td className="px-4 py-2.5 text-right font-bold">₹{listing.productionCosts.pesticidesCost.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-charcoal-muted">₹{Math.round(listing.productionCosts.pesticidesCost / listing.quantityQuintals)}/q</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold">Irrigation & Power</td>
                  <td className="px-4 py-2.5">Tube-well electricity & diesel pump</td>
                  <td className="px-4 py-2.5 text-right font-bold">₹{(listing.productionCosts.irrigationCost + listing.productionCosts.electricityDieselCost).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-charcoal-muted">₹{Math.round((listing.productionCosts.irrigationCost + listing.productionCosts.electricityDieselCost) / listing.quantityQuintals)}/q</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold">Machinery & Tillage</td>
                  <td className="px-4 py-2.5">Tractor land prep & sowing machine</td>
                  <td className="px-4 py-2.5 text-right font-bold">₹{listing.productionCosts.machineryCost.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-charcoal-muted">₹{Math.round(listing.productionCosts.machineryCost / listing.quantityQuintals)}/q</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold">Labour</td>
                  <td className="px-4 py-2.5">{listing.productionCosts.labourersCount} labourers ({listing.productionCosts.labourDays} days)</td>
                  <td className="px-4 py-2.5 text-right font-bold">₹{listing.productionCosts.labourCost.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-charcoal-muted">₹{Math.round(listing.productionCosts.labourCost / listing.quantityQuintals)}/q</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold">Harvesting & Threshing</td>
                  <td className="px-4 py-2.5">Harvesting combine & cleaning</td>
                  <td className="px-4 py-2.5 text-right font-bold">₹{listing.productionCosts.harvestingCost.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-charcoal-muted">₹{Math.round(listing.productionCosts.harvestingCost / listing.quantityQuintals)}/q</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold">Logistics & Storage</td>
                  <td className="px-4 py-2.5">Transport & jute bag storage</td>
                  <td className="px-4 py-2.5 text-right font-bold">₹{(listing.productionCosts.transportationCost + listing.productionCosts.storageCost).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-charcoal-muted">₹{Math.round((listing.productionCosts.transportationCost + listing.productionCosts.storageCost) / listing.quantityQuintals)}/q</td>
                </tr>
              </tbody>
              <tfoot className="bg-ivory-100 dark:bg-charcoal font-bold text-xs border-t-2 border-ivory-300 dark:border-charcoal-light">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-forest dark:text-emerald-400">
                    {t("TOTAL ESTIMATED PRODUCTION COST", "कुल अनुमानित उत्पादन लागत")}
                  </td>
                  <td className="px-4 py-3 text-right text-forest dark:text-emerald-400 text-sm font-extrabold">
                    ₹{listing.productionCosts.totalCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-forest dark:text-emerald-400 text-sm font-extrabold">
                    ₹{listing.productionCosts.costPerQuintal}/q
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Section 5: Attached Evidence Documents */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2 border-b border-ivory-200 dark:border-charcoal-light pb-2">
            <FileText className="w-5 h-5 text-forest dark:text-emerald-400" />
            {t("Supporting Document Evidence List", "सहायक दस्तावेज साक्ष्य सूची")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {listing.productionCosts.evidenceList.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex items-center justify-between hover:border-forest/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-forest/10 text-forest dark:bg-forest/20 dark:text-emerald-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-charcoal dark:text-ivory-100">
                      {doc.title}
                    </p>
                    <p className="text-3xs text-charcoal-muted dark:text-ivory-400">
                      {doc.fileName} • {doc.category}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="px-2.5 py-1 rounded-lg text-2xs font-semibold bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light text-forest dark:text-emerald-400 hover:bg-ivory-100 transition-colors"
                >
                  {t("View", "देखें")}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Price Visualization & Comparison */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-charcoal dark:text-ivory-100 flex items-center gap-2 border-b border-ivory-200 dark:border-charcoal-light pb-2">
            <Scale className="w-5 h-5 text-forest dark:text-emerald-400" />
            {t("Agrisense Fair Price Analysis", "एग्रीसेंस उचित मूल्य विश्लेषण")}
          </h2>

          <PriceVisualization
            priceAnalysis={listing.priceAnalysis}
            onViewEvidence={(doc) => setSelectedDoc(doc)}
          />

          <PriceComparisonWidget
            priceAnalysis={listing.priceAnalysis}
            askingPrice={listing.askingPricePerQuintal}
            cropName={listing.cropName}
          />

          <TransparencyScoreCard
            priceAnalysis={listing.priceAnalysis}
            hasOrganicCert={listing.organic.isOrganic}
            hasLabTest={listing.quality.hasLabTest}
            hasProductionCosts={true}
            hasGovtVerification={listing.verification.isVerified}
          />
        </div>

        {/* Footer Officer Seal */}
        <div className="pt-6 border-t border-ivory-300 dark:border-charcoal-light flex items-center justify-between text-2xs text-charcoal-muted dark:text-ivory-400">
          <div>
            <p className="font-bold text-charcoal dark:text-ivory-200">
              AGRISENSE TRANSPARENT MANDI PLATFORM
            </p>
            <p>Generated for Listing {listing.id} on {listing.listingDate}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
              ✓ Digital Verification Seal Verified
            </p>
            <p>ID: {listing.verification.verificationId}</p>
          </div>
        </div>
      </div>

      {/* Price Breakdown Drawer / Modal */}
      {showPriceBreakdown && (
        <PriceBreakdownModal
          priceAnalysis={listing.priceAnalysis}
          askingPrice={listing.askingPricePerQuintal}
          cropName={listing.cropName}
          variety={listing.variety}
          onClose={() => setShowPriceBreakdown(false)}
          onViewEvidence={(doc) => setSelectedDoc(doc)}
        />
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal document={selectedDoc} onClose={() => setSelectedDoc(null)} />
    </div>
  );
}
