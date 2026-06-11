import { floridaHumidDay } from "./climate-profiles";
import { smallExperimentalBiome } from "./biome-profiles";
import { conservativePolicy } from "./control-policies";
import { simulateBiome } from "../services/biome-simulator";
import { formatNumber, formatPct } from "./format-output";

const result = simulateBiome({
  profile: smallExperimentalBiome,
  climate: floridaHumidDay,
  controlPolicy: conservativePolicy,
  hours: 24 * 7,
});

console.log("");
console.log(`Biome: ${result.profileName}`);
console.log(`Policy: ${result.policyName}`);
console.log(`Hours simulated: ${result.hourlyRecords.length}`);
console.log("");
console.log(`Stability score: ${formatNumber(result.stabilityScore, 1)}`);
console.log(`Total water captured L: ${formatNumber(result.totalWaterCapturedLiters, 2)}`);
console.log(`Total water consumed L: ${formatNumber(result.totalWaterConsumedLiters, 2)}`);
console.log(`Final stored water L: ${formatNumber(result.finalStoredWaterLiters, 2)}`);
console.log(`Temperature range C: ${formatNumber(result.minTemperatureC, 1)} - ${formatNumber(result.maxTemperatureC, 1)}`);
console.log(`Humidity range %: ${formatNumber(result.minRelativeHumidityPct, 1)} - ${formatNumber(result.maxRelativeHumidityPct, 1)}`);
console.log(`Compute uptime: ${formatPct(result.computeUptimePct)}`);
console.log(`Plant stress hours: ${result.plantStressHours}`);
console.log(`Water deficit hours: ${result.waterDeficitHours}`);
console.log(`Heat surplus hours: ${result.heatSurplusHours}`);
console.log("");
