import { MapPin, Calendar, Award, ShieldCheck, Scale, ArrowRight, Eye } from "lucide-react";
import type { CropListing } from "../../types/mandi";
import { VerificationBadge } from "./VerificationBadge";
import { useLanguage } from "../../context/LanguageContext";

interface CropListingCardProps {
  listing: CropListing;
  onOpenReport: (listing: CropListing) => void;
  onMakeOffer: (listing: CropListing) => void;
}

export function CropListingCard({ listing, onOpenReport, onMakeOffer }: CropListingCardProps) {
  const { t } = useLanguage();

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-sm hover:shadow-xl hover:border-forest/40 dark:hover:border-emerald-500/40 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Banner Image / Gradient */}
      <div className="relative h-44 w-full bg-ivory-200 dark:bg-charcoal overflow-hidden">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.cropName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-forest/20 via-emerald-100 to-amber/20 flex items-center justify-center">
            <span className="text-4xl font-extrabold text-forest/40">{listing.cropName}</span>
          </div>
        )}

        {/* Badges Over Image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
          {listing.verification.isVerified && <VerificationBadge type="GOVT_VERIFIED" size="sm" />}
          {listing.organic.isOrganic && (
            <VerificationBadge
              type={
                listing.organic.verificationState === "VERIFIED"
                  ? "ORGANIC_VERIFIED"
                  : "ORGANIC_CLAIMED"
              }
              size="sm"
            />
          )}
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-3xs font-medium flex items-center gap-1">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span>
            {listing.location.district}, {listing.location.state}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Title & Variety */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-lg text-charcoal dark:text-ivory-100 group-hover:text-forest dark:group-hover:text-emerald-400 transition-colors">
                {listing.cropName}
              </h3>
              <p className="text-xs font-semibold text-charcoal-muted dark:text-ivory-400">
                {t("Variety: ", "किस्म: ")} {listing.variety}
              </p>
            </div>

            <span className="px-2.5 py-1 rounded-lg bg-ivory-100 dark:bg-charcoal text-charcoal dark:text-ivory-200 text-xs font-bold shrink-0 border border-ivory-300 dark:border-charcoal-light">
              {listing.quantityQuintals} Quintals
            </span>
          </div>

          {/* Quality Chips */}
          <div className="flex flex-wrap gap-2 mt-3 text-3xs font-medium text-charcoal/80 dark:text-ivory-300">
            <span className="px-2 py-0.5 rounded-md bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              🏆 {listing.quality.grade}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              💧 {listing.quality.moisturePercentage}% Moisture
            </span>
            <span className="px-2 py-0.5 rounded-md bg-ivory-100 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              🌱 {listing.productionMethod}
            </span>
          </div>
        </div>

        {/* Price Section */}
        <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xs uppercase font-bold tracking-wider text-charcoal-muted dark:text-ivory-400 block">
                {t("Farmer Asking Price", "किसान मांग मूल्य")}
              </span>
              <span className="text-xl font-extrabold text-forest dark:text-emerald-400">
                ₹{listing.askingPricePerQuintal.toLocaleString()}
                <span className="text-xs font-normal text-charcoal-muted dark:text-ivory-400">
                  {" "}
                  / q
                </span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-3xs uppercase font-bold tracking-wider text-charcoal-muted dark:text-ivory-400 block">
                {t("Total Amount", "कुल राशि")}
              </span>
              <span className="text-xs font-bold text-charcoal dark:text-ivory-200">
                ₹{(listing.askingPricePerQuintal * listing.quantityQuintals).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Agrisense Fair Range */}
          <div className="pt-2 border-t border-ivory-200 dark:border-charcoal-light flex items-center justify-between text-2xs">
            <span className="text-charcoal-muted dark:text-ivory-400 font-medium flex items-center gap-1">
              <Scale className="w-3 h-3 text-forest dark:text-emerald-400" />
              {t("Agrisense Fair Range:", "एग्रीसेंस उचित सीमा:")}
            </span>
            <span className="font-bold text-forest dark:text-emerald-400">
              ₹{listing.priceAnalysis.indicativeMinPrice.toLocaleString()} – ₹
              {listing.priceAnalysis.indicativeMaxPrice.toLocaleString()}/q
            </span>
          </div>
        </div>

        {/* Additional Verification Badges */}
        <div className="flex flex-wrap gap-1.5">
          {listing.quality.hasLabTest && <VerificationBadge type="QUALITY_VERIFIED" size="sm" />}
          <VerificationBadge type="PRICE_REPORT_GENERATED" size="sm" />
          {listing.productionCosts.evidenceList.length > 0 && (
            <VerificationBadge type="EVIDENCE_ATTACHED" size="sm" />
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenReport(listing)}
            className="w-full px-3 py-2 rounded-xl text-xs font-bold text-charcoal dark:text-ivory-200 bg-ivory-100 hover:bg-ivory-200 dark:bg-charcoal dark:hover:bg-charcoal-light border border-ivory-300 dark:border-charcoal-light transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            {t("View Report", "रिपोर्ट देखें")}
          </button>

          <button
            onClick={() => onMakeOffer(listing)}
            className="w-full px-3 py-2 rounded-xl text-xs font-bold text-white bg-forest hover:bg-forest-dark transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            {t("Express Interest", "रुचि व्यक्त करें")}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
