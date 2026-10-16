# Batch 1: momentum foundation

Scope: tasks 1, 3, 11 and 14, the global standard-loop baseline, and the assigned `boostExit` audit. Based on main `bf329fe`. No level geometry, assets, camera settings, spring collisions or boost costs changed. Later batches require separate approval; building-gap consolidation was cancelled.

## Physics and control decisions

Standard loops now derive their ground-gravity scale from radius:

```text
g = min(0.232, 14² / (6.5 × radius))
drag = 0.0015 × min(1, 130 / radius)
normal reaction = speed² / radius + g × cos(angle)
```

A frictionless full circle needs entry speed squared of at least `5 × g × radius` to retain contact at the top. The 6.5 budget allows for drag. The shared profile scales effective ground gravity for larger standard loops; it does not increase entry velocity, disable contact checks, modify airborne gravity, or recognize particular level positions. Normal running remains 14 and boost's target remains 23. Existing limited directional propulsion is retained, and stops accelerating same-direction movement above normal running speed. Tangential running and rolling forces use the same ratios as ordinary terrain: running 0.232; rolling uphill 0.145; rolling downhill 0.58, multiplied by the loop's gravity scale. These are classic-style gameplay coefficients rather than a conservative rigid-body simulation.

An intentionally difficult future loop can opt into `profile: 'advanced'`, which retains the previous 0.58 gravity (or an explicitly supplied gravity). Standard loops require no individual tuning. Finite positive radii are required. Both directions are supported, including signed boost acceleration. In the packaged browser, City Collapse Climax completed in 54 approach/traversal ticks at 14 versus 32 at a 23-speed approach. The two other authored loops completed in 78 and 55 ticks at 14. A consecutive normal-running double-loop regression also passes.

Existing floor slopes already preserved tangent speed and ramp launch direction after the earlier uphill correction. Those behaviors remain. The extra drag curve beginning at speed 26 was removed because it prematurely erased terrain-earned momentum. Existing rolling drag remains 0.15% per tick, with new rolling friction described below. Extremely long descents can therefore exceed ordinary boost speed; there is no new hard cap. This is intentional, and does not make a flat-ground Spin Dash faster than boost.

For authored wall/ceiling terrain, the shared collision module now supports explicit directed segments with `contactMode: 'oriented'`. Endpoint order defines tangent direction and the outward normal `(tangentY, -tangentX)`. Contact stores signed tangent speed, inherits moving-surface velocity, follows connected endpoints, supports normal-directed jumps, and releases contact at an unsupported convex turn or insufficient steep-surface speed. Air contacts sweep against the active face. Substeps limit travel between collision checks; mixed legacy-floor/directed joins preserve the remaining substep travel rather than pausing at the seam. This augments existing floor contact rather than replacing it. No existing room was rebuilt with these segments; connected-wall/ceiling coverage uses isolated test fixtures.

Loop exit/failure locks re-entry until Sonic clears the entrance. Re-arming cannot trigger entry in the same tick. Returning from either side permits another traversal. A loop awards its 500 points and completion statistic only once per reset, avoiding repeated-score farming.

## Spin Dash, rolling and artwork

- Full release: `12 + 0.35 × charge`, maximum charge 20, giving **19** before ordinary friction; previously 26. Boost remains 23.
- Rolling friction: `0.0234375 × 14/6 = 0.0546875` per tick, halved underwater, alongside the existing 0.15% drag. Downhill forces can overcome friction and accelerate beyond release speed.
- Uncurl: grounded rest below 0.03 tangent speed, after the first roll tick, with standing clearance. Releasing Down alone does not uncurl an active roll. Low ceilings retain the curled pose until standing is possible. Jumping and rails retain their existing state transitions.
- Reference: Sonic 2's `Sonic_RollSpeed` / `Sonic_CheckRollStop` in [the Sonic Retro disassembly](https://github.com/sonicretro/s2disasm/blob/master/s2.asm): rolling friction uses half acceleration and rolling ends at zero inertia. Constants are scaled to this game's 14-unit running baseline; original code/assets were not imported.
- Ground rolling visual diameter: **28 → 38**; jumping spin stays **38**. Recovered and fallback drawing anchor the bottom at the existing foot position. Source artwork and collision dimensions are unchanged.

## `boostExit` audit

Inspected the actual flagged surfaces and the original checklist, update-progress, playtest guide, and prior momentum reports. Most flags belong to intended express/rail exits or the pool launch and remain unchanged. The shared `mid-junction` is the one flagged ordinary `main` platform. Its flag was also bypassing approved precision braking: a speed-10 opposite-input tick yielded 9.18 instead of 8.975. Ordinary main platforms now receive precision braking even when flagged; express exits retain their previous handling. Passive momentum preservation and all flags remain intact. No speculative route restrictions were introduced.

## Validation

- Baseline: 350 game tests and 9 build tests passed.
- Updated: **382 game tests and 9 build tests pass**; compatibility generation, hashed player generation and ZIP packaging succeed.
- New coverage: standard loop radii 40, 94, 95, 130, 200 and 320, both directions at 14; low-speed failure; faster high-speed completion; advanced opt-in; reverse boosting; repeated traversal and score; high-speed exit re-arming; both-act rolling/Spin Dash; main/express braking; directed walls/ceilings, joins, active faces, moving carry, jumping and convex detachment.
- Updated intentionally obsolete expectations for 26-speed Spin Dash, Down-release uncurl, old overspeed damping and 28-unit ground-ball anchoring. Existing authored gap and boosted-blimp replay inputs were retuned with ordinary directional buttons to aim the now-faster trajectory; route/reward assertions remain. Existing dash-blimp and cautious-wait replay assertions remain intact.
- Packaged Chromium replay and preview: see [browser evidence](validation/batch1-momentum/browser-results.json) and [video](validation/batch1-momentum-preview.mp4). The verifier serves `dist/site`, loads the actual content-hashed runtime, uses fixed simulation ticks and real button controls after placing Sonic at the named test entrances. It does not substitute the VM compatibility files.

Reproduce:

```sh
npm ci
npm run build:player
npm test
npm run test:build
npm run package
python -m http.server 8018 --bind 127.0.0.1 --directory dist/site
# In another terminal, with Playwright and Chromium installed:
node tools/verify-batch1.cjs http://127.0.0.1:8018/
```

The browser replay is automated, not a human playtest. It checks the authored City Collapse Climax and double-loop entries, passive Spin Dash terrain launch, and both-act braking, stopping, boost and airborne coasting. Wall/ceiling terrain has automated fixture coverage but no authored stage route yet. Physical laptop performance and a complete human run remain user review items.

## Deliberately deferred

The blimp's recorded-jump qualification is unchanged until Batch 3, even though the general ramp vector already works without Jump. Spring reliability, directional spikes, high-speed object interactions and 25% air-boost cost belong to Batch 2. Upper-route geometry and moving-spring alignment belong to Batch 3. Camera magnification/transition work belongs to Batch 4. No merge or next batch is authorized by completion of this report.
