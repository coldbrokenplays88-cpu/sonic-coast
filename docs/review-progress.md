# Review findings checklist

Branch: `fix/review-findings`, based on main `710786e`.
The starting working folder was clean. No merges or pushes to main are authorized.
Existing tests and image files must remain unchanged.

- [ ] 1. Stop horizontal velocity at both world edges; add a 200-tick regression test.
- [ ] 2. Restore keyboard controls after Sound and stage selection; reproduce in Chromium.
- [ ] 3. Leave touch controls unchanged and report the required decision.
- [ ] 4. Consolidate breakable drawing; investigate duplicate water checks without changing behavior or sounds.
- [ ] 5. Load artwork by act with error fallbacks; measure compression only; inspect city cache.
- [ ] 6. Cull distant surfaces and cache static poses; compare collisions and call counts.
- [ ] 7. Skip unchanged playing frames; retain controlled/non-playing drawing; run browser verifier.
- [ ] Part 3. Write plain-English proposals only, including recommended next work.
- [ ] Final. Check all changes, record proof and limits, push branch, update draft PR, provide play instructions and merge recommendation.

## Baseline and validation

Baseline suite is running. Per-item results will be recorded here.
GitHub API access currently returns `Forbidden`; draft PR creation will be attempted after this initial tracking commit.
