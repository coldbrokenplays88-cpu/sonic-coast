# Stage Runtime Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task in the current session, followed by one fresh whole-branch review. Native execution and the written plan were approved by the user on 2026-10-12.

**Goal:** Separate shared movement/collisions and world interactions from stage-specific behavior, preserving the existing game exactly.

**Architecture:** Retain classic scripts, shared globals, existing public function names and the current 60 Hz tick. Mechanically extract four focused files, then introduce explicit dispatch at existing stage-specific call sites. Keep every numerical expression and contact/update order; compare against immutable main `559d132`.

**Tech Stack:** Static HTML/CSS/JavaScript, Node's test runner, Chromium/Playwright browser verification; no new runtime dependency or bundler.

**Spec:** [Approved stage runtime design](../specs/2026-10-12-stage-runtime-reorganization-design.md).

## Global constraints

- Baseline: main `559d132`, including the approved ending, precision movement and merged conservative cleanup.
- Work branch: `codex/stage-runtime-reorganization`. Never merge or deploy automatically.
- Preserve both existing acts exactly: controls, movement/collision arithmetic, springs, loops, rails/boost, enemies/checkpoints, camera, animations, boss/ending, audio and UI.
- Asset files, level builders and authored geometry remain unchanged.
- Retain the existing classic-script format and original function names. No bundler, imports, dependency installation, event bus, entity framework or serialized-level migration.
- No future levitation formulas, laser timing schema, new stage identifiers, gravity overrides or placeholder hazard implementations.
- Keep stage-world logic frozen during pause, loading and ending paths. Keep the controller's explicit boss/ending branches.
- No promised size/FPS gain. Test and report actual results; do not retune the game to accommodate the refactor.

## Review focus

1. A spring/vent launch, sloped seam or moving platform must retain contact and protected momentum; Task 1 checks both movement paths and Task 4 compares their traces/routes.
2. A buffered jump after entering the pool, or a wrong-route landing, must keep its current landing-phase order; Task 2 tests these separately.
3. Act switches/restarts/deaths must select/reset the correct stage, including interior visibility in either act; Tasks 2–3 test selection, shared interiors and call order.
4. Pausing, ending asset loading, the boss entrance and armor destruction must bypass the same ordinary world work; Task 3 tests branch ordering and Task 4 executes the real boss/ending.
5. Classic-script startup and historical-source comparison tools must still work on the Pages prefix, with no duplicate globals or uninitialized state access; Tasks 1–2 update loaders and Task 4 exercises history and static hosting.

## Task 1: Extract movement and surface collision

**Files:** Create `Inferno-Ascent-Game/player-movement.js`, `surface-collision.js`, `test-stage-runtime.cjs`; modify `game.js`, `index.html`, `test-support.cjs`.

**Interfaces:**
- Preserve `jump()`, `updateRoll(down)`, `updateMovement(): boolean`, `updateBrakingPose(dir, incoming)` in `player-movement.js`.
- Preserve `pose(s, t = runFrames)`, `yOn(s, x, t = runFrames)`, `active(s)`, `topAt(x, below = -Infinity)`, `bodyHeight()`, `feet()`, `resetPlatforms()`, `land(s, y)`, `canStand()`, `resolveHazards(oldX, oldY)` in `surface-collision.js`.
- Add `applySurfaceMotion(): void`: copy the existing grounded slope/moving-surface carry block, invoked at its original position before velocity clamping.
- Add `moveAndResolveSurfaces(): void`: copy the existing position integration, connected-surface following, gravity and earliest-crossing landing block, including its final roll-state assignment. Original locals remain local to this helper.
- `updateMovement()` calls `resolveHazards(p.lastX, p.lastY)` after surface integration. These are the original pre-integration coordinates, set by that block; do not allocate a new snapshot object per tick.
- Shared state/constants remain in `game.js`; new extracted files must not read them during script initialization.

- [x] Archive main `559d132` outside the repo. Record fresh 184-test baseline and browser/route/ending evidence against that unchanged archive before edits.
- [x] Add failing collision-boundary tests: an airborne player crosses two surfaces in one tick and lands on the earliest; a player follows a connected angled seam without snapping across a gap; grounded carry follows both x/y moving surfaces. Call the new solver boundary directly and assert player coordinates, grounded/surface identity and velocity, using existing `boot()` fixtures. Retain existing movement/launch assertions.
- [x] Run `node --test test-stage-runtime.cjs` from the game directory. The new solver tests must fail because the helper is undefined, not because the fixture fails to boot.
- [x] Move the named functions and extract the two specified blocks without changing calculations, loop iteration order, early returns or state assignments. Keep moving carry before clamping/integration, hazard resolution after contact, and death checks after hazard/braking effects.
- [x] Load `surface-collision.js?v=1` and `player-movement.js?v=1` immediately before `game.js` in HTML and at the matching position in `test-support.cjs`. Preserve all prior script ordering. Advance the controller cache version.
- [x] Run all Node tests and JS/CJS syntax checks. Compare both acts' movement traces and authored surface renders against the immutable baseline before continuing.
- [x] Commit the passing extraction: `refactor: separate player movement and surface collision`.

