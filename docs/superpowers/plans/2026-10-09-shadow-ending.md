# Shadow Ending Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Animate the approved dialogue-free Shadow ending after Act 2's boss.
**Architecture:** Pure UMD timeline/poses in ending-scene.js; cached pixel atlas rendering in ending-art.js; integration in boss-game.js and game.js. Fixed 60 Hz animation uses the existing pause loop and fixed captured boss camera.
**Tech Stack:** Vanilla JavaScript, Canvas 2D, generated transparent PNG atlases, Node test runner, Chromium/Playwright.
**Spec:** docs/superpowers/specs/2026-10-09-shadow-ending.md

## Global Constraints
- One fixed rooftop camera throughout the scene.
- No dialogue, captions or voice lines.
- Drawings specify poses, expression and composition only.
- Existing game geometry, movement and boss combat remain intact.
- Results appear after the entire performance; gameplay timer and statistics freeze during it.

## Review Focus
- Pause/blur at rocket contact or teleport: no lost/repeated events or advancing clock.
- Restart/act selection during scene: no stale lock or scene on another act.
- Missing/late atlas load: scene must wait safely and resume when ready, not run invisible.
- Pixel crop boundaries/anchors: no adjacent frames, jitter, blurry character scaling or fake transparency.
- Final blow from either eye/socket and atypical player position: staging and frozen camera must remain legible.

### Task 1: deterministic storyboard timeline
**Files:** ending-scene.js, test-ending.cjs.
**Interfaces:** createEndingScene(arena, player, camera) -> state; tickEndingScene(state) -> state; endingPose(state) -> actor/effect descriptors; ENDING_BEATS immutable durations.
- [x] Write failing tests for beat order, upward emerald gesture, nod-before-surprise, kick/rocket/pod contact, Sonic-only disappearance, terminal state and immovable camera snapshot.
- [x] Implement fixed-frame timeline with explicit event boundaries and continuous trajectories.
- [x] Run node --test test-ending.cjs; expect all pass.

### Task 2: actor art and connected game sequence
**Files:** generated assets/ending-{shadow,sonic,eggman}.png; ending-art.js; boss-game.js; game.js; index.html; test-support.cjs; test-ending-integration.cjs; game-audio.js.
**Interfaces:** prepareEndingArt(name,image); endingArtReady(); drawEndingScene(state); global ending state reset by setupBossEncounter. beginEndingScene()/updateEndingScene() bridge timeline, readiness, effects and results.
- [x] Inspect generated PNGs and define cell crop bounds/anchors. Cache native pixel sprites once and render at integer backing scale.
- [x] Write failing integration tests for boss defeat trigger, frozen controls/timer/camera, pause/resume, asset wait, restart/act switch, and result delay.
- [x] Implement guarded transition from boss collapse, lock player input, hide ordinary player during scene, animate generated sprites plus original procedural effects/audio.
- [x] Extend audio cue tests. Run full node --test; expect all pass.

### Task 3: complete browser performance and delivery
**Files:** scripts/verify-ending.cjs, docs/validation/ending-* evidence, docs/ending-playtest.md.
- [x] Replay the full scene in Chromium, inspect keyframes and a video, check fixed camera/zero page errors, delayed image readiness, pause/reset and exact final result timing.
- [x] Exercise normal full boss replay through ending; run game regressions and both-act browser checks.
- [x] Fresh whole-branch review; fix material findings with regression tests. Commit/push separate review branch; do not merge or publish Pages directly.
