# Phase three completion report

The owner approved all five proposals and declined mobile play. Work is on `refactor/phase-three`, based on main `548ac04`, which already contained the merged bug fixes. The starting folder was clean. The earlier mobile-decision documentation was carried forward; no separate planned game update was started.

All five improvements are implemented. Nothing has been merged or deployed by this task.

| Proposal | Player-facing result | Status | Proof |
| --- | --- | --- | --- |
| Publish only the game | The live-site package excludes tests, tools and source code. A separate player ZIP includes the launcher and instructions. | done | Staging/ZIP checks pass: 37 ZIP files, one content-named browser script, all remaining fallback/ending assets, no developer scripts. Pages builds/checks before uploading `dist/site`; branch pushes do not deploy. |
| Readable code | Authored game code is easier to maintain; game behavior is unchanged. | done | Pinned Prettier configuration; existing tests/verifiers untouched; 350/0 suite and before/after raw-image comparisons pass. Generated descriptor values were preserved. |
| Remove unused material | No mobile buttons; unused images and old HUD/touch scaffolding are gone. | done | Only `objects.png` and `sonic.png` deleted. Thirty unused CSS selector instances and absent touch-button bindings removed. Keyboard, mouse boost, Sound, fullscreen and responsive window layout remain checked. |
| Consolidate Act 2 | Same routes, objects and progression, created by one level template/builder. | done | Every saved baseline level value, floor sample, both object aliases and fresh-run independence match; all route/physics tests pass. No old district construction remains in the playable build. |
| Modules and packaging | One packaged browser script replaces the ordered script collection in the playable game. | done | Canonical ES modules use explicit imports, shared reassigned state and explicit startup. Source `PLAY.html` and the packaged site use the same build. Compatibility/player freshness checks and browser tools pass. |

## Verification

Baseline and final `node --test` from `Inferno-Ascent-Game`: **350 passed, 0 failed**. Every existing test/helper/verifier is unchanged. Nine new build/level/module/path checks also pass. Every remaining image/audio/provenance asset is unchanged. No images were converted or regenerated.

- **360 raw-canvas frames match main** across both acts and nine normal/missing-artwork cases. Includes recovered/legacy/procedural Sonic fallbacks and all city fallback tiers.
- **24 whole-page screenshot comparisons match main**: both acts, widths 1440/1024/640, ready/playing/paused/fullscreen. This checks the removed CSS and preserved HUD/layout as well as the game canvas.
- Existing browser verifier passes against the module build under **`/sonic-coast/`**: both acts, keyboard controls, pause/HUD, facade/pillar comparisons, pool arc, actual MP3 play/pause/mute/restart, sound-event wiring, fullscreen and smaller-window layout; zero page errors.
- Source-download **`PLAY.html`** passes startup artwork-request and Sound/dropdown focus checks. It requests the same 7/8 gameplay sheets for Act 1/2, without unnecessary legacy downloads.
- Existing ending verifier reaches results with the original beat/event sequence, frozen gameplay state, asset retry, pause/resume and act switching; zero page errors.
- Existing moving-platform/blimp route verifier passes desktop/laptop replay with zero hits/deaths and 344 rendered frames; zero page errors. Its draw-time samples are not a hardware FPS guarantee.
- Existing boss replay reaches **win**, 3 hits/3 bites, zero deaths/damage; both actual music tracks pass.
- Pinned player/compatibility generation checks, ZIP resource checks, metadata authoring syntax checks and `git diff --check` pass.

Compact command outcomes are recorded in [validation/phase-three.json](validation/phase-three.json). The level baseline fixture identifies main `548ac04`. Authoring/developer instructions are in [phase-three-architecture.md](phase-three-architecture.md).

## Independent review

A fresh reviewer independently ran the 350 game tests, seven initial build checks and generated-output freshness checks. It compared classic gameplay functions/initializers against the baseline and found no additional material changes outside the approved work. It reviewed module initialization, bridge overrides, Act 2 identities/restarts and package contents.

The review found one important issue in new build tooling: a linked output folder could bypass the source/output overlap guard. Two new regressions failed before the fix. Staging now resolves real filesystem paths, including existing linked parents of a new directory, before checking or clearing output. Both regressions pass after the fix; the complete final suites pass **350/0 + 9/0**. The review's old source-download instruction note was corrected in the final documentation work. No material findings remain unresolved. The reviewer reviewed, rather than independently reran, the full browser comparisons/replays.

## Choices made to preserve compatibility