## Task 2: Isolate stage-specific behavior

**Files:** Create `Inferno-Ascent-Game/stage-runtime.js`; modify `game.js`, `player-movement.js`, `surface-collision.js`, `index.html`, `test-support.cjs`, `test-stage-runtime.cjs`. Inspect `scripts/verify-precision-physics.cjs` for historical-source compatibility; change only if required.

**Interfaces:**
- `selectStageRuntime(): void` selects one of two stable, explicit adapters using the built level's act, once per setup. Recognize the unchanged legacy Act 1 builder's absent act field only with `selectedAct === 1`. Unsupported values throw a descriptive setup error. Do not add future stage IDs or a generic plugin registry.
- `resetStageRuntime(): void` calls existing Act 2 reset behavior at the original respawn slot; Act 1 is a no-op.
- `updateStageMotion(): boolean` calls `updateMiddleMotion()` for Act 2 and returns false for Act 1, at the existing first movement slot. Preserve the following loop-motion branch.
- `beforeStageLanding(s): void` contains the wrong-route/fallen correction at its original point before contact assignments. `afterStageLanding(s): void` contains pool entry at its original point after `p.surface = s` and before visited/collapse/buffered-jump work. Both are no-ops in Act 1.
- `updateStageWorld(): void` calls `updateAct2()` then `updateMiddleSection()` in Act 2. The controller continues to call shared `updateCityInteriors()` immediately afterward in either act.
- `handleStageEnemyDamage(e): void` preserves the existing Act 2 wrong-route-guard condition and its `p.hurt`/playing-mode checks, at the original post-damage slot.
- `stageDeathLimit(): number` returns 800 for Act 1 or `level.floorAt(p.x) + 950` for Act 2. Invoke only after the existing death-zone early return, preserving short-circuit behavior.
- `updateStageCompletion(): void` retains Act 1's exact goal/main-landing condition and Act 2's boss-defeated ending transition at the original completion slot.

- [x] Add failing tests for explicit selection and unsupported acts, Act 1 no-op isolation, Act 2 reset dispatch, consumed-tick short circuit, wrong-route correction before contact, pool rolling state before a buffered jump, and distinct death/completion rules. Spy existing stage functions where necessary and assert ordering/state, not the adapters' internal representation.
- [x] Run the focused tests; confirm missing dispatch functions cause the expected failures.
- [x] Implement the two adapters and dispatch functions. Select immediately after level construction, preserving the existing `END` assignment and boss-setup position. Replace only the identified stage-specific calls/conditions. Retain existing Act 2/middle/boss implementations and camera/drawing code.
- [x] Insert `stage-runtime.js?v=1` before the controller in HTML and the VM boot list. Bump changed script URLs. Ensure definitions do not access uninitialized globals during load.
- [x] Run all Node tests and syntax checks. Execute the existing historical precision comparison using its unchanged `9f94cc4` source baseline, with output redirected/copied to temporary locations so existing review artifacts are not overwritten. If extracted scripts affect the historical page, adjust its loader compatibility rather than change that baseline or its assertions.
- [x] Compare wrong-route/pool, spring/vent, both-route timing, reset/act-switch and ordinary movement outcomes against main `559d132`.
- [x] Commit the passing adapters: `refactor: isolate Neon Express stage behavior`.

## Task 3: Extract world interactions and verify tick order

**Files:** Create `Inferno-Ascent-Game/world-interactions.js`; modify `game.js`, `index.html`, `test-support.cjs`, `test-stage-runtime.cjs`.

**Interfaces:** All synchronous, returning void and operating on existing globals/data:
- `updateWorldPlatforms()` copies only the current crumble/restore loop.
- `collectWorldRings()` copies current world-ring pickup logic.
- `activateWorldDevices()` copies pad activation then spring activation, preserving that order and current launch/roll/sound semantics.
- `updateWorldEnemies()` copies the existing enemy loop, rebound/damage branches and post-damage stage dispatch.
- `updateWorldCheckpoints()` copies the checkpoint loop and following sector assignment, preserving their order.
- Boss/monitor calls stay in the controller between devices and enemies. Scattered-ring particles remain in `updateParticles()`.

