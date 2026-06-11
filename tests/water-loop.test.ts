import { describe, it, expect } from "vitest";
import { updateWaterReservoir } from "../src/services/water-loop";

describe("water-loop", () => {
  it("increases stored when captured > consumed", () => {
    const prev = { storedLiters: 100, capacityLiters: 200, capturedLitersThisHour: 0, consumedLitersThisHour: 0, evaporatedLitersThisHour: 0, condensedLitersThisHour: 0, deficitLiters: 0, overflowLiters: 0 } as any;
    const biomass = { waterDemandLitersPerHour: 5 } as any;
    const next = updateWaterReservoir({ previous: prev, capturedLiters: 50, passiveCondensationLiters: 0, biomass, coolingWaterLiters: 0, serviceWaterLiters: 0 });
    expect(next.storedLiters).toBeGreaterThan(prev.storedLiters);
  });

  it("produces deficit when consumed > captured", () => {
    const prev = { storedLiters: 10, capacityLiters: 100, capturedLitersThisHour: 0, consumedLitersThisHour: 0, evaporatedLitersThisHour: 0, condensedLitersThisHour: 0, deficitLiters: 0, overflowLiters: 0 } as any;
    const biomass = { waterDemandLitersPerHour: 50 } as any;
    const next = updateWaterReservoir({ previous: prev, capturedLiters: 0, passiveCondensationLiters: 0, biomass, coolingWaterLiters: 0, serviceWaterLiters: 0 });
    expect(next.deficitLiters).toBeGreaterThan(0);
  });
});
