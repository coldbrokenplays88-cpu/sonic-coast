# PLAYTEST — AIR-1 / GROUND-3

## Approved baseline and exact build

Continue `codex/playtest-physics`; no recreation from main. Scaffold handoff:
`docs/playtest-scaffold.md`. The user approved scaffold access (“yeah it works”)
and then explicitly approved GROUND-3 (“fucking perfect”) without outstanding
conditions before this airborne stage. Ground approval was not inferred from tests.

Starting SHA: `622c7a7649abe3c3b2fdcde2fa4c410accc82689`.
**Exact tested implementation: `d0bc375d9ccb4a231f601e939b6347840f5e2c82`.**
This record is a subsequent documentation-only commit. Ground implementation
baseline was `805b52e25ea8329827a3f585963d162768844074`.
Node v24.19.0, npm 11.9.0; installed lockfile dependencies reused unchanged.

## State model and units

`src/playtest-motion.js` is the sole experimental movement/time owner.
`src/playtest-ground.js` supplies the accepted ground integration primitives;
its standalone wrapper remains for regression comparisons. `src/playtest.js`
owns the `'playtest'` scene, input, reset, camera, renderer and diagnostics.
Act 1/2 controllers, geometry and cameras are unchanged. The shared edits only
register the module and update PLAYTEST presentation/routing. Generated
compatibility/runtime files come from `npm run build:player`.

One tick is 1/60 s; speed is world units/tick and acceleration units/tick².
Positive x is right; positive y is down. The logical viewport is 960×540,
zoom 1, using existing high-resolution crisp output. No historical Sonic
accuracy is claimed. Legacy inspection found ordinary speed range 14, feet at
`p.y + 20`, collision heights 48/26/38 and independent visual scaling; these
are context, not experimental body assumptions.

| Mode | Authoritative position and velocity | Derived values |
| --- | --- | --- |
| Grounded | `x` is contact-anchor x; signed `speed` along tangent; `air=null` | Analytic floor y, tangent/normal; world velocity `speed*T` |
| Airborne | `x,y` are body center; `air.vx,vy`; `speed=null` | Render reference at body bottom; no ground anchor/contact normal |

Cached grounded `y` is never a second position integrator. Legacy `p.vx`,
`contactSpeed`, loop state and legacy input mutations never advance PLAYTEST.
Four quarter-tick intervals partition at takeoff and time-of-impact events;
only their unconsumed time advances the new mode. Tick count increments once.
The 60 Hz accumulator uses a 1e-7 ms boundary tolerance, and caps per-render
catch-up at 250 ms. Rendering never integrates physics. Scheduling equivalence
is tested within that domain, not across arbitrary background suspension.

## Transition rules

| Event | Rule |
| --- | --- |
| Fresh grounded jump | Convert `speed*T`, add `10.5*N`; store vertical jump-lift budget; leave ground explicitly |
| Jump release | Once, while rising, add 60% of the remaining generated upward lift to vy; vx is untouched; clear budget |
| Ledge | Find the analytic support-span edge; release with the same `speed*T`, no jump impulse |
| Convex crest | Release when required support reaction becomes negative; locate crossing within substep; preserve `speed*T` |
| Floor landing | Project incoming velocity onto actual landing tangent; discard inward normal component; choose a fitting posture |
| Wall / ceiling | Sweep the actual body to first impact; remove inward normal velocity; constrain acceleration for remaining interval; never attach |
| Ground posture | Keep contact anchor; require actual body clearance before widening/uncurling |
| Reset / exit | Discard input edges, flight/contact history and experimental state; safe fixture spawn |
| Pause / resume | Preserve position/vector; discard pending edges and cut eligibility so clearing keys cannot create a synthetic short hop |

The jump-lift budget begins at `max(0,-10.5*normal.y)` and diminishes by gravity
0.35 per airborne tick. Early release keeps 40% of what remains; it never clamps
total vy. Inherited uphill lift survives even after the generated budget expires.
Ceiling impact and landing clear the budget. Ledge/crest falls have none.

