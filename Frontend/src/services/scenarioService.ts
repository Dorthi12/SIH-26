import type {
  ScenarioSimulationRequest,
  ScenarioSimulation,
} from "../types/scenario";

/**
 * Simulates a scenario.
 * Adjusts yield and suitability based on temperature and rainfall delta coefficients.
 */
export async function simulateScenario(
  request: ScenarioSimulationRequest
): Promise<ScenarioSimulation> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const baseYield = 3.4;
  const baseSuitability = 92;
  const baseRisk: "Low" | "Medium" | "High" = "Low";

  const rainfallDelta = request.rainfall_delta_pct ?? 0;
  const tempDelta = request.temperature_delta_c ?? 0;

  // Simple agricultural weather equations:
  // - Every +1 °C temperature reduces yield by 3.5%
  // - Every -1% rainfall reduces yield by 0.5%
  const tempFactor = 1 - (tempDelta * 0.035);
  const rainFactor = 1 + (rainfallDelta * 0.005);

  const scenarioYield = Math.max(0.1, baseYield * tempFactor * rainFactor);
  const scenarioSuitability = Math.max(0, Math.min(100, Math.round(baseSuitability * tempFactor * rainFactor)));

  let scenarioRisk: "Low" | "Medium" | "High" = "Low";
  if (scenarioSuitability < 60) scenarioRisk = "High";
  else if (scenarioSuitability < 80) scenarioRisk = "Medium";

  const yieldDelta = scenarioYield - baseYield;
  const yieldDeltaPct = (yieldDelta / baseYield) * 100;
  const suitabilityDelta = scenarioSuitability - baseSuitability;

  return {
    base: {
      predicted_yield_t_per_ha: baseYield,
      suitability_score: baseSuitability,
      risk_level: baseRisk,
    },
    scenario: {
      predicted_yield_t_per_ha: Math.round(scenarioYield * 100) / 100,
      suitability_score: scenarioSuitability,
      risk_level: scenarioRisk,
    },
    deltas: {
      yield_delta_t_per_ha: Math.round(yieldDelta * 100) / 100,
      yield_delta_pct: Math.round(yieldDeltaPct * 10) / 10,
      suitability_delta: suitabilityDelta,
      risk_changed: baseRisk !== scenarioRisk,
    },
  };
}
