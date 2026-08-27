import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

interface IntelligenceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  route: string;
  accentClass?: string;  // subtle background treatment
  patternClass?: string; // SVG pattern class
}

export function IntelligenceCard({
  icon,
  title,
  description,
  ctaLabel,
  route,
  accentClass = "bg-forest/[0.03]",
}: IntelligenceCardProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(route)}
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border border-ivory-300 bg-white shadow-card p-5 md:p-6 text-left w-full overflow-hidden",
        "hover:shadow-card-hover hover:-translate-y-1 transition-all duration-250",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 focus-visible:ring-offset-2"
      )}
      aria-label={`${title} — ${ctaLabel}`}
    >
      {/* Subtle accent background */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none", accentClass)} />

      {/* Icon */}
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-forest/8 text-forest shadow-sm border border-forest/8 transition-all duration-200 group-hover:bg-forest group-hover:text-white group-hover:border-forest group-hover:shadow">
        {icon}
      </div>

      {/* Content */}
      <div className="relative flex-1 space-y-2">
        <h3 className="text-sm font-bold text-charcoal tracking-tight">{title}</h3>
        <p className="text-xs text-charcoal-muted leading-relaxed">{description}</p>
      </div>

      {/* CTA */}
      <div className="relative flex items-center gap-1.5 text-xs font-semibold text-forest">
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
      </div>
    </button>
  );
}
