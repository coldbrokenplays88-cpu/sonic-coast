# Ending acting refinement implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan inline. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Combine main's expressive storyboard poses with the useful polish transitions on the existing unmerged PR.

**Architecture:** Change only authored exposures in `ending-scene.js`. Reuse original gesture/reaction keys, retain clean supplemental anticipation, recoil, landing, turn and toss/catch. The native renderer and all source PNGs remain untouched.

**Tech Stack:** Canvas 2D, JavaScript, Node tests, Chromium/Playwright, FFmpeg.

**Spec:** Latest user request “Neon Express Act 2 — Targeted Cutscene Refinement”; approved storyboard in `docs/superpowers/specs/2026-10-09-shadow-ending.md` and both conversation storyboard images.

## Global constraints

- Work directly on `codex/ending-animation-polish`; update the existing PR only; no new PR or merge.
- Priority: storytelling, acting, faces, fluidity, polish.
- Sonic remains more energetic than Shadow; no dialogue; yellow Emerald toss/catch retained.
- No gameplay, collision, level, camera, renderer or original artwork changes.
- Preserve 966 ticks / 16.1 seconds, 16 beats and nine sound cues.

## Review focus

- Inspect every exposed cel and rendered teleport face; existence tests cannot identify artistic defects.
- Measure readable sad holds and review actual playback, not merely whether a cel appears.
- Sonic's gestures must remain legible while Shadow's toss occupies attention.
- Mixed poses must preserve feet, orientation, proportions and hand/gem continuity.
- Verify boss/ending/results, downloads, pause/restart and frozen camera integration.

### Task 1: Restore acting and verify the finished scene

**Files:** Modify `Inferno-Ascent-Game/ending-scene.js`, `test-ending-polish.cjs`, `scripts/verify-ending-polish.cjs`, `docs/ending-animation-polish.md`; add `test-ending-acting.cjs`; update validation preview/evidence.

**Interfaces:** Consume existing `endingPose(scene)` actors, timeline functions and native caches; produce the same interfaces with stronger authored exposures. No new runtime APIs.

- [x] Write regression tests for readable sad poses, original shrug/nod, clean confusion/float faces, Shadow annoyance/upward activation/final relief.
- [x] Run `node --test test-ending-acting.cjs`: expected failures on short sad hold, missing gestures, malformed floating selection, missing upward activation/final relief.
- [x] Revise exposures and remove the old requirement to use every supplemental cel. Retain clean movement improvements; exclude defective supplemental Sonic 23 and original three-glove nod keys 12/15/16/17; keep the Emerald in the same hand during relief.
- [x] Run `node --test`: expected all passing, including existing integration/rendering/movement coverage.
- [x] Render main, previous polish and update with identical camera; inspect faces, gestures, toss, kick and relief. Save full updated preview and labeled comparison.
- [x] Run browser integration, normal-input boss replay and warmed desktop/laptop profiles: expected frozen camera/stats/timer, results after ending, no page errors or extra ending canvas allocations.
- [x] Fresh review of final diff and actual render evidence; correct significant findings and rerun affected checks.
- [x] Save validation notes and commit/push to the existing branch only.
