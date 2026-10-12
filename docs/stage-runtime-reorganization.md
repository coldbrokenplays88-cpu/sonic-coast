# Stage runtime reorganization

Baseline: merged main `559d132`. Branch: `codex/stage-runtime-reorganization`. The approved design and Native implementation plan are under `docs/superpowers/`. This is a structural refactor of the current game; no next-zone mechanics, assets or level content are introduced. No automatic merge or deployment.

## What changed

| File | Ownership |
| --- | --- |
| `Inferno-Ascent-Game/game.js` | Shared state, setup/input, fixed-tick controller, UI/results, rendering and the existing explicit boss/ending control branches. |
| `player-movement.js` | Shared jump, roll, spindash, acceleration/braking, momentum, gravity orchestration and braking-pose state. Original tuning and public function names remain. |
| `surface-collision.js` | Surface transforms/queries, player body measurements, moving-platform carry, connected slopes, swept landing/contact, standing clearance and solid-hazard collision. |
| `world-interactions.js` | Named phases for crumble/restore timers, world-ring collection, pads/springs, enemies and checkpoints. Existing loops/calculations are preserved. |
| `stage-runtime.js` | Two explicit existing-stage adapters: reset, pre-movement motion, two landing phases, world events, enemy damage response, death floor and completion. |

The controller now reads as a sequence of named operations instead of embedding those loops and stage exceptions. Classic script loading, shared globals and existing test/tool entry points remain. Four scripts are inserted immediately before the controller, in this order: surface collision → player movement → world interactions → stage runtime → game. HTML cache versions and the VM test loader match that order.

Moving-platform collision and carrying have a dedicated home, providing a foundation to extend later for launched platforms. Stage-specific motion and event entry points provide places for the user's future levitation and hazard design. The current collision engine is retained. No speculative field-strength formulas, timers, new stage IDs, registry/framework, ES-module migration or placeholder lasers/pads are added.

## Order and ownership

The normal playing tick remains:

1. Presentation step, mode/ending guard, gameplay clock and player/effect counters.
2. Crumble/restore updates, including during the existing boss-owned branches.
3. Shared movement. Inside it: stage motion → loop short circuit → controls/velocity → surface slope/carry → velocity limits → position/gravity/contact → solid hazards → braking/grind effects → death checks.
4. Stage events: Act 2 events/debris, then middle-section reveal. Shared building interior visibility still runs for either act, followed by the existing mode guard.
5. Rings → pads/springs → monitors → boss → enemies → checkpoints/sectors → stage completion.
6. Particles → movement sound selection → camera → HUD.

Boss entrance bypasses ordinary movement/world interactions; destroyed armor retains its movement call. Paused ticks advance only the presentation step. The ending retains its own update/HUD path with frozen gameplay clock and fixed camera. These decisions and early returns were tested explicitly rather than reorganized into a new scheduler.

Landing also keeps distinct phases: wrong-route/fallen speed correction occurs before contact assignment and landing effects; pool rolling state is established after contact assignment and before visited/collapse/buffered-jump work. Combining these callbacks into one final landing notification would change the current game.

For future stages, define their actual behavior in a stage-specific script and add an explicit adapter/selection rule when the stage identity and level builder are designed. Use existing phase entry points where their order fits; introduce another phase only when the real mechanic needs it and has regression coverage. Future moving/launching platform types should extend the existing transform/contact system. Shared movement still honors the existing propulsion/contact flags, preserving compatibility; this pass does not replace the player-state schema or eliminate every stage-related read.

## Measurements

| Measure | Main baseline | Refactored |
| --- | ---: | ---: |
| Controller (`game.js`) bytes | 47,452 | 33,882 |
| Controller physical lines | 264 | 186 |
| Loaded runtime scripts | 22 | 26 |
| Loaded runtime JS bytes | 240,049 | 242,392 |
| Sum of per-script gzip estimates | 88,366 | 90,820 |
| Asset bytes | 50,192,520 | 50,192,520 |

This improves organization rather than download size. Runtime code grows by **2,343 bytes (0.98%)**, with four additional small script requests. Gzip numbers are estimates, not measured GitHub transfer sizes; splitting scripts loses some shared compression. No bundler/build step or runtime package is added. Verification scripts/tests are developer files; they are not loaded by the game. The unchanged Pages workflow still uploads the entire game folder, including those tools.

Steady early-stage update medians on cloud Chromium were **0.0663 → 0.0688 ms** in Act 1 and **0.1000 → 0.0918 ms** in Act 2. Six warmed world-draw scenes ranged **3.52–5.86 ms before / 3.09–5.34 ms after**. Ending draw timings across five poses and desktop/laptop layouts ranged **2.76–5.35 ms before / 2.47–5.24 ms after**. Individual samples increased as well as decreased; these are noisy batch averages, not proof of an FPS improvement or physical-device guarantees. Ending native-cel storage remains **26,645,212 bytes**, with **zero additional world/ending canvases** in warm sampled ending poses. Adapters are stable objects selected during setup, not allocated every tick; no new growing stage cache is introduced.

