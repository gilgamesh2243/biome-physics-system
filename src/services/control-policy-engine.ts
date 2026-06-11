import type { AirState } from "../domain/air";
import type { ControlAction, ControlPolicy } from "../domain/control-policy";
import type { ComputeLoadState } from "../domain/compute";
import type { WaterReservoirState } from "../domain/reservoirs";
import type { ThermalControlCapacity } from "../domain/simulation";

export function chooseControlActions(input: {
  air: AirState;
  water: WaterReservoirState;
  compute: ComputeLoadState;
  policy: ControlPolicy;
  thermalControl: ThermalControlCapacity;
}): ControlAction[] {
  const actions: ControlAction[] = [];

  // Water capture: run if below max storage and policy allows
  if (
    input.policy.allowWaterCapture &&
    input.water.storedLiters < input.policy.maxWaterStorageLiters
  ) {
    actions.push({ type: "RUN_WATER_CAPTURE", intensityPct: 100 });
  }

  const tempOverTarget = input.air.temperatureC - input.policy.targetTemperatureC;
  const tempOverMax = input.air.temperatureC - input.policy.maxTemperatureC;

  // Venting proportional to how far above target, capped by profile
  if (input.policy.allowVenting && tempOverTarget > 0) {
    const ventFraction = Math.min(1, Math.max(0, tempOverTarget / 10));
    const airflowM3PerHour = Math.round(input.thermalControl.maxVentilationM3PerHour * ventFraction);
    if (airflowM3PerHour > 0) actions.push({ type: "VENT_AIR", airflowM3PerHour });
  }

  // Heat storage attempt
  if (input.policy.allowHeatStorage && tempOverTarget > 0) {
    const storageFraction = Math.min(1, Math.max(0, tempOverTarget / 8));
    const watts = Math.round(input.thermalControl.maxHeatStorageWatts * storageFraction);
    if (watts > 0) actions.push({ type: "STORE_HEAT", watts });
  }

  // Heat rejection
  if (tempOverTarget > 0) {
    const rejectionFraction = Math.min(1, Math.max(0, tempOverTarget / 8));
    let watts = Math.round(input.thermalControl.maxHeatRejectionWatts * rejectionFraction);
    if (tempOverMax > 5 && input.thermalControl.emergencyHeatRejectionWatts) {
      watts = Math.max(watts, input.thermalControl.emergencyHeatRejectionWatts);
    }
    if (watts > 0) actions.push({ type: "REJECT_HEAT", watts });
  }

  // Compute throttling
  if (
    input.policy.allowComputeThrottle &&
    input.air.temperatureC > input.policy.maxTemperatureC + 2
  ) {
    actions.push({ type: "THROTTLE_COMPUTE", targetUtilizationPct: 50 });
  }

  if (actions.length === 0) actions.push({ type: "NOOP" });

  return actions;
}
