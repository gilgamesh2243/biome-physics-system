import type { AirState } from "../domain/air";
import type { BiomeState } from "../domain/biome-state";
import type { ControlAction } from "../domain/control-policy";
import type {
  BiomeHourlyRecord,
  BiomeSimulationInput,
  BiomeSimulationResult,
} from "../domain/simulation";
import type { BiomeWarning } from "../domain/warnings";
import { calculateAbsoluteHumidityGm3 } from "./psychrometrics";
import { calculateComputeLoad } from "./compute-loop";
import { calculateBiomassState } from "./biomass-loop";
import { updateWaterReservoir } from "./water-loop";
import { updateThermalState } from "./thermal-loop";
import { updateAirState } from "./air-loop";
import { chooseControlActions } from "./control-policy-engine";
import { calculateStabilityScore } from "./stability-score";

function validateSimulationInput(input: BiomeSimulationInput) {
  if (input.hours <= 0) throw new Error("hours must be positive");
}

export function simulateBiome(
  input: BiomeSimulationInput
): BiomeSimulationResult {
  validateSimulationInput(input);

  const records: BiomeHourlyRecord[] = [];

  let water = input.profile.initialWater;
  let thermalReservoir = input.profile.initialThermalReservoir;

  const firstClimate = input.climate[0];

  let air: AirState = {
    temperatureC: firstClimate.temperatureC,
    relativeHumidityPct: firstClimate.relativeHumidityPct,
    absoluteHumidityGm3: calculateAbsoluteHumidityGm3({
      temperatureC: firstClimate.temperatureC,
      relativeHumidityPct: firstClimate.relativeHumidityPct,
    }),
    airVolumeM3: input.profile.airVolumeM3,
    airExchangeM3PerHour: 0,
  };

  for (let hourIndex = 0; hourIndex < input.hours; hourIndex++) {
    const climate = input.climate[hourIndex % input.climate.length];

    const compute = calculateComputeLoad(input.profile.compute);

    const biomass = calculateBiomassState({ profile: input.profile.biomass, air });

    const actions = chooseControlActions({ air, water, compute, policy: input.controlPolicy });

    const captureIntensity = actions.find((a) => a.type === "RUN_WATER_CAPTURE") ? input.profile.waterCaptureLitersPerHour : 0;

    const ventAirflow = actions.find((a) => a.type === "VENT_AIR") ? (actions.find((a) => a.type === "VENT_AIR") as any).airflowM3PerHour : 0;

    const heatRejected = actions.filter((a) => a.type === "REJECT_HEAT").reduce((s, a) => s + (a.type === "REJECT_HEAT" ? a.watts : 0), 0);

    const heatStored = actions.filter((a) => a.type === "STORE_HEAT").reduce((s, a) => s + (a.type === "STORE_HEAT" ? a.watts : 0), 0);

    // update thermal
    const { thermal, thermalReservoir: newThermalReservoir } = updateThermalState({
      previousThermalReservoir: thermalReservoir,
      thermalBounds: input.profile.thermalBounds,
      airTemperatureC: air.temperatureC,
      computeHeatWatts: compute.heatOutputWatts,
      solarGainWatts: climate.solarGainWattsPerM2 ?? 0,
      biomassHeatWatts: 0,
      heatRejectedWatts: heatRejected,
      heatStoredWatts: heatStored,
      airVolumeM3: input.profile.airVolumeM3,
    });

    thermalReservoir = newThermalReservoir;

    // update water reservoir
    const captured = captureIntensity;

    const updatedWater = updateWaterReservoir({
      previous: water,
      capturedLiters: captured,
      passiveCondensationLiters: input.profile.passiveCondensationLitersPerHour,
      biomass,
      coolingWaterLiters: 0,
      serviceWaterLiters: 0,
    });

    water = updatedWater;

    // update air
    const nextAir = updateAirState({
      previous: air,
      climate,
      ventAirflowM3PerHour: ventAirflow,
      transpirationLitersPerHour: biomass.transpirationLitersPerHour,
      waterCaptureEfficiencyPct: captureIntensity > 0 ? 50 : 0,
      airVolumeM3: input.profile.airVolumeM3,
    });

    air = nextAir;

    const warnings = collectWarnings({
      air,
      water,
      thermal,
      biomass,
      actions,
      policy: input.controlPolicy,
    });

    const state: BiomeState = {
      hourIndex,
      air,
      water,
      thermal,
      thermalReservoir,
      biomass,
      compute,
      warnings,
    };

    records.push({ hourIndex, climateHour: climate.hour, state, actions });
  }

  const resultBase = buildSimulationResult({ profileName: input.profile.name, policyName: input.controlPolicy.name, records });

  const stabilityScore = calculateStabilityScore(resultBase as any);

  const result: BiomeSimulationResult = { ...resultBase, stabilityScore } as BiomeSimulationResult;

  return result;
}

