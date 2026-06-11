import { describe, it, expect } from "vitest";
import { updateThermalState } from "../src/services/thermal-loop";

describe("thermal-loop", () => {
  it("increases temp with compute heat and respects storage capacity", () => {
    const prev = { storedWattHours: 0, capacityWattHours: 1000, heatAddedWattHours: 0, heatRemovedWattHours: 0, overflowWattHours: 0, deficitWattHours: 0 } as any;
    const { thermal, thermalReservoir } = updateThermalState({ previousThermalReservoir: prev, thermalBounds: { minTemperatureC: 10, maxTemperatureC: 40, targetTemperatureC: 25 }, airTemperatureC: 20, computeHeatWatts: 1000, solarGainWatts: 0, biomassHeatWatts: 0, heatRejectedWatts: 0, heatStoredWatts: 0, airVolumeM3: 100 });
    expect(thermal.airTemperatureC).toBeGreaterThan(20);
    expect(thermalReservoir.storedWattHours).toBeLessThanOrEqual(prev.capacityWattHours);
  });
});
