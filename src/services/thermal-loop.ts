import type { ThermalReservoirState } from "../domain/reservoirs";
import type { ThermalBounds, ThermalState } from "../domain/thermal";
import type { WattHours, Watts } from "../domain/units";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

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
  climateTemperatureC?: number;
  ambientExchangeCoefficientWattsPerC?: number;
}): { thermal: ThermalState; thermalReservoir: ThermalReservoirState } {
  const climateTemperatureC = input.climateTemperatureC ?? input.airTemperatureC;
  const ambientExchangeCoefficientWattsPerC = input.ambientExchangeCoefficientWattsPerC ?? 50;

  const ambientExchangeWatts =
    (climateTemperatureC - input.airTemperatureC) * ambientExchangeCoefficientWattsPerC;

  const netWatts =
    input.computeHeatWatts +
    input.solarGainWatts +
    input.biomassHeatWatts +
    ambientExchangeWatts -
    input.heatRejectedWatts -
    input.heatStoredWatts;

  const heatAddedWh = Math.max(0, netWatts) / 1;
  const heatRemovedWh = Math.max(0, -netWatts) / 1;

  const rawThermalStorage =
    input.previousThermalReservoir.storedWattHours + heatAddedWh - heatRemovedWh;

  const overflowWattHours =
    rawThermalStorage > input.previousThermalReservoir.capacityWattHours
      ? rawThermalStorage - input.previousThermalReservoir.capacityWattHours
      : 0;
  const deficitWattHours = rawThermalStorage < 0 ? Math.abs(rawThermalStorage) : 0;

  const storedWattHours = Math.max(
    0,
    Math.min(input.previousThermalReservoir.capacityWattHours, rawThermalStorage)
  );

  // heat capacity: J per C (air ~ 1200 J/m3·K)
  const airHeatCapacityJPerC = Math.max(1, input.airVolumeM3) * 1200;
  const unclampedDeltaC = (netWatts * 3600) / airHeatCapacityJPerC; // W * s / J/C => C
  const deltaC = clamp(unclampedDeltaC, -5, 5);
  const nextAirTemp = input.airTemperatureC + deltaC;

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
