import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { PageContainer }          from "../components/ui/PageContainer";
import { ProgressIndicator }      from "../components/recommendation/ProgressIndicator";
import { LocationStep }           from "../components/recommendation/LocationStep";
import { FarmAreaStep }           from "../components/recommendation/FarmAreaStep";
import { SeasonStep }             from "../components/recommendation/SeasonStep";

import { ReviewStep }             from "../components/recommendation/ReviewStep";
import { FarmContextPanel }       from "../components/recommendation/FarmContextPanel";
import { FormNavigation }         from "../components/recommendation/FormNavigation";

import { useRecommendation } from "../context/RecommendationContext";
import type { FarmerInput, Season } from "../types/farmer";
import {
  EMPTY_FORM,
  toAcres,
  type RecommendationFormData,
} from "../types/recommendationForm";

// ── Steps ─────────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { number: 1, label: "Location" },
  { number: 2, label: "Area"     },
  { number: 3, label: "Season"   },
  { number: 4, label: "Review"   },
];

// ── Validation per step ───────────────────────────────────────────────────

type StepErrors = Partial<Record<string, string>>;

function validateStep(step: number, form: RecommendationFormData): StepErrors {
  const errors: StepErrors = {};
  if (step === 1) {
    if (!form.district) errors.district = "Please select your district.";
    if (!form.state)    errors.state    = "State is required.";
  }
  if (step === 2) {
    if (!form.area)                                errors.area = "Please enter your farm area.";
    else if (parseFloat(form.area) <= 0)           errors.area = "Farm area must be greater than 0.";
  }
  if (step === 3) {
    if (!form.season) errors.season = "Please select a growing season.";
  }
  return errors;
}

function canAdvance(step: number, form: RecommendationFormData): boolean {
  return Object.keys(validateStep(step, form)).length === 0;
}

// ── Recommendation page ───────────────────────────────────────────────────

export function Recommendation() {
  const navigate = useNavigate();
  const { setFarmerInput, setStatus } = useRecommendation();

  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState<RecommendationFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<StepErrors>({});
  const [loading, setLoading] = useState(false);

  const patch = useCallback((update: Partial<RecommendationFormData>) => {
    setForm((prev) => ({ ...prev, ...update }));
    // Clear errors for updated keys
    if (Object.keys(update).length > 0) {
      setErrors((prev) => {
        const next = { ...prev };
        Object.keys(update).forEach((k) => delete next[k]);
        return next;
      });
    }
  }, []);

  const handleNext = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    // Step 4 is Review — submit on "Get Crop Recommendation"
    if (step === 4) {
      handleSubmit();
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  const handleEditStep = (targetStep: number) => {
    setErrors({});
    setStep(targetStep);
  };

  const handleSubmit = () => {
    setLoading(true);
    const input: FarmerInput = {
      district: form.district,
      season:   form.season as Season,
      land_area_acres: toAcres(form.area, form.areaUnit),
    };
    setFarmerInput(input);
    setStatus("loading");
    // Brief loading state for UX, then navigate
    setTimeout(() => navigate("/analyzing"), 600);
  };

  const isLastStep = step === 4;
  const advance    = canAdvance(step, form);

  return (
    <div className="min-h-screen bg-ivory">

      {/* ── Sticky step progress bar ── */}
      <div className="sticky top-16 z-30 bg-ivory dark:bg-[#101815] border-b border-ivory-300 dark:border-[#26362f] shadow-nav">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/50">Crop Recommendation</p>
            <span className="text-2xs font-bold text-forest">
              Step {step} of {WIZARD_STEPS.length} — {WIZARD_STEPS[step - 1]?.label}
            </span>
          </div>
          {/* Thin step progress */}
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            {WIZARD_STEPS.map((s) => (
              <div
                key={s.number}
                className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                  step > s.number
                    ? "bg-forest"
                    : step === s.number
                    ? "bg-forest/60"
                    : "bg-ivory-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <PageContainer maxWidth="xl" padded className="py-8 md:py-12 animate-fade-in">
        <div className="space-y-8">

          {/* ── Page header ── */}
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-forest/60">
              Get Your Crop Recommendation
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
              Tell us about your farm.
            </h1>
            <p className="text-base text-charcoal-muted leading-relaxed">
              Tell us about your farm and we'll evaluate the available crop options.
            </p>
          </div>

          {/* ── Progress indicator ── */}
          <div className="max-w-2xl mx-auto">
            <ProgressIndicator steps={WIZARD_STEPS} currentStep={step} />
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-6 xl:gap-8 items-start">

            {/* ── LEFT: Form card ── */}
            <div className="bg-white rounded-2xl border border-ivory-300 shadow-card p-5 md:p-8 space-y-6">
              {/* Step content */}
              {step === 1 && (
                <LocationStep
                  form={form}
                  errors={errors as Partial<Record<"district" | "state", string>>}
                  onChange={patch}
                />
              )}
              {step === 2 && (
                <FarmAreaStep
                  form={form}
                  errors={errors as Partial<Record<"area", string>>}
                  onChange={patch}
                />
              )}
              {step === 3 && (
                <SeasonStep
                  form={form}
                  errors={errors as Partial<Record<"season", string>>}
                  onChange={patch}
                />
              )}
              {step === 4 && (
                <ReviewStep
                  form={form}
                  onEdit={handleEditStep}
                />
              )}

              {/* Navigation */}
              <FormNavigation
                step={step}
                totalSteps={WIZARD_STEPS.length}
                canNext={isLastStep
                  ? canAdvance(1, form) && canAdvance(2, form) && canAdvance(3, form)
                  : advance}
                isLastStep={isLastStep}
                isLoading={loading}
                onBack={handleBack}
                onNext={handleNext}
              />
            </div>

            {/* ── RIGHT: Context panel (desktop only) ── */}
            <div className="hidden lg:block">
              <FarmContextPanel form={form} />
            </div>
          </div>

          {/* ── Mobile: Context panel below form (single render) ── */}
          <div className="lg:hidden">
            <FarmContextPanel form={form} />
          </div>

        </div>
      </PageContainer>
    </div>
  );
}
