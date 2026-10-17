# PLAYTEST — DEVICES-1 / PATH-1 / AIR-2 / GROUND-5

## Approval, branch and build identity

Continue `codex/playtest-physics`; do not recreate from main. Scaffold handoff:
`docs/playtest-scaffold.md`. The user approved the PATH-1 loop/wall/ceiling
update with “ok this is really good” before requesting this stage. All prior
approved ground/air tuning remains. **DEVICES-1 awaits personal feel approval.**

Starting SHA: `07acc6bbfda012584a9f28b8eccae41ec1284cf8`, clean working tree.
Runtime build: `runtime-e3819878416facf6.js`. Node v24.19.0, npm11.9.0;
existing lockfile dependencies reused, no new dependencies or asset generation.
**Exact tested implementation commit: `2d329587903bb440563da138e6386b084851fd12`.**
This build-identity record is a subsequent documentation-only commit.

GitHub API access now succeeds. `gh pr list --head codex/playtest-physics
--state open` returned an empty list: no matching open PR was available to mark
draft. No PR created or modified. No main changes, act migration, merge, hosting
change, Pages dispatch or deployment. Only the existing feature branch is pushed.

## State and time ownership

`src/playtest-motion.js` remains the only movement/time controller.
`src/playtest-ground.js` supplies the same force integration; its only extension
is an optional arc-length coordinate. `src/playtest-path.js` supplies analytic
geometry, body clearance and collision queries, never a second movement loop.
`src/playtest-devices.js` supplies pure device poses and swept collision queries;
it never owns a second update or clock. `src/playtest.js` owns input, scene lifecycle, camera, renderer and diagnostics.
Scene ID remains `'playtest'`. Compatibility JS and browser bundles are generated
by repository tooling from canonical `src/`; generated JS is never hand edited.

| State | Position authority | Velocity authority |
| --- | --- | --- |
| Original grounded fixtures | Contact anchor world x | Signed surface `speed` |
| New path fixtures | `pathS`, distance along the connected path | The same signed surface `speed` |
| Moving-platform contact | Contact anchor world x/y plus `supportId` | Signed `speed` relative to the platform; world velocity=`speed*T+carrier velocity` |
| Airborne | Body-center world x/y; `pathS=null` on path departure | `air.vx,vy`; grounded `speed=null` |

For paths, grounded x/y are derived caches, not competing integrators. Tangent
and normal come from the selected path position; world velocity is `speed*T`.
Landing projects the original incoming vector onto T and discards inward normal
velocity. Jumping adds10.5*N to that same world vector. No speed is assigned on
loop entry, exit or segment joins. No legacy p.vx/contactSpeed/loop.speed drives
PLAYTEST; input is routed before legacy mutations and legacy gameplay is bypassed.

The 60 Hz tick retains four quarter-tick intervals. New curved traversal further
partitions remaining time to limit angular travel to.04 radians per integration
step. Support loss is located within an interval; unconsumed time advances air
motion exactly once. Collision queries return times, never advance the player.
Ticks increment once even across transitions. Device motion is a deterministic
piecewise-linear triangular cycle evaluated at the same fractional tick. Intervals
split at platform reversal times, so swept collision uses constant carrier velocity
within each interval. Side blocks cancel relative walking without discarding carrier
time. Rendering never advances physics.
Catch-up remains capped at250 ms per render, with the existing1e-7 ms tick-boundary
tolerance; scheduling equivalence is tested within that domain.

## Preserved approved tuning

World units/tick and units/tick²; positive y points down. One tick=1/60 second.
The logical viewport remains960×540, zoom1, with existing full-resolution crisp
sprite rendering. No art, dimensions, frame sequences or existing-act camera
behavior changed. No complete historical Sonic accuracy is claimed.

