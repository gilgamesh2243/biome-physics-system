import type { ComputeLoadProfile, ComputeLoadState } from "../domain/compute";

export function calculateComputeLoad(
  profile: ComputeLoadProfile
): ComputeLoadState {
  const utilization = profile.utilizationPct / 100;

  const powerDrawWatts =
    profile.activeMachines * profile.wattsPerMachine * utilization;

  const heatOutputWatts = powerDrawWatts;

  const coolingRequiredWatts =
    heatOutputWatts * (profile.coolingOverheadPct / 100);

  return {
    activeMachines: profile.activeMachines,
    powerDrawWatts,
    utilizationPct: profile.utilizationPct,
    heatOutputWatts,
    coolingRequiredWatts,
    throttlingRequired: false,
  };
}
