import type { Celsius, Watts, WattHours } from "./units";

export interface ThermalState {
  airTemperatureC: Celsius;
  targetTemperatureC: Celsius;

  computeHeatWatts: Watts;
  solarGainWatts: Watts;
  biomassHeatWatts: Watts;

  coolingRemovedWatts: Watts;
  heatRejectedWatts: Watts;
  heatStoredWatts: Watts;

  thermalStorageWh: WattHours;

  heatSurplusWatts: Watts;
  heatDeficitWatts: Watts;
}

export interface ThermalBounds {
  minTemperatureC: Celsius;
  maxTemperatureC: Celsius;
  targetTemperatureC: Celsius;
}
