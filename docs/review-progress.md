# Review findings checklist

Branch: `fix/review-findings`, based on main `710786e`.
The starting working folder was clean. No merges or pushes to main are authorized.
Existing tests and image files must remain unchanged.

- [x] 1. Stop horizontal velocity at both world edges; add a 200-tick regression test.
- [x] 2. Restore keyboard controls after Sound and stage selection; reproduce in Chromium.
- [x] 3. Decision received: no mobile play. No on-screen buttons; unused touch scaffolding is proposed for a later cleanup.
- [ ] 4. Consolidate breakable drawing; investigate duplicate water checks without changing behavior or sounds.
- [x] 5. Load artwork by act with error fallbacks; measure compression only; inspect city cache.
- [x] 6. Cull distant surfaces and cache static poses; compare collisions and call counts.
- [x] 7. Skip unchanged playing frames; retain controlled/non-playing drawing; run browser verifier.
- [x] Part 3. Write plain-English proposals only, including recommended next work.
- [x] Final. Changes checked, evidence/limits and play instructions recorded, branch pushed and remote verified. Draft PR creation/update blocked by GitHub API Forbidden; no merge or main push performed.

## Baseline and validation

Baseline: **339 passed / 0 failed**.

Item 1: **341 passed / 0 failed**, including two new regressions. Both failed before the fix (200-tick Left ended at vx=-14); both pass afterwards. Turning right moves immediately.

Draft PR creation was attempted immediately after the setup commit and failed: GitHub GraphQL returned Forbidden. The branch push succeeded; this checklist is the fallback progress record.
GitHub API access returned `Forbidden`; the attempted draft creation failed.

Item 2: **341 passed / 0 failed**. Chromium reproduced focus staying on Sound, ignored Right input and Space toggling sound again. New browser regression fails before the change and passes afterwards: focus returns to the canvas after Sound and stage selection, Right reaches game controls and Space leaves sound unchanged.

Item 3: the owner declined mobile play. No gameplay code changed in the proposals-only phase; unused touch styles/bindings are proposed for a separate cleanup.

Item 4: breakable drawing consolidated. **343 passed / 0 failed** (two added water regressions). Water-call removal is deliberately unfinished: deleting the post-movement call changed crossing-tick vx from 4 to 8, vy from 1.145 to 4.58, left underwater false and omitted the splash. The pre-movement check also handles placement/respawn before water physics. Both retained to preserve behavior.

Item 5: **343 passed / 0 failed**. Chromium verifies 7/8 gameplay-sheet startup requests for Act 1/2, no unnecessary fallback requests and no repeat downloads on restart. Existing verify-browser passes, zero page errors. Raw canvas comparisons: **360 identical frames**, both acts × 9 normal/missing-art cases × 20 scenes, zero page errors. Gameplay-loader PNG bytes: 34,315,885 → 13,979,916 (Act 1) / 16,145,899 (Act 2). Compression measured only; details in review-assets.md. City cache unchanged after inspection.

Item 6: **348 passed / 0 failed**. Three optimization regressions fail before and pass after. **13,566 identical contact states and 9,044 identical topAt queries** vs preceding collision source; seven phases, every surface in both acts. All existing route/physics tests pass unchanged. Mean pose calls per tick: Act 1 run 233.42→16.42 / jump 246.23→15.04; Act 2 run 1462.46→55.19 / jump 1401.18→52.91. Full method and counts in review-performance.md.

Item 7: **350 passed / 0 failed**, compared with baseline 339/0 (11 added tests). The frame regression fails before and passes after: no draw without an update during normal play, one draw after catch-up updates; controlled/ready/paused/win/over states still draw. Existing `node scripts/verify-browser.cjs http://127.0.0.1:8000` passes on the final runtime changes with zero page errors. No physical high-refresh monitor tested.

Part 3: docs/review-proposals.md covers formatting/config, 30 script tags and module/build migration, live three-layer Act 2 construction, two unused images and five old HUD class groups, Pages staging allowlist, and recommended next work. Proposals only: no workflow, asset, CSS, level-builder, bundler or formatting changes.

Independent review of runtime commits 710786e..ca40891: no critical, important or minor findings; reviewer separately ran all 11 added tests (11/0) and git diff --check. Browser and full-suite evidence reviewed but not independently rerun by reviewer.

Final evidence/report: docs/review-report.md and docs/validation/review-verification.json. Existing browser verifier passes at root and `/sonic-coast/`; ending verifier passes through results, with pause/resume, art retry and act switching. Independent review found no issues. Direct file launch blocked by managed browser policy; launcher inspected only. Final branch push succeeded; remote branch content was verified against the local commit, and remote main is still 710786e. Draft PR still blocked by GitHub API Forbidden. Item 4 remains explicitly partial; item 3 is resolved: no mobile play.

Phase 3 follow-up: owner reports the fixes seem to work without breaking the game. Proposals now include a plain-English summary of all five recommendations, effort and risk. Mobile play is ruled out; touch-code removal is documented as a later cleanup. Only documentation changed, so the previous 350/0 runtime result is retained as historical evidence; no new runtime test run is claimed.
