# Stage runtime reorganization

Status: proposed design for user review; no game code changed.

Baseline: main `559d132`, including the approved ending, precision movement and merged conservative cleanup. Work branch: `codex/stage-runtime-reorganization`. Never merge or deploy automatically.

## Purpose and constraints

Make future stage hazards, environmental physics and gimmicks easier to implement and test without leaking their rules into Neon Express. The user's examples include levitation fields, launched floor/platform sections, electrified surfaces and several laser variants. Their behavior and level designs will arrive in a later organized prompt; this task implements none of them.

Preserve both existing acts exactly: input response, movement and collision arithmetic, springs, loops, rail/boost rules, enemy/checkpoint behavior, camera framing, every animation, the boss and ending, audio and UI. Asset files, level builders and authored geometry remain unchanged. Success means clearer responsibilities plus equivalent measured runtime behavior, not fewer bytes or a promised speed improvement.

## What the code currently does

- `game.js` owns shared state, setup/input, movement, landing/surface collision, hazards, pickups/devices/enemies/checkpoints, frame scheduling, drawing and results.
- `updateMovement()` calls `updateMiddleMotion()` before shared physics. It also contains pool/wrong-route landing behavior and act-specific death-floor checks.
- `update()` fixes the order of crumble timers, movement, Act 2/middle/interior events, pickups, pads/springs, monitors/boss, enemies, checkpoints, results, particles, sounds, camera and HUD. Its boss and ending branches intentionally bypass parts of ordinary gameplay.
- `act2.js` already contains stage events/debris, launch/loop mechanics, shared camera functions and city drawing. `midsection.js` already provides the pool/secret/wrong-route behavior. These implementations can remain intact behind explicit stage entry points.
- `pose()` and landing collision already support moving surfaces. New platform-launch mechanics should extend that real system later rather than introduce a second collision engine now.
- Classic scripts share lexical globals; the test harness loads an explicit script list. Load order and existing test-visible function names are compatibility requirements.

## Options considered

1. **Focused extraction and explicit stage entry points — recommended.** Separate current responsibilities into a few ordinary scripts, retaining shared state and current call order. This addresses the actual coupling with a limited migration.
2. **File extraction alone.** Lower-risk mechanical moves improve navigation, but leave middle-section and Act 2 behavior hardwired into shared movement. This would only partly meet the goal.
3. **Full engine/module/entity rewrite.** Could provide broader extensibility, but would change state ownership, loading and many interfaces. Its risk and scope are unjustified before the next zone is designed.

## Proposed boundaries

Keep `game.js` as the controller: shared state, setup, fixed tick orchestration, input bindings, UI/result handling and current rendering. Retain the existing classic-script format and original function names. No bundler, imports, dependency installation, event bus, entity framework or serialized-level migration.

Add four focused runtime files:

| File | Responsibility |
| --- | --- |
| `player-movement.js` | Existing jump/roll/spindash/steering/gravity/momentum calculations and movement animation-state tracking. `updateMovement()` keeps its public name and return semantics. |
| `surface-collision.js` | Existing surface poses, height/availability queries, body measurements, landing/contact resolution, moving-platform carry and solid-hazard collision. Preserve contact iteration order and calculations. |
| `world-interactions.js` | Extract existing crumble timers, ring collection, pad/spring activation, enemy interactions and checkpoint updates into named functions invoked at their original tick positions. These operate on existing level data; they do not own physics or schedules. |
| `stage-runtime.js` | Explicit selection of the current existing stage behavior and narrow dispatch functions for the stage-specific calls already embedded in shared code. Implement only Neon Express Act 1 and Act 2 adapters. |

Extraction is structural: preserve existing expressions, constants and statements rather than rewriting numerical code. Avoid deeply splitting hot loops into numerous small callbacks. `boost-rules.js`, boss/ending scripts, assets/renderers, level builders and camera implementations remain in their existing locations. Any related edits there are limited to replacing an existing stage integration call; there is no camera or cutscene refactor.

## Stage integration contract

Define only the integration points needed by current behavior, at their current call positions:

