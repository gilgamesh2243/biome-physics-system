import { describe, it, expect } from "vitest";
import { smallExperimentalBiome } from "../src/examples/biome-profiles";
import { floridaHumidDay } from "../src/examples/climate-profiles";
import { conservativePolicy } from "../src/examples/control-policies";
import { simulateBiome } from "../src/services/biome-simulator";

describe("biome-simulator", () => {
  it("returns requested number of hours and non-negative water", () => {
    const result = simulateBiome({ profile: smallExperimentalBiome, climate: floridaHumidDay, controlPolicy: conservativePolicy, hours: 24 * 7 });
    expect(result.hourlyRecords.length).toBe(24 * 7);
    expect(result.totalWaterCapturedLiters).toBeGreaterThanOrEqual(0);
    expect(result.finalStoredWaterLiters).toBeGreaterThanOrEqual(0);
    expect(result.stabilityScore).toBeGreaterThanOrEqual(0);
    expect(result.stabilityScore).toBeLessThanOrEqual(100);
  });

  it("throws on invalid hours", () => {
    expect(() => simulateBiome({ profile: smallExperimentalBiome, climate: floridaHumidDay, controlPolicy: conservativePolicy, hours: 0 })).toThrow();
  });
});
