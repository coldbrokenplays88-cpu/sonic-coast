# Conservative codebase audit implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement inline, followed by one fresh whole-branch review.

**Goal:** Remove proven obsolete runtime code while preserving the approved game exactly.

**Architecture:** Audit classic scripts together in index load order; cross-check declarations, indirect references, tests, authoring files and browser coverage. Delete only unreachable renderer implementations and their private scaffolding. Keep all assets and existing active systems; compare baseline and cleanup using identical seeded input, geometry snapshots and actual browser pixels.

**Tech Stack:** Static HTML/CSS/JavaScript, Node tests, Chromium/Playwright, temporary Acorn/eslint-scope audit tools outside the repository.

**Spec:** User's uploaded “Full Codebase Audit and Conservative Cleanup” request (2026-10-12).

## Constraints

- Baseline main `cb5e4db`, including approved ending refinement `034fa92`.
- Isolated branch `codex/conservative-codebase-audit`; create an unmerged PR, never merge.
- No physics, controls, collision, level data, placements, timing, visible/audio/UI changes.
- No asset deletion, redesign, new runtime dependency or major rewrite.
- Preserve rare/secret routes, planned authoring hooks, partial-download fallbacks, test controls and deployment files.

## Review focus

- An unused binding may initialize a level object: retain the constructor call and leave harmless authoring aliases intact.
- Classic-script functions can be called indirectly or by test/tool strings: inspect all such references, not just lexical call counts.
- Asset error/late loading may exercise the older Sonic/background fallback renderers: preserve these paths and compare forced-failure renders.
- The legacy spring test must verify the active approved spring, preserving its compression/grid/anchor assertions.
- Verify both acts, hidden/alternate routes, checkpoints, devices, boss, ending and audio; separate automated checks from human/device testing limits.

### Task 1: Prove candidates, clean safely and compare

**Files:** `act2.js`, `pixel-world.js`, `game.js`, `level2-original.js`, `test-inputs.cjs`, `index.html`; audit report and measured validation evidence under `docs/`.

**Interface:** No active runtime signature or data schema changes. Retired functions have no game callers, export registry entry or event reference; current renderers stay unchanged. Assets remain available even if a proven unused atlas request is stopped.

- [x] Run baseline Node suite (184 passing), inventory exact tracked bytes/source lines, read entrypoint/deployment, inspect every runtime system and static references.
- [x] Record baseline geometry/input traces, browser pixel hashes and asset requests; prove legacy renderer functions have zero runtime calls across sampled playtests.
- [x] Remove seven obsolete Act 2 render helpers, obsolete pixel air-device renderer, obsolete object-atlas renderer/outline scaffold, unused constant/state and unused original-city route-cue calculation. Retarget the existing obsolete spring test to the actual approved renderer. Keep all live builders and fallbacks.
- [x] Run the complete Node suite and existing browser checks; compare exact level output, physics/state traces, seeded rendered frames, all ending ticks and fallback behavior with baseline. Expected no behavioral/pixel differences, fewer unused downloads.
- [x] Profile warmed drawing separately from other browser activity; verify static Pages entrypoint/resources and unchanged deployment workflow.
- [x] Fresh review; resolve significant findings, document retained candidates and limits, collect before/after LOC/bytes/file counts.
- [x] Prepare the reviewed branch, final report and unmerged PR description. Commit/push and attempt PR creation as the final publishing step; never merge.
