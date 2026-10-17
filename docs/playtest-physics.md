# PLAYTEST ground movement — GROUND-1

## Checkpoint and provenance

Continue `codex/playtest-physics`; do not recreate it from main. The starting
commit was `3cfe3550641d96ca39e37f9f9033ed2ca37ee0bf`, matching the fetched branch.
The scaffold handoff is `docs/playtest-scaffold.md`. The user approved its
access/switching checkpoint in this conversation ("yeah it works") before Task 2.

**Exact tested implementation commit:**
`92fca8ce899d37264b42decff1b7ed2dc50f16b1`.
This document is a subsequent documentation-only commit; no runtime change is
needed to add these verification records. Node v24.19.0, npm 11.9.0, existing
installed lockfile dependencies; no dependency changes.

## State, ownership and units

`src/playtest-ground.js` contains the actual experimental controller used by
PLAYTEST and the regression tests. `src/playtest.js` owns its lifecycle, input,
camera, renderer and debug HUD. The string scene ID remains `'playtest'`.

The player's **only authoritative velocity is signed `speed` along the surface
tangent**. Position is the contact anchor's world x; surface y and tangent are
sampled analytically. `groundContact()` derives `vx = speed * tx`, `vy = speed * ty`,
body center, normal and normal reaction. These velocities describe the contact
anchor, not a separately simulated center of mass. No mutable experimental vx,
legacy `p.vx`, `p.contactSpeed` or `p.loop.speed` drives this controller.

Positive x is right, positive y down. A world unit is a logical canvas unit;
the viewport remains 960×540 at zoom 1 with the existing full-resolution output.
One controller tick is 1/60 s: speed is units/tick, acceleration units/tick².
Thus 14 units/tick is 840 units/s; gravity 0.35 is 1260 units/s².

The legacy inspection found a 60 Hz accumulator, a 14-unit ordinary running
range, ordinary ground feet at `p.y + 20`, foot radius 9, and collision heights
48 standing / 26 ground-roll / 38 airborne. Its ground rolling artwork is 38
units; other visuals use independent source-frame scaling. A 120-tick Act 1
running probe reached vx 5.91390 at x 817.869, y 400; that authored-route sample
is context, not a measurement of its maximum running speed. The experiment does
not claim historical Sonic accuracy or reuse legacy collision assumptions.

`stepGroundPlayer()` advances once per experimental tick. It uses four fixed
quarter-tick integration substeps, a midpoint surface tangent and trapezoidal
travel; substeps are internal to that single controller. Input handlers queue
controls rather than move the player. A quick Down edge is buffered until the
next tick. Reset, scene exit and resume discard stale inputs/edges.

The PLAYTEST frame route has its own 60 Hz accumulator. A 1e-7 ms comparison
tolerance prevents losing exact tick boundaries to floating-point rounding.
Physics and camera following advance only on ticks; draw calls never advance
movement. Paused time is discarded. Per-render elapsed time is limited to
250 ms to bound catch-up after a stalled/background tab; equivalence is claimed
within that scheduling domain, not across arbitrary multi-second suspension.

## Tuning and posture rules

| Parameter | Value | Purpose |
| --- | ---: | --- |
| Input-driven running range | 14 | Familiar benchmark pace; not a momentum cap |
| Running acceleration | 0.16/tick | Predictable build-up, about 1.47 s to flat maximum |
| Standing opposite-input braking | 0.50/tick | Brake to zero before a later tick propels in reverse |
| Released standing resistance | 0.10/tick | Stable flat coast-down |
| Gravity | 0.35/tick² | Projected onto the actual tangent in either direction |
| Rolling resistance | 0.025/tick | One quarter of released standing resistance |
| Rolling opposite-input brake | 0.18/tick | Additional passive resistance, never reverse propulsion |
| Roll entry | Fresh Down/S edge at speed ≥2 | No charge or Spin Dash |
| Automatic uncurl | Speed <0.08 for 12 eligible ticks | 0.2 s sustained near-rest hysteresis |
| Numerical safety reset | Speed >80 or non-finite state | Separate from tuning; outside benchmark operation |

Standing propulsion only adds speed toward the 14-unit drive range. It does
not clamp or damp already-earned higher speed. Holding travel direction while
rolled adds **no propulsion**, even near zero. Gravity acts continuously in both
postures. Released movement uses sign-preserving Coulomb resistance with a
zero clamp; no automatic sign flip on flat ground. Standing braking disables
propulsion for its entire tick, including after the speed reaches zero.