| Choice | Why | Maintenance cost |
| --- | --- | --- |
| Generate classic compatibility files from `src` and retain the original index test entry | Existing VM tests and assertions must remain unchanged. The published game still uses the module build. | Generated copies must stay synchronized; checks reject stale output. If this mapping were wrong, the compatibility suite alone would not prove the module build, so the actual packaged build was separately checked in Chromium. |
| Keep two inert old Act 2 filenames | The unchanged test helper still reads those paths. Their construction code is gone, and neither file is loaded in the playable site. | Two comments-only files remain until test-helper changes are separately authorized. |
| Track `PLAY.html` and generated content-named JS/CSS in the source download | The owner can play the actual module build before merging without installing build tools. | About 0.55 MB of JS plus a stylesheet/entry is duplicated in source history; future edits must regenerate them. Freshness checks pass. |

The two optional Python metadata tools now update canonical module descriptors and instruct developers to rebuild. They were syntax-checked; their artwork analysis was not rerun, so no descriptor or image regeneration is claimed.

## What was not verified

Direct `file://` navigation is blocked by this managed browser's administrator policy. Direct double-click launch therefore remains unverified here, although the ordinary-script build has all relative resources present and passes when served. The Windows batch file was inspected and updated, but not executed on Windows. No physical high-refresh display, physical mobile device, Safari/Firefox, human listening pass, live Actions run or deployment was tested. Audio checks verify actual playback state and event wiring, not listening quality. Mobile play was explicitly declined.

The intended changes are structural and packaging changes, plus removal of unused material. No new gameplay, graphic or sound design was added. The tested settled frames and screen layouts match main. Transient download timing and untested routes/input combinations are not covered by those equality checks.

## Play the branch without coding

1. Open [refactor/phase-three](https://github.com/coldbrokenplays88-cpu/sonic-coast/tree/refactor/phase-three), then click **Code → Download ZIP**.
2. Extract the ZIP completely. Open **Inferno-Ascent-Game** and double-click **PLAY.html** in Chrome or Edge. Keep its assets folder and content-named script/style beside it. No coding tools or typed commands are needed.
3. On Windows, if blank, double-click **RUN-GAME-WINDOWS.bat** and leave its window open. It selects PLAY.html automatically. This fallback requires Python already installed.
4. If using the smaller **Neon-Express-player.zip** produced by the workflow instead, extract it and open **index.html**. It contains the same module build, launcher and assets, without developer files.

The checked player ZIP is also generated locally at `dist/Neon-Express-player.zip`. Its existence is not a claim that GitHub Actions has run or published it. The source ZIP includes the built PLAY entry specifically so branch play-testing does not depend on an Actions run.

## A few-minute play-test

1. Start **Act 1**, hold Left at the edge, then press Right. Sonic should turn away immediately; run, jump and roll as before.
2. Click **Sound**, then try arrows/A/D and Space. Controls should work, and Space should not toggle Sound again. Check music pause/resume with **P**.
3. Start **Act 2**; check the burning-city background, movement, jumping and artwork.
4. Switch **Act 2 → Act 1 → Act 2**, starting each run. Both acts should keep loading correctly.
5. Enter/leave fullscreen with **F**, then resize the window. Check the ring/time/lives/boost display and that there are no on-screen phone buttons.
6. If continuing a longer session, try the Act 2 low/high routes and boss/ending. Automated replays passed, but your feel check remains useful.

## Reverting and merge recommendation

Each main proposal has a distinct commit:

| Change | Commit |
| --- | --- |
| Publishing/player packaging | `06eed02` |
| Formatting | `8fcb1e8` |
| Unused artwork/HUD/touch removal | `99ec942` |
| Act 2 consolidation | `9019eae` |
| Modules, compatibility and ready-to-play entry | `fcd127b` |
| Review fix: linked-folder staging protection | `9e5535c` |

Later commits use earlier build tooling, so a complete rollback should revert in reverse order. A targeted rollback may require regenerating the playable output; I can do that Git work without changing tests. The original main history and prior bug fixes remain available.

**Safe to merge: yes, based on the checked behavior, after playing this new branch.** Nothing has been merged or pushed to main by this task. The branch was pushed successfully and verified on GitHub. Draft PR creation was attempted but GitHub’s GraphQL API returned Forbidden, so no draft PR was created. To create it through the website, open [the comparison](https://github.com/coldbrokenplays88-cpu/sonic-coast/compare/main...refactor/phase-three?expand=1), click Create pull request, then use the create-button arrow to select Create draft pull request. This does not merge or deploy the branch.
