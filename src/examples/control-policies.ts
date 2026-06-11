import type { ControlPolicy } from "../domain/control-policy";

export const conservativePolicy: ControlPolicy = {
  id: "policy_conservative",
  name: "Conservative stability policy",

  targetTemperatureC: 26,
  minTemperatureC: 18,
  maxTemperatureC: 31,

  minRelativeHumidityPct: 45,
  maxRelativeHumidityPct: 85,

  minWaterStorageLiters: 100,
  maxWaterStorageLiters: 900,

  allowComputeThrottle: true,
  allowVenting: true,
  allowHeatStorage: true,
  allowWaterCapture: true,
};

export const aggressiveComputePolicy: ControlPolicy = {
  id: "policy_aggressive_compute",
  name: "Aggressive compute policy",

  targetTemperatureC: 28,
  minTemperatureC: 16,
  maxTemperatureC: 36,

  minRelativeHumidityPct: 35,
  maxRelativeHumidityPct: 90,

  minWaterStorageLiters: 50,
  maxWaterStorageLiters: 4800,

  allowComputeThrottle: false,
  allowVenting: true,
  allowHeatStorage: true,
  allowWaterCapture: true,
};

export const waterPreservationPolicy: ControlPolicy = {
  id: "policy_water_preservation",
  name: "Water preservation policy",

  targetTemperatureC: 27,
  minTemperatureC: 18,
  maxTemperatureC: 33,

  minRelativeHumidityPct: 40,
  maxRelativeHumidityPct: 88,

  minWaterStorageLiters: 500,
  maxWaterStorageLiters: 4500,

  allowComputeThrottle: true,
  allowVenting: false,
  allowHeatStorage: true,
  allowWaterCapture: true,
};
