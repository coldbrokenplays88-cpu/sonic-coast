# PLAYTEST physics — shared rolling transitions / GROUND-6

## Current correction: shared momentum posture rules

Starting SHA: `62fa7a4ffa11638e5bbe4cf4b750048b5e7956d0` on the same
`codex/playtest-physics` branch. The user requested this across the shared momentum
physics, not just Act 1. `beginGroundTick` now uncurls a moving roll immediately
on opposite-direction input when standing clearance exists, using the existing
.5 standing brake and brake artwork. Held Down cannot silently recurl that turn.
Both PLAYTEST and Act 1 use this rule; future integrations inherit it.

Ground, curved-path and moving-platform landings share `landingGroundPosture`:
resume standing when it fits, retaining the roll only for constrained clearance.
This replaces restoration of a stale pre-flight roll after upright falling or
launch animations. Continuous grounded rolls and their downhill multiplier,
friction, momentum, jump/Boost values and geometry are unchanged. Just-departed
rolled crests still require physical separation before upright grip can reattach.
PLAYTEST now draws the existing brake frames for its standing countersteer.
Act 2 remains on its existing legacy controller pending the separate migration.

Verification: seven new regressions cover this correction; the reproduced state
failures now pass;
**543/543 gameplay tests,10/10 build tests**, `build:player`, generated checks and
`package` pass. Earlier rolling-countersteer assertions now explicitly cover the
remaining rolled case with obstructed standing clearance; unobstructed turns are
covered by the new standing-brake tests. No force constants or test thresholds
were weakened. The input-only Act 1 replay brakes before closely spaced hazards
to reflect the new standing transitions; it still uses actual production inputs.

Fresh ZIP browser smoke passed in Chromium151: shared standing posture, actual
brake-atlas draw, low-clearance/crest regressions, all earlier benchmark fixtures,
Act 1 completion at tick2117 with0 hits/deaths, both express routes, Act 2 flow and
scene switching. Zero page errors. This is automated verification, not user feel
approval. Direct-file loading remains blocked by the browser environment policy;
the extracted package loads through the verified Python3 HTTP fallback.

Exact tested implementation: `eddc4503325569f141136be104d3d995939cd628`.
This identity line is a subsequent documentation-only change.

Current ZIP: `dist/Neon-Express-player.zip`,37 files,52,342,802 bytes.
SHA256: `9bada43b1a6b6ec4ef0549400c2109286775fd6c13db2fa262925fd819194a2b`.
Runtime: `runtime-38d6781cee9f412a.js`; CSS remains `style-c9f48a6e01dc8ece.css`.
The source archive uses `Inferno-Ascent-Game/PLAY.html`; the player ZIP uses
`index.html`. No attachment service or public preview is available. No PR,
merge, deployment or Act 2 migration. **Stop for user feedback.**

Manual check: roll quickly and press the opposite direction in PLAYTEST and Act 1;
look for immediate standing braking without losing the contact anchor. Jump or
fall from a roll and check the clear landing resumes running. Repeat under a low
ceiling, where standing must remain blocked until Sonic has room.

---

## Earlier Act 1 integration record

## Current stage: Act 1 only

The user approved build `8a7e57b` and explicitly authorized Act 1 integration.
Act 1 now uses approved PLAYTEST forces; PLAYTEST remains the reference scene.
**Act 1 awaits personal playtest approval. Act 2 has not been migrated.**
The older benchmark record below describes earlier stages, not current Act 1.

Starting SHA: `8a7e57bd614270ea7b39b7a8fbc951b0c89d0b4c`, clean feature branch
`codex/playtest-physics`. Node24.19.0/npm11.9.0, existing dependencies/lockfile.
No matching open PR returned by GitHub; none created or modified. No main,
hosting, merge, deployment or ready-state changes.

**Exact tested implementation commit:** `b59fe32d54e273713b56db42c2a627d76d8cd4d8`.
This identity record is a subsequent documentation-only change. All37 ZIP
entries were compared byte-for-byte with that commit (player index maps to
PLAY.html; hashed CSS maps to style.css). Runtime/package content is unchanged.

### Movement ownership and compatibility decisions

- `src/act1-motion.js` is Act 1's sole movement owner. It adapts the actual finite,
  stacked authored surfaces, using approved `beginGroundTick`,
  `advanceGroundSubstep`, `finishGroundTick`, Spin Dash and Boost state functions.
  Pure air-force calculation was extracted without changing PLAYTEST behavior.
