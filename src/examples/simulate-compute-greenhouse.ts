import { floridaHumidDay, arizonaDryDay } from "./climate-profiles";
import { computeGreenhouseBiome } from "./biome-profiles";
import { aggressiveComputePolicy } from "./control-policies";
import { simulateBiome } from "../services/biome-simulator";
import { formatNumber, formatPct } from "./format-output";

for (const scenario of [
  { name: "Florida humid day", climate: floridaHumidDay },
  { name: "Arizona dry day", climate: arizonaDryDay },
]) {
  const result = simulateBiome({
    profile: computeGreenhouseBiome,
    climate: scenario.climate,
    controlPolicy: aggressiveComputePolicy,
    hours: 24 * 7,
  });

  console.log("");
  console.log(`Scenario: ${scenario.name}`);
  console.log(`Biome: ${result.profileName}`);
  console.log(`Policy: ${result.policyName}`);
  console.log(`Stability score: ${formatNumber(result.stabilityScore, 1)}`);
  console.log(`Water captured L: ${formatNumber(result.totalWaterCapturedLiters, 2)}`);
  console.log(`Water consumed L: ${formatNumber(result.totalWaterConsumedLiters, 2)}`);
  console.log(`Final stored water L: ${formatNumber(result.finalStoredWaterLiters, 2)}`);
  console.log(`Temp range C: ${formatNumber(result.minTemperatureC, 1)} - ${formatNumber(result.maxTemperatureC, 1)}`);
  console.log(`RH range %: ${formatNumber(result.minRelativeHumidityPct, 1)} - ${formatNumber(result.maxRelativeHumidityPct, 1)}`);
  console.log(`Compute uptime: ${formatPct(result.computeUptimePct)}`);
  console.log(`Plant stress hours: ${result.plantStressHours}`);
  console.log(`Water deficit hours: ${result.waterDeficitHours}`);
  console.log(`Heat surplus hours: ${result.heatSurplusHours}`);
}
