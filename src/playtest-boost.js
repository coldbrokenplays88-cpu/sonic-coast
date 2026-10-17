// Experimental resource/input state only. The existing motion controller owns time.
export let experimentalBoostTuning;
export function createExperimentalBoost(meter = 90) {
  return {
    meter,
    locked: false,
    held: false,
    airUsed: false,
    remaining: 0,
    active: false,
    bursts: 0,
  };
}
export function beginExperimentalBoost(player, input, startedGrounded) {
  const b = player.boost,
    t = experimentalBoostTuning;
  b.held = !!input.boostHeld;
  b.active = false;
  if (!b.held) {
    b.locked = false;
    b.remaining = 0;
  }
  if (player.mode === 'grounded') {
    b.airUsed = false;
    b.remaining = 0;
    return;
  }
  const freshAir = input.boostPressed && (input.boostPressAirborne ?? !startedGrounded);
  if (freshAir && b.held && !b.airUsed && !b.locked && !player.dash && b.meter >= t.maximum / 4) {
    b.meter -= t.maximum / 4;
    b.airUsed = true;
    b.remaining = t.airTicks;
    b.bursts++;
    player.air.vx = player.facing * Math.max(t.speed, player.air.vx * player.facing);
    player.air.vy = 0;
    player.air.cutEligible = false;
    player.air.jumpLift = 0;
    player.latestTransition = 'air Boost burst';
  }
}
export function resetExperimentalAirBoost(player) {
  player.boost.airUsed = false;
  player.boost.remaining = 0;
  player.boost.active = false;
}
export function experimentalGroundBoost(player, surface) {
  const b = player.boost;
  return (
    b.held &&
    !player.dash &&
    ((surface.grindable && surface.infiniteBoost) || (b.meter > 0 && !b.locked))
  );
}
export function initializeRuntimeModule() {
  experimentalBoostTuning = Object.freeze({
    maximum: 90,
    groundCost: 0.5,
    speed: 23,
    response: 0.14,
    airTicks: 18,
  });
}
export function getRuntimeBindings() {
  return {};
}
