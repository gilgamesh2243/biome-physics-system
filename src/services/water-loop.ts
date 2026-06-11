import type { BiomassState } from "../domain/biomass";
import type { WaterReservoirState } from "../domain/reservoirs";
import type { Liters } from "../domain/units";

export function updateWaterReservoir(input: {
  previous: WaterReservoirState;
  capturedLiters: Liters;
  passiveCondensationLiters: Liters;
  biomass: BiomassState;
  coolingWaterLiters: Liters;
  serviceWaterLiters: Liters;
}): WaterReservoirState {
  const consumedLiters =
    input.biomass.waterDemandLitersPerHour +
    input.coolingWaterLiters +
    input.serviceWaterLiters;

  const totalIn = input.capturedLiters + input.passiveCondensationLiters;

  const rawStored = input.previous.storedLiters + totalIn - consumedLiters;

  const overflowLiters =
    rawStored > input.previous.capacityLiters
      ? rawStored - input.previous.capacityLiters
      : 0;

  const deficitLiters = rawStored < 0 ? Math.abs(rawStored) : 0;

  const storedLiters = Math.max(0, Math.min(input.previous.capacityLiters, rawStored));

  return {
    storedLiters,
    capacityLiters: input.previous.capacityLiters,
    capturedLitersThisHour: input.capturedLiters,
    consumedLitersThisHour: consumedLiters,
    evaporatedLitersThisHour: 0,
    condensedLitersThisHour: input.passiveCondensationLiters,
    deficitLiters,
    overflowLiters,
  };
}
