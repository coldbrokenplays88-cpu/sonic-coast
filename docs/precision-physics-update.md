# Precision movement update — October 9, 2026

Branch: `codex/precision-physics`, based on the merged boss pacing update (`9f94cc4`). Applies to both existing Neon Express acts. This update changes movement control only; level geometry, enemies, routes, art, audio, boss choreography, and the deferred cutscene are untouched.

## Exact tuning

Values use the game's existing 60 Hz units: horizontal velocity is world units/frame; braking and drag are velocity removed per frame.

| Control | Before | After |
| --- | ---: | ---: |
| Ordinary ground countersteering below speed 8 | 1 | 1.25 |
| Ordinary ground countersteering at speed 8 or above | 0.82 | 1.025 |
| Recovery/lower ground countersteering at speed 14 or below | 2.5 | 3.125 |
| Recovery/lower ground countersteering above speed 14 | 1.4 | 1.75 |
| Ordinary air countersteering | 0.2 | 0.25 |
| Released-input ground drag below speed 3, ordinary floors | 0.5 | 0.65 |
| Released-input ground drag below speed 3, recovery/lower floors | 0.65 | 0.8 |

Ordinary countersteering now stops at zero instead of carrying a braking impulse into the opposite direction. Continued input accelerates normally on the next frame. Same-direction acceleration is unchanged, including the first step from rest (0.555). There is no new air friction. The existing neutral-air multiplier of 0.999 above speed 14 is retained; at speed 14 or below neutral air has no horizontal drag.

The stronger control excludes rolling/spin dash, grinding, charged movement, active boost, boost-exit surfaces, and the scripted wrong-route drop. Spring/vent launch flight is explicitly marked until a landing, ordinary jump, or respawn; both rising and descending launch aiming retain their old values. Existing boost rules, launch powers, jump impulse, jump release/cut, coyote time, input buffering, gravity, speed caps, slope response, and moving-platform carrying are unchanged. `game.js` and `act2.js` script versions were advanced in the HTML for browser cache refresh.

## Validation

- `node --test`: **149 passed**, no failures/skips; includes 24 new both-act physics regressions. The new braking/stopping tests failed against the original implementation before tuning; preservation tests passed before and after.
- `node scripts/verify-precision-physics.cjs http://127.0.0.1:8003`: Chromium comparison with the actual merged `9f94cc4` movement code. On existing flat opening decks in both acts, braking from speed 14 takes **13 frames / 83.325 units**, compared with **16 frames / 106 units** before (21.4% shorter). Braking from speed 23 takes **21 frames / 236.468 units**, compared with **26 frames / 295.685 units** (20.0% shorter).
- Air countersteering from speed 10 for 20 frames ends at **5** instead of **6**, with unchanged vertical motion. A one-frame footstep travels **0.555 units** instead of **0.61** after settling.
- Browser trajectories match the old build exactly for ordinary running, boost acceleration/drain/release, charged spin dash, ordinary jump height, neutral air momentum, and countersteered real spring/vent flights.
- Actual Act 2 replay passes five Neon Switchback transfers (including the moving deck), the six narrow spring transfers and moving hoist, and the empty-gauge boost rail into its shared landing at nearly **23** speed. No geometry was widened or aiming assistance added.
- A descending landing at **13.5** speed on the existing 300-unit `neon-1` deck stops at **0** on that deck without a fall. Native keyboard braking and real-time updates also pass. Evidence: `docs/validation/precision-physics-replay.json` and `precision-landing.png`.
- Existing `verify-camera.cjs` passes all four early rooftop ascents. Existing `verify-browser.cjs` passes both acts, boost release, pause/fullscreen, actual audio, pool route, asset loading, cached rendering comparisons, native input, and responsive layout. Both browser runs report zero page errors.
- Existing Chromium Egg Scorpion replay still wins in 2,041 frames with three bite hits, four tail strikes, three lasers, zero damage, and zero deaths. Its validation outputs were directed outside the repository to retain the earlier boss evidence.

No remaining failures were found in these desktop Chromium and automated scenarios. The final subjective feel and actual Safari/iPad performance still need the player's playtest. Holding the opposite direction intentionally changes an ordinary jump's horizontal travel; holding no direction retains the previous travel. Fast landings still require timely braking, and scripted spring/vent aiming is unchanged.

## Delivery and playtest

This branch is a reviewable update; GitHub Pages changes only after its PR is merged and deployment succeeds. To test before merging, download the branch ZIP, open `Inferno-Ascent-Game`, and run `RUN-GAME-WINDOWS.bat` (or use the existing local game launcher). Check short position adjustments, reversing after slowing, fast landings, and tower climbs in both acts. No cutscene work is included.
