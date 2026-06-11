import type { BiomeProfile } from "../domain/simulation";

export const smallExperimentalBiome: BiomeProfile = {
  id: "biome_small_experimental",
  name: "Small experimental biome",

  airVolumeM3: 300,

  initialWater: {
    storedLiters: 300,
    capacityLiters: 1000,
    capturedLitersThisHour: 0,
    consumedLitersThisHour: 0,
    evaporatedLitersThisHour: 0,
    condensedLitersThisHour: 0,
    deficitLiters: 0,
    overflowLiters: 0,
  },

  initialThermalReservoir: {
    storedWattHours: 0,
    capacityWattHours: 5000,
    heatAddedWattHours: 0,
    heatRemovedWattHours: 0,
    overflowWattHours: 0,
    deficitWattHours: 0,
  },

  biomass: {
    plantedAreaM2: 25,
    leafAreaIndex: 1.5,
    baseTranspirationLitersPerM2Hour: 0.04,
    idealTemperatureC: 26,
    idealRelativeHumidityPct: 65,
  },

  compute: {
    activeMachines: 4,
    wattsPerMachine: 250,
    utilizationPct: 60,
    coolingOverheadPct: 35,
  },

  thermalBounds: {
    minTemperatureC: 18,
    maxTemperatureC: 32,
    targetTemperatureC: 26,
  },

  waterCaptureLitersPerHour: 2,
  passiveCondensationLitersPerHour: 0.1,
};

export const computeGreenhouseBiome: BiomeProfile = {
  id: "biome_compute_greenhouse",
  name: "Compute greenhouse biome",

  airVolumeM3: 1200,

  initialWater: {
    storedLiters: 1200,
    capacityLiters: 5000,
    capturedLitersThisHour: 0,
    consumedLitersThisHour: 0,
    evaporatedLitersThisHour: 0,
    condensedLitersThisHour: 0,
    deficitLiters: 0,
    overflowLiters: 0,
  },

  initialThermalReservoir: {
    storedWattHours: 0,
    capacityWattHours: 30000,
    heatAddedWattHours: 0,
    heatRemovedWattHours: 0,
    overflowWattHours: 0,
    deficitWattHours: 0,
  },

  biomass: {
    plantedAreaM2: 100,
    leafAreaIndex: 2.2,
    baseTranspirationLitersPerM2Hour: 0.035,
    idealTemperatureC: 27,
    idealRelativeHumidityPct: 68,
  },

  compute: {
    activeMachines: 30,
    wattsPerMachine: 180,
    utilizationPct: 65,
    coolingOverheadPct: 40,
  },

  thermalBounds: {
    minTemperatureC: 18,
    maxTemperatureC: 33,
    targetTemperatureC: 27,
  },

  waterCaptureLitersPerHour: 8,
  passiveCondensationLitersPerHour: 0.5,
};
