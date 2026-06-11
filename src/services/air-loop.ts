import type { AirState, ExternalClimateCondition } from "../domain/air";
import { calculateAbsoluteHumidityGm3, clampPercent } from "./psychrometrics";

export function updateAirState(input: {
  previous: AirState;
  climate: ExternalClimateCondition;
  ventAirflowM3PerHour: number;
  transpirationLitersPerHour: number;
  waterCaptureEfficiencyPct: number;
  airVolumeM3: number;
}): AirState {
  // ventilation mixes external air proportional to vent/volume
  const externalPull = Math.max(0, Math.min(1, input.ventAirflowM3PerHour / Math.max(1, input.airVolumeM3)));

  const externalTemp = input.climate.temperatureC;
  const externalRh = input.climate.relativeHumidityPct;

  const mixedTemp = input.previous.temperatureC * (1 - externalPull) + externalTemp * externalPull;

  // transpiration adds moisture; approximate: 1 liter water = 1000 g; distributed into air volume (gm3)
  const transpirationG = input.transpirationLitersPerHour * 1000 / Math.max(0.0001, input.airVolumeM3);

  // water capture removes a small fraction of moisture from air proportional to efficiency
  const captureRemovalG = (input.waterCaptureEfficiencyPct / 100) * transpirationG * 0.5;

  const prevAbs = input.previous.absoluteHumidityGm3;

  const nextAbs = Math.max(0, prevAbs * (1 - externalPull) + (externalRh ? calculateAbsoluteHumidityGm3({ temperatureC: externalTemp, relativeHumidityPct: externalRh }) * externalPull : prevAbs) + transpirationG - captureRemovalG);

  // compute RH from absolute humidity approximation by invert via psychrometrics? We'll approximate by scaling
  const approxRh = clampPercent((nextAbs / Math.max(0.1, calculateAbsoluteHumidityGm3({ temperatureC: mixedTemp, relativeHumidityPct: 100 }))) * 100);

  return {
    temperatureC: mixedTemp,
    relativeHumidityPct: approxRh,
    absoluteHumidityGm3: nextAbs,
    airVolumeM3: input.previous.airVolumeM3,
    airExchangeM3PerHour: input.ventAirflowM3PerHour,
    co2Ppm: input.previous.co2Ppm,
  };
}