- [x] Add failing order tests by recording phase calls from a normal `update()`: platforms → movement → stage world → shared interiors → rings → devices → monitors → boss → enemies → checkpoints → completion → particles → camera → HUD. Assert the shared interior call occurs in both acts and before the existing mode guard.
- [x] Add branch tests: paused update does no gameplay work; ending update calls only ending/HUD after the global `step` increment; boss-owned entrance omits ordinary movement/stage interactions; destroyed armor retains its movement call; movement failure or post-stage death retains the current HUD/return behavior. Check clock/run-frame freezing where applicable.
- [x] Run focused tests; confirm the missing world-interaction functions cause failure.
- [x] Extract the five loops into their specified functions. Replace them with calls at precisely the original positions. Do not introduce new early exits inside enemy/device loops or change behavior after damage/death.
- [x] Insert `world-interactions.js?v=1` after movement/collision and before stage-runtime/controller in both loaders; final new-file order is surface collision → player movement → world interactions → stage runtime → controller. Bump the controller's cache URL.
- [x] Run all Node tests/syntax checks and both-act input/route comparisons. Verify existing sound event ordering and timer/camera behavior.
- [x] Commit the passing orchestration: `refactor: separate world interaction phases`.

## Task 4: Browser parity, review and delivery

**Files:** Create `Inferno-Ascent-Game/scripts/verify-stage-runtime.cjs`, `docs/stage-runtime-reorganization.md`, `docs/validation/stage-runtime-reorganization.json`; update this plan's progress. No new assets or deployment changes.

**Interfaces:** `node scripts/verify-stage-runtime.cjs <baseline URL> <working URL>` runs Chromium comparisons with a seeded random source and controlled fixed ticks, exiting nonzero on any mismatch. Write compact evidence to `STAGE_OUTPUT` or `/tmp/sonic-stage-runtime-validation`; do not overwrite unrelated repository previews. Existing public input helpers and normal controls remain the execution interface.

- [x] Create the reusable browser comparison using the existing audit methodology: serialize both acts; hash identical authored/hidden surface views; compare full player/camera/boost/stats traces; compare all ending pixels and actor poses. Compare ordered sound-event records as well as final state. Use the immutable `559d132` server for every before result.
- [x] Run the full Node suite and JS/CJS/Python syntax checks; `git diff --check` must pass. Retain all original tests/assertions and report the added test count accurately.
- [x] Run the new parity script, existing `verify-browser.cjs`, `verify-route-timing.cjs`, `verify-ending.cjs`, background checks and normal-input boss replay on the refactored server. Redirect authoring/preview outputs outside the repository. Verify secrets, pool/wrong-route behavior, all moving-platform phases, empty-gauge rails, spring/vent launch protection, physical-input recovery and ending retry/pause/act switching.
- [x] Repeat the forced sprite/background failure comparisons at matching poses. Run browser checks under a simulated `/sonic-coast/` project prefix. Confirm assets, level builders, camera/ending/audio files and Pages workflow remain unchanged except any explicitly necessary integration call.
- [x] Profile warmed world/ending draws sequentially on desktop/laptop viewport settings, with no competing browser benchmarks; compare canvas allocations and cache growth. Report timing noise without promising hardware FPS.
- [x] Request one fresh whole-branch review, covering the approved spec, complete diff and recorded evidence. Resolve meaningful findings and rerun only affected checks plus final gates. No repeated full-review cycle for documentation-only fixes.
- [x] Document the new boundaries and exact stage phases, how a future stage will extend them, what was preserved, before/after measurements and verification limits. Do not add hypothetical hazard code or claim exhaustive human/device testing.
- [ ] Commit and push explicitly to `codex/stage-runtime-reorganization`. Create an unmerged PR if GitHub API access permits and attach its URL. If API access returns Forbidden, supply the pushed branch comparison link and prepared PR description; never merge or trigger deployment.

## Plan self-review

The four tasks cover every approved boundary and preserve legacy/global/test tooling. New phase functions have explicit names, signatures, positions and ownership. Numerical/contact tests, adapter isolation tests, tick-order tests and actual browser comparisons cover the five review risks. No unrelated renderer/UI/audio/asset rewrite or next-zone implementation is included. Native execution minimizes repeated context while the tasks modify the same update path; one final independent review provides a whole-branch check.