There is no coyote time or landing-jump buffer. A physical grounded jump press
is queued only to the next simulation tick. An airborne press is not queued;
holding through landing does not jump again. Down's existing fresh-edge roll
input is preserved. Reset/switching clears all keys and pending edges.

### Contact geometry and support convention

Standing is a 22×48 box, ground-oriented by the surface tangent. Rolling and
ordinary curled flight use a diameter-38 circle. Airborne standing remains an
upright 22×48 box. Ground center is anchor plus `height/2*N`; renderer bounds
map to these dimensions using existing Sonic frames and palettes. Yellow is
the ground anchor/normal; pink is airborne center. Cyan outlines show bodies.
The HUD reports both reference and center so they cannot be mistaken for feet.

A jump curls around the unchanged ground anchor when the wider circle fits;
beside a wall it can retain the narrower upright posture. Automatic ledge/crest
curling preserves the existing center and also checks clearance. Landing
normally restores preflight posture around the landing anchor. If blocked,
it retains the actual fitting flight posture; no unchecked fallback expansion.
Upright floor sweeps report a corner witness: landing solves
`anchor.x + normal.x*24 = airborneCenter.x`, rather than treating the corner as
the center. Stationary wall-adjacent jumps therefore do not snap sideways.

Terrain is an analytic height field with unit tangent T, upward normal N and
signed curvature k (negative in the concave valley, positive atop the crest).
With contact-anchor travel speed v and body offset r, center normal acceleration
is `-v²*k*(1+r*k)`. Support reaction is that value minus `gravity*N.y`.
A crossing below -1e-6 releases contact; this tolerance is numerical, not a
speed gate. Tested curves have regular offsets (`1+r*k > 0`).

This remains the approved **kinematic contact-anchor model**, not a rigid-body
simulation: transition momentum is its reported `v*T`, not the derivative of a
rotating offset center. No body-rotation speed bonus is introduced at release.
Posture changes can move the center around a fixed anchor without an impulse.
Airborne energy is not reported using the ground-only reference formula.

Circle/floor distance uses bounded closest-point solving on these gentle
analytic curves; upright floor collision uses its footprint. Static obstacles
use circle/AABB distance or box separation; continuous conservative advancement
finds the first impact along constant-acceleration flight. Ground obstacle
sweeps use the corresponding circle or box sweep. Corner separation and
acceleration constraints avoid repeated zero-time impacts. No discrete endpoint
pass-through or silent unchecked advance is used. Iteration bounds fail loudly
if unsupported geometry fails convergence. Skin=1e-5; separation=0.002, a
geometric outgoing-contact tolerance, not a time-based adhesion/coyote rule.

## Tuning and supported fixtures

Ground constants are unchanged: run range 14, acceleration .16, brake .50,
released standing resistance .10, gravity .35, rolling resistance .025.
Opposing rolled input brakes by up to `.18*(1-abs(T.y))*min(1,abs(v)/2)`;
forward rolled input supplies no running propulsion. Roll entry needs fresh
Down at speed ≥2. Automatic uncurl requires speed <.08 for 12 eligible ticks,
low enough slope force for rest, and clearance. Steep-slope reversal stays
curled. Ordinary input does not clamp earned ground momentum.

Air acceleration .08; opposing brake .16; input-driven horizontal range 14.
Opposing input stops before reverse propulsion on a later tick. No-input flight
has zero horizontal friction. Same-direction input above 14 cannot erase earned
vx. Numerical speed >80 or non-finite state resets, separately from tuning and
outside normal benchmark travel. Gravity has no separate artificial fall cap.

- **Flat:** y400, x±5000; spawn0. Original acceleration/braking area.
- **Valley:** x±2400, flat bottom |x|≤200 at y650; C² transition to grade .65
  by |x|1000, then long approaches. Spawn0; original geometry unchanged.