- Ground `speed` is signed tangent velocity relative to its support; air `vx/vy`
  own airborne motion. Legacy `p` is a presentation/interaction projection.
  Damage, enemy rebound and explicit scripted control changes are adopted at
  defined handoffs; legacy gravity/integration do not also advance Act 1.
- Discrete existing platform poses interpolate within their original ticks.
  Carry is applied once; jump/edge release inherits measured carrier velocity
  once. Platforms retain their sinusoidal motion, crumble/reset rules and one-way
  landing behavior. Joins include ramps ending on overlapping lower roofs.
- Upright floor crest grip remains approved; a rolled body leaves an actual
  convex lip with its earned tangent vector. No new speed assists or eligibility
  rules were added. Existing express `entrySpeed:20` remains in world-horizontal
  units, including its authored monitor placement. Both express routes are
  reachable with the existing fresh midair Boost burst after ramp takeoff.
- Act 1 retains its original six-tick coyote and eight-tick jump buffer, plus
  six-tick roll-input buffer. These are control compatibility, not force changes;
  PLAYTEST still has no coyote/landing buffer. Landing consumes a queued jump at
  contact time. A Spin Dash charge cannot leave an ordinary jump buffered.
- Standing collision remains22×48; rolling is the approved38-unit circle.
  Rendering uses its actual normal-offset contact anchor; source artwork and
  animation sequences are unchanged. Hazard queries use the migrated dimensions.
- **Explicit user-approved geometry exception:** all five Act 1 tunnel ceilings
  gain7 units of clearance, from33 to40 (`h:177`→`170`). Their tops, widths,
  positions and floors are unchanged. No other level geometry changed.
- Act 1 has no authored loops, grindable rails, springs, water, bosses or ending
  cutscene. Their accepted PLAYTEST regressions and legacy Act 2 tests remain;
  there is no claim of newly authored Act 1 coverage for absent content. A foreign
  spring/vent launch and scripted ownership are tested as synthetic adapter seams.

### Verification and measured evidence

Baseline: `npm test` **515/515**, `test:build` **10/10**, `check:compat` and
`check:player` passed before editing. Final `build:player`, `build`, `npm test`
(**536/536**), `test:build` (**10/10**), `check:compat`, `check:player`, and
`package` passed. No disabled tests or dependency changes.

Historical force-value unit fixtures explicitly use `bootLegacy`: they still
exercise the preserved controller shipped for Act 2, including Act 1 terrain
fixtures. They are not presented as migrated Act 1 runtime coverage. New
`test-act1-motion.cjs` has21 focused integration tests. The only old numerical
expectation updated is Act 1 braking after respawn (9→8.5 in one tick), since
respawn selects the approved.5 brake rather than the legacy1.025 brake.

Fresh extracted ZIP browser smoke: Chromium151.0.7922.173, zero page errors.
It checks approved PLAYTEST fixtures, pause/reset/switching, Act 2 run/jump/Boost,
and actual Act 1 routes using normal input handlers:

| Authored replay | Result |
| --- | --- |
| Full Act 1, no Boost | Finish at tick2492 (41.53 simulated seconds),0 hits/deaths, all checkpoints,4 express landings,9 recoveries,32 surfaces |
| Long Shot Boost express, from its checkpoint | Reaches `rail-28` at tick205,0 hits/deaths |
| Final Transfer Boost express, from its checkpoint | Reaches `rail-72` at tick190,0 hits/deaths |

These are deterministic input replays, not human playtests or optimal route times.
The full browser replay, including periodic draws, took1.81 seconds wall time;
this is a bounded smoke measurement, not a laptop/device performance guarantee.
A rendered38-unit rolling Sonic was also inspected inside the widened tunnel.

Independent review found a zero-duration wall-contact division bug. Its regression
failed before the fix, then passed along with the complete suite. Other focused
checks cover fast/side contacts, uphill/downhill rolling, uncurl/turns, carrier
reversal and jump, actual rebound drone, monitors, damage/death/checkpoint reset,
air-burst eligibility/cost, buffered input, map bounds and scripted handoffs.
No confirmed unresolved defect remains in this bounded pass; personal feel review
and exhaustive combinations are still outstanding.

### Current package and access

