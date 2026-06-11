import type { BiomeSimulationResult } from "../domain/simulation";

export function calculateStabilityScore(result: Omit<BiomeSimulationResult, "stabilityScore">): number {
  const totalHours = Math.max(1, result.hourlyRecords.length);

  // Water-related penalties
  const waterDeficitPenalty = (result.waterDeficitHours / totalHours) * 30;
  const waterReservePenalty = Math.max(0, (20 - result.waterStorageMinPct) / 20) * 25; // up to 25 points if reserve drops below 20%

  // Temperature penalties
  const temperatureOvershootPenalty = Math.min(30, result.maxTemperatureOvershootC * 3); // ~3 points per °C overshoot
  const temperatureWarningPenalty = (result.temperatureWarningHours / totalHours) * 15;

  // Humidity penalties
  const humidityUndershootPenalty = Math.min(25, result.minHumidityUndershootPct * 1.4);
  const humidityOvershootPenalty = Math.min(10, result.maxHumidityOvershootPct * 0.5);
  const humidityWarningPenalty = (result.humidityWarningHours / totalHours) * 10;

  // Heat and plant stress
  const heatPenalty = (result.heatSurplusHours / totalHours) * 20;
  const plantPenalty = (result.plantStressHours / totalHours) * 25;

  // Compute uptime penalty (small)
  const computePenalty = (100 - result.computeUptimePct) * 0.2;

  const totalPenalty =
    waterDeficitPenalty +
    waterReservePenalty +
    temperatureOvershootPenalty +
    temperatureWarningPenalty +
    humidityUndershootPenalty +
    humidityOvershootPenalty +
    humidityWarningPenalty +
    heatPenalty +
    plantPenalty +
    computePenalty;

  const score = 100 - totalPenalty;

  return Math.max(0, Math.min(100, score));
}
