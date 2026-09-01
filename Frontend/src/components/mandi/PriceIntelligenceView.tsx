import { useState } from "react";
import { Scale, MapPin, CheckCircle2, ShieldCheck, DollarSign, Award, Leaf } from "lucide-react";
import type { CropListing } from "../../types/mandi";
import { PriceVisualization } from "./PriceVisualization";
import { TransparencyScoreCard } from "./TransparencyScoreCard";
import { PriceComparisonWidget } from "./PriceComparisonWidget";
import { VerificationBadge } from "./VerificationBadge";
import { useLanguage } from "../../context/LanguageContext";

interface PriceIntelligenceViewProps {
  listings: CropListing[];
  initialSelectedListingId?: string;
  onSelectListing?: (listing: CropListing) => void;
}

export function PriceIntelligenceView({
  listings,
  initialSelectedListingId,
  onSelectListing,
}: PriceIntelligenceViewProps) {
  const { t } = useLanguage();

  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedListingId || (listings.length > 0 ? listings[0].id : "")
  );

  const selectedListing =
    listings.find((item) => item.id === selectedId) || listings[0];

  if (!selectedListing) {
    return (
      <div className="p-12 text-center text-charcoal-muted dark:text-ivory-400">
        No crop listings available for Price Intelligence analysis.
      </div>
    );
  }

  const { priceAnalysis } = selectedListing;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <Scale className="w-6 h-6 text-forest dark:text-emerald-400" />
            {t("Fair Crop Price Intelligence Engine", "उचित फसल मूल्य बुद्धिमत्ता इंजन")}
          </h2>
          <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-1">
            {t(
              "Select any crop listing on sale below to view its justified price breakdown based on quality, evidence, and production economics.",
              "गुणवत्ता, साक्ष्य और उत्पादन लागत के आधार पर नीचे दी गई किसी भी फसल का मूल्य विश्लेषण देखने के लिए चुनें।"
            )}
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-emerald-400 text-xs font-extrabold border border-forest/20 flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4 text-amber" />
          <span>{t("Evidence-Backed Economic Model", "साक्ष्य-आधारित आर्थिक मॉडल")}</span>
        </div>
      </div>

      {/* CROP SELECTOR BAR / CAROUSEL */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400">
          {t("Select Crop On Sale to Inspect Price Intelligence:", "मूल्य बुद्धिमत्ता देखने के लिए बिक्री हेतु उपलब्ध फसल चुनें:")}
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {listings.map((item) => {
            const isSelected = item.id === selectedListing.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
                  if (onSelectListing) onSelectListing(item);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? "border-forest bg-forest/10 dark:bg-forest/20 shadow-md ring-2 ring-forest/40"
                    : "border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal-dark hover:border-forest/50 hover:bg-ivory-50 dark:hover:bg-charcoal"
                }`}
              >
                {/* Active Checkmark Pill */}
                {isSelected && (
                  <span className="absolute top-2 right-2 p-0.5 rounded-full bg-forest text-white">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🌾</span>
                    <h4 className="font-extrabold text-sm text-charcoal dark:text-ivory-100 truncate">
                      {item.cropName}
                    </h4>
                  </div>
                  <p className="text-3xs text-charcoal-muted dark:text-ivory-400 truncate mt-0.5">
                    {item.variety} • {item.quantityQuintals}q
                  </p>
                </div>

                <div className="pt-2 border-t border-ivory-200 dark:border-charcoal-light flex items-center justify-between text-3xs">
                  <span className="font-mono font-bold text-forest dark:text-emerald-400">
                    ₹{item.askingPricePerQuintal}/q
                  </span>
                  <span className="text-charcoal-muted dark:text-ivory-400 truncate max-w-[80px]">
                    {item.location.district}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED CROP BANNER SUMMARY */}
      <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory-200 dark:border-charcoal-light pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-ivory-100 dark:bg-charcoal shrink-0 border border-ivory-300">
              <img
                src={selectedListing.images[0]}
                alt={selectedListing.cropName}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-xl text-charcoal dark:text-ivory-100">
                  {selectedListing.cropName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-lg bg-ivory-200 dark:bg-charcoal text-xs font-bold text-charcoal-muted">
                  Variety: {selectedListing.variety}
                </span>
                <VerificationBadge type="GOVT_VERIFIED" size="sm" />
                {selectedListing.organic.isOrganic && (
                  <VerificationBadge type="ORGANIC_VERIFIED" size="sm" />
                )}
              </div>

              <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-1 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-forest" />
                  {selectedListing.location.district}, {selectedListing.location.state} ({selectedListing.location.nearestMandi})
                </span>
                <span>•</span>
                <span>Quantity: <strong>{selectedListing.quantityQuintals} Quintals</strong></span>
                <span>•</span>
                <span>Grade: <strong>{selectedListing.quality.grade}</strong> ({selectedListing.quality.moisturePercentage}% Moisture)</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
              Asking Price
            </span>
            <span className="text-2xl font-black text-forest dark:text-emerald-400 block">
              ₹{selectedListing.askingPricePerQuintal}
              <span className="text-xs font-normal text-charcoal-muted"> / quintal</span>
            </span>
            <span className="text-3xs text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">
              Fair Range: ₹{priceAnalysis.indicativeMinPrice} – ₹{priceAnalysis.indicativeMaxPrice}/q
            </span>
          </div>
        </div>

        {/* Dynamic Badges & Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-3xs text-charcoal-muted block font-bold">Production Cost</span>
              <span className="font-extrabold text-charcoal dark:text-ivory-100">
                ₹{selectedListing.productionCosts.costPerQuintal} / quintal
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex items-center gap-2">
            <Award className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <div>
              <span className="text-3xs text-charcoal-muted block font-bold">Quality Grade</span>
              <span className="font-extrabold text-charcoal dark:text-ivory-100">
                {selectedListing.quality.grade} ({selectedListing.quality.moisturePercentage}% Moisture)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-600 shrink-0" />
            <div>
              <span className="text-3xs text-charcoal-muted block font-bold">Organic Status</span>
              <span className="font-extrabold text-charcoal dark:text-ivory-100">
                {selectedListing.organic.isOrganic ? "NPOP Verified (+₹300/q)" : "Conventional"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber shrink-0" />
            <div>
              <span className="text-3xs text-charcoal-muted block font-bold">Transparency Score</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {priceAnalysis.transparencyScore} / 100 Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PRICE FORMATION VISUALIZATION FOR SELECTED CROP */}
      <PriceVisualization priceAnalysis={priceAnalysis} />

      {/* TRANSPARENCY SCORE & EVIDENCE CHECKLIST FOR SELECTED CROP */}
      <TransparencyScoreCard priceAnalysis={priceAnalysis} />

      {/* MARKET COMPARISON WIDGET FOR SELECTED CROP */}
      <PriceComparisonWidget
        priceAnalysis={priceAnalysis}
        askingPrice={selectedListing.askingPricePerQuintal}
        cropName={selectedListing.cropName}
      />
    </div>
  );
}
