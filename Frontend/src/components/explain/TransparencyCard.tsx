import { ShieldCheck, TrendingUp, BarChart3, CloudSun, CheckCircle2 } from "lucide-react";

export function TransparencyCard() {
  return (
    <div className="rounded-2xl border border-ivory-300 bg-white shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-ivory-200 flex items-center gap-3 bg-ivory-50">
        <ShieldCheck className="h-5 w-5 text-forest shrink-0" />
        <p className="text-sm font-bold text-charcoal">Recommendation Transparency</p>
      </div>

      <div className="p-5 md:p-6 space-y-5">
        <p className="text-sm text-charcoal-muted leading-relaxed">
          This recommendation is decision-support guidance generated from model outputs and supporting
          agricultural signals. It does not guarantee future crop performance.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Primary */}
          <div className="rounded-xl border border-forest/15 bg-forest/[0.04] px-4 py-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-forest" />
              <p className="text-xs font-bold uppercase tracking-wider text-forest/70">Primary Signal</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-forest/60" />
              <p className="text-sm font-semibold text-charcoal">Predicted Yield</p>
            </div>
          </div>

          {/* Supporting */}
          <div className="rounded-xl border border-ivory-200 bg-white px-4 py-3.5 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-charcoal-muted/60">
              Supporting Signals
            </p>
            <ul className="space-y-1.5">
              {[
                { icon: <BarChart3 className="h-3.5 w-3.5" />, label: "Historical Performance" },
                { icon: <CloudSun className="h-3.5 w-3.5" />,  label: "Weather Conditions" },
                { icon: <TrendingUp className="h-3.5 w-3.5" />, label: "Yield Trend" },
              ].map((s) => (
                <li key={s.label} className="flex items-center gap-2 text-xs font-medium text-charcoal-light">
                  <span className="text-charcoal-muted/50">{s.icon}</span>
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
