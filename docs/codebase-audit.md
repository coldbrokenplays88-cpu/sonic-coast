# Conservative codebase audit — Neon Express

Baseline: main `cb5e4db` (approved ending included). Cleanup branch: `codex/conservative-codebase-audit`. No assets were deleted, no feature was redesigned, and deployment is unchanged.

## Measurements

These count physical lines, not statements: much of the existing game is densely packed onto long lines. Authored source includes runtime JS, tests, verification/authoring tools, HTML, CSS, Windows launcher and Pages YAML; it excludes dependencies and the three generated frame-descriptor files. Runtime JS totals include all 22 scripts actually loaded by `index.html`, including descriptors. Gzip figures are reproducible estimates, not measured GitHub transfer compression. There is no bundler or compiled production bundle.

| Measure | Before | After | Difference |
| --- | ---: | ---: | ---: |
| Authored source lines | 3,731 | 3,670 | −61 |
| Authored source bytes | 397,320 | 386,859 | −10,461 |
| Runtime JavaScript lines | 2,228 | 2,167 | −61 |
| Runtime JavaScript bytes | 250,512 | 240,049 | −10,463 (4.18%) |
| Runtime JS gzip estimate | 91,444 | 88,366 | −3,078 (3.37%) |
| Game directory bytes, as currently uploaded by Pages | 50,605,243 | 50,594,782 | −10,461 |
| Asset bytes | 50,192,520 | 50,192,520 | 0 |
| Tracked repository file-content bytes, including audit records | 94,498,627 | 94,518,713 | +20,086 |
| Tracked files | 171 | 174 | +3 audit records |

Six existing files changed: four runtime JS files, the HTML script-version URLs, and one spring test. Three audit records are added: this report, the implementation plan, and validation JSON (**nine changed/added paths**). No runtime dependencies, assets, gameplay scripts or build files are added. Repository-content change includes the new audit records, so it can grow slightly even though shipped code is smaller. Git object history is not purged; checkout storage and clone history are not interchangeable.

Startup avoids one **787,609-byte PNG request** and an unused **2164×727 outline canvas** (6,292,912 bytes of nominal RGBA backing, about 6.0 MiB), plus the unused image decode. The PNG remains in the repository and Pages artifact. This is a loading/cache improvement, not a claimed gameplay FPS boost.

## What was audited

- All 22 runtime scripts in browser load order: level construction/restoration, middle section, movement/collision/input/state, boost rules, city rendering, sprite selection/native caches, HUD/fullscreen, original synthesized effects, both music tracks, boss choreography/collision/art, ending timeline/art/loading.
- All 31 CommonJS test/helper/browser-tool files, the Python metadata authoring tool, HTML/CSS, Windows launcher, generated frame metadata, provenance JSON and assets. All 53 JS/CommonJS files and the Python tool pass syntax checks.
- The classic-script call graph and lexical scopes were analyzed together, then checked against whole-repository references, object registries, dynamic property access, DOM event handlers and string-based test commands. Static “unused” results were treated as candidates, not deletion instructions.
- Chromium precise coverage during the baseline sampled both acts, every authored surface, revealed secrets, normal movement scenarios and the full ending. Each retired drawing entry had zero calls. Reference tracing confirmed their active replacements; coverage alone was not used to prove deadness.
- Repository inventory and SHA-256 duplicate checks, asset-load references, developer artifacts, dependency/build manifests and `.github/workflows/pages.yml`.

## Safe removals and why

