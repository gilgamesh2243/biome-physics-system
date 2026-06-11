import type { ExternalClimateCondition } from "./air";
import type { BiomassProfile } from "./biomass";
import type { ComputeLoadProfile } from "./compute";
import type { ControlAction, ControlPolicy } from "./control-policy";
import type { WaterReservoirState, ThermalReservoirState } from "./reservoirs";
import type { ThermalBounds } from "./thermal";
import type { BiomeState } from "./biome-state";
import type { Liters, CubicMeters } from "./units";

export interface BiomeProfile {
  id: string;
  name: string;

  airVolumeM3: CubicMeters;

  initialWater: WaterReservoirState;
  initialThermalReservoir: ThermalReservoirState;

  biomass: BiomassProfile;
  compute: ComputeLoadProfile;

  thermalBounds: ThermalBounds;

  waterCaptureLitersPerHour: Liters;
  passiveCondensationLitersPerHour: Liters;
  thermalControl: ThermalControlCapacity;
}

export interface BiomeSimulationInput {
  profile: BiomeProfile;
  climate: ExternalClimateCondition[];
  controlPolicy: ControlPolicy;
  hours: number;
}

export interface BiomeHourlyRecord {
  hourIndex: number;
  climateHour: number;
  state: BiomeState;
  actions: ControlAction[];
}

export interface BiomeSimulationResult {
  profileName: string;
  policyName: string;
  hourlyRecords: BiomeHourlyRecord[];

  totalWaterCapturedLiters: Liters;
  totalWaterConsumedLiters: Liters;
  finalStoredWaterLiters: Liters;

  maxTemperatureC: number;
  minTemperatureC: number;
  minRelativeHumidityPct: number;
  maxRelativeHumidityPct: number;

  computeUptimePct: number;
  plantStressHours: number;
  waterDeficitHours: number;
  heatSurplusHours: number;

  stabilityScore: number;
  totalHeatRejectedKwh?: number;
  totalHeatStoredKwh?: number;
}

export interface ThermalControlCapacity {
  maxHeatRejectionWatts: number;
  maxHeatStorageWatts: number;
  maxVentilationM3PerHour: number;
  emergencyHeatRejectionWatts?: number;
}
