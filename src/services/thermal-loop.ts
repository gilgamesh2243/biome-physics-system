import type { ThermalReservoirState } from "../domain/reservoirs";
import type { ThermalBounds, ThermalState } from "../domain/thermal";
import type { WattHours, Watts } from "../domain/units";

export function updateThermalState(input: {
  previousThermalReservoir: ThermalReservoirState;
  thermalBounds: ThermalBounds;
  airTemperatureC: number;
  computeHeatWatts: Watts;
  solarGainWatts: Watts;
  biomassHeatWatts: Watts;
  heatRejectedWatts: Watts;
  heatStoredWatts: Watts;
  airVolumeM3: number;
}): { thermal: ThermalState; thermalReservoir: ThermalReservoirState } {
  const netWatts = input.computeHeatWatts + input.solarGainWatts + input.biomassHeatWatts - input.heatRejectedWatts - input.heatStoredWatts;

  const heatAddedWh = Math.max(0, netWatts) / 1; // per hour, 1 W => 1 Wh per hour
  const heatRemovedWh = Math.max(0, -netWatts) / 1;

  const rawThermalStorage = input.previousThermalReservoir.storedWattHours + heatAddedWh - heatRemovedWh;

  const overflowWattHours = rawThermalStorage > input.previousThermalReservoir.capacityWattHours ? rawThermalStorage - input.previousThermalReservoir.capacityWattHours : 0;
  const deficitWattHours = rawThermalStorage < 0 ? Math.abs(rawThermalStorage) : 0;

  const storedWattHours = Math.max(0, Math.min(input.previousThermalReservoir.capacityWattHours, rawThermalStorage));

  // naive temperature change: assume heat capacity proportional to air volume; tune factor
  const temperatureChangeC = netWatts / Math.max(1, input.airVolumeM3) / 100;
  const nextAirTemp = input.airTemperatureC + temperatureChangeC;

  const heatSurplusWatts = nextAirTemp > input.thermalBounds.maxTemperatureC ? netWatts : 0;
  const heatDeficitWatts = nextAirTemp < input.thermalBounds.minTemperatureC ? Math.abs(netWatts) : 0;

  const thermal: ThermalState = {
    airTemperatureC: nextAirTemp,
    targetTemperatureC: input.thermalBounds.targetTemperatureC,
    computeHeatWatts: input.computeHeatWatts,
    solarGainWatts: input.solarGainWatts,
    biomassHeatWatts: input.biomassHeatWatts,
    coolingRemovedWatts: input.heatRejectedWatts,
    heatRejectedWatts: input.heatRejectedWatts,
    heatStoredWatts: input.heatStoredWatts,
    thermalStorageWh: storedWattHours,
    heatSurplusWatts,
    heatDeficitWatts,
  };

  const thermalReservoir: ThermalReservoirState = {
    storedWattHours: storedWattHours,
    capacityWattHours: input.previousThermalReservoir.capacityWattHours,
    heatAddedWattHours: heatAddedWh,
    heatRemovedWattHours: heatRemovedWh,
    overflowWattHours,
    deficitWattHours,
  };

  return { thermal, thermalReservoir };
}
