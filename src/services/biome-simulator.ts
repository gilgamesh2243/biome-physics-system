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

    const initialCompute = calculateComputeLoad(input.profile.compute);

    const biomass = calculateBiomassState({ profile: input.profile.biomass, air });

    const actions = chooseControlActions({
      air,
      water,
      compute: initialCompute,
      policy: input.controlPolicy,
      thermalControl: input.profile.thermalControl,
    });

    function getRunWaterCaptureIntensity(actions: ControlAction[]): number {
      const action = actions.find((a) => a.type === "RUN_WATER_CAPTURE");
      return action?.type === "RUN_WATER_CAPTURE" ? action.intensityPct : 0;
    }

    function getVentAirflow(actions: ControlAction[]): number {
      const action = actions.find((a) => a.type === "VENT_AIR");
      return action?.type === "VENT_AIR" ? action.airflowM3PerHour : 0;
    }

    function getHeatRejectedWatts(actions: ControlAction[]): number {
      return actions.reduce((sum, action) => (action.type === "REJECT_HEAT" ? sum + action.watts : sum), 0);
    }

    function getHeatStoredWatts(actions: ControlAction[]): number {
      return actions.reduce((sum, action) => (action.type === "STORE_HEAT" ? sum + action.watts : sum), 0);
    }

    const captureIntensityPct = getRunWaterCaptureIntensity(actions);
    const captured = input.profile.waterCaptureLitersPerHour * (captureIntensityPct / 100);

    const ventAirflow = getVentAirflow(actions);

    const heatRejected = getHeatRejectedWatts(actions);

    const heatStored = getHeatStoredWatts(actions);

    // update thermal
    // If throttling requested, recompute compute load with reduced utilization
    function getThrottleTargetUtilization(actions: ControlAction[]): number | undefined {
      const act = actions.find((a) => a.type === "THROTTLE_COMPUTE");
      return act?.type === "THROTTLE_COMPUTE" ? act.targetUtilizationPct : undefined;
    }

    const throttleTarget = getThrottleTargetUtilization(actions);
    const compute =
      throttleTarget != null
        ? { ...calculateComputeLoad({ ...input.profile.compute, utilizationPct: throttleTarget }), throttlingRequired: true }
        : initialCompute;

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
      climateTemperatureC: climate.temperatureC,
      ambientExchangeCoefficientWattsPerC: 75,
    });

    thermalReservoir = newThermalReservoir;

    // update water reservoir
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
      waterCapturedLiters: captured,
      airVolumeM3: input.profile.airVolumeM3,
      nextTemperatureC: thermal.airTemperatureC,
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

  const resultBase = buildSimulationResult({
    profileName: input.profile.name,
    policyName: input.controlPolicy.name,
    records,
    policy: input.controlPolicy,
    waterCapacityLiters: input.profile.initialWater.capacityLiters,
  });

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
  policy: BiomeSimulationInput["controlPolicy"];
  waterCapacityLiters: number;
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
  const waterStorageValues = records.map((r) => r.state.water.storedLiters);
  const waterStorageMinLiters = Math.min(...waterStorageValues);
  const waterStorageMinPct = input.waterCapacityLiters > 0 ? (waterStorageMinLiters / input.waterCapacityLiters) * 100 : 0;

  const humidityWarningHours = records.filter(
    (r) => r.state.warnings.includes("LOW_HUMIDITY") || r.state.warnings.includes("HIGH_HUMIDITY")
  ).length;

  const temperatureWarningHours = records.filter(
    (r) => r.state.warnings.includes("LOW_TEMPERATURE") || r.state.warnings.includes("HIGH_TEMPERATURE")
  ).length;

  const maxTemperatureOvershootC = Math.max(
    0,
    ...records.map((r) => r.state.air.temperatureC - input.policy.maxTemperatureC)
  );

  const minHumidityUndershootPct = Math.max(
    0,
    ...records.map((r) => input.policy.minRelativeHumidityPct - r.state.air.relativeHumidityPct)
  );

  const maxHumidityOvershootPct = Math.max(
    0,
    ...records.map((r) => r.state.air.relativeHumidityPct - input.policy.maxRelativeHumidityPct)
  );

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
    stabilityScore: 0 as never,
    totalHeatRejectedKwh: records.reduce((sum, r) => sum + (r.state.thermal.heatRejectedWatts ?? 0), 0) / 1000,
    totalHeatStoredKwh: records.reduce((sum, r) => sum + (r.state.thermal.heatStoredWatts ?? 0), 0) / 1000,
    waterStorageMinLiters,
    waterStorageMinPct,
    maxTemperatureOvershootC,
    minHumidityUndershootPct,
    maxHumidityOvershootPct,
    humidityWarningHours,
    temperatureWarningHours,
  };
}
