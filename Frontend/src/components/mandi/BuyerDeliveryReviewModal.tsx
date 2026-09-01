import { useState } from "react";
import { X, FileCheck, CheckCircle2, AlertTriangle, Scale, Eye } from "lucide-react";
import type { DeliverySubmission } from "../../types/mandi";

interface BuyerDeliveryReviewModalProps {
  submission: DeliverySubmission;
  onClose: () => void;
  onConfirm: () => void;
  onRaiseIssue: () => void;
}

export function BuyerDeliveryReviewModal({
  submission,
  onClose,
  onConfirm,
  onRaiseIssue,
}: BuyerDeliveryReviewModalProps) {
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-charcoal dark:text-ivory-100">
                Delivery Verification & Review
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-ivory-400">
                Deal: <span className="font-mono text-forest dark:text-emerald-400">{submission.dealId}</span>
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

        {/* Delivery Details Card */}
        <div className="p-4 rounded-2xl bg-ivory-50 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
                Quantity Submitted:
              </span>
              <span className="font-black text-sm text-charcoal dark:text-ivory-100">
                {submission.quantityQuintals} q
              </span>
            </div>

            <div>
              <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
                Received at Warehouse:
              </span>
              <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                {submission.receivedQuantityQuintals || submission.quantityQuintals} q
              </span>
            </div>

            <div>
              <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
                Quality Grade:
              </span>
              <span className="font-bold text-charcoal dark:text-ivory-100">
                {submission.qualityGrade || "Grade A"}
              </span>
            </div>

            <div>
              <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
                Moisture Level:
              </span>
              <span className="font-bold text-charcoal dark:text-ivory-100 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-blue-500" />
                {submission.moisturePercentage || 11.8}%
              </span>
            </div>

            <div>
              <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
                Vehicle Reg Number:
              </span>
              <span className="font-mono text-2xs font-bold text-charcoal dark:text-ivory-100">
                {submission.vehicleNumber}
              </span>
            </div>

            <div>
              <span className="text-3xs uppercase font-bold text-charcoal-muted dark:text-ivory-400 block">
                Delivery Date:
              </span>
              <span className="font-bold text-2xs text-charcoal dark:text-ivory-100">
                {submission.deliveryDate}
              </span>
            </div>
          </div>

          {/* Submitted Evidence Checklist */}
          <div className="pt-2 border-t border-ivory-200 dark:border-charcoal-light space-y-2">
            <span className="text-3xs font-extrabold uppercase tracking-wider text-charcoal-muted dark:text-ivory-400 block">
              Submitted Documents & Evidence:
            </span>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light text-2xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Delivery Receipt ({submission.deliveryReceiptUrl})
              </span>
              <button
                onClick={() => setViewingDoc(submission.deliveryReceiptUrl || "Receipt")}
                className="text-forest dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3 h-3" /> View
              </button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light text-2xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Weighbridge Slip ({submission.weighbridgeReceiptUrl})
              </span>
              <button
                onClick={() => setViewingDoc(submission.weighbridgeReceiptUrl || "Weighbridge")}
                className="text-forest dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3 h-3" /> View
              </button>
            </div>
          </div>
        </div>

        {/* View Document Preview Modal Inline Overlay */}
        {viewingDoc && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between text-2xs font-bold text-amber-900 dark:text-amber-200">
            <span>📄 Viewing Document Preview: <b>{viewingDoc}</b> (Verified Mock Document)</span>
            <button
              onClick={() => setViewingDoc(null)}
              className="text-amber-800 hover:underline text-3xs font-extrabold"
            >
              Close Preview
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-ivory-200 dark:border-charcoal-light">
          <button
            type="button"
            onClick={onRaiseIssue}
            className="px-4 py-2.5 rounded-xl font-extrabold text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/60 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Raise Issue / Mismatch</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-md flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-amber" />
            <span>Confirm Delivery & Release Funds</span>
          </button>
        </div>
      </div>
    </div>
  );
}
