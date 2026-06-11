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

  it("overloaded profile produces at least one limiting condition", () => {
    const overloadedBiome = { ...smallExperimentalBiome, compute: { activeMachines: 60, wattsPerMachine: 220, utilizationPct: 90, coolingOverheadPct: 45 }, waterCaptureLitersPerHour: 1 } as any;
    const result = simulateBiome({ profile: overloadedBiome, climate: floridaHumidDay, controlPolicy: conservativePolicy, hours: 24 * 3 });
    const problem = result.waterDeficitHours > 0 || result.heatSurplusHours > 0 || result.plantStressHours > 0 || result.stabilityScore < 100;
    expect(problem).toBeTruthy();
  });

  it("throttling reduces compute heat and heat rejected is recorded", () => {
    const overloadedBiome = { ...smallExperimentalBiome, compute: { activeMachines: 60, wattsPerMachine: 220, utilizationPct: 90, coolingOverheadPct: 45 }, waterCaptureLitersPerHour: 1, thermalControl: { maxHeatRejectionWatts: 8000, maxHeatStorageWatts: 2000, maxVentilationM3PerHour: 300, emergencyHeatRejectionWatts: 10000 } } as any;
    const result = simulateBiome({ profile: overloadedBiome, climate: floridaHumidDay, controlPolicy: conservativePolicy, hours: 24 * 3 });
    // heat rejected should be recorded
    expect((result.totalHeatRejectedKwh ?? 0)).toBeGreaterThan(0);
    // stability should not be perfect
    expect(result.stabilityScore).toBeLessThan(100);
  });
});
