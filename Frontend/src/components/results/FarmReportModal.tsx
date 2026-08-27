/**
 * FarmReportModal — "Farm Decision Report" modal.
 *
 * Steps:
 *   preview    → user picks format and reviews what the report will contain
 *   generating → POST /reports/generate in progress (simulated by stub)
 *   ready      → success state with report metadata
 *   error      → generation failed, offer retry
 *
 * Integration: generateReport() in farmReportService.ts is the single
 * backend call point for POST /reports/generate.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, FileText, FileCode, Braces,
  Sprout, MapPin, CloudSun, BarChart3,
  TrendingUp, ShieldAlert, Sparkles, CheckCircle2,
  Download, ExternalLink, RefreshCw, Loader2,
  Clock, CalendarDays, ChevronRight, History,
  AlertCircle,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { generateReport } from "../../services/farmReportService";
import type {
  ReportFormat,
  ReportModalStep,
  ReportPreviewData,
  ReportGenerationResponse,
} from "../../types/farmReport";

// ── Format metadata ───────────────────────────────────────────────────────

interface FormatMeta {
  id: ReportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  ext: string;
}

const FORMATS: FormatMeta[] = [
  {
    id: "pdf",
    label: "PDF",
    description: "Printable, shareable document",
    icon: <FileText className="h-4 w-4" />,
    ext: ".pdf",
  },
  {
    id: "html",
    label: "HTML",
    description: "Web-viewable report",
    icon: <FileCode className="h-4 w-4" />,
    ext: ".html",
  },
  {
    id: "json",
    label: "JSON",
    description: "Machine-readable data",
    icon: <Braces className="h-4 w-4" />,
    ext: ".json",
  },
];

// ── Component ─────────────────────────────────────────────────────────────

interface FarmReportModalProps {
  open: boolean;
  onClose: () => void;
  predictionId: string;
  data: ReportPreviewData;
}

export function FarmReportModal({
  open,
  onClose,
  predictionId,
  data,
}: FarmReportModalProps) {
  const [step, setStep]     = useState<ReportModalStep>("preview");
  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [result, setResult] = useState<ReportGenerationResponse | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset state when modal reopens
  useEffect(() => {
    if (open) {
      setStep("preview");
      setFormat("pdf");
      setResult(null);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleGenerate = useCallback(async () => {
    setStep("generating");
    try {
      // ── BACKEND INTEGRATION POINT ──────────────────────────────────────
      const response = await generateReport({ prediction_id: predictionId, format });
      setResult(response);
      setStep("ready");
    } catch {
      setStep("error");
    }
  }, [predictionId, format]);

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{ backgroundColor: "rgba(15, 30, 20, 0.55)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div
        className={cn(
          "relative w-full sm:max-w-2xl max-h-[95dvh] overflow-y-auto",
          "bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl",
          "flex flex-col",
          "animate-slide-up"
        )}
      >
        {/* Close button */}
        <button
          type="button"
          aria-label="Close report modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-charcoal-muted/60 hover:bg-ivory-200 hover:text-charcoal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── Content switches by step ── */}
        {step === "preview"    && <PreviewStep    data={data} format={format} setFormat={setFormat} onGenerate={handleGenerate} onClose={onClose} />}
        {step === "generating" && <GeneratingStep format={format} />}
        {step === "ready"      && result && <ReadyStep data={data} format={format} result={result} onClose={onClose} onRetry={() => setStep("preview")} />}
        {step === "error"      && <ErrorStep onRetry={() => setStep("preview")} onClose={onClose} />}
      </div>
    </div>
  );
}

// ── STEP 1: Preview ───────────────────────────────────────────────────────

