import { useState } from "react";
import {
  Truck,
  MapPin,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Calculator,
  Navigation,
  Scale,
} from "lucide-react";
import { logisticsService } from "../../services/logisticsService";
import type { PayerOption } from "../../types/mandi";
import { useMandi } from "../../context/MandiContext";

export function LogisticsMatchingView() {
  const { setActiveTab, showNotification } = useMandi();

  const [quantity, setQuantity] = useState<number>(250);
  const [farmerLocation, setFarmerLocation] = useState<string>("Lucknow, UP");
  const [buyerLocation, setBuyerLocation] = useState<string>("Kanpur, UP");
  const [distanceKm] = useState<number>(185);

  const [selectedOptionId, setSelectedOptionId] = useState<string>("OPT-A");
  const [payer, setPayer] = useState<PayerOption>("Buyer Pays");

  const [askingPricePerQuintal, setAskingPricePerQuintal] = useState<number>(2880);
  const [storageCost, setStorageCost] = useState<number>(5000);
  const [otherCharges, setOtherCharges] = useState<number>(2500);

  const logisticsEstimate = logisticsService.calculateEstimate(
    quantity,
    farmerLocation,
    buyerLocation,
    distanceKm,
    payer
  );

  const selectedOption =
    logisticsEstimate.transportOptions.find((opt) => opt.id === selectedOptionId) ||
    logisticsEstimate.transportOptions[0];

  const netRealization = logisticsService.calculateNetRealization(
    askingPricePerQuintal,
    quantity,
    selectedOption.estimatedCost,
    storageCost,
    otherCharges,
    payer
  );

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
    showNotification("Transport Option Updated!");
  };

  const handlePayerChange = (newPayer: PayerOption) => {
    setPayer(newPayer);
    showNotification(`Logistics Term set: ${newPayer}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-7 h-7 text-forest dark:text-emerald-400" />
            <h2 className="text-2xl font-black text-charcoal dark:text-ivory-100">
              🚚 Logistics & Route Matching
            </h2>
          </div>
          <p className="text-xs text-charcoal-muted dark:text-ivory-400 mt-1">
            Calculate accurate transit costs, select transport options, and evaluate expected net realization.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700/60 flex items-center gap-2 text-2xs font-extrabold text-blue-900 dark:text-blue-200">
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          <span>Distance: ~{distanceKm} km (Lucknow ➔ Kanpur)</span>
        </div>
      </div>

      {/* Main Grid: Logistics Estimate + Transport Options + Net Realization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Route Details & Cost Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Overview Header Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400">
                Route & Produce Details
              </h3>
              <span className="text-3xs font-mono px-2.5 py-1 rounded-full bg-ivory-100 dark:bg-charcoal font-bold text-charcoal dark:text-ivory-300">
                Estimated Transit (Not Guaranteed)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
                <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-forest" /> Pickup Origin
                </span>
                <span className="font-extrabold text-xs text-charcoal dark:text-ivory-100 block">
                  {farmerLocation}
                </span>
                <span className="text-3xs text-charcoal-muted">Verified Farmer Location</span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-1 text-forest dark:text-emerald-400 text-2xs font-extrabold">
                  <span>~{distanceKm} km</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
                <span className="text-3xs text-charcoal-muted mt-0.5">Approx. 4.5 Hours Transit</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-1">
                <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-600" /> Destination Hub
                </span>
                <span className="font-extrabold text-xs text-charcoal dark:text-ivory-100 block">
                  {buyerLocation}
                </span>
                <span className="text-3xs text-charcoal-muted">ABC Foods Processing Warehouse</span>
              </div>
            </div>
          </div>

          {/* Section 16: Transport Options Selector */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
              <Truck className="w-4 h-4 text-forest" /> Select Transport Mode
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {logisticsEstimate.transportOptions.map((option) => {
                const isSelected = option.id === selectedOptionId;
                return (
                  <div
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? "bg-forest/5 dark:bg-forest/20 border-forest dark:border-emerald-500 shadow-md ring-2 ring-forest/20"
                        : "bg-white dark:bg-charcoal-dark border-ivory-300 dark:border-charcoal-light hover:border-forest/50"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xs font-mono font-bold text-charcoal-muted">
                          {option.vehicleType}
                        </span>
                        {option.badgeText && (
                          <span className="text-3xs px-2 py-0.5 rounded-full font-extrabold bg-amber text-charcoal">
                            {option.badgeText}
                          </span>
                        )}
                      </div>

                      <h4 className="font-black text-sm text-charcoal dark:text-ivory-100 flex items-center gap-2">
                        <span>🚛 {option.title}</span>
                      </h4>

                      <div className="text-2xs text-charcoal-muted space-y-1">
                        <p>Capacity: <b className="text-charcoal dark:text-ivory-200">{option.capacityTonnes} Tonnes</b></p>
                        <p>Estimated Delivery: <b className="text-charcoal dark:text-ivory-200">{option.estimatedDays}</b></p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-ivory-200 dark:border-charcoal-light flex items-center justify-between">
                      <div>
                        <span className="text-2xs text-charcoal-muted block">Estimated Cost:</span>
                        <span className="text-lg font-black text-forest dark:text-emerald-400">
                          ₹{option.estimatedCost.toLocaleString("en-IN")}
                        </span>
                        <span className="text-3xs text-charcoal-muted block">
                          (~₹{option.costPerQuintal}/q)
                        </span>
                      </div>

                      <button
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-forest text-white shadow-xs"
                            : "bg-ivory-100 dark:bg-charcoal text-charcoal-muted"
                        }`}
                      >
                        {isSelected ? "Selected ✓" : "Select"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 15: Detailed Transport Cost Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-forest" /> Cost Breakdown ({selectedOption.title})
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                <span className="text-3xs uppercase font-bold text-charcoal-muted block">Base Freight</span>
                <span className="font-extrabold text-charcoal dark:text-ivory-100">
                  ₹{logisticsEstimate.breakdown.baseTransport.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                <span className="text-3xs uppercase font-bold text-charcoal-muted block">Distance Toll/Fuel</span>
                <span className="font-extrabold text-charcoal dark:text-ivory-100">
                  ₹{logisticsEstimate.breakdown.distanceAdjustment.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                <span className="text-3xs uppercase font-bold text-charcoal-muted block">Loading Fee</span>
                <span className="font-extrabold text-charcoal dark:text-ivory-100">
                  ₹{logisticsEstimate.breakdown.loading.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light">
                <span className="text-3xs uppercase font-bold text-charcoal-muted block">Unloading Fee</span>
                <span className="font-extrabold text-charcoal dark:text-ivory-100">
                  ₹{logisticsEstimate.breakdown.unloading.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-ivory-100 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light flex items-center justify-between text-xs">
              <span className="font-extrabold text-charcoal dark:text-ivory-100">
                Total Estimated Logistics Cost:
              </span>
              <span className="text-base font-black text-forest dark:text-emerald-400">
                ₹{selectedOption.estimatedCost.toLocaleString("en-IN")}{" "}
                <span className="text-2xs font-normal text-charcoal-muted">
                  (₹{Math.round((selectedOption.estimatedCost / quantity) * 10) / 10}/q)
                </span>
              </span>
            </div>
          </div>

          {/* Section 33: Multi-Village Pickup Route Visualizer */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
              📍 Suggested Multi-Village Aggregated Pickup Route
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {logisticsEstimate.pickupRouteStops?.map((stop, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="p-3 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-200 dark:border-charcoal-light space-y-0.5">
                    <span className="text-3xs font-extrabold text-forest dark:text-emerald-400 block">
                      Stop #{idx + 1}
                    </span>
                    <span className="font-bold text-xs text-charcoal dark:text-ivory-100">
                      {stop.village}
                    </span>
                    <span className="text-3xs text-charcoal-muted block">
                      {stop.farmerName} ({stop.quantity} q)
                    </span>
                  </div>
                  {idx < (logisticsEstimate.pickupRouteStops?.length || 0) - 1 && (
                    <ArrowRight className="w-4 h-4 text-charcoal-muted shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Structured Deal Term & Net Realization Card (Section 17, 18, 19) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Section 17: Who Pays for Transport Selector */}
          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-md space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Who Pays for Transport?
            </h3>
            <p className="text-3xs text-charcoal-muted">
              Select agreed deal term to compute net farmer realization.
            </p>

            <div className="space-y-2">
              {(["Buyer Pays", "Seller Pays", "Shared 50/50", "Included in Price", "Negotiable"] as PayerOption[]).map(
                (opt) => (
                  <button
                    key={opt}
                    onClick={() => handlePayerChange(opt)}
                    className={`w-full p-3 rounded-2xl text-xs font-extrabold text-left transition-all flex items-center justify-between border ${
                      payer === opt
                        ? "bg-forest text-white border-forest shadow-xs"
                        : "bg-ivory-50 dark:bg-charcoal text-charcoal dark:text-ivory-300 border-ivory-200 dark:border-charcoal-light hover:border-forest/40"
                    }`}
                  >
                    <span>{opt}</span>
                    {payer === opt && <CheckCircle2 className="w-4 h-4 text-amber" />}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Section 19: Net Realization Card */}
          <div className="p-6 rounded-3xl bg-[#0A3225] text-white border-2 border-emerald-600/40 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm uppercase tracking-wide text-white">
                  Expected Net Realization
                </h3>
              </div>
              <span className="text-3xs px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black shadow-xs">
                {payer}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-emerald-100/90 font-bold">Crop Asking Price:</span>
                <span className="font-black text-white">₹{askingPricePerQuintal}/q</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-emerald-100/90 font-bold">Produce Volume:</span>
                <span className="font-black text-white">× {quantity} q</span>
              </div>

              <div className="pt-2 border-t border-emerald-500/30 flex items-center justify-between font-bold">
                <span className="text-white">Gross Deal Value:</span>
                <span className="text-amber-300 font-black text-sm">₹{netRealization.grossValue.toLocaleString("en-IN")}</span>
              </div>

              <div className="pt-2 border-t border-emerald-500/30 space-y-1.5 text-2xs text-emerald-100 font-semibold">
                <div className="flex items-center justify-between">
                  <span>Transportation ({payer}):</span>
                  <span className={payer === "Seller Pays" || payer === "Shared 50/50" ? "text-rose-300 font-black" : "text-emerald-300 font-black"}>
                    {payer === "Seller Pays"
                      ? `- ₹${selectedOption.estimatedCost.toLocaleString("en-IN")}`
                      : payer === "Shared 50/50"
                      ? `- ₹${(selectedOption.estimatedCost / 2).toLocaleString("en-IN")}`
                      : "Paid by Buyer (₹0)"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Storage Fee:</span>
                  <span className="text-white font-bold">- ₹{storageCost.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Loading & Other Charges:</span>
                  <span className="text-white font-bold">- ₹{otherCharges.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Section 18: Impact comparison */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1.5 text-2xs mt-3">
                <div className="flex justify-between font-bold">
                  <span className="text-emerald-100">If Buyer Pays:</span>
                  <span className="text-emerald-300 font-black">Net: ₹{askingPricePerQuintal}/q</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-emerald-100">If Seller Pays:</span>
                  <span className="text-rose-300 font-black">
                    Net: ₹{askingPricePerQuintal - Math.round(selectedOption.estimatedCost / quantity)}/q
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-500/30 flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-wider text-emerald-100">
                  Expected Net Payout:
                </span>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400 block tracking-tight">
                    ₹{netRealization.expectedNetTotal.toLocaleString("en-IN")}
                  </span>
                  <span className="text-3xs font-mono text-emerald-200/90 font-bold">
                    (~₹{netRealization.expectedNetPerQuintal}/q net)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                showNotification("Logistics terms saved to active Smart Deal proposal!");
                setActiveTab("smart-deal");
              }}
              className="w-full py-3 rounded-xl font-black text-xs bg-amber-400 text-slate-950 hover:bg-amber-500 transition-colors shadow-md text-center"
            >
              Apply Logistics to Deal →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
