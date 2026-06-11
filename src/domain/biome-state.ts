import type { AirState } from "./air";
import type { BiomassState } from "./biomass";
import type { ComputeLoadState } from "./compute";
import type { WaterReservoirState, ThermalReservoirState } from "./reservoirs";
import type { ThermalState } from "./thermal";
import type { BiomeWarning } from "./warnings";

export interface BiomeState {
  hourIndex: number;
  air: AirState;
  water: WaterReservoirState;
  thermal: ThermalState;
  thermalReservoir: ThermalReservoirState;
  biomass: BiomassState;
  compute: ComputeLoadState;
  warnings: BiomeWarning[];
}