At the designated grade 0.65 (33.02°), tangent gravity is approximately 0.19075,
greater than both 0.10 standing and 0.025 rolling resistance. Released movement
therefore starts downhill from rest. On shallow grades, friction may support
rest. This is an explicit friction balance, not a slope-speed permission gate.

A roll crossing zero on a sufficiently steep slope stays curled: uncurl counting
requires gravity along the slope to be no greater than rolling resistance.
Rolling at sustained flat rest uncurls after the near-rest interval; forward
running propulsion can resume on subsequent ticks. Holding Down cannot
immediately recurl after that transition; release/repress is required.

The contact anchor is the actual ground point in both postures. Standing body:
22 wide ×48 high, center 24 units along the outward normal. Rolling body:
38-diameter circle, center 19 units along that same normal. Changing posture
does not move the anchor or inject speed. Existing recovered Sonic frames are
drawn independently of legacy pose/player state: standing source bounds scale
uniformly to 48 high and end at the anchor; rolling bounds fit 38×38 around the
circle center. The visible cyan collision overlay, yellow anchor and normal
line let testers distinguish artwork, body and contact. This is a contact-point
ground model, not a general finite-body rigid-body solver.

## Benchmark geometry and supported domain

- **Flat:** y=400, x=-5000…5000; reset/spawn at x=0, speed=0.
- **Valley:** x=-2400…2400, a 400-unit-wide flat bottom at y=650; reset/spawn
  at x=0, speed=0. Each side transitions over 800 horizontal units into a
  1400-unit-long inclined approach. Grade never exceeds 0.65.
- Let u=max(0, |x|-200), t=min(1,u/800). For u<800, height above the bottom is
  `0.65 * 800 * (t³ - t⁴/2)`; beyond it is `0.65 * (u-400)`.
  Height, tangent and curvature agree at joins |x|=200 and 1000 (C² continuous).
  Rendering and contact use this same analytic sampler; the visible line is
  sampled every four world units. There are no independent collision segments
  or a sharp V concealed under curved artwork.
- Both inclined ends stop at visible orange **TEST BOUNDARY → RESET** posts.
  Crossing resets to the selected course's safe flat spawn and clears input.
  These are test utilities, not walls, launch assists or evidence of crest handling.

Only flat and concave ground exist here. Normal support reaction is positive
through the tested range; the valley-run test checks that every tick. No adhesion
or detachment exception is needed. No convex lip, ledge, jump, loop, wall,
ceiling, rail, spring, boost, Spin Dash, water, enemy, goal or boss is simulated.
Airborne detachment and finite-body obstacle collision remain future work and
must not be inferred from this ground-constrained benchmark.

## Measured controller evidence

Measurements below call the actual production experimental controller at 60 Hz.
Unless listed, input is released. x is the anchor's horizontal position; all
starts use the specified supported course, not a substitute physics model.

| Start / held input | Duration | Measured outcome |
| --- | --- | --- |
| Flat x=0, v=0 standing; right / left | 60 ticks / 1 s | x=±288, v=±9.600 |
| Flat x=0, v=±12 standing; opposite | 24 ticks / 0.4 s | x=±144, v=0; reverse propulsion occurs later |
| Flat x=0, v=12 standing; released | 120 ticks / 2 s | x=720, v=0; stays stopped; negative case symmetric |
| Flat x=0, v=12 rolling; released | 120 ticks / 2 s | x=1260, v=9.000 |
| Same roll; hold right | 120 ticks / 2 s | Exactly the same state as the released roll |
| Flat x=0, v=22 standing; hold right | 20 ticks / 0.333 s | x=440, v=22, no clamp to 14 |
| Valley x=-1700, v=6 rolling downhill | 30 ticks / 0.5 s | x=-1486.544, v=10.9724; right-side mirror matches |
| Valley x=1700, v=6 rolling uphill | 30 ticks / 0.5 s | x=1769.625, v=-0.35988; slowed, stopped and reversed |
| Valley x=±1700, v=0 standing | 60 ticks / 1 s | x=±1563.046, v=∓5.44476 (released rollback) |
| Valley x=1400, v=2 rolling uphill | 60 ticks / 1 s | x=1228.996, v=-8.40726, still rolling |
| Flat x=0, v=1 rolling; hold left+Down | 60 ticks / 1 s | Uncurls at rest, then runs left; final v=-7.04 standing |

