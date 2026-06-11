import { arizonaDryDay } from "./climate-profiles";
import { computeGreenhouseBiome } from "./biome-profiles";
import {
  conservativePolicy,
  aggressiveComputePolicy,
  waterPreservationPolicy,
} from "./control-policies";
import { simulateBiome } from "../services/biome-simulator";
import { formatNumber, formatPct } from "./format-output";

const policies = [
  conservativePolicy,
  aggressiveComputePolicy,
  waterPreservationPolicy,
];

console.log("");
console.log("Control Policy Comparison");
console.log("Biome: Compute greenhouse biome");
console.log("Climate: Arizona dry day");
console.log("");
console.log(
  "Policy                         Score  Final Water L  Temp Max C  RH Min %  Compute Uptime  Plant Stress  Water Deficit  Heat Surplus  Heat Rejected kWh  Heat Stored kWh"
);
console.log(
  "-----------------------------------------------------------------------------------------------------------------------------"
);

for (const policy of policies) {
  const result = simulateBiome({
    profile: computeGreenhouseBiome,
    climate: arizonaDryDay,
    controlPolicy: policy,
    hours: 24 * 7,
  });

  console.log(
    [
      policy.name.padEnd(30),
      formatNumber(result.stabilityScore, 1).padStart(5),
      formatNumber(result.finalStoredWaterLiters, 2).padStart(14),
      formatNumber(result.maxTemperatureC, 1).padStart(11),
      formatNumber(result.minRelativeHumidityPct, 1).padStart(9),
      formatPct(result.computeUptimePct).padStart(15),
      String(result.plantStressHours).padStart(13),
      String(result.waterDeficitHours).padStart(14),
      String(result.heatSurplusHours).padStart(13),
      formatNumber(result.totalHeatRejectedKwh, 2).padStart(18),
      formatNumber(result.totalHeatStoredKwh, 2).padStart(16),
    ].join("  ")
  );
}