function PreviewStep({
  data, format, setFormat, onGenerate, onClose,
}: {
  data: ReportPreviewData;
  format: ReportFormat;
  setFormat: (f: ReportFormat) => void;
  onGenerate: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col min-h-0">
      {/* Modal header */}
      <div className="px-6 pt-6 pb-4 border-b border-ivory-200 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/10 text-forest">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 id="report-modal-title" className="text-base font-bold text-charcoal leading-tight">
              Farm Decision Report
            </h2>
            <p className="text-xs text-charcoal-muted">
              Create a detailed summary of your crop recommendation.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {/* Report preview (document-style) */}
        <div className="px-6 py-5 space-y-5">
          <p className="text-xs font-semibold text-charcoal-muted/60 uppercase tracking-widest">
            Report Contents
          </p>
          <ReportDocumentPreview data={data} />

          {/* Section checklist */}
          <div className="grid sm:grid-cols-2 gap-2 mt-1">
            {REPORT_SECTIONS.map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-xs text-charcoal-muted">
                <CheckCircle2 className="h-3.5 w-3.5 text-forest/60 shrink-0" />
                {s.label}
              </div>
            ))}
          </div>

          {/* Format picker */}
          <div className="space-y-2.5 pt-1">
            <p className="text-xs font-bold uppercase tracking-widest text-charcoal-muted/60">
              Report Format
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {FORMATS.map((f) => (
                <FormatCard
                  key={f.id}
                  meta={f}
                  selected={format === f.id}
                  onClick={() => setFormat(f.id)}
                />
              ))}
            </div>
          </div>

          {/* Previous reports note */}
          <div className="flex items-center gap-2 rounded-xl border border-ivory-200 bg-ivory-50 px-4 py-3 text-xs text-charcoal-muted">
            <History className="h-3.5 w-3.5 shrink-0 text-charcoal-muted/50" />
            <span>
              Previous reports will appear in{" "}
              <strong className="text-charcoal">History</strong> once the
              backend is connected.
            </span>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-6 py-4 border-t border-ivory-200 flex items-center justify-between gap-3 shrink-0 bg-ivory-50/50">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm font-medium text-charcoal shadow-sm hover:bg-ivory-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30"
        >
          Cancel
        </button>
        <button
          type="button"
          id="generate-report-btn"
          onClick={onGenerate}
          className="flex items-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 group"
        >
          <FileText className="h-4 w-4" />
          Generate Report
          <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// ── STEP 2: Generating ────────────────────────────────────────────────────

