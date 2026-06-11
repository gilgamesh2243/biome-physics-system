import type { Liters, Percent, Watts, CubicMetersPerHour } from "./units";

export type ControlAction =
  | { type: "RUN_WATER_CAPTURE"; intensityPct: Percent }
  | { type: "VENT_AIR"; airflowM3PerHour: CubicMetersPerHour }
  | { type: "IRRIGATE"; liters: Liters }
  | { type: "REJECT_HEAT"; watts: Watts }
  | { type: "STORE_HEAT"; watts: Watts }
  | { type: "THROTTLE_COMPUTE"; targetUtilizationPct: Percent }
  | { type: "NOOP" };

export interface ControlPolicy {
  id: string;
  name: string;

  targetTemperatureC: number;
  minTemperatureC: number;
  maxTemperatureC: number;

  minRelativeHumidityPct: Percent;
  maxRelativeHumidityPct: Percent;

  minWaterStorageLiters: Liters;
  maxWaterStorageLiters: Liters;

  allowComputeThrottle: boolean;
  allowVenting: boolean;
  allowHeatStorage: boolean;
  allowWaterCapture: boolean;
}
