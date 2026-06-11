import type { LitersPerHour, Percent, SquareMeters } from "./units";

export interface BiomassProfile {
  plantedAreaM2: SquareMeters;
  leafAreaIndex: number;
  baseTranspirationLitersPerM2Hour: number;
  idealTemperatureC: number;
  idealRelativeHumidityPct: Percent;
}

export interface BiomassState {
  plantedAreaM2: SquareMeters;
  leafAreaIndex: number;
  transpirationLitersPerHour: LitersPerHour;
  waterDemandLitersPerHour: LitersPerHour;
  growthIndex: number;
  stressIndex: number;
}
