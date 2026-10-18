# Momentum follow-ups

Starting branch: `codex/playtest-physics`; starting commit:
`78ac0816f06fcf95c2b4f80b9b7eb896506f9cf2`. Main lacks both experimental
controllers. Worktree was clean. Node24.19.0/npm11.9.0.
Baseline:563 game tests,10 build tests,`npm run build` passed.

Latest user correction: apply all five items to Act1, Act2 and PLAYTEST.
Use a rolling slope-speed cap of32, superseding42 in the pasted brief.
All three now share the approved controller. No controller migration, level-data
edits, new dependencies, main pushes, merges or deployments.

- [x] 1. Cap ground-rolling slope acceleration at32, preserving external momentum.
- [x] 2. Hold idle standing contact below0.3 speed on slopes through38 degrees.
- [x] 3. Air acceleration0.16/brake0.2 in both acts and PLAYTEST.
- [x] 4. Standing ground brake0.9; rolling brake unchanged.
- [ ] 5. Rolling uphill multiplier0.625; downhill multiplier2.5 unchanged.

Skip the optional30-tick slide input lock: it adds a control-state change beyond
holding still and would delay player corrections. All other behavior remains.
The Mania numbers in the request are tuning references, not independently verified
historical claims. Final evidence and test-expectation changes will be recorded here.

## Item1 evidence

565 game tests,10 build tests,build passed. All20/30/45-degree600-tick rolling
probes peak at32 in either direction. Starting at50 retains excess speed while
friction acts; running and below-cap comparisons are unchanged. safetySpeed80 stays.
Existing test changed: `no-input valley energy accounts for authored downhill work
and friction across smooth joins` previously equated all downhill work to energy,
even beyond32. It now requires exact local work below the cap, no unexplained
energy gain throughout, the32 peak, and continuous joins. The cap intentionally
rejects some downhill work; the integration tolerance remains0.05.

## Item2 evidence

567 game tests,10 build tests,build passed. Idle probes at10/20/30/38 degrees
stay at exact zero speed and displacement for300 ticks in both directions.
45-degree sliding remains44.246212 speed/4693.019485 pixels at300 ticks.
Explicit direction input and stationary rolling match the previous forces.
Flat coast-down remains80/140/230 ticks from8/14/23; rails opt out of standing
static grip. No input lock is added.
Existing test changed: `slope gravity slows uphill travel and accelerates downhill
in both directions; rest rolls back` used to require idle sliding on the33-degree
valley. It now requires zero idle speed/displacement there, while keeping its
moving uphill/downhill checks. New tests cover steeper sliding and rolling rollback.

## Item3 evidence

569 game tests,10 build tests,build passed. Both actual acts gain4.8 from forward
air input or lose6 from countersteer over30 ticks. Held jump remains157.5 pixels
and59 measured airborne ticks; no-input23-speed coasting is unchanged.
Existing test `no-input air motion conserves horizontal momentum; countersteer
brakes without a cap` now requires24 after starting at30 for30 ticks, instead of
its old24<speed<27 band. This directly tests the requested stronger brake.
`first upper spring is reachable with a held ordinary jump from the fallen slope`
now uses an ordinary held jump WITH air steering, retaining its no-Boost/no-death
requirements. `the upper route is reachable from the real choice entrance,
including an unfavorable hoist phase` likewise steers the entry jump and faces
right before engaging rail Boost; all6 spring and no-hit/no-death assertions stay.
Test-player helpers use0.2 air stopping distance/0.16 acceleration, land on the
clear part of the guarded roof, and hold the jump while aiming a stomp. This
preserves `secret exploration collects its monitor and returns through the low
route to the retained tower using ordinary input` and all its rewards, hits,
deaths, checkpoint and reconnection assertions. No production enemies or geometry
changed. These are intentional input adjustments for stronger air control.

## Item4 evidence

571 game tests,10 build tests,build passed. Stops from14 take16 ticks in either
direction (before28); reversing14 to the opposite13.9 takes103 ticks (before115).
Constrained rolling still loses0.205 per flat tick:0.18 brake+0.025 friction.
Existing tests deliberately updated for the0.9 standing brake:
- `countersteering a fast roll immediately enters standing braking in either direction`:
  first tick14→13.1, previously13.5; brake artwork/uncurl assertions unchanged.
- `shared momentum countersteering uncurls at speed, using standing brake and preserving the anchor`:
 14→13.1, previously13.5; contact/standing checks unchanged.
- `opposite roll input uncurls promptly at low speed without snapping velocity or bypassing clearance`:
 0.8 now stops at zero on the first tick, then reverses on later ticks; previously
 expected residual positive speed. Both signed zeros mean stopped.
- `act1: retry clears propulsion protection and restores ordinary ground control`
 and its Act2 counterpart:9→8.1 on one brake tick, previously8.5.
No rolling-brake, rail-brake, acceleration or artwork values changed.
