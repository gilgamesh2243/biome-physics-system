import { describe, it, expect } from "vitest";
import { updateAirState } from "../src/services/air-loop";

describe("air-loop", () => {
  it("transpiration increases absolute humidity and capture decreases it; venting mixes with outside", () => {
    const prev = { temperatureC: 25, relativeHumidityPct: 50, absoluteHumidityGm3: 8, airVolumeM3: 100, airExchangeM3PerHour: 0, co2Ppm: 400 } as any;
    const climate = { hour: 0, temperatureC: 25, relativeHumidityPct: 40 } as any;

    const withTransp = updateAirState({ previous: prev, climate, ventAirflowM3PerHour: 0, transpirationLitersPerHour: 1, waterCapturedLiters: 0, airVolumeM3: 100, nextTemperatureC: 25 });
    expect(withTransp.absoluteHumidityGm3).toBeGreaterThanOrEqual(prev.absoluteHumidityGm3);

    const withCapture = updateAirState({ previous: prev, climate, ventAirflowM3PerHour: 0, transpirationLitersPerHour: 1, waterCapturedLiters: 1, airVolumeM3: 100, nextTemperatureC: 25 });
    expect(withCapture.absoluteHumidityGm3).toBeLessThanOrEqual(withTransp.absoluteHumidityGm3);

    const vented = updateAirState({ previous: prev, climate: { hour: 0, temperatureC: 10, relativeHumidityPct: 20 }, ventAirflowM3PerHour: 100, transpirationLitersPerHour: 0, waterCapturedLiters: 0, airVolumeM3: 100, nextTemperatureC: 10 });
    expect(vented.temperatureC).toBeLessThan(prev.temperatureC);
    expect(vented.relativeHumidityPct).toBeGreaterThanOrEqual(0);
    expect(vented.relativeHumidityPct).toBeLessThanOrEqual(100);
  });
});
