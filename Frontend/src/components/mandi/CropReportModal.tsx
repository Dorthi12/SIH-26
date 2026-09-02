import React from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  X,
  Award,
  Sprout,
  DollarSign,
  Scale,
  Layers,
  Truck,
  Building,
} from 'lucide-react';
import type { CropListing } from '../../types/mandi';

interface CropReportModalProps {
  listing: CropListing;
  onClose: () => void;
}

export function CropReportModal({ listing, onClose }: CropReportModalProps) {
  const p = listing.productionCostsBreakdown;
  const l = listing.locationDetails;
  const c = listing.cropCharacteristics;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#17211d] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-ivory-300 dark:border-[#26362f] space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ivory-200 dark:border-[#26362f] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-forest" />
            <div>
              <h3 className="text-lg font-bold text-charcoal dark:text-ivory-100">
                Agrisense Crop Report & Price Model Audit
              </h3>
              <p className="text-2xs font-mono text-charcoal-muted">
                Listing ID: {listing.id} • Verified Producer Data
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-ivory-200 text-charcoal font-bold flex items-center justify-center text-xs hover:bg-ivory-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Crop Basic Details */}
        <div className="p-4 rounded-2xl bg-ivory-100/50 dark:bg-charcoal/40 border border-ivory-200 dark:border-[#26362f] space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xs text-forest font-mono uppercase font-bold">{listing.crop}</span>
              <h4 className="text-xl font-extrabold text-charcoal dark:text-ivory-100">
                {listing.variety}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-2xs text-charcoal-muted font-mono block">Mandi Asking Price</span>
              <span className="text-xl font-extrabold font-mono text-forest">
                ₹{listing.askingPricePerQuintal}/q
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
            <div>
              <span className="text-2xs text-charcoal-muted block">Quantity</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">{listing.quantityQuintals} Quintals</span>
            </div>
            <div>
              <span className="text-2xs text-charcoal-muted block">Moisture %</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">{listing.moisturePercentage}%</span>
            </div>
            <div>
              <span className="text-2xs text-charcoal-muted block">Quality Grade</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">{listing.grade}</span>
            </div>
            <div>
              <span className="text-2xs text-charcoal-muted block">Location</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">{listing.location}</span>
            </div>
          </div>
        </div>

        {/* 1. Itemized Production Costs Breakdown (Matching User Request) */}
        <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-3">
          <div className="flex items-center justify-between border-b border-red-200 pb-2">
            <h4 className="text-xs font-bold text-red-700 dark:text-red-300 font-mono uppercase flex items-center gap-1.5">
              <span>1. Production Costs (Itemized Inputs)</span>
            </h4>
            <span className="text-2xs font-mono text-red-600 font-bold">
              Total: ₹{p ? p.totalProductionCost.toLocaleString('en-IN') : '15,100'} / quintal
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs font-mono">
            <div className="p-2 rounded bg-white dark:bg-[#17211d] border border-red-100">
              <span className="text-charcoal-muted block">Seeds</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">₹{p ? p.seeds : 1200}</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-[#17211d] border border-red-100">
              <span className="text-charcoal-muted block">Fertilizer</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">₹{p ? p.fertilizer : 2400}</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-[#17211d] border border-red-100">
              <span className="text-charcoal-muted block">Pesticides</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">₹{p ? p.pesticides : 1000}</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-[#17211d] border border-red-100">
              <span className="text-charcoal-muted block">Irrigation</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">₹{p ? p.irrigation : 1200}</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-[#17211d] border border-red-100">
              <span className="text-charcoal-muted block">Electricity/Diesel</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">₹{p ? p.electricity : 800}</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-[#17211d] border border-red-100">
              <span className="text-charcoal-muted block">Machinery</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">₹{p ? p.machinery : 1500}</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-[#17211d] border border-red-100">
              <span className="text-charcoal-muted block">Labour</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">₹{p ? p.labour : 3000}</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-[#17211d] border border-red-100">
              <span className="text-charcoal-muted block">Land Prep</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">₹{p ? p.landPrep : 1000}</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-[#17211d] border border-red-100">
              <span className="text-charcoal-muted block">Harvesting</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">₹{p ? p.harvesting : 1500}</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-[#17211d] border border-red-100">
              <span className="text-charcoal-muted block">Transportation</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">₹{p ? p.transportation : 900}</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-[#17211d] border border-red-100">
              <span className="text-charcoal-muted block">Storage</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">₹{p ? p.storage : 600}</span>
            </div>
          </div>
        </div>

        {/* 2. Location & 3. Crop Characteristics Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Location Parameters */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2 text-xs font-mono">
            <h4 className="text-2xs font-bold text-blue-700 dark:text-blue-300 uppercase block font-sans">
              2. Location Factors
            </h4>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">State / District:</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">{l ? `${l.state}, ${l.district}` : 'Maharashtra, Nashik'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Target Mandi:</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">{l ? l.mandi : 'Nashik Mandi'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Labour Rate:</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">₹{l ? l.localLabourRate : 450}/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Transport Dist:</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">{l ? l.transportDistanceKm : 45} km</span>
            </div>
          </div>

          {/* Crop Characteristics */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2 text-xs font-mono">
            <h4 className="text-2xs font-bold text-emerald-700 dark:text-emerald-300 uppercase block font-sans">
              3. Crop Characteristics
            </h4>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Moisture Content:</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">{c ? c.moisturePct : listing.moisturePercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Quality Rating:</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">{c ? c.quality : 'Good'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Farming Method:</span>
              <span className="font-bold text-forest dark:text-emerald-400">{c ? c.farmingType : listing.productionMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Expected Shelf Life:</span>
              <span className="font-bold text-charcoal dark:text-ivory-100">{c ? c.expectedShelfLifeMonths : 6} Months</span>
            </div>
          </div>
        </div>

        {/* Fair Price Engine Calculation Breakdown */}
        <div className="p-4 rounded-2xl bg-forest/5 dark:bg-forest/10 border border-forest/20 space-y-2 text-xs font-mono">
          <div className="flex justify-between font-bold text-forest text-sm">
            <span>Agrisense Predicted Fair Price:</span>
            <span>₹{listing.fairPriceRange.min}–₹{listing.fairPriceRange.max}/q</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-2xs text-charcoal-muted pt-2 border-t border-forest/20">
            <span>Regional Ref: ₹{listing.fairPriceRange.breakdown.regionalRef}</span>
            <span>Production Cost Base: ₹{listing.fairPriceRange.breakdown.productionCost}</span>
            <span>Quality Premium: +₹{listing.fairPriceRange.breakdown.qualityPremium}</span>
            <span>Organic Premium: +₹{listing.fairPriceRange.breakdown.organicPremium}</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-600 transition-all"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
