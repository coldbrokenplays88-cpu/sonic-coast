# Interrupted update pass: recovery checkpoint

Audited on October 7, 2026 against `bcda37b`, matching GitHub `main`.
The checkout was clean before this continuation. The previous session's
six-step checklist and uncommitted work were not present in the checkout.
This document records observed state, not a reconstruction of that session.

## Present in the recovered repository

- Ascending Level 2 architecture and a rooftop finale, restored city districts,
  lower/skill/boost route distinctions, launch vents, ramps and grind rails.
- Burning skyline artwork, animated fire, smoke and embers, skyline movement,
  opaque building facades extending downward, and cached pixel deck textures.
- Pixel rings, expressive animation states for run, jump, boost, grind,
  braking, landing, hurt and spin; smoothing is disabled. Current sprite scaling
  rounds to backing pixels but does not enforce integer source-art scale.
- Recovery-route grip, variable jump height, spindash, and safe-ground checkpoint
  activation. These mechanisms exist; full-level fairness is not established.
- Ten existing input/physics tests, all passing before changes.

## Missing or different from the user's recovered session notes

- None of `Burning Neon City Panorama.png`, `Sonic peelout pixel sprite atlas.png`,
  or `Blue speedster 8x6 sprite atlas.png` were available in the accessible
  workspace. Existing assets were added with the original game import;
  no provenance confirms them as these recovered images. Do not replace or
  regenerate these assets as substitutes for the recovered files.
- No pool/water sequence, boost boxes, infinite-boost sections or empty-gauge
  skip-rail tests were found. Existing lower branches and shared landings
  cannot be identified as the interrupted session's new route structures.
- Boost still regenerates passively and from rings, enemies, express landings
  and respawning. Releasing boost preserves the remaining gauge already.
- Camera zoom was interpolated toward one of two threshold-selected targets.
- Springs had launch physics and a firing timestamp, but a static spring drawing.
- Score remains visible during gameplay; the HUD retains RINGS/TIME labels
  and route text. Speed is horizontal velocity multiplied by 18, with no unit
  definition or slope-aware speed measurement.
- Sound remains synthesized oscillator beeps. The planned richer original
  effects, enemy readability pass and full-level performance/fairness checks
  are not established by the current files.

## Changes made in this continuation

- Replaced threshold-selected camera zoom with a continuous speed blend from
  the existing resting zoom to the existing fast zoom. Loop speed is used
  while inside a loop; camera prediction and route layout are preserved.
- Added spring-cap compression/rebound on the existing pixel grid, preserving
  its colors, resting drawing, collision anchor and launch physics.
- Added regression tests for zoom continuity and spring animation, plus
  checks using authored horizontal/vertical moving platforms and angled decks.
- Updated cache query versions for the two changed runtime scripts.

## Recovered uploads and art integration

The three originals were subsequently supplied as downloadable files and
preserved byte-for-byte as `sonic-recovered-speedster.png`,
`sonic-recovered-peelout.png` and `city-recovered-burning.png`. Their sizes and
SHA-256 hashes are in `assets/recovered-art-metadata.json`. They supersede the
earlier missing-file observation above.

Both sprite originals contain related 8-by-6, 48-pose atlases. They are not
independent single-purpose peelout and grind strips. Explicit source rectangles
and body/foot anchors in `recovered-art.js` map their poses to active animation
states. The speedster sheet supplies normal poses; the peelout sheet supplies
fast running, boosting and rail poses. Leaning poses approximate grinding;
dedicated rail sprites may still need refinement. All expressions remain
available in the source atlases for future cutscenes.

Runtime caches normalize sprites once using nearest-neighbor sampling, then
draw them at integer backing-pixel scale with snapped positions. The new city
panorama takes priority for Level 2 and fire overlays now match its tower sites.
Older originals remain intact as fallbacks. No route geometry, gameplay physics,
HUD or sound rules were changed by this asset integration.

The user asked about the mockup for a new intermediate section. No original
mockup image or saved six-step checklist is available in this workspace.
`level2.js` references six supplied drawings under `full-user-section`, but
this is existing code, not the missing original mockup. There is still no
spring-to-pool-to-roof sequence. Do not assume the existing section matches the
requested new section or invent a replacement layout.

## Continue here

Obtain the intermediate-section mockup and the original six-step checklist if
available. The recovered images are now integrated; keep their originals and
inspect the frame mapping before further animation refinements. The missing
gameplay, HUD, sound and fairness work
must remain visible in the remaining update scope; do not claim the six-step
pass complete or invent its original step ordering.

Run `node --test test-inputs.cjs` in `Inferno-Ascent-Game`. Serve that directory
with `python3 -m http.server 8000 --bind 127.0.0.1` for internal browser tests.
Test actual launch/landing trajectories and both stages in Chromium as well
as the deterministic physics checks. Optional Google Fonts may be blocked;
the CSS uses Arial as its fallback.

## Resumed checkpoint — October 7, 2026

The earlier “Continue here” section above is historical and superseded. The user supplied the original27-item checklist, eight middle-section drawings, Sonic/spring/pickup references and a new boost-bar requirement, then authorized development. These are preserved in`docs/references`. The original tower is identified by the supplied Neon Switchback screenshot; both new routes are now implemented before it. Do not ask again for these already-recovered mockups.

Work continued from`1c4c473` on`codex/sonic-update-oct7`. This checkpoint adds40 supplemental animation poses without changing original PNGs; integrates the user's MP3; fixes wrong-choice falls and two vent landings; shows damaged architecture; and adds native secret-return/recovery tests. Detailed current28-item status, evidence and remaining device/manual checks are in`docs/update-progress.md`, with captures in`docs/validation`. The supplied music is an additional request beyond those28items.

Required continuation checks:`node --test` in`Inferno-Ascent-Game` (currently95passed), then`scripts/verify-browser.cjs` against an internal Python static server. Rebuild sprite metadata only if authoring changes require it; the source PNGs must stay intact. The six-step interrupted-session ordering was never fully recovered; use the actual files and28-item ledger rather than inventing its stage numbers.

The user created PR#1 and left it unmerged. Save/push changes to the same branch; do not merge or claim a Pages deployment. Source workflow deploys only`main`. Current independent code review found no critical/important regression. Remaining checks: actual iPad/Safari/MagicKeyboard behavior, uninterrupted manual full-game run and final aesthetic acceptance; circular lift replacement still awaits its specific mockup. Optional fonts may be blocked; game functionality uses its existing fallback.
