# PLAYTEST — PATH-1 / AIR-2 / GROUND-5

## Approval, branch and build identity

Continue `codex/playtest-physics`; do not recreate from main. Scaffold handoff:
`docs/playtest-scaffold.md`. The user personally approved scaffold access,
GROUND-3, AIR-2/GROUND-4 (upright crest grip/quick turns), and GROUND-5 downhill
rolling with “perfect.” This stage is **not yet approved for feel**.

Starting SHA: `6a5841b631ba7c82152e81aeef3d0d9feb539813`, clean working tree.
**Exact tested implementation: `21a358d04b2b7d251aa48c8d877e3eb7cb5a7f0c`.**
This record is a subsequent documentation-only commit. Node v24.19.0,
npm11.9.0; existing lockfile dependencies reused with no dependency changes.
The preceding approved documentation remains available in Git at the starting SHA.

GitHub REST and `gh` GraphQL requests both returned403 in this environment.
Available Git refs contained25 PR heads, none matching the current branch head.
Therefore associated open/draft PR metadata could **not** be verified. No PR was
created, converted, merged or otherwise modified. No Pages workflow dispatched,
hosting changed, deployment performed, or existing-act physics migrated.

## State and time ownership

`src/playtest-motion.js` remains the only movement/time controller.
`src/playtest-ground.js` supplies the same force integration; its only extension
is an optional arc-length coordinate. `src/playtest-path.js` supplies analytic
geometry, body clearance and collision queries, never a second movement loop.
`src/playtest.js` owns input, scene lifecycle, camera, renderer and diagnostics.
Scene ID remains `'playtest'`. Compatibility JS and browser bundles are generated
by repository tooling from canonical `src/`; generated JS is never hand edited.

| State | Position authority | Velocity authority |
| --- | --- | --- |
| Original grounded fixtures | Contact anchor world x | Signed surface `speed` |
| New path fixtures | `pathS`, distance along the connected path | The same signed surface `speed` |
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
Ticks increment once even across transitions. Rendering never advances physics.
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

## Repeatable fixtures and controls

Original Flat, Valley, Crest, Gap, Wall and Low ceiling remain unchanged.
Original safe bounds, gap recovery and reset mechanics remain available.
New buttons reset without carrying momentum from another fixture:

| Fixture | Geometry / reset |
| --- | --- |
| Loop → / Loop ← | Radius96; floor y600;1000-unit approaches; spawn140 units from selected end |
| Wide loop | Same chain at radius140; left approach |
| Walls / ceiling → / ← | Radius120 corners,60-unit vertical wall portions,360-unit ceiling; floor y440 and ceiling y140 |

Hold Right to increase pathS through the whole loop; Left decreases it, including
while inverted. Air controls still operate in world x. Space jumps normal to the
current surface; tap Down to roll. R/Restart resets the selected fixture. P/Escape
pauses/resumes; the selector returns to Act1/2. End posts and deep-fall recovery
are labeled test resets, not collisions or evidence of unlimited geometry.

The wall route was sized so actual earned ordinary running can reach its ceiling,
not only artificially initialized test speeds. Only the new path fixtures limit
camera lookahead/lag to keep the player visible during rapid turns; the original
fixtures and both acts retain their existing camera behavior and zoom.
No springs, moving platforms, Spin Dash, rails, Boost, enemies or bosses added.
Supported surface graphs here are the tested ordered analytic chains, not an
arbitrary branching world or an existing-act migration.

## Measured evidence and verification

Baseline:457 gameplay tests,9 build tests, compatibility/player checks passed.
Final required commands all pass, in order: `npm run build:player`, `npm test`
(**469**), `npm run test:build` (**9**), `npm run check:compat` (**31 modules**),
`npm run check:player`, `npm run package`. Twelve path regressions exercise the
actual controller, alongside every accepted ground/air and Act1/2 regression.
Only intentional module-list/runtime setup changes affect shared test support.

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
all five new fixture buttons, real wall/inverted traversal and exit from earned
running, low-speed failure, jump/pause/reset, prior fixtures and both legacy acts'
running/jumping/boosting, and clean switching. Zero page errors. Inspected actual
rendered inverted Sonic. Observed worst update time across bounded fixture runs:
3.5 ms; this excludes draw cost and is not a device-wide performance guarantee.

## Package and access

Generated ZIP: `/workspace/sonic-coast-playtest/dist/Neon-Express-player.zip`.
**52,327,821 bytes,37 files**, CRC checked; every extracted entry matches the
committed build (player index maps to PLAY.html).
SHA256:`2aa3ea86f50f378ce415ec2c4fed6a5752c74260dca0b9146de90277b24ebb8e`.
Runtime:`runtime-5c8218cb57c4d997.js`; CSS:`style-c9f48a6e01dc8ece.css`.

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

1. Loop → / ← and Wide: hold direction from reset, then try entering slowly,
   rolling, braking, reversing and jumping from different parts of the loop.
2. Walls / ceiling in both directions: follow the curved wall onto the ceiling;
   jump off, lose momentum, fall and reattach. Watch normal and STEEP GRIP status.
3. Check speed and body outline at joins/crossover; try repeated traversal,
   pause/reset while inverted, and switching to both acts during a jump.
4. Recheck Valley's approved downhill roll, floor Crest grip and quick roll turns.

Wait for explicit personal playtest approval. Do not begin later features.
