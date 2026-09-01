import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  X,
  MapPin,
  Thermometer,
  Droplets,
  Calendar,
  Sprout,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Award,
  FlaskConical,
} from "lucide-react";

export interface TopProducerState {
  name: string;
  hindiName?: string;
  share: string;
  percentage: number;
}

export interface CropGuideItem {
  name: string;
  hindiName?: string;
  season: string;
  hindiSeason?: string;
  text: string;
  hindiText?: string;
  img: string;
  topStates: TopProducerState[];
  details: {
    climate: { temp: string; rainfall: string; note: string; noteHi?: string };
    soil: { type: string; ph: string; note: string; noteHi?: string };
    duration: { season: string; days: string; sowingWindow: string };
    yield: { average: string; optimal: string };
    fertilizer: { npk: string; advice: string; adviceHi?: string };
    pestControl: { commonPests: string; prevention: string; preventionHi?: string };
  };
}

interface CropDetailModalProps {
  crop: CropGuideItem | null;
  onClose: () => void;
}

export function CropDetailModal({ crop, onClose }: CropDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (crop) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [crop, onClose]);

  if (!crop) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-landing-border bg-landing-card shadow-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full bg-black/50 text-landing-ivory backdrop-blur-md transition-transform duration-200 hover:scale-105 hover:bg-black/75"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        {/* Hero Header */}
        <div className="relative h-48 w-full flex-shrink-0 sm:h-56">
          <img
            src={crop.img}
            alt={crop.name}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-landing-forest-deep via-landing-forest-deep/65 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 text-landing-ivory">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="rounded-full bg-landing-accent px-3 py-0.5 text-xs font-bold text-landing-forest-deep shadow-sm">
                {crop.season} {crop.hindiSeason ? `(${crop.hindiSeason})` : ""}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold drop-shadow-md sm:text-3xl flex items-baseline gap-2 flex-wrap">
              <span>{crop.name}</span>
              {crop.hindiName && (
                <span className="text-lg font-medium opacity-90 sm:text-xl">
                  ({crop.hindiName})
                </span>
              )}
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-landing-ivory/90 sm:text-sm leading-relaxed">
              {crop.text} {crop.hindiText ? `• ${crop.hindiText}` : ""}
            </p>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin">
          {/* Top 5 Producer States Section */}
          <div className="rounded-2xl border border-landing-border bg-landing-secondary/20 p-4.5">
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="flex size-8 items-center justify-center rounded-xl bg-landing-primary/10 text-landing-primary">
                <Award className="size-4.5" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-landing-fg sm:text-base">
                    Top 5 Producer States in India
                  </h3>
                  <span className="text-[0.7rem] font-semibold text-landing-terracotta bg-landing-terracotta/10 px-2 py-0.5 rounded-full">
                    भारत के शीर्ष 5 उत्पादक राज्य
                  </span>
                </div>
                <p className="text-xs text-landing-fg-muted mt-0.5">
                  Major contributing states for {crop.name} cultivation
                </p>
              </div>
            </div>

            <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {crop.topStates.map((st, idx) => {
                const rankColor =
                  idx === 0
                    ? "bg-amber-500 text-white"
                    : idx === 1
                    ? "bg-slate-400 text-white"
                    : idx === 2
                    ? "bg-amber-700 text-white"
                    : "bg-landing-primary/20 text-landing-primary";

                return (
                  <div
                    key={st.name}
                    className="flex flex-col justify-between rounded-xl border border-landing-border bg-landing-card p-3 shadow-sm transition-all hover:border-landing-primary/40 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className={`flex size-5.5 items-center justify-center rounded-full text-[0.7rem] font-bold ${rankColor}`}
                      >
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-landing-primary">
                        {st.share}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-bold text-landing-fg line-clamp-1">
                        {st.name}
                      </p>
                      {st.hindiName && (
                        <p className="text-[0.7rem] font-medium text-landing-fg-muted line-clamp-1">
                          {st.hindiName}
                        </p>
                      )}
                      {/* Share progress bar */}
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-landing-border/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-landing-primary transition-all duration-500"
                          style={{ width: `${Math.min(st.percentage * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Medium & Small Info Blocks Grid */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-landing-fg flex items-center gap-2">
                  <Sprout className="size-4.5 text-landing-primary" />
                  Agronomic Requirements & Details
                </h3>
                <span className="text-[0.7rem] font-semibold text-landing-terracotta bg-landing-terracotta/10 px-2 py-0.5 rounded-full">
                  कृषि संबंधी विवरण
                </span>
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Block 1: Climate & Temp */}
              <div className="flex flex-col justify-between rounded-2xl border border-landing-border bg-landing-card p-4 shadow-sm transition-all hover:border-landing-primary/30">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                      <Thermometer className="size-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[0.7rem] font-semibold uppercase tracking-wider text-landing-fg-muted">
                        Climate & Temp / जलवायु-तापमान
                      </h4>
                      <p className="text-sm font-extrabold text-landing-fg">
                        {crop.details.climate.temp}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-landing-border/60 text-xs text-landing-fg-muted space-y-1.5">
                    <p className="flex items-center gap-1.5 font-semibold text-landing-fg text-xs">
                      <Droplets className="size-3.5 text-blue-500" />
                      Rainfall (वर्षा): {crop.details.climate.rainfall}
                    </p>
                    <p className="text-[0.75rem] leading-relaxed text-landing-fg-muted">
                      {crop.details.climate.note}
                    </p>
                  </div>
                </div>
                {crop.details.climate.noteHi && (
                  <div className="mt-2.5 rounded-lg bg-landing-secondary/30 p-2 text-[0.725rem] leading-relaxed text-landing-fg/90">
                    <span className="font-semibold text-landing-terracotta">हिंदी: </span>
                    {crop.details.climate.noteHi}
                  </div>
                )}
              </div>

              {/* Block 2: Soil Requirements */}
              <div className="flex flex-col justify-between rounded-2xl border border-landing-border bg-landing-card p-4 shadow-sm transition-all hover:border-landing-primary/30">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                      <MapPin className="size-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[0.7rem] font-semibold uppercase tracking-wider text-landing-fg-muted">
                        Soil & pH / मिट्टी और पीएच
                      </h4>
                      <p className="text-sm font-extrabold text-landing-fg">
                        pH {crop.details.soil.ph}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-landing-border/60 text-xs text-landing-fg-muted space-y-1.5">
                    <p className="font-semibold text-landing-fg text-xs">
                      Type: {crop.details.soil.type}
                    </p>
                    <p className="text-[0.75rem] leading-relaxed text-landing-fg-muted">
                      {crop.details.soil.note}
                    </p>
                  </div>
                </div>
                {crop.details.soil.noteHi && (
                  <div className="mt-2.5 rounded-lg bg-landing-secondary/30 p-2 text-[0.725rem] leading-relaxed text-landing-fg/90">
                    <span className="font-semibold text-landing-terracotta">हिंदी: </span>
                    {crop.details.soil.noteHi}
                  </div>
                )}
              </div>

              {/* Block 3: Season & Duration */}
              <div className="flex flex-col justify-between rounded-2xl border border-landing-border bg-landing-card p-4 shadow-sm transition-all hover:border-landing-primary/30">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                      <Calendar className="size-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[0.7rem] font-semibold uppercase tracking-wider text-landing-fg-muted">
                        Season & Duration / समय
                      </h4>
                      <p className="text-sm font-extrabold text-landing-fg">
                        {crop.details.duration.days}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-landing-border/60 text-xs text-landing-fg-muted space-y-1.5">
                    <p className="font-semibold text-landing-fg text-xs">
                      Sowing (बुवाई): {crop.details.duration.sowingWindow}
                    </p>
                    <p className="text-[0.75rem] leading-relaxed">
                      Season (मौसम): {crop.details.duration.season}
                    </p>
                  </div>
                </div>
              </div>

              {/* Block 4: Expected Yield */}
              <div className="flex flex-col justify-between rounded-2xl border border-landing-border bg-landing-card p-4 shadow-sm transition-all hover:border-landing-primary/30">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                      <TrendingUp className="size-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[0.7rem] font-semibold uppercase tracking-wider text-landing-fg-muted">
                        Expected Yield / अनुमानित उपज
                      </h4>
                      <p className="text-sm font-extrabold text-landing-fg">
                        {crop.details.yield.average}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-landing-border/60 text-xs text-landing-fg-muted space-y-1.5">
                    <p className="font-semibold text-landing-fg text-xs">
                      Optimal (अधिकतम): {crop.details.yield.optimal}
                    </p>
                    <p className="text-[0.75rem] leading-relaxed">
                      Depends on seeds & irrigation • बीज और सिंचाई पर निर्भर
                    </p>
                  </div>
                </div>
              </div>

              {/* Block 5: Fertilizer Plan */}
              <div className="flex flex-col justify-between rounded-2xl border border-landing-border bg-landing-card p-4 shadow-sm transition-all hover:border-landing-primary/30">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                      <FlaskConical className="size-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[0.7rem] font-semibold uppercase tracking-wider text-landing-fg-muted">
                        Nutrient / NPK Plan (उर्वरक)
                      </h4>
                      <p className="text-sm font-extrabold text-landing-fg">
                        {crop.details.fertilizer.npk}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-landing-border/60 text-xs text-landing-fg-muted space-y-1.5">
                    <p className="text-[0.75rem] leading-relaxed text-landing-fg-muted">
                      {crop.details.fertilizer.advice}
                    </p>
                  </div>
                </div>
                {crop.details.fertilizer.adviceHi && (
                  <div className="mt-2.5 rounded-lg bg-landing-secondary/30 p-2 text-[0.725rem] leading-relaxed text-landing-fg/90">
                    <span className="font-semibold text-landing-terracotta">हिंदी: </span>
                    {crop.details.fertilizer.adviceHi}
                  </div>
                )}
              </div>

              {/* Block 6: Pest & Disease Protection */}
              <div className="flex flex-col justify-between rounded-2xl border border-landing-border bg-landing-card p-4 shadow-sm transition-all hover:border-landing-primary/30">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                      <ShieldAlert className="size-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[0.7rem] font-semibold uppercase tracking-wider text-landing-fg-muted">
                        Pest Protection / कीट सुरक्षा
                      </h4>
                      <p className="text-xs font-bold text-landing-fg leading-tight">
                        {crop.details.pestControl.commonPests}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-landing-border/60 text-xs text-landing-fg-muted space-y-1.5">
                    <p className="text-[0.75rem] leading-relaxed text-landing-fg-muted">
                      {crop.details.pestControl.prevention}
                    </p>
                  </div>
                </div>
                {crop.details.pestControl.preventionHi && (
                  <div className="mt-2.5 rounded-lg bg-landing-secondary/30 p-2 text-[0.725rem] leading-relaxed text-landing-fg/90">
                    <span className="font-semibold text-landing-terracotta">हिंदी: </span>
                    {crop.details.pestControl.preventionHi}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-landing-border bg-landing-secondary/30 px-5 py-3.5">
          <button
            onClick={onClose}
            className="rounded-full border border-landing-border px-5 py-2 text-xs font-semibold text-landing-fg hover:bg-landing-card transition-colors"
          >
            Close / बंद करें
          </button>
          <Link
            to="/recommendation"
            className="inline-flex items-center gap-2 rounded-full bg-landing-primary px-5 py-2 text-xs sm:text-sm font-semibold text-landing-primary-fg shadow-landing-soft hover:bg-landing-forest-deep transition-all hover:-translate-y-0.5"
          >
            Get Personalized Advisory / व्यक्तिगत सलाह
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
