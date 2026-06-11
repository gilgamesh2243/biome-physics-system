import { describe, it, expect } from "vitest";
import { calculateComputeLoad } from "../src/services/compute-loop";

describe("compute-loop", () => {
  it("calculates power draw and heat output", () => {
    const profile = { activeMachines: 10, wattsPerMachine: 200, utilizationPct: 50, coolingOverheadPct: 20 };
    const state = calculateComputeLoad(profile as any);
    expect(state.powerDrawWatts).toBeCloseTo(10 * 200 * 0.5);
    expect(state.heatOutputWatts).toBeCloseTo(state.powerDrawWatts);
    expect(state.coolingRequiredWatts).toBeCloseTo(state.heatOutputWatts * 0.2);
  });
});
