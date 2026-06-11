import type { BiomeSimulationResult } from "../domain/simulation";

export function calculateStabilityScore(result: Omit<BiomeSimulationResult, "stabilityScore">): number {
  const totalHours = Math.max(1, result.hourlyRecords.length);

  const waterPenalty = (result.waterDeficitHours / totalHours) * 35;
  const heatPenalty = (result.heatSurplusHours / totalHours) * 30;
  const plantPenalty = (result.plantStressHours / totalHours) * 20;
  const computePenalty = (100 - result.computeUptimePct) * 0.15;

  const score = 100 - waterPenalty - heatPenalty - plantPenalty - computePenalty;

  return Math.max(0, Math.min(100, score));
}