1. **Selection/setup:** after the playable level is constructed, choose its existing behavior before setup/reset uses it. Preserve the current boss setup position and ring additions.
2. **Reset:** dispatch current Act 2 reset operations at the existing respawn point, without resetting unrelated state or changing checkpoint restoration.
3. **Before shared movement:** dispatch `updateMiddleMotion()` at the current first statement of `updateMovement()`. Preserve the consumed-tick boolean contract and subsequent loop branch. Act 1 has an explicit no-op.
4. **Landing:** isolate the current wrong-route correction before contact assignment and pool entry after contact assignment. Keep these as two distinct contact phases; moving them to the end of landing would change behavior, including buffered jumps.
5. **After movement:** dispatch existing `updateAct2()` and `updateMiddleSection()` in that order. The controller then runs the shared `updateCityInteriors()` for either act and retains the following mode guard. Interior visibility depends on building data, so it must not become an Act 2-only behavior.
6. **Enemy damage:** isolate the existing wrong-route-guard reaction at its current position immediately after damage. Keep its player/mode guards intact.
7. **Death boundary and completion:** encapsulate the existing Act 1/Act 2 floor and completion distinctions while preserving evaluation order, boolean results and boss/ending transition checks.

The controller retains the current explicit boss/ending control branches. Stage adapters call existing implementation functions synchronously; they do not schedule work or tick a second clock. Selection happens at setup, not by allocating a new adapter every frame. Existing supported stages must have explicit adapters; an unsupported identifier should fail during setup rather than silently run the wrong behavior. Pause/loading/ending paths must not advance stage world logic.

No future levitation force formulas, laser timing schema, new stage identifiers, gravity overrides or placeholder hazard implementations are introduced. When the user provides that design, add the actual mechanics at the appropriate identified phase. A missing future integration phase is added then, with tests, rather than guessed now.

## Loading and compatibility

Load the new function-only scripts before the controller's startup calls. Select a deterministic order in `index.html` and use the same order in the VM boot harness and any verification tool that currently hardcodes scripts. Do not execute initialization against `level`/`p` while those globals are still uninitialized. Existing state globals, registered game tools and test-facing helpers stay accessible. Preserve verification tools that serve historical source snapshots, including the precision-physics comparison; account for newly extracted scripts when serving those snapshots without changing their intended baseline.

Keep static relative resource URLs compatible with the `/sonic-coast/` GitHub Pages prefix and the Windows/local launcher. Update cache versions for changed files. Pages packaging and UI markup otherwise remain unchanged.

## Verification and acceptance

The fresh Node baseline on `559d132` is 184 passing tests, zero failures/skips. Before implementation, archive that commit and establish fresh browser baselines. Compare against that version throughout the extraction; do not use a later refactored checkpoint as the only behavioral reference.

- Run all existing Node tests and syntax checks. Update explicit loader lists, retaining all assertions. Add meaningful regression coverage for stage dispatch/order, reset behavior and isolation where existing tests do not cover the new interfaces.
- Compare serialized playable level data and complete player/state traces under identical input, including narrow high-speed landings, countersteering, coasting, boost release, spindash, rolling, short/full jumps, moving platforms, springs, vents, rails, loops and wrong-route/pool behavior.
- Replay both middle routes and their moving-platform phases, checkpoint/death/restart/act switches, normal-input boss combat and the complete ending. Verify pause, asset retry and physical-input recovery retain their existing behavior.
- Compare native canvas pixels at identical frames/positions/camera settings, including hidden routes, asset fallbacks and every ending tick. Preserve animation/sound event order and current native media controls.
- Run existing browser/HUD/audio/fullscreen/layout checks and verify the Pages project prefix. Profile warm world/ending draws separately from other browser work; check that the refactor creates no new per-frame canvases or growing stage caches.
- Report measured differences and testing limits. If behavioral/pixel parity fails, fix the extraction or retain the original code; do not retune the game to accommodate the refactor. Automated Chromium checks are not exhaustive human or physical-device testing.

Deliver a separate review branch, an unmerged PR where API access permits, a concise explanation of the new boundaries and validation evidence. Do not promise a download-size reduction; small dispatch/helper overhead is acceptable for clarity, provided performance and behavior are preserved.

## Risks and deliberately deferred work

The main risk is moving statements across tick/contact boundaries, changing evaluation order, or exposing initialization-order problems in global scripts. Landing guards, crumble timing, launch protection, enemy rebound, boss control ownership and ending freeze deserve explicit coverage.

Defer state encapsulation, ES modules, generic object registries, rendering/camera reorganization, CSS cleanup, asset compression, deployment filtering and implementation of the next zone. Those can be reconsidered against actual future requirements.
