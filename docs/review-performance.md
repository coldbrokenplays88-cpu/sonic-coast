# Surface work measurements

Static surfaces reuse their computed coordinates and slope. A coordinate change invalidates that cache. Moving surfaces still use the existing time calculation. Before asking for a surface pose, contact loops reject surfaces outside the player's horizontal sweep. Moving roofs use their full travel range, and the sweep includes the existing nine-unit foot radius. Surface order, crossing calculations and contact selection are unchanged.

Counts include `pose()` calls during the entire update, including camera and effects, and exclude drawing. Each sample is 200 ticks holding Right, from startup or from a placement 100 units above startup with initial vertical velocity -8. These are reproducible scenarios, not a claim to recreate the reviewer's exact route.

| Scenario | First tick before → after | Mean per tick before → after | Peak before → after |
| --- | ---: | ---: | ---: |
| Act 1 run | 11 → 11 | 233.42 → 16.42 | 629 → 23 |
| Act 1 jump | 205 → 7 | 246.23 → 15.04 | 629 → 23 |
| Act 2 run | 45 → 45 | 1462.45 → 55.19 | 3333 → 65 |
| Act 2 jump | 779 → 41 | 1401.18 → 52.91 | 3333 → 65 |

The static cache removes repeated allocations even where call counts do not change. No device FPS or heap-allocation benchmark was performed.

The before/after contact harness compared **13,566 identical player states** and **9,044 identical surface queries**, across every surface in both acts, seven moving-platform phases, ground/air states and speeds up to 100 units/tick. The baseline source was the preceding commit's collision file, including the separately authorized world-edge fix. All existing route-replay and physics tests remain unchanged and pass. New regressions cover cache invalidation, distant roofs, moving roofs, signed flights and foot-radius edge contacts. Three new optimization assertions failed before the change and pass afterwards.

Detailed per-tick counts and collision totals are in [review-surface-performance.json](validation/review-surface-performance.json). To repeat the contact comparison, save the collision source from commit `16c5dea` outside the game and run `node scripts/verify-review-collisions.cjs <saved file>` from the game folder.
