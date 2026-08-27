import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

interface RecommendationSummaryProps {
  cropName: string;
}

const REASONS = [
  "Highest predicted yield among evaluated candidates.",
  "Strong historical performance.",
  "Favorable weather compatibility in the demo context.",
  "Positive historical yield trend.",
] as const;

export function RecommendationSummary({ cropName }: RecommendationSummaryProps) {
  return (
    <div className="rounded-2xl border border-forest/15 bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-forest text-white">
        <p className="text-xs font-bold uppercase tracking-widest opacity-70">Recommendation Summary</p>
        <p className="text-xl font-bold mt-0.5">Why {cropName}?</p>
      </div>

      <div className="p-6 space-y-5">
        <ul className="space-y-3">
          {REASONS.map((reason, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5",
                i === 0 ? "bg-forest text-white" : "bg-ivory-200 text-charcoal-muted"
              )}>
                {i + 1}
              </span>
              <p className="text-sm text-charcoal leading-relaxed">{reason}</p>
            </li>
          ))}
        </ul>

        <div className="border-t border-ivory-200 pt-4">
          <div className="flex items-start gap-3">
            <Check className="h-4 w-4 text-forest shrink-0 mt-0.5" />
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Taken together, these signals support <strong className="text-charcoal">{cropName}</strong> as
              the current top-ranked option. This is decision-support guidance —{" "}
              <strong className="text-charcoal">not a guarantee</strong> that {cropName} will perform best
              under actual farm conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
