import { describe, it, expect } from "vitest";
import { updateAirState } from "../src/services/air-loop";

describe("air-loop", () => {
  it("transpiration increases RH and capture decreases RH, venting pulls toward outside", () => {
    const prev = { temperatureC: 25, relativeHumidityPct: 50, absoluteHumidityGm3: 10, airVolumeM3: 100, airExchangeM3PerHour: 0 } as any;
    const climate = { hour: 0, temperatureC: 25, relativeHumidityPct: 40 } as any;
    const withTransp = updateAirState({ previous: prev, climate, ventAirflowM3PerHour: 0, transpirationLitersPerHour: 1, waterCaptureEfficiencyPct: 0, airVolumeM3: 100 });
    expect(withTransp.relativeHumidityPct).toBeGreaterThanOrEqual(prev.relativeHumidityPct);

    const withCapture = updateAirState({ previous: prev, climate, ventAirflowM3PerHour: 0, transpirationLitersPerHour: 1, waterCaptureEfficiencyPct: 100, airVolumeM3: 100 });
    expect(withCapture.relativeHumidityPct).toBeLessThanOrEqual(withTransp.relativeHumidityPct);

    const vented = updateAirState({ previous: prev, climate: { hour: 0, temperatureC: 10, relativeHumidityPct: 20 }, ventAirflowM3PerHour: 100, transpirationLitersPerHour: 0, waterCaptureEfficiencyPct: 0, airVolumeM3: 100 });
    expect(vented.temperatureC).toBeLessThan(prev.temperatureC);
    expect(vented.relativeHumidityPct).toBeGreaterThanOrEqual(0);
    expect(vented.relativeHumidityPct).toBeLessThanOrEqual(100);
  });
});
