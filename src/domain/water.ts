import type { Liters, LitersPerHour } from "./units";

export interface WaterDemandProfile {
  plantLitersPerHour: LitersPerHour;
  coolingLitersPerHour: LitersPerHour;
  serviceLitersPerHour: LitersPerHour;
}

export interface WaterLoopResult {
  storedLiters: Liters;
  capturedLiters: Liters;
  consumedLiters: Liters;
  evaporatedLiters: Liters;
  condensedLiters: Liters;
  overflowLiters: Liters;
  deficitLiters: Liters;
}
