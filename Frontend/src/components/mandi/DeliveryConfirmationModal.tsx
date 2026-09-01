import { useState } from "react";
import { X, Upload, Truck, FileCheck, CheckCircle2 } from "lucide-react";
import type { DeliverySubmission } from "../../types/mandi";

interface DeliveryConfirmationModalProps {
  dealId: string;
  defaultQuantity: number;
  onClose: () => void;
  onSubmit: (submission: DeliverySubmission) => void;
}

export function DeliveryConfirmationModal({
  dealId,
  defaultQuantity,
  onClose,
  onSubmit,
}: DeliveryConfirmationModalProps) {
  const [deliveryDate, setDeliveryDate] = useState("2026-10-15");
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [vehicleNumber, setVehicleNumber] = useState("UP-32-BZ-9410");
  const [pickupLocation, setPickupLocation] = useState("Haidergarh, Barabanki, UP");
  const [deliveryLocation, setDeliveryLocation] = useState("Kanpur Processing Plant, Kanpur, UP");
  const [deliveryReceiptName, setDeliveryReceiptName] = useState("Delivery_Receipt_AGR004821.pdf");
  const [weighbridgeSlipName, setWeighbridgeSlipName] = useState("Weighbridge_Slip_Kanpur_250Q.pdf");
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const submission: DeliverySubmission = {
        id: `DEL-${Date.now()}`,
        dealId,
        farmerId: "FARMER-UP-1042",
        deliveryDate,
        quantityQuintals: Number(quantity),
        vehicleNumber,
        pickupLocation,
        deliveryLocation,
        deliveryReceiptUrl: deliveryReceiptName,
        weighbridgeReceiptUrl: weighbridgeSlipName,
        photos: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop"],
        qualityGrade: "Grade A",
        moisturePercentage: 11.8,
        status: "SUBMITTED",
      };
      onSubmit(submission);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-charcoal dark:text-ivory-100">
                🚚 Delivery Submission
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-ivory-400">
                Deal: <span className="font-mono text-forest dark:text-emerald-400">{dealId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-ivory-200 dark:hover:bg-charcoal text-charcoal-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delivery Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-2xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400 mb-1">
                Quantity Delivered (Quintals)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal text-xs font-bold text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400 mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal text-xs font-bold text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-2xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400 mb-1">
              Vehicle Registration Number
            </label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal text-xs font-bold font-mono text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
              placeholder="e.g. UP-32-BZ-9410"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-2xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400 mb-1">
                Pickup Location
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal text-xs font-bold text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                required
              />
            </div>

            <div>
              <label className="block text-2xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400 mb-1">
                Destination Warehouse
              </label>
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal text-xs font-bold text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-forest"
                required
              />
            </div>
          </div>

          {/* Document Upload Simulation */}
          <div className="space-y-3 pt-2">
            <h4 className="text-2xs font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400">
              Attach Delivery Evidence & Documents
            </h4>

            <div className="p-3 rounded-2xl border border-dashed border-ivory-300 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-charcoal dark:text-ivory-100">Delivery Receipt:</span>
                <span className="font-mono text-charcoal-muted text-2xs">{deliveryReceiptName}</span>
              </div>
              <label className="px-3 py-1 rounded-xl text-3xs font-extrabold bg-ivory-200 dark:bg-charcoal-light text-charcoal dark:text-ivory-200 cursor-pointer hover:bg-ivory-300">
                <span>Upload</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setDeliveryReceiptName(e.target.files[0].name)}
                />
              </label>
            </div>

            <div className="p-3 rounded-2xl border border-dashed border-ivory-300 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-charcoal dark:text-ivory-100">Weighbridge Slip:</span>
                <span className="font-mono text-charcoal-muted text-2xs">{weighbridgeSlipName}</span>
              </div>
              <label className="px-3 py-1 rounded-xl text-3xs font-extrabold bg-ivory-200 dark:bg-charcoal-light text-charcoal dark:text-ivory-200 cursor-pointer hover:bg-ivory-300">
                <span>Upload</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setWeighbridgeSlipName(e.target.files[0].name)}
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-ivory-200 dark:border-charcoal-light">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-charcoal-muted dark:text-ivory-400 hover:bg-ivory-200 dark:hover:bg-charcoal"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-forest text-white hover:bg-forest-dark transition-colors shadow-md flex items-center gap-2"
            >
              {isUploading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-amber" />
                  <span>Submit Delivery Evidence</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
