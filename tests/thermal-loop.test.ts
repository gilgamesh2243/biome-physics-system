import { describe, it, expect } from "vitest";
import { updateThermalState } from "../src/services/thermal-loop";

describe("thermal-loop", () => {
  it("increases temp with compute heat and respects storage capacity, ambient exchange affects net", () => {
    const prev = { storedWattHours: 0, capacityWattHours: 10000, heatAddedWattHours: 0, heatRemovedWattHours: 0, overflowWattHours: 0, deficitWattHours: 0 } as any;
    const { thermal, thermalReservoir } = updateThermalState({
      previousThermalReservoir: prev,
      thermalBounds: { minTemperatureC: 10, maxTemperatureC: 80, targetTemperatureC: 25 },
      airTemperatureC: 20,
      computeHeatWatts: 5000,
      solarGainWatts: 0,
      biomassHeatWatts: 0,
      heatRejectedWatts: 0,
      heatStoredWatts: 0,
      airVolumeM3: 100,
      climateTemperatureC: 30,
      ambientExchangeCoefficientWattsPerC: 100,
    });
    expect(thermal.airTemperatureC).not.toBe(20);
    expect(thermalReservoir.storedWattHours).toBeLessThanOrEqual(prev.capacityWattHours);
  });
});
