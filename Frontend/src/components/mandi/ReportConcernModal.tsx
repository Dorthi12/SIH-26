import { useState } from "react";
import { AlertTriangle, X, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface ReportConcernModalProps {
  buyerName: string;
  onClose: () => void;
  onSubmitReport: (category: string, text: string) => void;
}

export function ReportConcernModal({ buyerName, onClose, onSubmitReport }: ReportConcernModalProps) {
  const { t } = useLanguage();
  const [category, setCategory] = useState<string>("Misleading requirement");
  const [detailsText, setDetailsText] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onSubmitReport(category, detailsText);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-charcoal-dark border border-ivory-300 dark:border-charcoal-light shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-ivory-200 dark:border-charcoal-light">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h3 className="font-black text-lg text-charcoal dark:text-ivory-100">
              Report a Concern
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-muted font-bold hover:bg-ivory-100 dark:hover:bg-charcoal"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-black text-base text-charcoal dark:text-ivory-100">
              Report Submitted
            </h4>
            <p className="text-xs text-charcoal-muted dark:text-ivory-400">
              Thank you. Your concern regarding <strong>{buyerName}</strong> has been logged for Agrisense Trust Desk review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-charcoal-muted dark:text-ivory-300 font-medium">
              Reporting buyer: <strong>{buyerName}</strong>
            </p>

            <div className="space-y-1.5">
              <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
                Select Concern Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal font-bold text-charcoal dark:text-ivory-100"
              >
                <option value="Excessive Land Control">Excessive Land Control (&gt;40% Land Control Violation)</option>
                <option value="Forced Crop Requirement">Forced Crop Requirement</option>
                <option value="Crop Rotation Violation">Crop Rotation Safeguard Violation</option>
                <option value="Contract Violation">Contract Violation</option>
                <option value="Stock/Hoarding Concern">Stock / Hoarding Concern</option>
                <option value="Market Manipulation">Market Manipulation</option>
                <option value="Buyer Misconduct">Buyer Misconduct</option>
                <option value="Payment issue">Payment issue / delay</option>
                <option value="Incorrect business information">Incorrect business information</option>
                <option value="Suspicious behaviour">Suspicious behaviour</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-charcoal dark:text-ivory-200 block">
                Describe Your Concern *
              </label>
              <textarea
                required
                rows={4}
                value={detailsText}
                onChange={(e) => setDetailsText(e.target.value)}
                placeholder="Describe your concern in detail..."
                className="w-full p-3 rounded-xl border border-ivory-300 dark:border-charcoal-light bg-white dark:bg-charcoal text-xs font-semibold text-charcoal dark:text-ivory-100"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-3xs text-amber-900 dark:text-amber-200 font-medium">
              Notice: Reports are handled by Agrisense platform moderators for quality audit purposes.
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-ivory-100 text-charcoal"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2 rounded-xl font-black text-xs bg-red-600 hover:bg-red-700 text-white shadow-md"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