**No-input valley diagnostic:** start x=-1800, v=0 rolling; 600 ticks / 10 s.
Energy `v²/2 + 0.35*(650-y)` starts at 273 and finishes at 106.870104.
Peak speed 21.464911; furthest right x=1408.8825, then natural reversal.
Maximum measured growth above initial energy: 0. Travel distance 6645.20173;
friction work 166.130043 versus energy lost 166.129896, difference 0.00014721.
Energy is evaluated for the contact-point model; intentional friction explains
its decline. Final oscillation phase is not used as an arbitrary endpoint target.

The largest per-tick travel was 21.46438 units and tangent change 0.023049 rad.
Regression budgets are <35 units per tick and <0.04 rad, covering the supported
benchmark range while detecting join teleports/jitter. Energy error budget is
0.05 unit²/tick² (<0.02% of initial energy), comfortably above measured integration
error but far below a meaningful artificial energy injection. Join probes at
±1e-5 units require height differences <2e-5, angle/curvature differences <1e-6.
Directional symmetry uses 1e-8 tolerance for accumulated floating-point error.

Two seconds holding right under 30, 60 and 120 Hz renders, and repeating
7/23/11/39/20 ms intervals, all yield exactly 120 controller ticks and identical
player state. One `update()` produces one controller tick, including when legacy
movement/interaction routines are replaced with throwing guards in isolation
tests. Act-switch tests compare each legacy act's movement after leaving PLAYTEST
to a fresh boot, and confirm no stale experimental state or input remains.

## Verification, package and access

Baseline: 429 gameplay tests, nine build tests, compatibility/player checks all
passed. Final required commands all passed: `npm run build:player`, `npm test`
(437 tests), `npm run test:build` (nine), `npm run check:compat` (29 modules),
`npm run check:player`, `npm run package`. Original non-PLAYTEST tests remain
unchanged. Scaffold tests now expect actual ground movement while retaining
their isolation, lifecycle and Act 1/2 comparisons. Eight ground-controller
regressions were added. Source/build manifests and generated compatibility files
are synchronized; generated JS was not manually edited.

Player ZIP: `dist/Neon-Express-player.zip`, 52,314,567 bytes, 37 files.
SHA-256: `3b397ce803b8e70daecac09f1da2c61e5e7ebc9eea359dcfa6cb05febb57e4a3`.
Runtime: `runtime-86723af583267f05.js`; CSS: `style-c9f48a6e01dc8ece.css`.
Integrity checked; freshly extracted outside the repository. Its index matches
committed `PLAY.html`, and its runtime matches the committed generated bundle.

Chromium 151.0.7922.173 through a Python 3.12.14 local HTTP server passed the
bounded extracted-package smoke: actual Sonic art/contact pixels, movement,
rolling, valley reset/rollback, horizontal+vertical following, live diagnostics,
pause/resume/reset, input/legacy-state isolation, entry into both existing acts,
normal running/jumping/fresh midair boost, and clean return to PLAYTEST. No page
JavaScript errors. The legacy boost probe deliberately presses boost after
takeoff; simultaneous grounded jump+boost does not count as an air burst.
This is automation, not a claimed human playtest or exhaustive route replay.

Direct file navigation was attempted first and blocked by environment browser
policy (`ERR_BLOCKED_BY_ADMINISTRATOR`), not verified as a game failure. On Linux
the extracted build passed via `python3 -m http.server 8000 --bind 127.0.0.1`
from its directory and `http://127.0.0.1:8000/`. That address is local-only.
The supplied Windows launcher requires Python; it was not executed on Linux.

No ZIP-attachment upload tool or isolated public-preview service is available.
The generated player ZIP remains in this workspace. A GitHub source ZIP of this
branch also includes the ready-built game: extract it and open
`Inferno-Ascent-Game/PLAY.html` (or serve that folder and open `/PLAY.html`).
A source ZIP is distinct from the generated player ZIP; a repository branch
link is not a publicly playable URL. No hosting change, Pages dispatch,
PR creation or merge is part of this work.

## User playtest before expanding

1. On Flat, accelerate both ways, countersteer, then release and compare stopping.
2. Tap Down while moving; compare rolled coasting with upright coasting. Holding
   forward should not power the roll. Brake to rest and check automatic uncurl.
3. Select Valley. Run up each side, release and observe downhill rollback; roll
   down and up the other side. Watch the anchor and collision outline at joins.
4. Check pause/resume/reset, both safe spawns, and switching to Act 1/2 and back.

Stop at this ground-only slice. Wait for explicit feedback/approval on feel
before adding airborne physics or any other feature; continue this same branch.
