import type { AirState, ExternalClimateCondition } from "../domain/air";
import { calculateAbsoluteHumidityGm3, clampPercent } from "./psychrometrics";

export function updateAirState(input: {
  previous: AirState;
  climate: ExternalClimateCondition;
  ventAirflowM3PerHour: number;
  transpirationLitersPerHour: number;
  waterCapturedLiters: number;
  airVolumeM3: number;
  nextTemperatureC: number;
}): AirState {
  const externalPull = Math.max(
    0,
    Math.min(1, input.ventAirflowM3PerHour / Math.max(1, input.airVolumeM3))
  );

  const externalAbs = calculateAbsoluteHumidityGm3({
    temperatureC: input.climate.temperatureC,
    relativeHumidityPct: input.climate.relativeHumidityPct,
  });

  const mixedAbs =
    input.previous.absoluteHumidityGm3 * (1 - externalPull) + externalAbs * externalPull;

  const transpirationAddedGm3 =
    (input.transpirationLitersPerHour * 1000) / Math.max(1, input.airVolumeM3);

  const captureRemovedGm3 =
    (input.waterCapturedLiters * 1000) / Math.max(1, input.airVolumeM3);

  const nextAbs = Math.max(0, mixedAbs + transpirationAddedGm3 - captureRemovedGm3);

  const saturationAbs = calculateAbsoluteHumidityGm3({
    temperatureC: input.nextTemperatureC,
    relativeHumidityPct: 100,
  });

  const relativeHumidityPct = clampPercent(
    saturationAbs > 0 ? (nextAbs / saturationAbs) * 100 : 0
  );

  return {
    temperatureC: input.nextTemperatureC,
    relativeHumidityPct,
    absoluteHumidityGm3: nextAbs,
    airVolumeM3: input.previous.airVolumeM3,
    airExchangeM3PerHour: input.ventAirflowM3PerHour,
    co2Ppm: input.previous.co2Ppm,
  };
}
