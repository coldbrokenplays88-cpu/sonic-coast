# Act 2 disappearing structures and effects

Four reproducible rendering defects were found against `9ca5e64`:

- The Burning Quarter carrier's fixed overhead track disappeared whenever its moving deck was horizontally off screen.
- Vertical lift guides disappeared when the deck was below the viewport, even with the upper guides on screen.
- The damaged blimp's smoke disappeared when its hull was below the viewport.
- The Glass Canyon tower's smoke disappeared when its roof was below the viewport.

These renderers used the deck, hull, or roof bounds to reject larger structures/effects. Moving guides now use their fixed travel extents; smoke uses bounds that include its rise and drift. Fully off-screen objects are still culled. Secret-reveal rules, level geometry, movement, and platform activation are unchanged.

## Verification

- All four initial regression tests failed against the old renderer and passed after the correction.
- Expanded regression coverage: 14 tests, including zooms `1`, `.94`, and `.78`, fully off-screen structures, and intentionally hidden secret platforms.
- Full suite: **331 passed**, zero failures/skips.
- Chromium raster comparison: **48 cases** across desktop/laptop viewports, three zooms, and before/after renderers. Each old case produced zero visible pixels for the isolated structure/effect; each fixed case produced visible pixels.
- Existing browser integration checks passed for both acts, facade/pillar pixel parity, pool traversal, controls, audio, fullscreen, and responsive layout. Zero page errors.
- Focused independent code review found no actionable issues.

Run from `Inferno-Ascent-Game` with the static server running:

```sh
node --test
VISIBILITY_BASELINE_REF=9ca5e64 node scripts/verify-world-visibility.cjs http://127.0.0.1:8014
node scripts/verify-browser.cjs http://127.0.0.1:8014
```

The isolated native-canvas captures intentionally hide other layers so the missing geometry/effects can be assessed directly. See [browser results](act2-visibility/browser-results.json), [carrier before](act2-visibility/carrier-before.png) / [after](act2-visibility/carrier-after.png), [lift before](act2-visibility/lift-before.png) / [after](act2-visibility/lift-after.png), [wreck before](act2-visibility/wreck-before.png) / [after](act2-visibility/wreck-after.png), and [tower before](act2-visibility/tower-before.png) / [after](act2-visibility/tower-after.png).

This covers the four confirmed cases; it does not establish that every possible visual disappearance has been reproduced. The separately discussed physics, spike, rooftop, and character-animation changes remain pending. This branch is for manual review and must not be merged automatically.
