import React, { useState } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  Star,
  Sprout,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Scale,
  MessageSquare,
  FileText,
  Award,
} from 'lucide-react';
import type { CropListing } from '../../types/mandi';

interface MarketplaceViewProps {
  listings: CropListing[];
  onOpenCropReport: (listing: CropListing) => void;
  onContactFarmer: (listing: CropListing) => void;
  onMakeOffer: (listing: CropListing) => void;
}

export function MarketplaceView({
  listings,
  onOpenCropReport,
  onContactFarmer,
  onMakeOffer,
}: MarketplaceViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('All');
  const [organicOnly, setOrganicOnly] = useState(false);

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCrop = selectedCropFilter === 'All' || item.crop.includes(selectedCropFilter);
    const matchesOrganic = !organicOnly || item.organicStatus === 'Verified Organic';

    return matchesSearch && matchesCrop && matchesOrganic;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Search & Filter Controls Bar ───────────────────────────────── */}
      <div className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-4 lg:p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by crop, variety, or district (e.g. Wheat, Basmati, Barabanki)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 dark:bg-charcoal/40 text-xs text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest/30 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <select
              value={selectedCropFilter}
              onChange={(e) => setSelectedCropFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-ivory-100/50 dark:bg-charcoal/40 text-xs font-semibold text-charcoal dark:text-ivory-100 outline-none"
            >
              <option value="All">All Crops</option>
              <option value="Wheat">Wheat</option>
              <option value="Potato">Potato</option>
              <option value="Rice">Rice</option>
              <option value="Gram">Gram / Chickpea</option>
            </select>

            <button
              type="button"
              onClick={() => setOrganicOnly(!organicOnly)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                organicOnly
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-ivory-100/50 dark:bg-charcoal/40 border-ivory-300 text-charcoal-muted hover:text-charcoal'
              }`}
            >
              🌱 Verified Organic Only
            </button>
          </div>
        </div>
      </div>

      {/* ── Listing Cards Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white dark:bg-[#17211d] rounded-2xl border border-ivory-300 dark:border-[#26362f] p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4 group"
          >
            {/* Header / Verified Badge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-mono font-bold text-forest uppercase bg-forest/10 px-2.5 py-0.5 rounded-full border border-forest/20">
                  {listing.crop}
                </span>

                {listing.organicStatus === 'Verified Organic' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300">
                    🌱 Verified Organic
                  </span>
                ) : listing.organicStatus === 'Claimed Organic (Pending Evidence)' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300">
                    ⏳ Organic Claim Pending
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-charcoal-muted bg-ivory-200 dark:bg-charcoal/60 px-2 py-0.5 rounded-full">
                    Conventional
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100 group-hover:text-forest transition-colors">
                {listing.variety}
              </h3>

              <div className="flex items-center gap-2 text-xs text-charcoal-muted dark:text-ivory-200/70">
                <MapPin className="w-3.5 h-3.5 text-forest" />
                <span>{listing.location}</span>
                <span>•</span>
                <span className="font-semibold text-charcoal dark:text-ivory-100">{listing.quantityQuintals} Quintals</span>
              </div>
            </div>

            {/* Price & Fair Range Container */}
            <div className="p-3.5 rounded-xl bg-ivory-100/60 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f] space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xs text-charcoal-muted font-mono block">Farmer Asking Price</span>
                  <span className="text-xl font-extrabold font-mono text-forest">
                    ₹{listing.askingPricePerQuintal} <span className="text-xs font-sans text-charcoal-muted font-normal">/ quintal</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-2xs text-charcoal-muted font-mono block">Agrisense Fair Range</span>
                  <span className="text-xs font-bold font-mono text-amber">
                    ₹{listing.fairPriceRange.min}–₹{listing.fairPriceRange.max}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-charcoal-muted border-t border-ivory-200 dark:border-[#26362f] pt-2">
                <span>Grade: <strong className="text-charcoal dark:text-ivory-100">{listing.grade}</strong></span>
                <span>Moisture: <strong className="text-charcoal dark:text-ivory-100">{listing.moisturePercentage}%</strong></span>
              </div>
            </div>

            {/* Farmer Info Bar */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-forest/10 text-forest font-bold flex items-center justify-center text-xs">
                  {listing.farmerName[0]}
                </div>
                <div>
                  <span className="font-bold text-charcoal dark:text-ivory-100 block text-xs truncate max-w-[120px]">
                    {listing.farmerName}
                  </span>
                  <span className="text-[10px] text-amber flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber" />
                    {listing.farmerRating} ({listing.farmerCompletedTransactions} deals)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-ivory-200 dark:border-[#26362f]">
              <button
                type="button"
                onClick={() => onOpenCropReport(listing)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-ivory-300 dark:border-[#26362f] bg-white dark:bg-[#17211d] text-charcoal text-xs font-semibold hover:border-forest/30 transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-forest" />
                Crop Report
              </button>

              <button
                type="button"
                onClick={() => onContactFarmer(listing)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 transition-all shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Contact / Offer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
