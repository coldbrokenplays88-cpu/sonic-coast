# Batch 3 paused — 2026-10-16

User requested saving progress and stopping. Do not resume until instructed. This is an unfinished local checkpoint, not a release. No PR, push, or merge performed.

## Scope and workflow

Branch: `codex/batch-3-route-corrections`, based on approved main `acf327d` (Batch 2 merged).
Implement Batch 3 only: momentum-only double-loop secret access and normal exit; upper spring route restoration; moving spring alignment; Split Skyline configuration audit. Building connections were CANCELLED. All six upper springs must be upright, including moving spring. No camera/Batch 4 work. Preserve original hidden vent and blimp fast/waiting alternatives. Stop after PR for approval. User wants no preview videos, ZIP, or detailed report.

## Current edits (not fully validated)

- `src/level2.js`: launch ramp shortened to x2=31127 (height unchanged), two visible normal-route roof/ramp surfaces added from x31400 to32000. This lets ordinary run14 reach the existing payoff roof without a jump. Blimp entry and airborne cluster shifted left784; entry raised relative to ordinary roof to y=-3320; entry spring power21. Original return-rail seam and hallway exit retained. This local geometry candidate needs final timing/playtesting review.
- `src/blimp-route.js`: qualification now uses actual ramp departure speed>=24, with no recorded-jump prerequisite. Ramp jumps remain supported. Landing elsewhere or using an air boost invalidates qualification. Optional builder coordinates synchronized to authored template.
- `src/midsection.js`: all six upper launchX=0. Local powers now27,26,29,26,21,29 to permit air steering over existing gaps. No global physics changes. Remove mid-rail-monitor and invented secret ledges5..7; retain mockup reward ledges1..4 and reward monitor. Wrong-way enemy platform narrowed to58 units. Need verify strong vertical arcs do not undermine intended challenge or upper-route time advantage.
- `airDevicePose(d,t)` is shared by spring drawing/collision; launch particles now follow current moving anchor.
- Generated classic compatibility files updated. Player bundle NOT rebuilt yet.
- Baseline fixture updated only for intentional level-data changes. New regression file: `Inferno-Ascent-Game/test-batch3-routes.cjs`.

## Evidence so far

New tests initially reproduced six failures; after edits all seven new tests PASS (normal run/no-jump secret/upright springs/removed extras/moving anchors/qualification/Split Skyline).
`node --test test-batch3-routes.cjs test-midsection.cjs`:18 pass,2 fail. The existing isolated moving-spring-to-rail replay (90-tick limit) and moving-hoist phase180 replay still fail. Full six-spring replay at phase0 PASSES. Do not weaken assertions merely to pass: investigate reachability, timing, and steering.
`npm run build:compat` passed. `node --test tools/test-act2.cjs`:2 pass after localized template edits. Full suite/browser validation/review remain undone.
Split Skyline low-speed physical support, approach monitor, and infinite boost rail test PASS; flags appear intentional; no changes made there.

## Next work

1. Investigate the two spring replay failures. Air steering helper is `route-test-helpers.cjs:aimHighSource`; all production transfers must use real inputs, not position edits/hidden pushes. Repeated vertical bounces on left spring must remain possible while waiting for moving spring.
2. Update intentionally obsolete blimp tests/helper: old initial ramp Jump is no longer required (expected total jumps2 vs3), qualification fixtures must use departureFrame/departureSpeed. Return jump threshold must use reward.x1+320 instead of hardcoded29490 after cluster translation. Keep original vent equivalence tests and test denial of later-roof/air-boost bypasses.
3. Validate boost-entry steering, ordinary/rolling normal exit, blimp fast and cautious alternatives, and route times (<=5sec advantage). Existing timing tool location must be found with rg; summary previously incorrectly guessed scripts/verify-blimp-timing.cjs. Remove obsolete secret5..7 reconnection replay; preserve four-platform reward detour and legitimate return.
4. Check older momentum tests that intentionally depended on old ramp shape/entry jump. Keep unrelated assertions.
5. Run npm test, npm run build:player, npm run build, npm run test:build. Actual packaged Chromium button replays; no video/ZIP. One focused independent final review is authorized by requesting-code-review skill. Commit/push/create PR and STOP, no merge.

## Probe tools / environment

Repo `/workspace/sonic-coast-reorganization`; VM boot requires cwd `Inferno-Ascent-Game`. Wrap repeated const declarations in blocks. Playwright available and Chromium `/usr/bin/chromium`.
Throwaway probes in `/tmp/batch3-*` and `/tmp/upper-*.cjs`. `/tmp/power21.cjs` tested candidate geometry before production and completed actual no-jump Spin Dash blimp path in718ticks, both rewards, no hit/death, third blimp hidden at fast jump. That probe mutates geometry itself; DO NOT run unchanged on new production geometry (would translate twice).
Initial diagnosis: old normal run exits ramp vx9.45/vy-6.35 and dies before next roof; old Spin Dash exit tangent26 apex~-3215 cannot reach old entry y=-3750. Merely changing qualification is insufficient. New steeper ramp converts earned speed into vertical flight without adding speed. Entry power21 lands on the curved blimp where rolling can climb its left lip; power23 landed too far left and lost too much momentum.
Git fetch/push work; prior gh API/PR reads were403. Try PR creation once after completion; if still blocked provide branch comparison link and explain. Attach any actually created PR using codex_app attach_artifact. Do not attach a nonexistent PR.
