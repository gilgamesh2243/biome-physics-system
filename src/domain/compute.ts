import type { Percent, Watts } from "./units";

export interface ComputeLoadProfile {
  activeMachines: number;
  wattsPerMachine: Watts;
  utilizationPct: Percent;
  coolingOverheadPct: Percent;
}

export interface ComputeLoadState {
  activeMachines: number;
  powerDrawWatts: Watts;
  utilizationPct: Percent;
  heatOutputWatts: Watts;
  coolingRequiredWatts: Watts;
  throttlingRequired: boolean;
}
