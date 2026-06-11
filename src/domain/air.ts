import type {
  Celsius,
  CubicMeters,
  CubicMetersPerHour,
  Percent,
  Ppm,
} from "./units";

export interface AirState {
  temperatureC: Celsius;
  relativeHumidityPct: Percent;
  absoluteHumidityGm3: number;
  airVolumeM3: CubicMeters;
  airExchangeM3PerHour: CubicMetersPerHour;
  co2Ppm?: Ppm;
}

export interface ExternalClimateCondition {
  hour: number;
  temperatureC: Celsius;
  relativeHumidityPct: Percent;
  solarGainWattsPerM2?: number;
}
