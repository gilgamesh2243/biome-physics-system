import type { AirState } from "../domain/air";
import type { BiomassProfile, BiomassState } from "../domain/biomass";

export function calculateBiomassState(input: {
  profile: BiomassProfile;
  air: AirState;
}): BiomassState {
  const { profile, air } = input;

  const tempStress = Math.min(
    1,
    Math.abs(air.temperatureC - profile.idealTemperatureC) / 20
  );

  const humidityStress = Math.min(
    1,
    Math.abs(air.relativeHumidityPct - profile.idealRelativeHumidityPct) / 60
  );

  const stressIndex = Math.max(tempStress, humidityStress);

  const transpirationMultiplier = 1 + stressIndex * 0.75;

  const transpirationLitersPerHour =
    profile.plantedAreaM2 *
    profile.baseTranspirationLitersPerM2Hour *
    profile.leafAreaIndex *
    transpirationMultiplier;

  const growthIndex = Math.max(0, 1 - stressIndex);

  return {
    plantedAreaM2: profile.plantedAreaM2,
    leafAreaIndex: profile.leafAreaIndex,
    transpirationLitersPerHour,
    waterDemandLitersPerHour: transpirationLitersPerHour,
    growthIndex,
    stressIndex,
  };
}
