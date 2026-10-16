# Neon Express momentum physics

Current tuning and loop/rolling behavior are documented in [Batch 1 momentum foundation](batch-1-momentum-foundation.md); the report below is historical.

Historical PR #12 report. The [uphill correction](uphill-momentum-refinement.md) supersedes the slope-force and Spin Dash release tuning below, and adds a real-input passive ramp-launch regression.

Review branch: `codex/momentum-physics`, based on current main `0e8fddb` (merged prerequisite PR #11). The comparison baseline is its identical game tree at `8b984f9`. No level geometry, source artwork, sound assets, controls, camera settings or ending choreography changed. No laboratory/rocket subsystem was constructed.

## Diagnosis

The previous system already contained slope acceleration; the problem was its representation and limits. It added a slope-dependent change to **horizontal** velocity, ignored slope forces near rest, capped horizontal velocity at 24, and snapped to new slopes without conserving speed along the surface. This let Sonic crawl up steep inclines and made seam transitions change apparent speed.

Rolling had a four-second forced expiry and drag that grew with roll age. Spin Dash supplied only 23 before immediate losses, while running reached 14. Jumps approximated a small uphill lift and discarded platform velocity; leaving surfaces and releasing Jump could erase a ramp's launch velocity.

Loops used an angular path, but detached using a fixed speed of 5.5, forced movement to at least 4, injected a minimum speed on failure/exit, and capped loop speed at 24. **The old loop could already complete without boost at entry speed 20**; it was not universally boost-exclusive. Its approach momentum, contact rules and exits were inconsistent, however.

## Implementation

- Normal controls operate on signed speed **along the current surface**, converting to world-horizontal velocity for the existing controller. Connected seams preserve tangent speed. Air landings project incoming relative velocity onto the new surface; they do not manufacture velocity from an angle change.
- Gravity follows the slope direction: tangent acceleration `0.58 × sin(angle)` (underwater multiplier `2/7`). Running footsteps dissipate an additional `0.25 × abs(sin(angle))` against travel; rolling avoids this contact loss. Uphill propulsion weakens with inclination, while deliberate counter-braking retains its tuned strength. Releasing input still permits a precise stance at low speed.
- The hard 24 speed cap is removed. Smooth drag begins above tangent speed 26: speed is divided by `1 + 0.0003 × max(0, speed² − 26²) / max(1, abs(speed))`. Earned speed decays continuously instead of clipping. A long rolling descent settles to a stable speed in testing rather than growing indefinitely.
- Full Spin Dash is now `12 + 0.7 × charge` (maximum charge 20): 26 before the first rolling loss, compared with 23 previously. Input/charge behavior is retained. Rolling drag is a consistent `0.15%/tick`; the old four-second expiry and increasing age drag are removed. Low-speed roll expiry, clearance checks and release behavior remain.
- Upright jumps preserve horizontal velocity and add the existing vertical jump lift to the terrain/platform velocity. Flat-ground jump impulse and short-hop controls remain intact. Jump release trims only the added lift; coyote jumps retain their departing ramp velocity. Passive exits, including disappearing contacts, inherit surface motion. Above-terminal downward launch speed relaxes gradually toward 20 instead of instantly clipping.
- Loops use small angular substeps with slope gravity and rolling drag. Detachment follows normal acceleration `speed²/radius + gravity × cos(theta)`; speed must sustain contact on the ceiling. The ideal frictionless full-loop entry requirement is approximately `sqrt(5 × gravity × radius)`, with losses adding to it. There is no artificial minimum traversal/exit speed. Slow entries roll back or detach predictably, and failed loops can be retried. Loop jumping uses the surface normal.
- Faster travel subdivides collision integration so narrow surfaces/hazards cannot be skipped between endpoints, accounting for horizontal, vertical and ground-slope travel. Existing sweep/contact logic remains in the shared collision module.
- Boost retains the existing 23 target/minimum, charge drain, releases, rail allowance and one-air-burst-per-landing rules. It accelerates slower movement without reducing faster same-direction momentum. Rings still do not refill boost. Springs and prescribed launch settings remain intact.

The fixed 60 Hz simulation and existing input/frame accumulator remain the time basis. No packages or parallel movement engine were introduced.

## Measured comparison

Speeds below are world units per fixed tick, measured with identical controlled inputs and fixtures in Chromium. Multiply by 60 for units/second. Both acts produced the same shared-physics results.

| Check | Before | After |
| --- | ---: | ---: |
| Running after two seconds / sustained flat maximum | 14 / 14 | 14 / 14 |
| Full Spin Dash immediately after release | 22.851 | 25.961 |
| Spin Dash after one second with direction maintained | 20.083 | 23.092 |
| Rolling down the same 0.65 slope for three seconds | 27.766 | 38.793 |
| Running down that slope for three seconds | 28.624 | 31.675 |
| Steep uphill from rest, forward progress over 90 ticks | +62.417 | −20.769 (slides back) |
| Steep uphill at approach speed 26, progress over 20 ticks | 56.245 | 180.663 |
| Flat stop from speed 23, distance / ticks | 236.468 / 21 | **236.468 / 21** |
| One-frame low-speed adjustment / final velocity | 0.555 / 0 | **0.555 / 0** |
| Slow loop entry at 2, eventual exit speed | 6.086 (injected minimum) | 1.956 |
| Non-boost loop at entry speed 26, exit speed | 23.595 (capped) | 24.934 |

Normal acceleration, measured flat braking, precision, air countersteering and neutral airborne coasting compare exactly with the baseline. Holding Down on the long rolling descent stabilizes at approximately **39.287** in the isolated fixture. Rapid roll toggling cannot generate extra flat-ground speed.

## Verification and existing routes

- **284/284 Node tests pass**, including **30 momentum tests**; all 63 JS/CJS files pass syntax checks and whitespace checks pass. This static game has no build step.
- Physics fixtures are isolated in `test-momentum.cjs` and the browser verifier. They cover flat acceleration, shallow/steep descents, weak/strong uphill approaches, loops, ramps/gaps, moving surfaces, braking, high-speed narrow contacts, above-terminal launches, coyote/disappearing contacts, roll toggling and boost compatibility. No test terrain ships in gameplay.
- Reproducible comparison: serve the baseline and working checkout separately, then run `node scripts/verify-momentum.cjs <baseline URL> <working URL>`. Results default to `/tmp/sonic-momentum-validation`; override with `MOMENTUM_OUTPUT`.
- The **actual Act 2 descent → two loops → launch ramp → payoff roof** completes at zero boost with a 14-speed rolling approach and held Jump, a 26-speed approach with a short hop, and a first-airborne-tick coyote jump. Both loops complete in each run. Faster approaches require the player to choose jump duration; holding a long jump at every speed can overshoot.
- Browser replays complete the retained tower platforms, six-spring upper route, and empty-gauge express rail. Original route tests also retain secret exploration, moving-platform timing, pool exit, checkpoint/recovery and wrong-route behavior.
- Seven controlled middle-section phases complete without death/damage. Low route: **8.683 seconds**; high route: **7.283–7.350 seconds**. These are representative button-driven runs between shared points, not optimized human times or whole-act clear times.
- Standard Chromium checks pass for both acts, native keyboard controls, sound/music, fullscreen, pixel rendering and responsive layouts. Prerequisite browser checks pass for air boost, Bubble Shield, pool traversal and drowning/pause. Zero page errors.
- Ending replay retains all 16 beats/9 events, retry, pause and act switching. Source ending files are unchanged.
- Independent review found three launch-inheritance omissions: coyote jumps, above-terminal downhill exits, and disappearing contacts. All were reproduced in failing tests and fixed; the real coyote gap route now passes.
- Warm sampled update median: **0.101 ms before**, **0.105 ms after**. Draw median: **4.398 ms before**, **4.466 ms after**. These cloud batch measurements do not establish FPS on physical laptops/Safari.

[Machine-readable evidence](validation/momentum-physics.json) · [Non-boost loop](validation/momentum-loop-26-ground.png) · [Momentum landing](validation/momentum-landing-26-ground.png)

## Geometry and remaining review

**No geometry deviations were required in the tested sections.** This pass does not turn the existing technical rooftop climbs into continuous high-speed terrain. Their narrow landings still require braking and deliberate jumps. If a later playthrough identifies a particular transition that punishes well-executed momentum, it should receive a separate, local geometry review rather than another global speed change.

No known functional defect remains in the tested cases. Full-act feel, readability/camera behavior at newly earned speeds, and performance on the user's actual device still require manual playtesting. The laboratory rocket's full trajectory, collision and boarding mechanics remain future work; this update provides velocity inheritance rather than claiming that future system is complete.

## Playtest

Download `codex/momentum-physics` through GitHub **Code → Download ZIP**, extract it, and run `Inferno-Ascent-Game/RUN-GAME-WINDOWS.bat` (Python required), or serve the game folder with `python -m http.server 8000`. Compare flat braking first, then rolling down the Act 2 loop descent with an empty boost gauge; use held Jump at lower approach speed and short hops at higher speed. Try charged Spin Dash and deliberate air corrections.

Review and merge remain the user's decision. The GitHub Pages game updates after merge and successful Pages deployment.
