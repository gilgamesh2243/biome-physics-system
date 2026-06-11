import type { Liters, WattHours } from "./units";

export interface WaterReservoirState {
  storedLiters: Liters;
  capacityLiters: Liters;
  capturedLitersThisHour: Liters;
  consumedLitersThisHour: Liters;
  evaporatedLitersThisHour: Liters;
  condensedLitersThisHour: Liters;
  deficitLiters: Liters;
  overflowLiters: Liters;
}

export interface ThermalReservoirState {
  storedWattHours: WattHours;
  capacityWattHours: WattHours;
  heatAddedWattHours: WattHours;
  heatRemovedWattHours: WattHours;
  overflowWattHours: WattHours;
  deficitWattHours: WattHours;
}
