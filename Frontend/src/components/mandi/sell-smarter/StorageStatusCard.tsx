import { useState } from "react";
import type { SellSmarterCropOption } from "../../../types/sellSmarter";
import { Warehouse, AlertTriangle, ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";

interface StorageStatusCardProps {
  crop: SellSmarterCropOption;
}

export function StorageStatusCard({ crop }: StorageStatusCardProps) {
  const [hasStorage, setHasStorage] = useState<boolean>(crop.storage.available);
  const storage = crop.storage;

  return (
    <div className="bg-white dark:bg-charcoal-dark p-6 rounded-3xl border border-ivory-300 dark:border-charcoal-light shadow-sm space-y-6">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 dark:border-charcoal-light pb-4">
        <div>
          <h3 className="font-black text-lg text-charcoal dark:text-ivory-100 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-forest dark:text-emerald-400" />
            <span>Your Storage Situation & Crop Profile</span>
          </h3>
          <p className="text-2xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
            Evaluate holding capacity and perishability risks before deciding to store or sell
          </p>
        </div>

        {/* Toggle Storage Available */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light shrink-0">
          <span className="text-3xs font-extrabold uppercase px-2 text-charcoal-muted dark:text-ivory-300">
            Storage Available?
          </span>
          <button
            onClick={() => setHasStorage(true)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              hasStorage
                ? "bg-forest text-white shadow-xs"
                : "text-charcoal-muted hover:text-charcoal"
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => setHasStorage(false)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              !hasStorage
                ? "bg-rose-600 text-white shadow-xs"
                : "text-charcoal-muted hover:text-charcoal"
            }`}
          >
            No
          </button>
        </div>
      </div>

      {hasStorage ? (
        /* YES STORAGE STATE */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Storage Capacity Metrics */}
          <div className="p-5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-4">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-charcoal dark:text-ivory-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Available Holding Capacity</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-0.5">
                <span className="text-3xs font-bold text-charcoal-muted dark:text-ivory-400 block uppercase">
                  Available Buffer
                </span>
                <span className="text-xl font-black text-forest dark:text-emerald-400 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber" />
                  {storage.availableDays} Days
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-0.5">
                <span className="text-3xs font-bold text-charcoal-muted dark:text-ivory-400 block uppercase">
                  Storage Cost
                </span>
                <span className="text-xl font-black text-charcoal dark:text-ivory-100">
                  ₹{storage.storageCostPerQPerDay}/q/day
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-0.5">
                <span className="text-3xs font-bold text-charcoal-muted dark:text-ivory-400 block uppercase">
                  Total Capacity
                </span>
                <span className="text-lg font-black text-charcoal dark:text-ivory-100">
                  {storage.capacityQuintals} q
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-0.5">
                <span className="text-3xs font-bold text-charcoal-muted dark:text-ivory-400 block uppercase">
                  Current Crop Used
                </span>
                <span className="text-lg font-black text-charcoal dark:text-ivory-100">
                  {crop.quantityQuintals} q
                </span>
              </div>
            </div>
          </div>

          {/* Crop Perishability Profile */}
          <div className="p-5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-4">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-charcoal dark:text-ivory-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest dark:text-emerald-400" />
              <span>Crop Storage Profile — {crop.cropName}</span>
            </h4>

            <div className="space-y-3 text-xs font-bold">
              <div className="flex justify-between py-1.5 border-b border-ivory-200 dark:border-charcoal-light">
                <span className="text-charcoal-muted dark:text-ivory-400">Shelf Life Category</span>
                <span className="text-charcoal dark:text-ivory-100 font-black">{storage.shelfLifeCategory}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-ivory-200 dark:border-charcoal-light">
                <span className="text-charcoal-muted dark:text-ivory-400">Storage Degradation Sensitivity</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">{storage.storageSensitivity}</span>
              </div>

              <div className="space-y-1">
                <span className="text-3xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400 block">
                  Recommended Storage Conditions
                </span>
                <p className="text-2xs font-semibold text-charcoal dark:text-ivory-200 p-2.5 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light">
                  {storage.recommendedStorageConditions}
                </p>
              </div>

              <p className="text-xs font-extrabold text-forest dark:text-emerald-400 pt-1">
                {storage.urgencyText}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* NO STORAGE WARNING STATE */
        <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800/60 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-600 text-white shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-base text-rose-900 dark:text-rose-200">
                ⚠️ No Farm Storage Available
              </h4>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                Lack of storage increases sales urgency to prevent post-harvest spoilage and quality grade downgrades.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-charcoal border border-rose-200 dark:border-rose-900/50 space-y-2">
            <span className="text-xs font-black text-charcoal dark:text-ivory-100 block">
              Considerations for immediate action:
            </span>
            <ul className="space-y-1.5 text-xs text-charcoal-muted dark:text-ivory-300 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Evaluate current direct buyer offers with immediate pickup options.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Check nearby regional buyer demand for same-day delivery.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Factor crop shelf life ({storage.shelfLifeCategory}) into decision urgency.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Confirm instant logistics availability to avoid loading bottlenecks.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
