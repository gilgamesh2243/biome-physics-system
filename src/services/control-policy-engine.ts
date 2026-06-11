import type { AirState } from "../domain/air";
import type { ControlAction, ControlPolicy } from "../domain/control-policy";
import type { ComputeLoadState } from "../domain/compute";
import type { WaterReservoirState } from "../domain/reservoirs";

export function chooseControlActions(input: {
  air: AirState;
  water: WaterReservoirState;
  compute: ComputeLoadState;
  policy: ControlPolicy;
}): ControlAction[] {
  const actions: ControlAction[] = [];

  if (
    input.policy.allowWaterCapture &&
    input.water.storedLiters < input.policy.maxWaterStorageLiters
  ) {
    actions.push({ type: "RUN_WATER_CAPTURE", intensityPct: 100 });
  }

  if (
    input.policy.allowVenting &&
    input.air.temperatureC > input.policy.targetTemperatureC
  ) {
    actions.push({ type: "VENT_AIR", airflowM3PerHour: input.air.airVolumeM3 * 0.5 });
  }

  if (
    input.policy.allowHeatStorage &&
    input.air.temperatureC > input.policy.targetTemperatureC
  ) {
    actions.push({ type: "STORE_HEAT", watts: 500 });
  }

  if (input.air.temperatureC > input.policy.maxTemperatureC) {
    actions.push({ type: "REJECT_HEAT", watts: 1000 });
  }

  if (
    input.policy.allowComputeThrottle &&
    input.air.temperatureC > input.policy.maxTemperatureC + 3
  ) {
    actions.push({ type: "THROTTLE_COMPUTE", targetUtilizationPct: 50 });
  }

  if (actions.length === 0) {
    actions.push({ type: "NOOP" });
  }

  return actions;
}
