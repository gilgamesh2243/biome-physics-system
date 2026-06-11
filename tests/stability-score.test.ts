import { describe, it, expect } from "vitest";
import { calculateStabilityScore } from "../src/services/stability-score";

describe("stability-score", () => {
  it("is high when no penalties", () => {
    const fake: any = { hourlyRecords: new Array(10).fill(0), waterDeficitHours: 0, heatSurplusHours: 0, plantStressHours: 0, computeUptimePct: 100 };
    expect(calculateStabilityScore(fake)).toBeGreaterThan(90);
  });

  it("decreases with water deficit", () => {
    const fake: any = { hourlyRecords: new Array(10).fill(0), waterDeficitHours: 5, heatSurplusHours: 0, plantStressHours: 0, computeUptimePct: 100 };
    const score = calculateStabilityScore(fake);
    expect(score).toBeLessThan(100);
  });

  it("is clamped between 0 and 100", () => {
    const fake: any = { hourlyRecords: new Array(10).fill(0), waterDeficitHours: 1000, heatSurplusHours: 1000, plantStressHours: 1000, computeUptimePct: 0 };
    expect(calculateStabilityScore(fake)).toBeGreaterThanOrEqual(0);
    expect(calculateStabilityScore(fake)).toBeLessThanOrEqual(100);
  });
});
