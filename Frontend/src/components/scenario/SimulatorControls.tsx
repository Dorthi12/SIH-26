/**
 * SimulatorControls — the two-slider control panel for the scenario simulator.
 *
 * Contains:
 *   - Rainfall delta slider (–20% … +20%)
 *   - Temperature delta slider (–5°C … +5°C)
 *   - Reset button
 *   - Simulate CTA
 */

import { CloudRain, Thermometer, RefreshCw, PlayCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { ScenarioSlider } from "./ScenarioSlider";
import type { ScenarioControls, SimulatorStatus } from "../../types/scenario";

interface SimulatorControlsProps {
  controls: ScenarioControls;
  status: SimulatorStatus;
  onControlChange: (key: keyof ScenarioControls, value: number) => void;
  onReset: () => void;
  onSimulate: () => void;
}

export function SimulatorControls({
  controls,
  status,
  onControlChange,
  onReset,
  onSimulate,
}: SimulatorControlsProps) {
  const isLoading = status === "loading";
  const hasChanges =
    controls.rainfall_delta_pct !== 0 || controls.temperature_delta_c !== 0;

  return (
    <Card className="space-y-6">
      <CardHeader className="mb-0">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Scenario Controls</CardTitle>
          {hasChanges && (
            <button
              type="button"
              id="scenario-reset-btn"
              onClick={onReset}
              disabled={isLoading}
              aria-label="Reset scenario to defaults"
              className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 rounded-lg px-2 py-1 hover:bg-forest/[0.06] disabled:opacity-40 disabled:pointer-events-none"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
        <p className="text-sm text-charcoal-muted mt-1">
          Adjust the sliders to explore different weather scenarios.
        </p>
      </CardHeader>

      {/* Rainfall slider */}
      <div className="space-y-2">
        <ScenarioSlider
          id="rainfall-delta-slider"
          label="Rainfall Change"
          unit="%"
          value={controls.rainfall_delta_pct}
          min={-20}
          max={20}
          step={5}
          onChange={(v) => onControlChange("rainfall_delta_pct", v)}
          icon={<CloudRain className="h-4 w-4" />}
          positiveColor="text-forest-600"
          negativeColor="text-amber-600"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-ivory-300" />

      {/* Temperature slider */}
      <div className="space-y-2">
        <ScenarioSlider
          id="temperature-delta-slider"
          label="Temperature Change"
          unit="°C"
          value={controls.temperature_delta_c}
          min={-5}
          max={5}
          step={1}
          onChange={(v) => onControlChange("temperature_delta_c", v)}
          icon={<Thermometer className="h-4 w-4" />}
          positiveColor="text-amber-600"
          negativeColor="text-forest-600"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-ivory-300" />

      {/* CTA row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          id="simulate-scenario-btn"
          variant="primary"
          size="lg"
          className="w-full sm:flex-1 group"
          loading={isLoading}
          icon={
            !isLoading ? (
              <PlayCircle className="h-4 w-4" />
            ) : undefined
          }
          onClick={onSimulate}
          aria-busy={isLoading}
          aria-label="Simulate crop scenario with current settings"
        >
          {isLoading ? "Analysing scenario…" : "Simulate Scenario"}
        </Button>

        {!isLoading && (
          <button
            type="button"
            id="scenario-reset-btn-footer"
            onClick={onReset}
            disabled={!hasChanges}
            aria-label="Reset all scenario controls"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-ivory-300 bg-white px-4 py-2.5 text-sm font-medium text-charcoal-muted hover:text-forest hover:border-forest/30 hover:bg-forest/[0.04] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 disabled:opacity-40 disabled:pointer-events-none shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-center gap-3 py-2 animate-fade-in"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-forest/50 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <p className="text-xs text-charcoal-muted font-medium">
            Running scenario model…
          </p>
        </div>
      )}
    </Card>
  );
}