Generated package: `/workspace/sonic-coast-playtest/dist/Neon-Express-player.zip`.
37 files,52,342,575 bytes. SHA256:
`958222e6e6b077ab1bd39f4f7002ca0789e92786eaf489f0887020274e17d0c5`.
Runtime: `runtime-8f1f1bb01cf41897.js`; CSS: `style-c9f48a6e01dc8ece.css`.
Extracted and browser-tested separately from the checkout.

No ZIP attachment service or isolated public preview is available. Use the
immutable source archive of the final feature commit as the accessible fallback.
Its game entry is `Inferno-Ascent-Game/PLAY.html`; the player ZIP entry is
`index.html`. Direct-file launch was attempted and blocked by the cloud browser's
`ERR_BLOCKED_BY_ADMINISTRATOR` policy. Verified fallback, from the appropriate
game directory: `python3 -m http.server 8000 --bind 127.0.0.1`, then open
`http://127.0.0.1:8000/` (player ZIP), or `/PLAY.html` (source archive).
This local address is not a public website. Windows launcher needs Python and
was not executed on Linux. No public preview or Pages deployment is claimed.

### Act 1 manual approval checkpoint — STOP

1. Run, brake and reverse; compare downhill rolling with ordinary running.
2. Roll through tunnels; jump from ramps into upper/recovery routes. Test moving
   decks, crumble landings, the rebound drone and both Boost express approaches.
3. Try short/full jumps, held ground Boost through takeoff, then a fresh air burst.
   Pause/retry, die at a checkpoint and switch between all three scenes.

Wait for explicit personal Act 1 approval and authorization before Act 2 work.

---

## Earlier approved PLAYTEST benchmark record

## Approval, branch and build identity

Continue `codex/playtest-physics`; do not recreate from main. Scaffold handoff:
`docs/playtest-scaffold.md`. The user approved the springs/platforms/Spin Dash
update and DEVICES-2 jump-through correction with “perfect” before requesting
this stage. **RAIL-BOOST-1 was personally approved before Act 1 integration.**

Starting SHA: `ef7881abf183e6c5c552c4550bf45681c9fbdd52`, clean working tree.
Node v24.19.0, npm11.9.0; existing lockfile dependencies reused, no dependency or
asset generation changes. **Exact tested implementation commit: `cda7abda45c9eb1a4f0882ebfd6135f07535f76e`.**
This commit-identity record is a subsequent documentation-only change; runtime
and package hashes below identify the same tested player build.

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
it never owns a second update or clock. `src/playtest-rails.js` supplies finite rail geometry/capture queries;
`src/playtest-boost.js` supplies resource/input state. Neither advances time.
`src/playtest.js` owns input, scene lifecycle, camera, renderer and diagnostics.
Scene ID remains `'playtest'`. Compatibility JS and browser bundles are generated
by repository tooling from canonical `src/`; generated JS is never hand edited.

| State | Position authority | Velocity authority |
| --- | --- | --- |
| Original grounded fixtures | Contact anchor world x | Signed surface `speed` |
| New path fixtures | `pathS`, distance along the connected path | The same signed surface `speed` |
| Moving-platform contact | Contact anchor world x/y plus `supportId` | Signed `speed` relative to the platform; world velocity=`speed*T+carrier velocity` |
| Grinding | Contact anchor world x/y plus `railId` | The same signed tangent `speed`; no second rail velocity |
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

## Grind rails and Boost

The new Rails + Boost and Rails (empty meter) fixtures are reachable from safe
floor spawn(-780,400) by ordinary running and jumping; no Boost/Spin Dash needed.
Their finite main rail spans x[-600,600], y240..300, using four cubic Hermite
sections with continuous position/tangent (C1). A second rail spans[1000,1400],
separated by an actual400-unit gap. Terrain below remains safe floor y400.
Pieces retain explicit `grindable`, `routeType` and `infiniteBoost` metadata:
only the two middle sections[-300,300] are gold/free. Blue ends/second rail are
paid. No one-way direction gate, entry speed replacement or magnetic snap.

Capture solves the actual parabolic feet/rail intersections (polynomial degree≤6),
checks finite bounds and incoming normal direction, and projects velocity onto T.
Undersides and missed gaps do not capture. Standing collision remains upright22×48,
with feet at the rail rather than a normal-offset rotating box; artwork uses the
existing grind atlas. Standing entry preserves body center within.001. A curled
entry uncurls at the same foot anchor, as on an ordinary landing (the normal
38→48 posture height change is explicit). No art redraw or new collision size.
Smooth joins retain signed speed. Rail friction.025, rail drive.08, opposite
brake.45, ordinary running drive range14, and gravity.35 act on tangent speed.
These controls are rail-specific; all approved floor/rolling forces are unchanged.
Down/Spin Dash cannot turn grinding into an ordinary roll/charge. Jumps add10.5*N;
ends release v*T once, with no extra impulse. Departed rail contact is excluded
only until geometric separation; it can be captured again from above.

