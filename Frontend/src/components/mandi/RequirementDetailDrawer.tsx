import { X, Sprout, ShieldCheck, Scale, Calendar, Clock, ArrowRight, MessageSquare, DollarSign } from "lucide-react";
import type { BuyingRequirementItem } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface RequirementDetailDrawerProps {
  requirement: BuyingRequirementItem | null;
  onClose: () => void;
  onContactBuyer: () => void;
  onMakeOffer: (req: BuyingRequirementItem) => void;
}

export function RequirementDetailDrawer({
  requirement,
  onClose,
  onContactBuyer,
  onMakeOffer,
}: RequirementDetailDrawerProps) {
  const { t } = useLanguage();

  if (!requirement) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-full bg-white dark:bg-charcoal-dark border-l border-ivory-300 dark:border-charcoal-light shadow-2xl flex flex-col justify-between overflow-y-auto p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ivory-200 dark:border-charcoal-light">
            <div className="flex items-center gap-2">
              <Sprout className="w-6 h-6 text-forest dark:text-emerald-400" />
              <h3 className="font-black text-xl text-charcoal dark:text-ivory-100">
                Buying Requirement Details
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-charcoal-muted hover:bg-ivory-100 dark:hover:bg-charcoal font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-forest/10 border border-forest/20 flex items-center justify-between">
            <div>
              <span className="text-2xs font-extrabold uppercase tracking-wider text-forest dark:text-emerald-400 block">
                Target Crop & Variety
              </span>
              <span className="text-lg font-black text-charcoal dark:text-ivory-100 block">
                🌾 {requirement.cropName} {requirement.variety ? `(${requirement.variety})` : ""}
              </span>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
              🟢 {requirement.status}
            </span>
          </div>

          {/* Specs Table */}
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex items-center justify-between">
              <span className="text-charcoal-muted dark:text-ivory-400 font-bold">Required Quantity:</span>
              <span className="font-black text-charcoal dark:text-ivory-100 text-sm">
                {requirement.minQuantityQuintals} – {requirement.maxQuantityQuintals} Quintals
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light flex items-center justify-between">
              <span className="text-charcoal-muted dark:text-ivory-400 font-bold">Expected Price Range:</span>
              <span className="font-black text-forest dark:text-emerald-400 text-sm">
                ₹{requirement.expectedPriceMin.toLocaleString()} – ₹{requirement.expectedPriceMax.toLocaleString()} / q
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                <span className="text-charcoal-muted dark:text-ivory-400 font-bold block mb-1">Quality Grade:</span>
                <span className="font-extrabold text-charcoal dark:text-ivory-100">{requirement.qualityGrade}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                <span className="text-charcoal-muted dark:text-ivory-400 font-bold block mb-1">Max Moisture Limit:</span>
                <span className="font-extrabold text-charcoal dark:text-ivory-100">≤ {requirement.maxMoisturePercentage}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                <span className="text-charcoal-muted dark:text-ivory-400 font-bold block mb-1">Logistics & Pickup:</span>
                <span className="font-extrabold text-charcoal dark:text-ivory-100">{requirement.deliveryType}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                <span className="text-charcoal-muted dark:text-ivory-400 font-bold block mb-1">Required By Date:</span>
                <span className="font-extrabold text-charcoal dark:text-ivory-100">{requirement.requiredByDate}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
              <span className="text-charcoal-muted dark:text-ivory-400 font-bold block mb-1">Additional Requirements:</span>
              <p className="text-2xs text-charcoal dark:text-ivory-200 font-medium leading-relaxed">
                {requirement.notes || "Clean, properly graded produce required. Quality sample check at farmgate before loading."}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-ivory-200 dark:border-charcoal-light">
          <button
            onClick={() => {
              onMakeOffer(requirement);
              onClose();
            }}
            className="w-full py-3 rounded-2xl font-black text-xs bg-forest hover:bg-forest-dark text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <DollarSign className="w-4 h-4 text-amber" />
            <span>Make Offer</span>
          </button>

          <button
            onClick={() => {
              onContactBuyer();
              onClose();
            }}
            className="w-full py-3 rounded-2xl font-extrabold text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Contact Buyer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