function getRunWaterCaptureIntensity(actions: ControlAction[]): number {
  const action = actions.find((a) => a.type === "RUN_WATER_CAPTURE");
  return action?.type === "RUN_WATER_CAPTURE" ? action.intensityPct : 0;
}

function collectWarnings(input: {
  air: AirState;
  water: BiomeState["water"];
  thermal: BiomeState["thermal"];
  biomass: BiomeState["biomass"];
  actions: ControlAction[];
  policy: BiomeSimulationInput["controlPolicy"];
}): BiomeWarning[] {
  const warnings: BiomeWarning[] = [];

  if (input.water.deficitLiters > 0) warnings.push("WATER_DEFICIT");
  if (input.water.overflowLiters > 0) warnings.push("WATER_OVERFLOW");

  if (input.air.relativeHumidityPct < input.policy.minRelativeHumidityPct) {
    warnings.push("LOW_HUMIDITY");
  }

  if (input.air.relativeHumidityPct > input.policy.maxRelativeHumidityPct) {
    warnings.push("HIGH_HUMIDITY");
  }

  if (input.air.temperatureC < input.policy.minTemperatureC) {
    warnings.push("LOW_TEMPERATURE");
  }

  if (input.air.temperatureC > input.policy.maxTemperatureC) {
    warnings.push("HIGH_TEMPERATURE");
  }

  if (input.thermal.heatSurplusWatts > 0) warnings.push("HEAT_SURPLUS");
  if (input.thermal.heatDeficitWatts > 0) warnings.push("HEAT_DEFICIT");

  if (input.biomass.stressIndex > 0.65) warnings.push("PLANT_STRESS");

  if (input.actions.some((a) => a.type === "THROTTLE_COMPUTE")) {
    warnings.push("COMPUTE_THROTTLED");
  }

  return warnings;
}

function buildSimulationResult(input: {
  profileName: string;
  policyName: string;
  records: BiomeHourlyRecord[];
}) {
  const records = input.records;

  const totalWaterCapturedLiters = records.reduce(
    (sum, r) => sum + r.state.water.capturedLitersThisHour,
    0
  );

  const totalWaterConsumedLiters = records.reduce(
    (sum, r) => sum + r.state.water.consumedLitersThisHour,
    0
  );

  const finalStoredWaterLiters = records.at(-1)?.state.water.storedLiters ?? 0;

  const temperatures = records.map((r) => r.state.air.temperatureC);
  const humidities = records.map((r) => r.state.air.relativeHumidityPct);

  const maxTemperatureC = Math.max(...temperatures);
  const minTemperatureC = Math.min(...temperatures);
  const minRelativeHumidityPct = Math.min(...humidities);
  const maxRelativeHumidityPct = Math.max(...humidities);

  const plantStressHours = records.filter((r) => r.state.warnings.includes("PLANT_STRESS")).length;

  const waterDeficitHours = records.filter((r) => r.state.warnings.includes("WATER_DEFICIT")).length;

  const heatSurplusHours = records.filter((r) => r.state.warnings.includes("HEAT_SURPLUS")).length;

  const throttledHours = records.filter((r) => r.state.warnings.includes("COMPUTE_THROTTLED")).length;

  const computeUptimePct = ((records.length - throttledHours) / Math.max(1, records.length)) * 100;

  return {
    profileName: input.profileName,
    policyName: input.policyName,
    hourlyRecords: records,
    totalWaterCapturedLiters,
    totalWaterConsumedLiters,
    finalStoredWaterLiters,
    maxTemperatureC,
    minTemperatureC,
    minRelativeHumidityPct,
    maxRelativeHumidityPct,
    computeUptimePct,
    plantStressHours,
    waterDeficitHours,
    heatSurplusHours,
    stabilityScore: 0 as unknown as number,
  };
}