Meter maximum90. Ground Boost costs.5 per tick of actual paid grounded time,
including time held against a wall. Full/empty meter reset with the selected
fixture; no item monitors or meter regeneration were added. Explicit
`grindable && infiniteBoost` grants free Boost even with zero/locked meter.
Leaving that metadata region immediately restores paid rules; joins and meter
exhaustion partition the tick so no free quarter-tick leaks across a boundary.
The charged ground force approaches target23 with response.14 per60-Hz tick
(`1-.86^dt` for a partial tick); it never clamps a faster earned speed. Rolling
friction still applies while curled. Boost is unavailable during Spin Dash charge.
The existing acts' hurt/wrong-route/bubble-slam restrictions were inspected; those
states do not exist in this prototype and were not imported as artificial gates.

Shift/X/MouseBoost share a fresh-press group. An air press buys exactly22.5 once
per airborne period, for up to18 held ticks; release cancels the remaining burst
without refund. Holding ground Boost through jump/takeoff does not create this
request, including a ground press and jump in the same update. A second held key
is not another fresh press. Landing on actual floor/rail/platform contact restores
the allowance; a spring launch alone does not. Pause clears pending presses and
remaining burst while preserving spent allowance and meter; reset/exit clears all.

The **deliberate air burst** sets world vx=`face*max(23,vx*face)` and vy=0, clears
jump-cut lift, then suppresses gravity/steering for its remaining held ticks. This
matches the existing burst design and preserves faster aligned horizontal speed;
it is the only qualifying input that replaces an inherited spring/platform vy.
Routine held Boost in the air does nothing without a burst. Spring contact cancels
an ongoing burst before applying its own launch, without restoring spent allowance.
After the burst, existing air gravity/control resume. Ordinary loops still complete
without Boost. No existing acts' Boost/rail/controller code changed.

A resolved side contact constrains relative movement while the controller continues
time, carrier travel and meter accounting. Its resting normal contact is retained
without repeatedly applying zero-time propulsion; other colliders and a carrier
reversing into that contact still test normally. No second time owner or discarded
blocked time is used to hide contact or resource bugs.

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

Moving platforms are **one-way top surfaces**: jump through from below or the
side, then land when descending feet cross the top plane relative to the platform.
Crossing time is solved continuously, including high speed and vertical platform
reversals. A partial jump that never lifts the feet above the top cannot attach
from inside the deck. A platform alone does not block posture expansion below it.
Spring casings and other solid object colliders remain independent: the spring's
occupied footprint blocks ascent, while clear deck sections on either side remain
jump-through and landable. No item-monitor system was added in PLAYTEST.
Landing stores incoming horizontal speed minus carrier vx.
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
a deferred launch. Boost excludes the charging state.

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
This stage adds only grind rails and Boost to the approved PLAYTEST mechanics.
No enemies, bosses, existing-act migration or unrelated gameplay changes.
Supported surface graphs here are the tested ordered analytic chains, not an
arbitrary branching world or an existing-act migration.

## Measured evidence and verification

Stage baseline:492 gameplay tests,10 build tests, compatibility/player checks passed.
Final commands pass: `npm run build:player`, `npm run build`, `npm test`
(**515**), `npm run test:build` (**10**), `npm run check:compat` (**34 modules**),
`npm run check:player`, `npm run package`. Twenty-three new rail/Boost regressions
exercise the real controller, alongside
all23 device tests and prior ground/air/path and Act1/2 regressions.
The build test additionally checks every manifest module is registered in browser
startup order; it was added after the preceding stage's extracted-package test
caught missing device initialization. The old isolation test now expects Down+Jump
to charge PLAYTEST instead of advancing forward; protected legacy state is still
compared unchanged. No tests were disabled or weakened to hide a regression.

Rail/Boost evidence (same real controller; speeds in units/tick):