| Removal | Evidence and retained replacement |
| --- | --- |
| `drawAct2ServiceStructures`, `drawRoofFrontage`, `drawFacadeBays`, `drawDistrictArchitecture`, `drawExposedFloorBody` | Old decorative architecture functions had no callers or registered exports/events. Current facade/deck/pillar/cutaway/detail renderers remain untouched. |
| `drawAct2CityDeck` | Uncalled forwarding wrapper. The active `drawAct2Supports` still dispatches directly to `drawPixelCityDeck` or `drawGrindRail`. |
| `drawDebrisBeacon` | Uncalled old warning graphic. The live debris branch uses `drawDebrisWarning`; falling debris, warning timing and hazards are unchanged. |
| `drawPixelAirDevice` | Obsolete spring/vent drawing had no game callers; only an old test called it. Current spring, vent and pool-booster renderers remain. The test now invokes `drawPolishedSpring` with every original assertion retained (compression, extension, return, fixed anchor, two-unit grid). |
| `sprite`, object `spriteBounds`, `makeObjectOutline`, object loader entry/outline callback | The old object-atlas renderer was uncalled. No active sprite descriptor, indirect lookup or registered tool requests the `objects` sheet. Current springs, monitors, pads, enemies and spikes are procedural pixel artwork. All default and fallback comparisons remain pixel-identical. Asset file retained. |
| `CITY_PIXEL` | Literal constant never read; active grid arithmetic is unchanged. |
| Global `audio=null` | Never read or assigned after initialization. Music and sound use their existing private media/context state; both files are unchanged. |
| Original-city `routeCues` allocation | Computed locally, never returned or read. The live level builder still creates and returns its own cues. Serialized levels and route replays are identical. |

**Ten obsolete functions** and their private scaffolding were removed. Duplicate old/new rendering implementations were resolved by deleting unreachable versions, rather than rewriting the active renderer into a new shared system. No live gameplay duplication was consolidated and no public registered tool was removed. Cache versions change only for the four modified runtime scripts, avoiding stale browser copies after a future merge.

## Deliberately retained

- **`level2-original.js` and `level2-restoration.js`:** Despite their names, they supply playable districts, geometry, hazards and routes. Deleting them would remove content. Only the original builder's unreturned temporary cue array is removed.
- **Older Sonic atlases/renderer and city images:** These are active partial-download/error fallbacks. Removing them based on ordinary loaded-game coverage would break those situations. Five forced asset-failure cases produce 80 additional pixel-identical frames before/after cleanup.
- **Unreferenced level-construction bindings** (`inside`, `blocked`, loop segments, hidden rail segments): Their initializer calls create real level objects. Those calls and authoring aliases stay. The tiny local `boostPad` authoring hook also stays; generic pad gameplay remains available.
- **Hidden/rare interactions and planned fields:** Secret reveals, pool/wrong-way flags, sealed-route logic, challenge descriptors, loop/rail transitions and launch guards are retained. Low invocation counts do not establish obsolescence.
- **`testControlled`, model-context tools, hidden HUD hooks:** These support intentional browser playtesting, normal physical-input recovery and compatibility/accessibility. They are not discarded as debugging leftovers.
- **CSS layers:** Earlier overrides, unused-looking selectors and responsive/fullscreen rules are candidates for a separate visual refactor. Cascade ordering, inherited properties and uncommon states make broad pruning risky; CSS and UI markup remain unchanged except script URL versions.
- **Repeated input, launch/state-reset and coordinate logic:** There are opportunities to factor these, but floating-point order, special momentum exceptions, event ordering and construction side effects require a behavioral refactor. This pass leaves them intact.
- **Assets/provenance and review history:** `assets/sonic.png` has no current loader entry, and `objects.png` is no longer requested; both remain as candidates, without deletion. All artwork and music/provenance files are byte-identical. The only exact duplicate file pair is `docs/references/midsection4.png` / `midsectionh4.png`: both document the shared route junction under meaningful reference names, so both remain. Existing videos, comparisons and storyboard/reference material still serve review/history purposes.
- **Deployment packaging:** Pages currently uploads the whole game folder, including developer tests/tools. A future staging filter could reduce artifact size, but the current workflow and Windows/local launch path are retained. No workflow, publishing or Git-history rewrite is performed.
- **Repository organization:** The global script order, compact `game.js`, active compatibility wrappers and embedded/generated descriptor data remain potential maintainability work. Introducing modules, a bundler or file moves would add risk to a conservative cleanup. No speculative architecture rewrite.

## Verification

