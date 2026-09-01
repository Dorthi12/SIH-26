import { Building2, MapPin, Calendar, Briefcase, Award, Globe, Scale } from "lucide-react";
import type { BuyerProfile } from "../../types/mandi";

interface BusinessInformationProps {
  buyer: BuyerProfile;
}

export function BusinessInformation({ buyer }: BusinessInformationProps) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-ivory-200 dark:border-charcoal-light">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-charcoal dark:text-ivory-100">
              About This Buyer
            </h2>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400">
              Verified business metadata and operational parameters
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-2xs font-extrabold bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border border-blue-300">
          🏭 {buyer.buyerType}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <span className="text-3xs font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 block mb-1">
              Registered Business Name
            </span>
            <p className="font-extrabold text-sm text-charcoal dark:text-ivory-100">
              {buyer.businessName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-3xs font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 block mb-1">
                Buyer Category
              </span>
              <p className="font-bold text-charcoal dark:text-ivory-200 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                {buyer.buyerType}
              </p>
            </div>

            <div>
              <span className="text-3xs font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 block mb-1">
                Industry Line
              </span>
              <p className="font-bold text-charcoal dark:text-ivory-200">
                {buyer.industry}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-3xs font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 block mb-1">
                Primary Location
              </span>
              <p className="font-bold text-charcoal dark:text-ivory-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                {buyer.district}, {buyer.state}
              </p>
            </div>

            <div>
              <span className="text-3xs font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 block mb-1">
                Operating Since
              </span>
              <p className="font-bold text-charcoal dark:text-ivory-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                {buyer.operatingSinceYear || 2018} ({buyer.yearsActiveOnPlatform} Years on Agrisense)
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <span className="text-3xs font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 block mb-1">
              Typical Purchase Volume
            </span>
            <p className="font-extrabold text-sm text-forest dark:text-emerald-400 flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              {buyer.typicalOrderVolume}
            </p>
          </div>

          <div>
            <span className="text-3xs font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 block mb-1">
              Sourcing & Procurement Regions
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {buyer.operatingRegions.map((region) => (
                <span
                  key={region}
                  className="px-2.5 py-1 rounded-lg bg-ivory-100 dark:bg-charcoal text-charcoal dark:text-ivory-200 border border-ivory-300 dark:border-charcoal-light font-bold text-3xs"
                >
                  📍 {region}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-3xs font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 block mb-1">
              Business Overview
            </span>
            <p className="text-xs text-charcoal-muted dark:text-ivory-300 font-medium leading-relaxed bg-ivory-50 dark:bg-charcoal p-3.5 rounded-2xl border border-ivory-200 dark:border-charcoal-light">
              {buyer.aboutDescription ||
                "We purchase agricultural produce directly from verified farmers and producer groups for grain processing, flour milling, and regional distribution across North & Central India."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