| Start / input / duration | Verified outcome |
| --- | --- |
| Descending standing capture, world vx±12/±45, vy40 | Projected signed speed; center displacement<.001; no entry grant |
| Rail speed±20 across joins, no input35 ticks | Per-step travel<25; gravity+friction energy-accounting error<.08 |
| Jump from rail and return; speed±24 at either end | Re-capture allowed; exact single v*T conversion at end; jump adds10.5*N |
| Free→paid boundary, speed±20, .2 units before it | ~.99 tick paid; meter30→29.505 within.002, both directions |
| Ground Boost held30 ticks from rest | Meter90→75, signed speed>22; initial35 is not clamped |
| Real run40 ticks + jump50 ticks, then Boost12 | Both fixtures capture; free section speed20.671267, meter stays90/0 |
| Air burst initial vx30/vy-12, held18 ticks | vx30 retained, vy0, meter67.5, remaining0; gravity resumes next tick |
| Insufficient0/1/22.49 versus exact22.5 | No partial burst; exact cost buys one, no repeated purchase until landing |
| Spring struck by an active burst | Spring applies launch, burst cancels, spent allowance/meter retained |
| Paid Boost at static wall/elevator/casing10 ticks | Meter85; no zero-time collision loop; carrier time remains correct |
| Render schedules30/60/120 Hz and uneven,1 second | Identical60 player/controller ticks and resource state |

Independent review found repeated Boost propulsion at a blocked carrier/casing and
lost meter cost during blocked time. Both failing repros and re-review pass. The
full prior sweep regression also exposed the need to retain a resolved rolled
resting contact while consuming time; it now passes without changing tolerances.
No prior test expectations were changed for this stage. The browser script now
expects the RAIL-BOOST-1 build and additionally tests earned rail access, zero-meter
free Boost, paid ground cost, no held takeoff burst, and a fresh18-tick air burst.

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
spring launch, both carrier directions, jump-through/descending catch, partial ascents, solid
mounted-spring obstruction and clear-deck access, slopes, cancellation,
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
spring velocity, empty-deck jump-through on both sides of the spring versus its
solid footprint, Spin Dash, earned rail access, free Boost at0, paid ground cost,
fresh air burst18 ticks through real DOM inputs, pause/reset, and Act1/2
running/jumping/boosting/clean switching. Zero page errors. Actual rendered Sonic
on the grind rail, spring/casing and empty-meter FREE RAIL HUD were inspected. Observed worst loop update5.1ms in this bounded
run; not a full render/device performance guarantee or human feel approval.

## Package and access

Generated ZIP: `/workspace/sonic-coast-playtest/dist/Neon-Express-player.zip`.
**52,336,594 bytes,37 files**, CRC checked; every extracted entry matches the
committed build (player index maps to PLAY.html).
SHA256:`be5fd0afc16e629227843a8aa89c596269034c6a9a323e045526e6e3f39caaf8`.
Runtime:`runtime-6c5ff8f00c0b8113.js`; CSS:`style-c9f48a6e01dc8ece.css`.

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

## Previous device manual checks (still applicable)

1. Flat/Valley: Down+Jump at rest; charge, release Down, brake, cancel with the
   opposite direction. Compare short/full charge and both slope directions.
2. Springs: jump onto the yellow cap repeatedly; run into casing sides. Check
   jump release leaves spring height intact, then try horizontal/diagonal caps.
3. Moving platforms / Moving spring: jump aboard, ride through a reversal,
   walk off either edge, jump while moving, and bounce from the moving cap. Jump
   up through clear deck sections; the spring casing should obstruct only its footprint.
4. Recheck approved loop traversal, valley rolling, upright crest grip and quick
   low-speed turns. Pause/reset and switch to each act during a charge or flight.

Those device checks remain regressions; the new approval checkpoint is below.

## RAIL-BOOST-1 manual approval checkpoint — STOP

1. Rails + Boost: run/jump onto blue or gold rail sections; grind both directions,
   brake, jump/reland and ride off either end. Try the gap to the second rail.
2. Rails (empty meter): reach the gold section with ordinary movement, then hold
   Shift/X. Boost should work at0 without spending meter; blue sections are paid.
3. Flat: hold Boost, jump while still holding, then release/repress in the air.
   Only the fresh air press should level the jump and spend22.5. Try a second press.
4. Recheck springs, jump-through moving platforms, Spin Dash and unboosted loops.
   Test Boost against a wall/casing, pause/reset, and switching to either legacy act.

This earlier rails/Boost checkpoint was approved. The current Act 1 approval
checkpoint at the top of this document supersedes it; Act 2 remains gated.