| Parameter | Value |
| --- | ---: |
| Input-driven running range / acceleration | 14 / .16 |
| Standing countersteer / released resistance | .50 / .10 |
| Base normal and air gravity | .35 |
| Rolling resistance | .025 |
| Downhill rolling tangent-force multiplier | 2.5 |
| Rolling opposite brake | .18*(1-abs(T.y))*min(1,abs(speed)/2) |
| Fresh roll entry | Speed≥2 |
| Deliberate low-speed countersteer uncurl | Speed≤1, rest-supporting grade and clearance |
| Passive uncurl | Speed<.08 for12 eligible ticks, same support/clearance |
| Jump impulse / retained short-hop lift | 10.5 /40% remaining generated lift |
| Air acceleration / brake / input range | .08 / .16 /14 |
| Numerical safety reset | Non-finite state or speed>80 |

Forward rolled input adds no running propulsion. Only actual downhill rolling
(`speed*T.y>0`) receives the2.5 multiplier; uphill, flat and braking constants
are unchanged. Ordinary directional input cannot clamp earned higher momentum.
No-input air travel has zero horizontal friction. Opposing input brakes before
reverse propulsion on a later tick. Rolling reversals on steep slopes remain
curled. All original flat/valley/ground and air regressions remain passing.

Downhill ratio reference: Sonic2 `Sonic_SlopeResist` uses0x20 versus downhill
`Sonic_RollRepel`0x50. Its separate uphill reduction was intentionally not copied.
[Reference disassembly](https://github.com/sonicretro/s2disasm/blob/4ef457c18fc4902396c43ab06fabc119ac6ecb64/s2.asm#L37754).
Asymmetric downhill force is an authored nonconservative force; base mechanical
energy may increase by its accounted extra work, minus friction. It is not a
hidden velocity kick or a claim of conservative gravity.

Short hop cuts only the tracked remaining vertical jump-generated budget, which
decays by.35 per airborne tick. It does not clamp inherited uphill vy or alter
later unrelated falls. Head impact clears the budget. No coyote time or landing
jump buffering. A grounded physical press queues only the next simulation tick;
holding through landing does not jump again. Pause/resume discards pending keys
and cut eligibility without changing position or vector. Reset/exit clears all
experimental contact, path and jump state. Both legacy acts retain their behavior.

## Connected geometry and contact rules

New fixtures are ordered line/circular-arc chains parameterized by length.
Positions and unit tangents agree at every join (C1); curvature changes at
line/arc joins. The full circle is no longer represented as y(x). The same
analytic geometry is used for physics and rendering; no invisible support path
is drawn differently from collision. The solid track strip is12 units thick.

Ground standing is the approved22×48 oriented box; rolled shape is a diameter38
circle. Air standing stays an upright22×48 box. Path standing-foot clearance
solves the small normal offset needed by the flat box corners against adjoining
material; anchor and tangent speed remain unchanged. It is bounded below2 units
for these fixtures and checked by body-overlap tests. Artwork and outline use
that actual body center, while the yellow anchor stays at the surface point.
Posture expansion requires clearance. Ordinary obstacle walls and ceilings remain
solid blockers and are never promoted into drivable paths.

Loop bottoms are explicit **path crossovers**: overlapping nonlocal branches are
resolved by connected path position and the body's geometric footprint. They
are not all simultaneous collision layers. On departure, already overlapping
nonlocal layers are excluded only until geometric separation; no timer or speed
eligibility gate enables the route. The HUD exposes pathS and contact normal.
This connectivity prevents flat approach motion colliding with the other branch
of the same loop while preserving jump entry and later reattachment.

Support uses the approved kinematic contact-anchor convention: with surface
curvature k and body offset r, reaction is `-v²*k*(1+r*k)-gravity*N.y`.
Body-center offsets are not treated as a separately conserved rigid-body velocity;
release preserves the documented anchor velocity v*T without a rotation bonus.

- Original floor crest grip stays unchanged. New path grip applies only on
  upward floor-facing surfaces, not vertical/inverted faces.
- Curved wall/ceiling contact also requires nonnegative normal support
  (numerical tolerance1e-6). Inadequate momentum releases to air with v*T.
- On steep path faces (normal.y≥-sqrt(.5)), speed below2.5 releases traction.
  Straight wall/ceiling faces can retain explicit grip above that threshold.
  The HUD labels this STEEP GRIP; it supplies no tangent propulsion.
- The2.5 threshold is the classic `Sonic_SlopeRepel`0x280 steep-contact rule,
  limited to steep designated surfaces. It is not a loop-entry speed gate,
  automatic completion rule or unconditional wall/ceiling adhesion.

Airborne arc collision isolates every trajectory/circle intersection on the
remaining interval (polynomial degree≤4), validates sector and normal, and sweeps
finite endcaps independently. Rectangle corner and outer side candidates cover
the upright body; circle candidates cover rolling. This avoids the invalid
assumption that one convex endcap plane separates an entire concave arc.
Existing six-fixture CCD remains unchanged. Landing restores a fitting preflight
posture, projects incoming velocity, and checks support before attachment.
Back faces block rather than granting unsupported surface attachment.

## Springs, moving platforms and Spin Dash

Spring caps are 48 units wide with a solid 20-unit casing; the yellow cap is the
only active face. Drawing, clearance and collision use the same oriented pose.
Air sweeps isolate parabolic face/edge roots, including rounded circle/casing
corners; ground sweeps use the actual before/after body travel. Coplanar grounded
cap crossings bounce too. Sides and back block, and do not activate the spring.
No arbitrary cooldown: outward separation prevents a second launch on the same
contact; a later landing bounces again.

At impact, preserve relative tangent velocity, assign outward relative normal
speed18, and add the spring carrier velocity once. This is the explicit spring
impulse, not a general momentum override. Spring lift has no jump-cut budget;
held/released Jump cannot cut it. The diagnostic records spring ID, fractional
time, launch vector and launch count. Platform-mounted springs use the same pose
and fractional clock as their supporting platform, including reversals.

Moving platforms are solid horizontal rectangles with top-only attachment; sides
and undersides block. Landing stores incoming horizontal speed minus carrier vx.
Riding adds carrier travel once; jumping/walking off converts relative speed to
world velocity once, then clears `supportId`. No repeated velocity accumulation.
The ferry moves ±120 units at2 units/tick (period240); the elevator ±70 at1.55556
units/tick (period180). These bounded diagnostic cycles deliberately reverse
instantaneously; they are not acceleration-smoothed physical elevators.

A carrier genuinely pushing a rider into an obstruction triggers a visible
`blocked clearance reset`, at contact rather than after penetration. Ordinary
walking into a wall while its carrier moves parallel/away stays supported, as does
contact with the casing of a spring on the same carrier. This stage has no health,
crush-death animation, dynamic platform pushing/stacking or physical rigid bodies.

Spin Dash: on floor-facing terrain, at abs(speed)≤.5, hold Down and press Jump;
hold both for up to30 ticks (.5 seconds), then release Down. Charge is shown on
HUD and by the existing spinning artwork. Release is12..19 signed tangent units;
full charge loses only normal rolling friction in its release tick. Thereafter
approved rolling forces apply, with no input propulsion or momentum cap. Stronger
existing speed is never replaced by a smaller release. At high speed Down+Jump
remains a normal jump, not a forced charge. Slopes use the same tangent direction.
While charging, the existing standing brake/coast resistance braces the low-speed
player against gravity; no normal movement constants change. Opposite directional
input cancels charge. Jump release holds the accumulated charge while Down remains
held; pause/reset/exit, support loss and spring launch cancel pending charge without
a deferred launch. Boost remains disabled.

## Repeatable fixtures and controls

Original Flat, Valley, Crest, Gap, Wall and Low ceiling remain unchanged.
Original safe bounds, gap recovery and reset mechanics remain available.
New buttons reset without carrying momentum from another fixture:

| Fixture | Geometry / reset |
| --- | --- |
| Loop → / Loop ← | Radius96; floor y600;1000-unit approaches; spawn140 units from selected end |
| Wide loop | Same chain at radius140; left approach |
| Walls / ceiling → / ← | Radius120 corners,60-unit vertical wall portions,360-unit ceiling; floor y440 and ceiling y140 |
| Springs | Raised upright cap x120/y376, horizontal caps, diagonal cap; safe floor y400 |
| Moving platforms | Horizontal ferry x0/y280 and vertical elevator x500/y280 above safe floor |
| Moving spring | Upright cap24 units above the horizontal carrier |

Hold Right to increase pathS through the whole loop; Left decreases it, including
while inverted. Air controls still operate in world x. Space jumps normal to the
current surface; tap Down to roll. R/Restart resets the selected fixture. P/Escape
pauses/resumes; the selector returns to Act1/2. End posts and deep-fall recovery
are labeled test resets, not collisions or evidence of unlimited geometry.

The wall route was sized so actual earned ordinary running can reach its ceiling,
not only artificially initialized test speeds. Only the new path fixtures limit
camera lookahead/lag to keep the player visible during rapid turns; the original
fixtures and both acts retain their existing camera behavior and zoom.
Only springs, moving platforms and Spin Dash were added. No rails, Boost, enemies,
bosses or existing-act changes.
Supported surface graphs here are the tested ordered analytic chains, not an
arbitrary branching world or an existing-act migration.

## Measured evidence and verification

Baseline:469 gameplay tests,9 build tests, compatibility/player checks passed.
Final commands pass: `npm run build:player`, `npm run build`, `npm test`
(**488**), `npm run test:build` (**10**), `npm run check:compat` (**32 modules**),
`npm run check:player`, `npm run package`. Nineteen device tests exercise the real
controller. All accepted ground/air/path tests and Act1/2 regressions are retained.
The build test additionally checks every manifest module is registered in browser
startup order; this catches the missing device initialization discovered by the
first extracted-package browser run. The old isolation test now expects Down+Jump
to charge PLAYTEST instead of advancing forward; protected legacy state is still
compared unchanged. No tests were disabled or weakened to hide a regression.

Device evidence (units/tick, one simulation owner):

| Start / input / duration | Measured or bounded outcome |
| --- | --- |
| Flat rest, Down+Jump30 ticks, release Down one tick | Charge30; speed18.975, x18.9875, ticks31; zero pre-release travel |
| Standing spring approach center(120,330), vy35, one tick | Impact tick.626607955; outgoing vy-18; end vy-17.869312784; one launch |
| Same spring, no input120 more ticks | Two launches total; repeated cap landing works |
| Ferry landing then speed0 relative,300 ticks | Same support; y error<1e-6 through reversals, no velocity accumulation |
| Either platform edge, relative speed±8, carrier moving±2 | World takeoff=relative tangent+carrier once; pre-edge coast error<.01 |
| Elevator jump near/before/after reversal | Outgoing vy=carrier vy-10.5; one full tick adds.35 gravity only |
| Full dash into loop, either direction | Rolls through without boost, air transition or entry speed replacement |
| Carrier against sidewall / own spring casing | No false crush; elevator tracking error<1e-6; no time discarded |
| Carrier pushing into overhead blocker | Explicit safe reset at contact; penetration≤.001 |
| 30/60/120 Hz and uneven schedules,2 seconds | Identical120 controller ticks and player state |

Cap tests cover upright/rolled approaches at20/45/70 units, inactive casing sides
and back, coplanar active-face crossing, diagonal tangent preservation, moving
spring launch, both carrier directions, underside blocking, slopes, cancellation,
reset/pause/scene switching and dash/loop integration. Exact launch-vector checks
use1e-7..1e-6 tolerances; contact/swept-body checks use.001 rather than arbitrary
endpoint assertions. Independent review found the own-casing reset and discarded
carrier-time bugs; their failing reproductions now pass and bounded re-review
found no blocker.

Preserved PATH-1 benchmark evidence (underlying ground/path tuning unchanged):

| Start / input | Outcome |
| --- | --- |
| Radius96, standing14,20 units before entry, hold travel direction |47 ticks through exit+30, both directions; minimum speed11.9450, no air transition |
| Same at24 |29 ticks; minimum21.0168; faster traversal |
| Radius140 at14 /24 |67 /43 ticks; minimum10.8978 /19.4939; symmetric directions |
| Actual running from rest at reset |Loop exits after151 ticks; Wide after171; wall/ceiling after197 forward /223 reverse; no air transition |
| Radius96 rolled3,2 units into entry, no input |Reverses downhill on tick24; speed magnitude.19106 at first reversed tick; no entry speed grant |
| Ceiling rest speed1 |Detaches; no upright floor-grip leak onto ceiling |
| Wall/ceiling jumps at signed16 |World vector equals incoming v*T+10.5*N; one tick owner in either direction |
| No-input standing24 loop |32 ticks; base energy305.5→238.165160; friction67.339858; max accounting error.007737 (<.05) |

Twenty-four speed/posture/direction ground runs (24/60, both signs, standing/roll)
check active material penetration≤.003 through joins. Air checks cover upright
and rolled40-unit tangent approaches in both directions and both explicit review
regressions near sector endpoints at speeds71.55 and79. The review found sector
entry/convex-plane misses; direct intersections and independent cap sweeps fix
those exact failures. Final focused independent review found no further blocker.
Join position/tangent probes use1e-6 offsets and1e-5 continuity tolerances; energy
uses the original.05 budget rather than an arbitrary exact endpoint assertion.
Reattachment checks discard normal velocity and forbid speed amplification.
Crossover jumps, intentional reverse re-entry, pause/reset/scene changes and
30/60/120 Hz plus uneven schedules pass;3 simulated seconds produce identical
180-tick player and camera state. This is bounded evidence, not proof for every
possible future surface graph or a substitute for user feel approval.

Freshly extracted package smoke passed in Chromium151.0.7922.173 over local HTTP:
all previous fixtures, five loop/wall/ceiling approaches, all three device buttons,
actual spring launch and uncut continuation, carrier riding/reversal/jump, moving
spring velocity, Spin Dash through real DOM inputs, pause/reset, and Act1/2
running/jumping/boosting/clean switching. Zero page errors. Actual rendered Sonic
and spring/casing were inspected. Observed worst loop update3.8ms in this bounded
run; not a full render/device performance guarantee or human feel approval.

## Package and access

Generated ZIP: `/workspace/sonic-coast-playtest/dist/Neon-Express-player.zip`.
**52,332,768 bytes,37 files**, CRC checked; every extracted entry matches the
committed build (player index maps to PLAY.html).
SHA256:`1d87851d49f7032aafc822d823bac915187b73e2d41aa26c3446fe3492b88d99`.
Runtime:`runtime-e3819878416facf6.js`; CSS:`style-c9f48a6e01dc8ece.css`.

No ZIP attachment/upload or isolated public preview service is available here.
The feature branch's immutable GitHub source archive is the accessible fallback;
it contains ready-built `Inferno-Ascent-Game/PLAY.html` and the matching assets.
A source archive is distinct from the generated player ZIP; neither a repository
link nor a local server address is a public playable preview.

Player-package entry: `index.html`. Source-archive entry:
`Inferno-Ascent-Game/PLAY.html`. Direct-file loading was attempted first and
blocked by browser environment policy (`ERR_BLOCKED_BY_ADMINISTRATOR`). Verified
local HTTP fallback uses Python3 from the extracted game directory:
`python3 -m http.server 8000 --bind 127.0.0.1`; open `http://127.0.0.1:8000/`
for the player ZIP, or `/PLAY.html` when serving the source archive's game folder.
Windows batch launcher requires Python and was not run on Linux. No public
preview, deployment, new PR or merge is claimed.

## Manual approval checkpoint — STOP

1. Flat/Valley: Down+Jump at rest; charge, release Down, brake, cancel with the
   opposite direction. Compare short/full charge and both slope directions.
2. Springs: jump onto the yellow cap repeatedly; run into casing sides. Check
   jump release leaves spring height intact, then try horizontal/diagonal caps.
3. Moving platforms / Moving spring: jump aboard, ride through a reversal,
   walk off either edge, jump while moving, and bounce from the moving cap.
4. Recheck approved loop traversal, valley rolling, upright crest grip and quick
   low-speed turns. Pause/reset and switch to each act during a charge or flight.

Wait for explicit personal playtest approval. No rails, Boost, act migration,
new PR, merge, deployment or later feature work.