- **Crest:** y=`400-100*(1-(x/360)²)³` inside |x|360, y400 outside; C² joins.
  Spawn -600, bounds±1800. Running toward it provides a repeatable release.
- **Gap:** floor y400 with open interval x100…300; spawn -250, bounds±1800.
  Visible solid edge columns extend downward; misses fall and reset.
- **Wall:** floor y400; solid x350…390, y150…400; spawn0, bounds±1800.
- **Low ceiling:** floor y400; solid x200…420, y320…357, clearance43;
  spawn0, bounds±1800. Rolling fits; standing does not.

Floor rendering and collision share the same sampler/spans. Buttons reset each
fixture; R/Restart resets the selected one. Orange boundary posts and falling
below y1350 reset to safe spawn, clear input and record a reason. Boundaries
are test utilities, not invisible support or evidence of obstacle handling.
No loops, walls/ceiling traversal, rails, springs, moving platforms, boost,
Spin Dash, water, enemies, bosses or goals run in PLAYTEST.

## Measured production-controller evidence

Measurements use actual generated production functions, not a parallel model.
Unless stated, controls are released. All durations are simulated 60 Hz ticks.

| Starting state and input | Duration | Measured outcome |
| --- | --- | --- |
| Flat x0, v±8, standing; hold jump | 60 | Center rise152.5; land x±480; incoming tangent speed±8 |
| Same; immediate release | 24 | Rise20.2; land x±192; tangent speed±8 |
| Valley x-1700, v-8 uphill; hold/tap | 72 / 42 | Rise243.323 / 84.504; right-slope mirror matches |
| Valley x-1700, v+8 downhill; hold/tap | 72 / 42 | Rise24.002 / 0 from initial center; mirror matches; tap still leaves surface |
| Valley x±1700, uphill speed22; release after one held tick | 1 more | vy differs from held by exactly .6 of remaining lift, vx identical, upward vy remains >10 in magnitude |
| Same uphill jump; release after32 held ticks | 1 more | Budget0; no change to inherited lift compared with continued hold |
| Air, flat center(0,0), vx±30/vy0; none or same-direction | 30 | vx remains exactly±30; opposite input produces±25.2 |
| Gap anchor x99, v14; right | 1 + 5 | Ledge release vector(14,0); one transition, no immediate reattachment |
| Crest anchor x∓20, v±4 / ±22; none | 20 | Low stays grounded; high releases once with identical before/after vector |
| Crest spawn -600, v14; hold right | 50 | Release x-114.766788, reaction≈-1e-6; vector(12.838031,-5.505162), unchanged by release |
| Valley x±1500, center65 outward, tangent±6 and inward normal8 | ≤20 | Landing tangent magnitudes4.99947/7.00053 depending uphill/downhill; mirrored and no speed amplification |
| Wall approaches at14,35,70, ground and air | 5 | Whole body blocked: standing center≤339.002; circle center≤331.002 |
| Stationary wall-adjacent upright jumps x339 and401 | 65 | Land standing at exactly same x; wall penetration0 |
| Ceiling center(300,380), circle vy-40 | 1 | Center≥375.998; head impact clears lift; no pass-through |
| Ceiling anchor(300,400), rolling/rest | 60 | Stays rolling at unchanged anchor; clears to standing12 ticks after moving to x500 |

Rise is measured from the pre-jump standing center; curling moves that center
5 units toward the anchor. Comparisons do not mistake that posture change for
an extra force. Landing evidence records the original incoming normal velocity,
before projection; dot-product checks use1e-8 tolerance, far below meaningful
speed differences. Contact/overlap tolerances of .001–.003 cover skin/TOI
roundoff, not a visible body width or a tunneling allowance.

Ground regression compares both flat/valley player x, speed, distance and posture
exactly with the approved integrator. No-input valley x-1800/v0 rolling,600 ticks:
energy273→106.870104, maximum273, peak speed21.464911, distance6645.20173,
zero airborne transitions. Lost energy166.129896 agrees with friction work
166.130043 (error.00014721). The .05 energy-error budget detects artificial
growth well below a meaningful gameplay effect; final oscillation phase is not
an arbitrary endpoint target. Original join, symmetry, braking and useful
held-countersteer tests remain intact.

