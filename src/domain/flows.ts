import type {
  Liters,
  LitersPerHour,
  Watts,
  WattHours,
  CubicMetersPerHour,
} from "./units";

export interface WaterFlow {
  liters: Liters;
  source: string;
  sink: string;
}

export interface WaterFlowRate {
  litersPerHour: LitersPerHour;
  source: string;
  sink: string;
}

export interface HeatFlow {
  watts: Watts;
  source: string;
  sink: string;
}

export interface EnergyFlow {
  wattHours: WattHours;
  source: string;
  sink: string;
}

export interface AirFlow {
  cubicMetersPerHour: CubicMetersPerHour;
  source: string;
  sink: string;
}
