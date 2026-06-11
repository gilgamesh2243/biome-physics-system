import { describe, it, expect } from "vitest";
import { calculateBiomassState } from "../src/services/biomass-loop";

describe("biomass-loop", () => {
  it("computes water demand and stress affects growth", () => {
    const profile = { plantedAreaM2: 10, leafAreaIndex: 1, baseTranspirationLitersPerM2Hour: 0.05, idealTemperatureC: 25, idealRelativeHumidityPct: 60 } as any;
    const air = { temperatureC: 25, relativeHumidityPct: 60, absoluteHumidityGm3: 10, airVolumeM3: 100 } as any;
    const state = calculateBiomassState({ profile, air });
    expect(state.waterDemandLitersPerHour).toBeGreaterThan(0);
    const stressed = calculateBiomassState({ profile, air: { ...air, temperatureC: 5 } as any });
    expect(stressed.stressIndex).toBeGreaterThan(state.stressIndex);
    expect(stressed.growthIndex).toBeLessThan(state.growthIndex);
  });
});