Forty-eight deterministic fixture/speed/jump approaches run100 ticks each,
including rolling and jump release; no obstacle penetration beyond .003 and
no collision convergence error. Separate beside-wall landing regressions caught
and fixed an 11-unit corner-witness snap/invalid fallback body. This grid is
bounded evidence, not a claim of arbitrary-geometry robustness.

Schedules30/60/120 Hz and7/23/11/39/20 ms over1.5 seconds produce identical
90-tick flight/player state. Isolation/lifecycle tests cover reset and switching
during flight, one update per tick, no landing-jump buffer, and both legacy acts
against fresh-boot behavior. No unsupported later mechanic was added.

## Verification and access

Baseline:438 gameplay tests,9 build tests,29-module compatibility and player
checks passed before source edits. Final commands all pass:
`npm run build:player`, `npm test` (**452**), `npm run test:build` (**9**),
`npm run check:compat` (**30 modules**), `npm run check:player`, `npm run package`.
Fourteen new AIR tests exercise the actual controller. Existing tests remain;
only PLAYTEST status expectations changed for the intentionally expanded scene.
Independent review found the wall-landing defect and verified its correction;
final source review confirmed no existing-act physics/level changes.

Player ZIP: `dist/Neon-Express-player.zip`, **52,321,389 bytes;37 files**.
SHA-256: `1e8480e3cdf18f292db3633c322fb78378d97da2faa775a02cae689f3dd659ef`.
Runtime:`runtime-da41f455d04d1960.js`; CSS:`style-c9f48a6e01dc8ece.css`.
CRC verified and freshly extracted outside the repository; every entry compared
byte-for-byte with the built game (ZIP index maps to committed PLAY.html).

Chromium151.0.7922.173 bounded extracted-package browser smoke passed over
Python local HTTP: rendered art/contact, ground rollback, held/cut jump, crest,
gap landing, wall stop/upright landing, ceiling/blocked uncurl, camera/HUD,
pause/resume/reset, flight exit, Act1/2 running/jumping/fresh air boost, clean
return; zero page errors. Inspected actual crest raster. This is automated
inspection, not a human feel approval, exhaustive route replay or device-wide
performance certification.

Direct-file launch was attempted first and blocked by browser environment
policy (`ERR_BLOCKED_BY_ADMINISTRATOR`); neither success nor a game defect is
claimed. Verified fallback from the extracted game directory:
`python3 -m http.server 8000 --bind 127.0.0.1`, then open
`http://127.0.0.1:8000/`. Python3.12 is available here; that address is local-only.
Windows launcher needs Python; it was not executed on Linux.

No ZIP upload/attachment capability or isolated public-preview service is
available. The generated player ZIP remains at the workspace path above.
Practical delivery is the feature branch's immutable GitHub **source ZIP**,
which includes the ready-built `Inferno-Ascent-Game/PLAY.html` and all37 matching
player files. Extract and open PLAY.html, or serve that directory as above and
open `/PLAY.html`. Source ZIP, player ZIP, repository link and public playable
website are different things. No public preview is claimed. No PR created,
merge, Pages dispatch or deployment performed.

## Manual approval checkpoint

1. Flat: compare tapping/holding jump, release steering, then countersteer in air.
2. Valley: jump uphill/downhill both ways, including an earned fast downhill roll;
   check inherited momentum and landing feel against the approved ground slice.
3. Crest/Gap: run through the crest, compare slow/fast contact, then jump the gap;
   inspect transition reason, outline and anchor for chatter or snapping.
4. Wall/Low ceiling: approach running/rolling, jump against them, check no
   pass-through/blocked expansion; reset or switch to both acts during flight.

Stop here and wait for explicit feel feedback/approval before expansion.