| Check | Result |
| --- | --- |
| Complete Node suite, before and after | **184 passed**, zero failures/skips. Spring test retargeted to the actual game renderer; no assertions or tests removed. |
| Actual serialized playable levels | Exact equality: Act 1 **69 surfaces / 4 enemies / 6 checkpoints**; Act 2 **241 surfaces / 31 enemies / 16 checkpoints** before boss adds its checkpoint. All other serialized collections/parameters match too. |
| Normal movement traces | **1,440 ticks** match exactly: running, high-speed ground/air countersteering, air coasting, boost release, spindash, short/full jumps in both acts. |
| Actual native canvas pixels | **1,290 matching frames**: 324 authored-surface/revealed-route views plus every one of the **966 ending frames**. Same seeded input/state, positions, camera, viewport and assets. |
| Ending actors/timing/result | All **966 pose ticks** match; ending reaches results. Nine cues, frozen timer/stats/camera, pause/resume, failed download/retry and act switching pass existing browser checks. |
| Forced missing artwork | **80 matching frames** across single recovered-sheet failure, both recovered-sheet failures/legacy Sonic, all gameplay Sonic sheets missing/procedural fallback, older city fallback and no-city fallback. Zero page errors. |
| Low/high routes | Normal-input physics/collision replay across **seven moving-platform phases**, identical timing and outcomes; low pool route and six-spring high route/empty-gauge rail exit still pass. |
| Boss through ending/results | Normal-input controller: three hits/three bites, four tail strikes, three lasers, no damage/deaths, final results. |
| Existing real-browser checks | Both acts; gauge release; pause/HUD; six facade comparisons; pool arc; sprite atlases; real MP3 play/pause/mute/restart; sound-event wiring; native keyboard/fullscreen; tablet/mobile layout. Zero page errors. |
| Background | Identical seam/wrap/animation measurements; original seamless panorama, smoke/fire/cloud animation and skyline movement retained. |
| Active named function bodies | **205 byte-identical**. Only retained function changed is `makeOriginalCity`, solely removing the unused temporary cue allocation. Physics/collision/control and animation/audio bodies are untouched. |
| Pages/local static site | Same entrypoint/script order/resource paths; browser checks also pass under simulated **`/sonic-coast/`** project prefix. No bundler/build step, package manifest, runtime install or configured lint process exists; syntax checks plus Node/browser checks are the available gates. |
| Warm drawing | Six world scenes: median batch draw times 3.43–5.86 ms before / 3.51–5.68 ms after. Five ending poses across desktop/laptop layouts: 3.01–5.82 ms before / 2.77–5.18 ms after. Some individual samples increased; cloud variance does not establish an FPS gain. Native ending cache stays 26,645,212 bytes, and warm ending poses allocate zero additional world/ending canvases. |

A fresh independent static review found no critical or important issues. It inspected the diff and recorded browser/test evidence; automated checks were executed by the primary agent.

Repeat the existing checks from the game folder with `node --test`, `node scripts/verify-browser.cjs <served URL>`, `ENDING_SKIP_CAPTURE=1 node scripts/verify-ending.cjs <served URL>`, and `node scripts/verify-ending-polish.cjs <baseline URL> <working URL>`. Browser scripts require Playwright and Chromium. The temporary audit harness sampled every authored surface, then hashed raw canvas RGBA bytes and compared serialized levels/state traces at identical seeded states; compact outcomes are retained below.

Detailed hashes/counts/metrics are in [codebase-cleanup.json](validation/codebase-cleanup.json). No full videos or extra image atlases were generated for this cleanup. Audit parser dependencies were installed only in `/tmp`, not added to the project.

## Limits

These are automated Node and actual Chromium browser checks, not a claim that every possible route/input/error combination was human-playtested. Pixel comparisons use controlled scene placements and seeded input; the route/boss replays use ordinary buttons after initial placement. Existing tests exercise checkpoints, vents, springs, moving platforms, rails, boost/loops, enemies and collisions. Rare combinations beyond that coverage remain a residual regression risk, mitigated by the narrow diff and unchanged active function bodies.

Drawing measurements describe this cloud Chromium machine, not guaranteed FPS on physical hardware. Browser layout checks include tablet/mobile sizes; physical devices, Safari and Firefox were not tested. Native audio play/pause and event wiring were checked, but there was no human listening pass. The actual GitHub Actions/Pages deployment will run after a user-controlled merge; this branch is not deployed or merged automatically.
