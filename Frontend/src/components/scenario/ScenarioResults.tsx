/**
 * ScenarioResults — comparison layout for Current vs. Scenario.
 *
 * Before a real simulation result exists: elegant placeholder state.
 * Structured to accept the ScenarioSimulation response from the backend.
 */

import { TrendingUp, TrendingDown, Minus, FlaskConical } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { cn } from "../../utils/cn";
import type {
  BasePrediction,
  ScenarioSimulation,
  ScenarioControls,
  SimulatorStatus,
} from "../../types/scenario";

interface ScenarioResultsProps {
  prediction: BasePrediction;
  controls: ScenarioControls;
  result: ScenarioSimulation | null;
  status: SimulatorStatus;
}

export function ScenarioResults({
  prediction,
  controls,
  result,
  status,
}: ScenarioResultsProps) {
  const hasResult = status === "result" && result !== null;
  const isLoading = status === "loading";

  return (
    <div className="space-y-6">
      {/* ── Comparison cards ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Current */}
        <ConditionCard
          label="Current"
          sublabel="Your base prediction"
          variant="current"
          yieldValue={prediction.predicted_yield_t_per_ha}
          suitability={prediction.suitability_score}
          riskLevel="Low"
          isLoading={false}
        />

        {/* Scenario */}
        <ConditionCard
          label="Scenario"
          sublabel={buildScenarioLabel(controls)}
          variant="scenario"
          yieldValue={hasResult ? result!.scenario.predicted_yield_t_per_ha : null}
          suitability={hasResult ? result!.scenario.suitability_score : null}
          riskLevel={hasResult ? result!.scenario.risk_level : null}
          isLoading={isLoading}
        />
      </div>

      {/* ── Delta row ── */}
      <Card className="space-y-4">
        <CardHeader className="mb-0">
          <CardTitle>Changes Under Scenario</CardTitle>
        </CardHeader>

        <div className="grid grid-cols-3 gap-3">
          <DeltaCell
            label="Yield Change"
            value={hasResult ? result!.deltas.yield_delta_t_per_ha : null}
            unit=" t/ha"
            formatSigned
            isLoading={isLoading}
          />
          <DeltaCell
            label="Suitability"
            value={hasResult ? result!.deltas.suitability_delta : null}
            unit=" pts"
            formatSigned
            isLoading={isLoading}
          />
          <DeltaCell
            label="Risk Change"
            value={hasResult ? (result!.deltas.risk_changed ? 1 : 0) : null}
            unit=""
            isLoading={isLoading}
            renderOverride={
              hasResult
                ? result!.deltas.risk_changed
                  ? () => (
                      <Badge variant="warning" size="md" dot>
                        Changed
                      </Badge>
                    )
                  : () => (
                      <Badge variant="success" size="md" dot>
                        Stable
                      </Badge>
                    )
                : undefined
            }
          />
        </div>
      </Card>

      {/* ── Scenario Summary ── */}
      <ScenarioSummary controls={controls} hasResult={hasResult} result={result} />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

interface ConditionCardProps {
  label: string;
  sublabel: string;
  variant: "current" | "scenario";
  yieldValue: number | null;
  suitability: number | null;
  riskLevel: "Low" | "Medium" | "High" | null;
  isLoading: boolean;
}

function ConditionCard({
  label,
  sublabel,
  variant,
  yieldValue,
  suitability,
  riskLevel,
  isLoading,
}: ConditionCardProps) {
  const isCurrent = variant === "current";

  return (
    <Card
      className={cn(
        "flex flex-col gap-4 relative overflow-hidden transition-all duration-300",
        isCurrent
          ? "border-forest/20 bg-forest/[0.02]"
          : "border-amber/20 bg-amber/[0.02]"
      )}
    >
      {/* Top badge */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-2xs font-bold uppercase tracking-widest",
            isCurrent ? "text-forest/70" : "text-amber-600/80"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isCurrent ? "bg-forest" : "bg-amber-400"
            )}
          />
          {label}
        </span>
        <span className="text-2xs text-charcoal-muted/60 font-medium">
          {sublabel}
        </span>
      </div>

      {/* Yield value */}
      <div>
        <p className="text-2xs font-semibold uppercase tracking-wider text-charcoal-muted/60 mb-1">
          Predicted Yield
        </p>
        {isLoading ? (
          <SkeletonLine wide />
        ) : yieldValue !== null ? (
          <p
            className={cn(
              "text-3xl font-bold tracking-tight tabular-nums animate-fade-in",
              isCurrent ? "text-charcoal" : "text-amber-700"
            )}
          >
            {yieldValue.toFixed(1)}
            <span className="text-base font-normal text-charcoal-muted ml-1">
              t/ha
            </span>
          </p>
        ) : (
          <PlaceholderDash />
        )}
      </div>

      {/* Suitability */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-charcoal-muted/60 mb-1">
            Suitability
          </p>
          {isLoading ? (
            <SkeletonLine />
          ) : suitability !== null ? (
            <p className="text-lg font-bold text-charcoal animate-fade-in tabular-nums">
              {suitability}%
            </p>
          ) : (
            <PlaceholderDash />
          )}
        </div>
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-charcoal-muted/60 mb-1">
            Risk Level
          </p>
          {isLoading ? (
            <SkeletonLine />
          ) : riskLevel !== null ? (
            <Badge
              variant={
                riskLevel === "Low"
                  ? "success"
                  : riskLevel === "Medium"
                  ? "warning"
                  : "danger"
              }
              size="sm"
              dot
            >
              {riskLevel}
            </Badge>
          ) : (
            <PlaceholderDash />
          )}
        </div>
      </div>
    </Card>
  );
}

interface DeltaCellProps {
  label: string;
  value: number | null;
  unit: string;
  formatSigned?: boolean;
  isLoading: boolean;
  renderOverride?: () => React.ReactNode;
}

function DeltaCell({
  label,
  value,
  unit,
  formatSigned,
  isLoading,
  renderOverride,
}: DeltaCellProps) {
  const isPositive = value !== null && value > 0;
  const isNegative = value !== null && value < 0;

  const Icon = isPositive
    ? TrendingUp
    : isNegative
    ? TrendingDown
    : Minus;

  const iconColor = isPositive
    ? "text-forest-600"
    : isNegative
    ? "text-red-500"
    : "text-charcoal-muted/50";

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-ivory-300 bg-white px-3 py-4 text-center">
      <p className="text-2xs font-bold uppercase tracking-widest text-charcoal-muted/60">
        {label}
      </p>

      {isLoading ? (
        <SkeletonLine />
      ) : value !== null ? (
        renderOverride ? (
          renderOverride()
        ) : (
          <div className={cn("flex items-center gap-1", iconColor)}>
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-base font-bold tabular-nums animate-fade-in">
              {formatSigned && value > 0 ? "+" : ""}
              {value.toFixed(1)}
              {unit}
            </span>
          </div>
        )
      ) : (
        <PlaceholderDash />
      )}
    </div>
  );
}

function ScenarioSummary({
  controls,
  hasResult,
  result: _result,
}: {
  controls: ScenarioControls;
  hasResult: boolean;
  result: ScenarioSimulation | null;
}) {
  const hasAnyChange =
    controls.rainfall_delta_pct !== 0 || controls.temperature_delta_c !== 0;

  return (
    <Card className="border-forest/10 bg-forest/[0.02] space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest/10">
          <FlaskConical className="h-4 w-4 text-forest" strokeWidth={1.75} />
        </div>
        <h3 className="text-sm font-semibold text-charcoal">Scenario Summary</h3>
      </div>

      {hasResult ? (
        /* ── TODO: when backend is connected, render a real narrative ──
           The backend response will contain enough data to build a sentence like:
           "With rainfall reduced by 15% and temperature increased by 2°C, the
            predicted yield changes from X to Y t/ha…"
        */
        <p className="text-sm text-charcoal-muted leading-relaxed animate-fade-in">
          {buildScenarioNarrative(controls)}
          {" "}
          Connect the backend to see the full predicted impact.
        </p>
      ) : hasAnyChange ? (
        <div className="space-y-2">
          <p className="text-sm text-charcoal-muted leading-relaxed">
            {buildScenarioNarrative(controls)}
          </p>
          <p className="text-xs text-charcoal-muted/60 italic">
            Click <strong>Simulate Scenario</strong> to see the predicted impact on your crop outlook.
          </p>
        </div>
      ) : (
        <p className="text-sm text-charcoal-muted/70 leading-relaxed italic">
          Adjust the rainfall or temperature controls above, then click{" "}
          <strong className="font-semibold text-charcoal-muted">
            Simulate Scenario
          </strong>{" "}
          to explore the impact on your crop outlook.
        </p>
      )}
    </Card>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function buildScenarioLabel(c: ScenarioControls): string {
  const parts: string[] = [];
  if (c.rainfall_delta_pct !== 0)
    parts.push(
      `${c.rainfall_delta_pct > 0 ? "+" : ""}${c.rainfall_delta_pct}% rainfall`
    );
  if (c.temperature_delta_c !== 0)
    parts.push(
      `${c.temperature_delta_c > 0 ? "+" : ""}${c.temperature_delta_c}°C temp`
    );
  return parts.length ? parts.join(", ") : "No change from baseline";
}

function buildScenarioNarrative(c: ScenarioControls): string {
  const rain = c.rainfall_delta_pct;
  const temp = c.temperature_delta_c;
  const parts: string[] = [];
  if (rain !== 0)
    parts.push(
      `rainfall ${rain > 0 ? "increased" : "reduced"} by ${Math.abs(rain)}%`
    );
  if (temp !== 0)
    parts.push(
      `temperature ${temp > 0 ? "increased" : "decreased"} by ${Math.abs(temp)}°C`
    );
  if (!parts.length) return "No changes have been applied to the baseline.";
  return `With ${parts.join(" and ")}, the predicted crop outlook may change significantly.`;
}

function PlaceholderDash() {
  return (
    <span className="text-lg font-bold text-charcoal-muted/30 select-none">
      —
    </span>
  );
}

function SkeletonLine({ wide = false }: { wide?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-6 rounded-lg skeleton-shimmer",
        wide ? "w-24" : "w-16"
      )}
    />
  );
}
