import { Clock, ShieldCheck, CheckCircle2, RotateCcw, Lock } from "lucide-react";
import type { NegotiationTimelineItem } from "../../types/mandi";

interface NegotiationTimelineViewProps {
  timeline: NegotiationTimelineItem[];
}

export function NegotiationTimelineView({ timeline }: NegotiationTimelineViewProps) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="p-5 rounded-3xl bg-ivory-50 dark:bg-charcoal border border-ivory-300 dark:border-charcoal-light space-y-4">
      <div className="flex items-center justify-between border-b border-ivory-200 dark:border-charcoal-light pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-forest dark:text-emerald-400" />
          <h3 className="font-extrabold text-sm text-charcoal dark:text-ivory-100">
            📊 Negotiation Audit Timeline
          </h3>
        </div>
        <span className="text-3xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          DISPUTE PREVENTION RECORD
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-forest/30">
        {timeline.map((item, idx) => (
          <div key={item.id || idx} className="relative flex items-start gap-3 text-xs">
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-charcoal-dark border-2 border-forest flex items-center justify-center text-3xs font-bold text-forest">
              {idx + 1}
            </div>

            <div className="flex-1 p-3 rounded-2xl bg-white dark:bg-charcoal-dark border border-ivory-200 dark:border-charcoal-light space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-charcoal dark:text-ivory-100">
                  {item.actorName} ({item.actorRole})
                </span>
                <span className="text-3xs text-charcoal-muted">{item.timestamp}</span>
              </div>

              <div className="flex items-center justify-between text-2xs">
                <span className="font-semibold text-charcoal-muted">{item.note}</span>
                <span className="font-black text-forest dark:text-emerald-400">
                  ₹{item.pricePerQuintal}/q ({item.quantityQuintals} q)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
