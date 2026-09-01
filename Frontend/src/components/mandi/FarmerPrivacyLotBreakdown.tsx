import { useState } from "react";
import { ShieldCheck, Eye, EyeOff, CheckCircle2, Lock } from "lucide-react";
import type { FarmerContribution, UserRole } from "../../types/mandi";

interface FarmerPrivacyLotBreakdownProps {
  farmers: FarmerContribution[];
  userRole: UserRole;
}

export function FarmerPrivacyLotBreakdown({ farmers, userRole }: FarmerPrivacyLotBreakdownProps) {
  const [showInternalBreakdown, setShowInternalBreakdown] = useState(false);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-5">
      {/* Header with Privacy Protection Notice */}
      <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-4">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
            📦 Combined Supply Pool Lot Breakdown & Traceability
          </h3>
          <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-0.5">
            {userRole === "BUYER"
              ? "Buyer Privacy View: Summary statistics shown without exposing individual farmer identities."
              : "Farmer View: Your personal lot allocation and status are highlighted."}
          </p>
        </div>

        <button
          onClick={() => setShowInternalBreakdown(!showInternalBreakdown)}
          className="px-3 py-1.5 rounded-xl text-2xs font-extrabold bg-ivory-100 dark:bg-charcoal text-charcoal dark:text-ivory-200 border border-ivory-300 dark:border-charcoal-light hover:bg-ivory-200 transition-colors flex items-center gap-1.5"
        >
          {showInternalBreakdown ? (
            <>
              <EyeOff className="w-3.5 h-3.5" /> Hide Lot Breakdown
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" /> View Lot Breakdown
            </>
          )}
        </button>
      </div>

      {/* Aggregate Overview Card for Buyer (Prompt Section 26) */}
      {userRole === "BUYER" && !showInternalBreakdown && (
        <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              6 Verified Farmers (Combined 800 q)
            </span>
            <span className="text-3xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Privacy Guarded
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-3xs uppercase text-charcoal-muted block">Total Quantity:</span>
              <span className="font-black text-charcoal dark:text-ivory-100">800 Quintals</span>
            </div>
            <div>
              <span className="text-3xs uppercase text-charcoal-muted block">Average Grade:</span>
              <span className="font-extrabold text-emerald-600">Grade A (100%)</span>
            </div>
            <div>
              <span className="text-3xs uppercase text-charcoal-muted block">Moisture Range:</span>
              <span className="font-extrabold text-charcoal dark:text-ivory-100">11.4% – 12.0% (Avg 11.7%)</span>
            </div>
            <div>
              <span className="text-3xs uppercase text-charcoal-muted block">Region:</span>
              <span className="font-extrabold text-charcoal dark:text-ivory-100">Lucknow Belt, UP</span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Traceable Lot Breakdown Table/Cards */}
      {(showInternalBreakdown || userRole === "SELLER") && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmers.map((farmer, idx) => {
              const isCurrentUser = farmer.farmerId === "FARMER-UP-1042";

              return (
                <div
                  key={farmer.farmerId}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isCurrentUser
                      ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 shadow-sm ring-2 ring-amber/30"
                      : "bg-ivory-50 dark:bg-charcoal border-ivory-200 dark:border-charcoal-light"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xs font-mono font-bold text-charcoal-muted">
                      {farmer.lotId}
                    </span>
                    <span
                      className={`text-3xs font-extrabold px-2 py-0.5 rounded-full ${
                        farmer.confirmationStatus === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {farmer.confirmationStatus === "CONFIRMED" ? "✓ Confirmed" : "⏳ Pending"}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-charcoal dark:text-ivory-100 flex items-center gap-1.5">
                      {userRole === "BUYER"
                        ? `Contributor #${idx + 1} (${farmer.district})`
                        : farmer.displayName}
                      {isCurrentUser && (
                        <span className="text-3xs px-1.5 py-0.5 rounded bg-forest text-white font-extrabold">
                          YOUR SHARE
                        </span>
                      )}
                    </h4>
                    <span className="text-3xs text-charcoal-muted block mt-0.5">
                      District: {farmer.district} | Moisture: {farmer.moisturePercentage}%
                    </span>
                  </div>

                  <div className="pt-2 border-t border-ivory-200 dark:border-charcoal-light grid grid-cols-2 gap-2 text-2xs">
                    <div>
                      <span className="text-3xs text-charcoal-muted block">Quantity:</span>
                      <span className="font-black text-charcoal dark:text-ivory-100">
                        {farmer.quantityQuintals} q
                      </span>
                    </div>

                    <div>
                      <span className="text-3xs text-charcoal-muted block">Fair Price Range:</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                        ₹{farmer.fairPriceRangeMin}–₹{farmer.fairPriceRangeMax}
                      </span>
                    </div>

                    {farmer.acceptedPricePerQuintal && (
                      <div className="col-span-2 pt-1 border-t border-ivory-100 dark:border-charcoal-light flex items-center justify-between font-extrabold">
                        <span className="text-3xs text-charcoal-muted">Accepted Payout:</span>
                        <span className="text-forest dark:text-emerald-400">
                          ₹{farmer.paymentAllocationAmount.toLocaleString("en-IN")}{" "}
                          <span className="text-3xs text-charcoal-muted">
                            (@₹{farmer.acceptedPricePerQuintal}/q)
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
