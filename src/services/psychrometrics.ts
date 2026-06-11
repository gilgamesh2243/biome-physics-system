export function calculateAbsoluteHumidityGm3(input: {
  temperatureC: number;
  relativeHumidityPct: number;
}): number {
  const { temperatureC, relativeHumidityPct } = input;

  const saturationVaporPressureHpa =
    6.112 * Math.exp((17.67 * temperatureC) / (temperatureC + 243.5));

  const actualVaporPressureHpa =
    saturationVaporPressureHpa * (relativeHumidityPct / 100);

  return (2.1674 * actualVaporPressureHpa * 100) / (273.15 + temperatureC);
}

export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}