## Verification

- **226 Node tests pass** (184 original + 42 new). New tests were observed failing before implementation, then passing. They cover contact/carry, stage selection/isolation, landing phases, death short circuit, phase order/bypass, shared interiors and the comparison tool's ability to detect regressions. Original assertions remain.
- **59 JS/CommonJS files** and the Python authoring tool pass syntax checks. Diff whitespace checks pass. No configured lint/bundler/build process exists.
- The reusable `scripts/verify-stage-runtime.cjs` runs actual Chromium against baseline and working URLs, seeds randomness/freezes automatic physics and compares complete serialized levels, player/camera/boost/stat traces, native canvas RGBA hashes, ending poses and ordered sound calls. Its unit tests reject altered geometry, velocity, faces/poses, sounds, asset requests, fallback renders, browser errors and incomplete endings.
- **324 authored/revealed-route views**, **all 966 ending frames and pose ticks**, **1,440 movement ticks**, **525 ordered sound calls** and **80 forced missing-asset fallback frames** match exactly. Normal asset requests and final ending result match too. All 31 asset files are byte-identical.
- Both acts' complete serialized data match, including Act 1's 69 surfaces/4 enemies/6 checkpoints and Act 2's 241 surfaces/31 enemies/16 pre-boss checkpoints. Seven low/high-route moving-platform phases keep identical timings. Hidden routes, pool traversal, six narrow springs, moving hoist and empty-gauge rail exit remain covered.
- The existing historical physics comparison still passes against its original `9f94cc4` source snapshot, without modifying that tool or baseline. It checks real switchback climbs, normal run/boost/spindash/jump/air coasting, protected launches, fast landing and native keyboard braking.
- Existing actual-browser tests pass for both acts, gauge release, HUD/pause, facade comparisons, atlas/pool rendering, native MP3 play/pause/mute/restart, sound-event wiring, keyboard/fullscreen and tablet/mobile layout. Ending asset retry, pause/resume and act switching pass.
- Normal-input boss replay reaches results after three hits/three bites, four tail strikes and three lasers, with zero damage/deaths. Background seam/wrap/fire/smoke/skyline measurements match baseline. Browser checks also pass under the simulated `/sonic-coast/` Pages prefix.
- Assets, level builders, Act 2/middle/boss/ending implementations, camera, renderer, audio, HUD/CSS and the Pages workflow remain unchanged. Local/Windows/static launch paths retain the same entrypoint.

Detailed hashes, counts, route timing and profiles are in [validation/stage-runtime-reorganization.json](validation/stage-runtime-reorganization.json). Raw snapshots/logs/screenshots stay in temporary validation storage; existing previews were not overwritten.

To repeat the principal checks, serve the immutable baseline and working game directories, then run from the game folder:

```sh
node --test
STAGE_OUTPUT=/tmp/sonic-stage-runtime-validation node scripts/verify-stage-runtime.cjs <baseline URL> <working URL>
node scripts/verify-browser.cjs <working URL>
ENDING_SKIP_CAPTURE=1 node scripts/verify-ending.cjs <working URL>
node scripts/verify-ending-polish.cjs <baseline URL> <working URL>
```

Browser tools require Playwright and Chromium. No product dependency was installed. Profiles must run without competing browser benchmarks for useful comparisons.

## Decisions and limits

- **Legacy identity:** The shipped Act 1 builder omits `level.act`. Recognize that exact legacy format only with `selectedAct === 1`, while also supporting explicit act 1 and rejecting unsupported identifiers/missing Act 2 identity. This preserves serialized level data. If wrong, the risk is stage misselection; tests cover it.
- **Skill tooling:** Cloud skill helper/review-template resources were unavailable. Equivalent manual task briefs, BASE ranges, an ignored progress ledger and explicit verification records preserve the approved execution workflow. If wrong, the risk is recovery/bookkeeping ambiguity; there is no runtime effect.

Independent whole-branch review is pending. Its final findings and disposition will be recorded before delivery.

These are actual automated Chromium and Node checks, not exhaustive human playtesting or a human audio-listening pass. Desktop/laptop viewport profiles and tablet/mobile layouts are simulated; physical devices, Safari and Firefox were not tested. Rare route/input/error combinations remain a residual regression risk. GitHub Pages compatibility is checked locally; no deployment or merge is performed. State encapsulation, rendering/camera refactors, CSS cleanup and the next zone remain separate work.
