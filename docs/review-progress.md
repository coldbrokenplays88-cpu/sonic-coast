# Review findings checklist

Branch: `fix/review-findings`, based on main `710786e`.
The starting working folder was clean. No merges or pushes to main are authorized.
Existing tests and image files must remain unchanged.

- [x] 1. Stop horizontal velocity at both world edges; add a 200-tick regression test.
- [x] 2. Restore keyboard controls after Sound and stage selection; reproduce in Chromium.
- [x] 3. Leave touch controls unchanged and report the required decision.
- [ ] 4. Consolidate breakable drawing; investigate duplicate water checks without changing behavior or sounds.
- [ ] 5. Load artwork by act with error fallbacks; measure compression only; inspect city cache.
- [ ] 6. Cull distant surfaces and cache static poses; compare collisions and call counts.
- [ ] 7. Skip unchanged playing frames; retain controlled/non-playing drawing; run browser verifier.
- [ ] Part 3. Write plain-English proposals only, including recommended next work.
- [ ] Final. Check all changes, record proof and limits, push branch, update draft PR, provide play instructions and merge recommendation.

## Baseline and validation

Baseline: **339 passed / 0 failed**.

Item 1: **341 passed / 0 failed**, including two new regressions. Both failed before the fix (200-tick Left ended at vx=-14); both pass afterwards. Turning right moves immediately.

Draft PR creation was attempted immediately after the setup commit and failed: GitHub GraphQL returned Forbidden. The branch push succeeded; this checklist is the fallback progress record.
GitHub API access currently returns `Forbidden`; draft PR creation will be attempted after this initial tracking commit.

Item 2: **341 passed / 0 failed**. Chromium reproduced focus staying on Sound, ignored Right input and Space toggling sound again. New browser regression fails before the change and passes afterwards: focus returns to the canvas after Sound and stage selection, Right reaches game controls and Space leaves sound unchanged.

Item 3: no changes. Decision and yes/no consequences will be in the final report.

Item 4: breakable drawing consolidated. **343 passed / 0 failed** (two added water regressions). Water-call removal is deliberately unfinished: deleting the post-movement call changed crossing-tick vx from 4 to 8, vy from 1.145 to 4.58, left underwater false and omitted the splash. The pre-movement check also handles placement/respawn before water physics. Both retained to preserve behavior.
