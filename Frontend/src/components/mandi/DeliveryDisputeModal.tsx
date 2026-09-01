import { useState } from "react";
import { X, AlertTriangle, Send } from "lucide-react";

interface DeliveryDisputeModalProps {
  dealId: string;
  expectedQuantity: number;
  onClose: () => void;
  onSubmitDispute: (issueDetails: {
    issueType: string;
    expectedQuantity: number;
    receivedQuantity: number;
    details: string;
  }) => void;
}

export function DeliveryDisputeModal({
  dealId,
  expectedQuantity,
  onClose,
  onSubmitDispute,
}: DeliveryDisputeModalProps) {
  const [issueType, setIssueType] = useState("Quantity mismatch");
  const [receivedQuantity, setReceivedQuantity] = useState(expectedQuantity - 20);
  const [details, setDetails] = useState(
    "20 quintals short upon arrival at Kanpur warehouse weighbridge scale."
  );

  const issueOptions = [
    "Quantity mismatch",
    "Quality mismatch",
    "Damaged produce",
    "Moisture mismatch",
    "Late delivery",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitDispute({
      issueType,
      expectedQuantity,
      receivedQuantity: Number(receivedQuantity),
      details,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-rose-900 dark:text-rose-200">
                Report Delivery Issue
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-ivory-400">
                Deal: <span className="font-mono text-rose-700 dark:text-rose-400">{dealId}</span>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Issue Type Selector */}
          <div>
            <label className="block text-2xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400 mb-2">
              Issue Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {issueOptions.map((opt) => (
                <label
                  key={opt}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    issueType === opt
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200"
                      : "bg-ivory-50 dark:bg-charcoal border-ivory-300 dark:border-charcoal-light text-charcoal dark:text-ivory-300 hover:border-rose-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="issueType"
                    checked={issueType === opt}
                    onChange={() => setIssueType(opt)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Expected vs Received Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-2xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400 mb-1">
                Expected Quantity (q)
              </label>
              <input
                type="number"
                value={expectedQuantity}
                disabled
                className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-ivory-100 dark:bg-charcoal-dark font-mono text-xs font-bold text-charcoal-muted opacity-80"
              />
            </div>

            <div>
              <label className="block text-2xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400 mb-1">
                Actual Received Quantity (q)
              </label>
              <input
                type="number"
                value={receivedQuantity}
                onChange={(e) => setReceivedQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-700/60 bg-rose-50/50 dark:bg-rose-950/20 text-xs font-mono font-bold text-rose-900 dark:text-rose-200 focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
          </div>

          {/* Additional details */}
          <div>
            <label className="block text-2xs font-extrabold uppercase text-charcoal-muted dark:text-ivory-400 mb-1">
              Additional Details & Observations
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-ivory-50 dark:bg-charcoal text-xs text-charcoal dark:text-ivory-100 focus:ring-2 focus:ring-rose-500"
              placeholder="Describe moisture reading, bag count, or physical condition..."
              required
            />
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-3xs font-bold text-amber-900 dark:text-amber-200">
            ⚠ Note: Submitting this dispute will pause full automatic release for the affected lot. Payment status will change to <b>⚠ Dispute Under Review</b>.
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-ivory-200 dark:border-charcoal-light">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-charcoal-muted dark:text-ivory-400 hover:bg-ivory-200 dark:hover:bg-charcoal"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-md flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
