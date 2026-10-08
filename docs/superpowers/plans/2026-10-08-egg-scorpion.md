# Egg Scorpion Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement inline, with a fresh whole-branch review.

**Goal:** Finish the playable Neon Express zone with an articulated pixel-art boss and its entrance, camera corrections, naming and act-specific music.
**Architecture:** Separate deterministic boss state/geometry from canvas rendering and lightweight game integration. Existing movement, damage, sound, camera and results remain the integration points. Render articulated sprites on the existing city pixel grid; bounded projectile state and cached textures prevent per-frame asset allocation.
**Tech Stack:** Plain browser JavaScript, canvas, Node tests, Playwright/Chromium verification.
**Spec:** docs/superpowers/specs/2026-10-08-egg-scorpion-design.md

## Global Constraints
- Preserve recovered assets, existing level layout, 1920×1080 resolution, and normal player controls.
- Exactly three successful boss hits, only after bites; second hit opens the laser tail.
- Shadow ending remains deferred; no automatic merge/deploy.
- Preserve user's locally saved naming edits and Act 1 music.

## Review Focus
- Missed openings and skipped attacks never prevent eventual victory.
- Death, pause, full restart and act switch reset/resume the correct encounter state.
- Hitbox geometry matches the lowered eyes and active attacks; one jump cannot cause multiple hits.
- Vertical prediction changes cannot snap framing or lose the next landing offscreen.
- Act switching during pending media promises cannot restart the wrong track.

### Task 1: Boss state, geometry and pixel art
**Files:** Create egg-scorpion.js, boss-art.js, test-boss.cjs, assets/egg-scorpion-parts.png.
**Interfaces:** createEggScorpion(arena), tickEggScorpion(boss, player), scorpionGeometry(boss), damageEggScorpion(boss,player); renderEggScorpion(boss).
- [x] Write and run failing tests for entrance, alternating attack warnings, three unique bite hits, missed-window repeat, laser warning/live cycle and damage collision.
- [x] Generate source art from the user's reference and build bounded articulated rendering.
- [x] Implement deterministic state, geometric collision and defeat sequence.
- [x] Run boss tests and inspect rendered poses.

### Task 2: Gameplay integration and fair retry
**Files:** Modify game.js, index.html, test-support.cjs; create boss-game.js, test-boss-integration.cjs.
**Interfaces:** setupBossEncounter(), updateBossEncounter(), bossOwnsControls(), drawBossEncounter(), frameBossCamera(); existing setup/respawn/update/draw call these.
- [x] Write and run failing integration tests: reaching arena starts entrance, cannot clear before defeat, pause freezes fight, death stays at arena/reset hits, restart and act switch remove encounter.
- [x] Integrate summit trigger, entry control lock, fight bounds, damage, result after defeat, original sound cues and arena camera.
- [x] Run integration and full existing tests; replay combat with normal inputs in Chromium.

### Task 3: Camera, names and music
**Files:** Modify act2.js, game-music.js, game.js, index.html, test-inputs.cjs, test-music.cjs.
- [x] Add failing tests around airborne/grounded framing, prediction speed cutoff and changing landing geometry.
- [x] Replace discontinuous prediction/framing with bounded continuous tracking; retain momentum lookahead and visible landing area.
- [x] Add failing music switch test; choose tracks by selected act with one native player and stale-promise protection.
- [x] Finish staged act-name edits and increment script cache versions.
- [x] Run focused and full tests.

### Task 4: Verification and delivery
**Files:** Create scripts/verify-boss.cjs; update progress, recovery and playtest docs; save screenshots in docs/validation.
- [x] Verify native-input fight, damage and recovery, pixel rendering, act tracks, both clip-equivalent camera ascents, no browser errors.
- [x] Run Node suite and existing browser/background checks.
- [x] Obtain fresh whole-branch review, fix important issues, save all evidence and commit.
- [ ] Push a review branch; create/attach PR if API permits, otherwise provide compare link. Leave merge/deploy to user.
