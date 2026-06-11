import { describe, it, expect } from "vitest";
import { chooseControlActions } from "../src/services/control-policy-engine";

import { conservativePolicy } from "../src/examples/control-policies";
import { smallExperimentalBiome } from "../src/examples/biome-profiles";

describe("control-policy-engine", () => {
  it("emits ventilation, storage and rejection scaled by thermal control", () => {
    const air: any = { temperatureC: smallExperimentalBiome.thermalBounds.targetTemperatureC + 6, airVolumeM3: smallExperimentalBiome.airVolumeM3 };
    const actions = chooseControlActions({ air, water: smallExperimentalBiome.initialWater as any, compute: smallExperimentalBiome.compute as any, policy: conservativePolicy as any, thermalControl: smallExperimentalBiome.thermalControl as any });
    const hasVent = actions.some((a) => a.type === "VENT_AIR");
    const hasStore = actions.some((a) => a.type === "STORE_HEAT");
    const hasReject = actions.some((a) => a.type === "REJECT_HEAT");
    expect(hasVent).toBeTruthy();
    expect(hasStore).toBeTruthy();
    expect(hasReject).toBeTruthy();
  });

  it("uses emergency rejection when far above max", () => {
    const air: any = { temperatureC: smallExperimentalBiome.thermalBounds.maxTemperatureC + 10, airVolumeM3: smallExperimentalBiome.airVolumeM3 };
    const actions = chooseControlActions({ air, water: smallExperimentalBiome.initialWater as any, compute: smallExperimentalBiome.compute as any, policy: conservativePolicy as any, thermalControl: smallExperimentalBiome.thermalControl as any });
    const reject = actions.find((a) => a.type === "REJECT_HEAT") as any;
    expect(reject).toBeDefined();
    expect(reject.watts).toBeGreaterThanOrEqual(smallExperimentalBiome.thermalControl.emergencyHeatRejectionWatts ?? 0);
  });
});