function GeneratingStep({ format }: { format: ReportFormat }) {
  const meta = FORMATS.find((f) => f.id === format)!;
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-6 py-16 text-center min-h-[360px]">
      {/* Animated icon */}
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-forest/8 text-forest animate-pulse">
          <FileText className="h-10 w-10" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-ivory-300 shadow-sm">
          <Loader2 className="h-4 w-4 text-forest animate-spin" />
        </div>
      </div>

      <div className="space-y-2 max-w-xs">
        <p className="text-base font-bold text-charcoal">
          Preparing your farm report…
        </p>
        <p className="text-sm text-charcoal-muted">
          Compiling recommendation data into a {meta.label} document.
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {[0, 200, 400].map((delay) => (
          <div
            key={delay}
            className="h-2 w-2 rounded-full bg-forest/40 animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── STEP 3: Ready ─────────────────────────────────────────────────────────

function ReadyStep({
  data, format, result, onClose, onRetry,
}: {
  data: ReportPreviewData;
  format: ReportFormat;
  result: ReportGenerationResponse;
  onClose: () => void;
  onRetry: () => void;
}) {
  const meta = FORMATS.find((f) => f.id === format)!;
  const createdDate = new Date(result.created_at);
  const reportName = `AgriSense_${data.crop}_${data.season}_Report${meta.ext}`;

  return (
    <div className="flex flex-col min-h-0">
      {/* Success header */}
      <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-forest/[0.04] to-ivory border-b border-ivory-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-white shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-forest/70">
              Report Ready
            </p>
            <h2 className="text-lg font-bold text-charcoal leading-tight">
              Your report is ready
            </h2>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
        {/* Report card */}
        <div className="rounded-2xl border border-ivory-300 bg-white shadow-card p-5 space-y-4">
          {/* File info */}
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest/8 text-forest border border-forest/10">
              {meta.icon}
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-bold text-charcoal truncate">{reportName}</p>
              <p className="text-xs text-charcoal-muted">
                {meta.label} format · {data.crop} recommendation
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-forest/8 border border-forest/15 px-2.5 py-1 text-2xs font-bold text-forest">
              <CheckCircle2 className="h-3 w-3" />
              Ready
            </span>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <MetaItem icon={<CalendarDays className="h-3.5 w-3.5" />} label="Generated">
              {createdDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </MetaItem>
            <MetaItem icon={<Clock className="h-3.5 w-3.5" />} label="Time">
              {createdDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </MetaItem>
            <MetaItem icon={<MapPin className="h-3.5 w-3.5" />} label="District">
              {data.district}
            </MetaItem>
            <MetaItem icon={<Sprout className="h-3.5 w-3.5" />} label="Crop">
              {data.crop}
            </MetaItem>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-ivory-100">
            <button
              type="button"
              id="report-view-btn"
              disabled
              title="Available once backend is connected"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white opacity-40 cursor-not-allowed"
            >
              <ExternalLink className="h-4 w-4" />
              View Report
            </button>
            <button
              type="button"
              id="report-download-btn"
              disabled
              title="Available once backend is connected"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm font-semibold text-charcoal opacity-40 cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>

          <p className="text-2xs text-charcoal-muted/50 text-center">
            View and Download will be enabled once{" "}
            <code className="font-mono text-forest/60">GET /reports/&#123;id&#125;</code> is connected.
          </p>
        </div>

        {/* Generate another */}
        <button
          type="button"
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-ivory-200 bg-white px-4 py-2.5 text-sm font-medium text-charcoal-muted hover:text-charcoal hover:border-ivory-300 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Generate another format
        </button>
      </div>

      <div className="px-6 py-4 border-t border-ivory-200 shrink-0 bg-ivory-50/50">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ── STEP 4: Error ─────────────────────────────────────────────────────────

function ErrorStep({ onRetry, onClose }: { onRetry: () => void; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-16 text-center min-h-[300px]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <AlertCircle className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <div className="space-y-1.5 max-w-xs">
        <p className="text-base font-bold text-charcoal">Report generation failed</p>
        <p className="text-sm text-charcoal-muted">
          Something went wrong while generating your report. Please try again.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm font-medium text-charcoal hover:bg-ivory-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          id="report-error-retry-btn"
          onClick={onRetry}
          className="flex items-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-600 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}

// ── Report document preview (in-modal) ───────────────────────────────────

function ReportDocumentPreview({ data }: { data: ReportPreviewData }) {
  return (
    <div className="rounded-2xl border border-ivory-300 bg-white shadow-card overflow-hidden">
      {/* Document header — mimics a real report header */}
      <div className="bg-forest px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sprout className="h-5 w-5 text-white/90" strokeWidth={1.5} />
          <div>
            <p className="text-2xs font-bold uppercase tracking-widest text-white/60">AgriSense</p>
            <p className="text-sm font-bold text-white">Farm Decision Report</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xs text-white/50">District</p>
          <p className="text-xs font-semibold text-white/90 max-w-[140px] truncate">{data.district}</p>
        </div>
      </div>

      {/* Document body */}
      <div className="p-4 space-y-3.5">
        {/* Farm info row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DocField label="Season" value={data.season} />
          <DocField label="Land Area" value={`${data.land_area_acres} acres`} />
          <DocField label="Date" value={new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
        </div>

        <DocDivider label="Recommended Crop" />

        {/* Recommended crop hero */}
        <div className="flex items-center gap-4 rounded-xl border border-forest/10 bg-forest/[0.03] px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest text-white shadow-sm">
            <Sprout className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-2xs text-charcoal-muted/60 font-semibold uppercase tracking-wider">Recommended</p>
            <p className="text-xl font-bold text-forest">{data.crop}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xs text-charcoal-muted/60 font-semibold uppercase tracking-wider">Suitability</p>
            <p className="text-lg font-bold text-charcoal">{data.suitability_score}<span className="text-sm text-charcoal-muted">/100</span></p>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-2">
          <ReportMetricCell
            icon={<TrendingUp className="h-3.5 w-3.5 text-forest" />}
            label="Predicted Yield"
            value={`${data.predicted_yield_t_per_ha} t/ha`}
          />
          <ReportMetricCell
            icon={<CloudSun className="h-3.5 w-3.5 text-blue-500" />}
            label="Weather"
            value={data.weather_compatibility}
          />
          <ReportMetricCell
            icon={<BarChart3 className="h-3.5 w-3.5 text-olive-600" />}
            label="History"
            value={data.historical_stability}
          />
        </div>

        <DocDivider label="Assessment" />

        {/* Remaining sections as chips */}
        <div className="flex flex-wrap gap-1.5">
          {["Risk Assessment", "Yield Trend", "Model Explanation", "Recommendations"].map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full border border-ivory-200 bg-ivory-100 px-2.5 py-1 text-2xs font-medium text-charcoal-muted"
            >
              <CheckCircle2 className="h-2.5 w-2.5 text-forest/50" />
              {s}
            </span>
          ))}
        </div>

        {/* Risk row */}
        <div className="flex items-center gap-2.5 rounded-xl border border-amber/20 bg-amber/[0.04] px-4 py-2.5">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <div>
            <p className="text-2xs font-bold text-charcoal-muted/60 uppercase tracking-wider">Yield Trend</p>
            <p className="text-xs font-semibold text-charcoal">{data.yield_trend}</p>
          </div>
        </div>

        {/* Model explanation note */}
        <div className="flex items-center gap-2.5 rounded-xl border border-forest/10 bg-forest/[0.03] px-4 py-2.5">
          <Sparkles className="h-4 w-4 text-forest/60 shrink-0" />
          <p className="text-2xs text-charcoal-muted leading-relaxed">
            Model explanation will include key feature contributions from{" "}
            <code className="font-mono text-forest/70">GET /predictions/&#123;id&#125;/explain</code>.
          </p>
        </div>
      </div>

      {/* Document footer */}
      <div className="border-t border-ivory-200 px-5 py-2.5 flex items-center justify-between">
        <p className="text-2xs text-charcoal-muted/40">AgriSense — Farm Intelligence Platform</p>
        <p className="text-2xs text-charcoal-muted/40">Page 1 of 1</p>
      </div>
    </div>
  );
}

// ── Format card ───────────────────────────────────────────────────────────

function FormatCard({
  meta, selected, onClick,
}: {
  meta: FormatMeta;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30",
        selected
          ? "border-forest/30 bg-forest/[0.04] shadow-sm"
          : "border-ivory-300 bg-white hover:border-forest/20 hover:bg-forest/[0.02]"
      )}
    >
      <span className={cn("transition-colors", selected ? "text-forest" : "text-charcoal-muted")}>
        {meta.icon}
      </span>
      <span className={cn("text-sm font-bold transition-colors", selected ? "text-forest" : "text-charcoal")}>
        {meta.label}
      </span>
      <span className="text-2xs text-charcoal-muted leading-tight">{meta.description}</span>
      {selected && (
        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-forest" />
      )}
    </button>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────

function DocField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-2xs font-bold uppercase tracking-wider text-charcoal-muted/50">{label}</p>
      <p className="text-xs font-semibold text-charcoal">{value}</p>
    </div>
  );
}

function DocDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1 bg-ivory-200" />
      <span className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/40">{label}</span>
      <div className="h-px flex-1 bg-ivory-200" />
    </div>
  );
}

function ReportMetricCell({
  icon, label, value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5 rounded-xl bg-ivory-50 border border-ivory-200 p-3">
      {icon}
      <p className="text-2xs font-bold text-charcoal-muted/60 uppercase tracking-wider leading-tight">{label}</p>
      <p className="text-xs font-bold text-charcoal">{value}</p>
    </div>
  );
}

function MetaItem({
  icon, label, children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-charcoal-muted">
      <span className="text-charcoal-muted/50">{icon}</span>
      <span className="text-charcoal-muted/60">{label}:</span>
      <span className="font-semibold text-charcoal truncate">{children}</span>
    </div>
  );
}

// ── Report sections list ──────────────────────────────────────────────────

const REPORT_SECTIONS = [
  { label: "Farm & district information" },
  { label: "Selected season" },
  { label: "Recommended crop & suitability" },
  { label: "Predicted yield & production" },
  { label: "Weather compatibility" },
  { label: "Historical performance" },
  { label: "Risk assessment" },
  { label: "Model explanation" },
  { label: "Alternative crops" },
  { label: "Recommendations" },
];
