import { Search, Filter, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { MarketplaceFilter } from "../../types/mandi";
import { useLanguage } from "../../context/LanguageContext";

interface MarketplaceFilterSidebarProps {
  filters: MarketplaceFilter;
  onChange: React.Dispatch<React.SetStateAction<MarketplaceFilter>>;
  onReset: () => void;
}

export function MarketplaceFilterSidebar({ filters, onChange, onReset }: MarketplaceFilterSidebarProps) {
  const { t } = useLanguage();

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-forest dark:text-emerald-400" />
          <h3 className="font-bold text-sm text-charcoal dark:text-ivory-100">
            {t("Marketplace Filters", "मंडी फ़िल्टर")}
          </h3>
        </div>
        <button
          onClick={onReset}
          className="text-3xs font-bold text-charcoal-muted hover:text-forest dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          {t("Reset All", "रीसेट करें")}
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 mb-1">
          {t("Search Keyword", "खोज कीवर्ड")}
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="e.g. Wheat, Barabanki, HD-2967"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
          />
        </div>
      </div>

      {/* Crop Filter */}
      <div>
        <label className="block text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 mb-1">
          {t("Crop Category", "फसल श्रेणी")}
        </label>
        <select
          value={filters.cropName}
          onChange={(e) => onChange((prev) => ({ ...prev, cropName: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs text-charcoal dark:text-ivory-100"
        >
          <option value="ALL">All Crops (सभी फसलें)</option>
          <option value="Wheat">Wheat (गेहूं)</option>
          <option value="Basmati Rice">Basmati Rice (बासमती)</option>
          <option value="Rice">Rice (धान / चावल)</option>
          <option value="Soybean">Soybean (सोयाबीन)</option>
          <option value="Red Onion">Red Onion (प्याज)</option>
          <option value="Mustard">Mustard (सरसों)</option>
          <option value="Gram / Chana">Gram / Chana (चना)</option>
        </select>
      </div>

      {/* State Filter */}
      <div>
        <label className="block text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 mb-1">
          {t("State Region", "राज्य क्षेत्र")}
        </label>
        <select
          value={filters.state}
          onChange={(e) => onChange((prev) => ({ ...prev, state: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs text-charcoal dark:text-ivory-100"
        >
          <option value="ALL">All Indian States (सभी राज्य)</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="Punjab">Punjab</option>
          <option value="Madhya Pradesh">Madhya Pradesh</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Rajasthan">Rajasthan</option>
        </select>
      </div>

      {/* Quality Grade Filter */}
      <div>
        <label className="block text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 mb-1">
          {t("Quality Grade", "गुणवत्ता ग्रेड")}
        </label>
        <select
          value={filters.qualityGrade}
          onChange={(e) => onChange((prev) => ({ ...prev, qualityGrade: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs text-charcoal dark:text-ivory-100"
        >
          <option value="ALL">All Grades (सभी ग्रेड)</option>
          <option value="Grade A">Grade A</option>
          <option value="Grade B">Grade B</option>
          <option value="Premium Export">Premium Export</option>
        </select>
      </div>

      {/* Checkboxes */}
      <div className="space-y-2 pt-2 border-t border-ivory-200 dark:border-charcoal-light">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal dark:text-ivory-200">
          <input
            type="checkbox"
            checked={filters.organicOnly}
            onChange={(e) => onChange((prev) => ({ ...prev, organicOnly: e.target.checked }))}
            className="w-4 h-4 accent-forest rounded"
          />
          <span>🌱 {t("Organic Verified Only", "केवल सत्यापित जैविक")}</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal dark:text-ivory-200">
          <input
            type="checkbox"
            checked={filters.govtVerifiedOnly}
            onChange={(e) => onChange((prev) => ({ ...prev, govtVerifiedOnly: e.target.checked }))}
            className="w-4 h-4 accent-forest rounded"
          />
          <span>🟢 {t("Govt Verified Farmer Only", "केवल सरकारी सत्यापित किसान")}</span>
        </label>
      </div>

      {/* Sort By Dropdown */}
      <div className="pt-2 border-t border-ivory-200 dark:border-charcoal-light">
        <label className="block text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 mb-1">
          {t("Sort Listings By", "लिस्टिंग का क्रम")}
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onChange((prev) => ({ ...prev, sortBy: e.target.value as MarketplaceFilter["sortBy"] }))
          }
          className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs text-charcoal dark:text-ivory-100 font-bold"
        >
          <option value="NEWEST">Newest Listings (नवीनतम)</option>
          <option value="LOWEST_PRICE">Lowest Price (कम कीमत)</option>
          <option value="HIGHEST_QUALITY">Highest Quality Grade (सर्वश्रेष्ठ ग्रेड)</option>
          <option value="HIGHEST_TRANSPARENCY">Highest Transparency Score (सर्वोत्तम साक्ष्य)</option>
        </select>
      </div>
    </div>
  );
}
