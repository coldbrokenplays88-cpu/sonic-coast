# Uphill momentum correction

Current tuning and loop/rolling behavior are documented in [Batch 1 momentum foundation](batch-1-momentum-foundation.md); the report below is historical.

Based on merged PR #12 (`705c281`), on `codex/uphill-momentum`. No geometry, camera, jump impulse, gravity, art, run-speed limit, normal acceleration, boost charge rules or spring launch settings changed.

## Reference and cause

The previous terrain model used air gravity as slope resistance, with extra running contact loss. That was too restrictive. It also ended a Spin Dash roll seven ticks after releasing Down, switching to stronger running resistance midway through the descent.

Cross-checked original behavior in both disassemblies:

- [Sonic 1: slope resistance](https://github.com/sonicretro/s1disasm/blob/2c51d46a0b0682133834db2093292d41da872ecf/_incObj/01%20Sonic.asm#L1322): walking `0x20 / 256 = 0.125`; rolling `0x50 / 256 = 0.3125`, divided by four when opposing inertia uphill.
- [Sonic 2: slope resistance](https://github.com/sonicretro/s2disasm/blob/15e9fd52a65318bec3d5e746ce48dba6db6910db/s2.asm#L37709): the same walking and rolling constants and uphill division. `Sonic_UpdateSpindash` starts rolling upon releasing Down; rolling does not end simply because Down is released.
- Both games' steep-slope adhesion rules require ground speed at least `2.5` above approximately 45 degrees. This is separate from slope resistance.

We reuse the **ratios**, scaled together by `0.58 / 0.3125 = 1.856` to preserve this game's existing downhill rolling force. These are intentional arcade slope forces, not a claim of exact energy conservation or a wholesale classic physics conversion. Loops retain their existing centripetal contact model and air gravity; neither is changed here.

All coefficients multiply `sin(angle)` along the surface at the fixed 60 Hz simulation rate:

| Motion | Previous coefficient | Corrected coefficient |
| --- | ---: | ---: |
| Rolling uphill | 0.58 | 0.145 |
| Rolling downhill | 0.58 | 0.58 |
| Running uphill at travel speed | 0.83 | 0.232 |
| Running downhill at travel speed | 0.33 | 0.232 |

Water retains its `2/7` slope-force multiplier. Smooth overspeed drag, tangent seam transfer and passive ramp velocity inheritance remain unchanged.

Only Spin Dash rolls persist after Down release. They return to standing below the existing speed-7 precision threshold. Ordinary/manual and forced pool rolls retain their existing release behavior. The flag clears on retry or when rolling ends. Low-speed rolling counter-braking now stops at zero instead of accidentally accelerating across zero; its braking coefficients remain unchanged.

On steep slopes, standing and low-speed rolling input cannot manufacture uphill motion below `14 × 2.5 / 6 = 5.833` tangent speed (half underwater). This applies the classic adhesion threshold to our faster running baseline. Our one-way surface solver keeps contact and permits rollback rather than reproducing the original forced 30-tick input lock. Downhill acceleration and deliberate braking remain available; scripted launch, wrong-route drop and boost-exit protections remain intact.

## Measured before/after

Browser comparison uses identical inputs, positions and geometry against the merged implementation. Both acts produce the same shared-physics measurements. Full evidence: [uphill-momentum.json](validation/uphill-momentum.json).

| Check | Merged PR #12 | Correction |
| --- | ---: | ---: |
| Tangent speed after 20 ticks uphill, rolling from 26 | 18.468 | 23.540 |
| Tangent speed after 20 ticks uphill, running from 26 | 15.347 | 22.287 |
| Rolling descent, three seconds on slope 0.65 | 38.793 | 38.793 |
| Real Spin Dash ramp exit: horizontal / vertical velocity | 11.656 / −8.548 | 20.918 / −15.340 |
| Passive payoff-roof landing after two loops | Falls and dies | Lands; zero jumps, boost or deaths |
| Flat braking from 23: ticks / distance | 21 / 236.468 | 21 / 236.468 |
| One-frame precision adjustment / final velocity | 0.555 / 0 | 0.555 / 0 |
| Neutral airborne coasting from 23 after 60 ticks | 21.660 | 21.660 |
| Ordinary airborne countersteering from 14 after 20 ticks | 9 | 9 |

The real route test charges with Down + Jump for 80 ticks, releases both, then holds Right. It never presses Jump again and has an empty boost gauge. It lands after 164 ticks from release and can brake to a standstill on that roof. The independent reviewer also verified passive completion with all input released. The [video preview](validation/uphill-spin-dash-preview.mp4) records the actual rendered route with the existing camera.

More retained velocity changes jump choice: the former held jump at approach speed 14 overshoots the landing, while a short jump passes. Ground and coyote jump regression replays now use short presses. No launch impulse or hidden speed boost was added to force a successful landing.

## Verification

- `node --test`: 296 passed, none failed/skipped.
- Chromium `scripts/verify-uphill.cjs`: before/after comparison in both acts; real Spin Dash release, both loops, passive launch/landing, identical flat running/braking/precision/air controls; zero page errors.
- Chromium `scripts/verify-momentum.cjs`: slope fixtures, jump/coyote routes, Act 2 vertical climb, moving springs, empty-gauge rail and shared junction; desktop/laptop viewports.
- Chromium `scripts/verify-browser.cjs` and `scripts/verify-prerequisites.cjs`: both acts, pool arc, native input, responsive layout, audio, boost release/air burst, Bubble Shield, drowning and retries.
- Seven midsection replay phases: normal route 8.200 seconds, upper route 7.283–7.350; zero hits/deaths. These are representative automated executions, not optimal human clear times.
- Independent review found the low-speed rolling climb and forced-pool-roll persistence issues; both corrected and covered by regression tests. No remaining blocking findings.

No hardware FPS guarantee is inferred from headless Chromium. The correction adds no packages, render effects or collision passes, and reuses the existing slope query for the traction check. Review and merge remain the user's decision.
