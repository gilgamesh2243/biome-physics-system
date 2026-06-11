import { describe, it, expect } from "vitest";
import { calculateStabilityScore } from "../src/services/stability-score";

function baseFake(overrides: Partial<any> = {}) {
  const base = {
    profileName: "fake",
    policyName: "fake",
    hourlyRecords: new Array(168).fill(0),
    totalWaterCapturedLiters: 0,
    totalWaterConsumedLiters: 0,
    finalStoredWaterLiters: 100,
    maxTemperatureC: 25,
    minTemperatureC: 20,
    minRelativeHumidityPct: 40,
    maxRelativeHumidityPct: 60,
    computeUptimePct: 100,
    plantStressHours: 0,
    waterDeficitHours: 0,
    heatSurplusHours: 0,
    totalHeatRejectedKwh: 0,
    totalHeatStoredKwh: 0,
    waterStorageMinLiters: 100,
    waterStorageMinPct: 100,
    maxTemperatureOvershootC: 0,
    minHumidityUndershootPct: 0,
    maxHumidityOvershootPct: 0,
    humidityWarningHours: 0,
    temperatureWarningHours: 0,
  };
  return { ...base, ...overrides };
}

describe("stability-score", () => {
  it("is high when no penalties", () => {
    const fake = baseFake();
    expect(calculateStabilityScore(fake)).toBeGreaterThan(90);
  });

  it("decreases when water storage minimum is very low", () => {
    const fake = baseFake({ waterStorageMinPct: 5 });
    const score = calculateStabilityScore(fake);
    expect(score).toBeLessThan(85);
  });

  it("decreases when temperature overshoot is large", () => {
    const fake = baseFake({ maxTemperatureOvershootC: 8 });
    const score = calculateStabilityScore(fake);
    expect(score).toBeLessThan(80);
  });

  it("decreases when humidity undershoot is large", () => {
    const fake = baseFake({ minHumidityUndershootPct: 12 });
    const score = calculateStabilityScore(fake);
    expect(score).toBeLessThan(85);
  });

  it("stress-like scenario scores below 65", () => {
    const fake = baseFake({
      hourlyRecords: new Array(168).fill(0),
      waterDeficitHours: 0,
      heatSurplusHours: 65,
      plantStressHours: 104,
      computeUptimePct: 100,
      waterStorageMinPct: 0.17,
      maxTemperatureOvershootC: 8,
      minHumidityUndershootPct: 12,
      maxHumidityOvershootPct: 0,
      humidityWarningHours: 80,
      temperatureWarningHours: 65,
    });

    expect(calculateStabilityScore(fake)).toBeLessThan(65);
  });
});
