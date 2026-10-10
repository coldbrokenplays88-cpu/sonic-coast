# Neon Express Act 2 — ending animation polish

Refines the existing ending from `f118a1f`. The story, fixed camera, character designs, original key artwork, gameplay physics, collision boxes, level geometry and route layouts are preserved.

## Animation changes

- 56 supplemental authored cels: 24 Sonic, 24 Shadow, 8 Eggman. Sonic gains blinks, gesture transitions, a steady-hand nod cycle and gradual surprise. Shadow gains kick anticipation/recoil, landing compression/recovery, a turn, release/catch poses and sigh follow-through. Eggman gains button press, firing brace/recoil, laughter and returning-rocket reactions. All 56 are exposed in the final timeline.
- Shadow remains airborne during his return travel, plants his feet once horizontal travel ends, compresses, rises and turns toward Sonic. This removes the previous grounded slide.
- The preserved kick key drawing meets the rocket at the forward boot. The projectile rotates around its nose; its smoke begins behind the rendered tail. Impact remains at kick frame 18.
- The yellow Emerald is lowered, released, follows a continuous airborne arc, is caught, and settles back into Shadow's hand. The airborne prop uses pixels extracted from the original Shadow atlas. Chaos Control starts after the catch, while Sonic is still nodding; only Sonic teleports away.
- Total duration remains **966 simulation frames / 16.1 seconds**. Offer is 90 frames (previously 108), nod 108 (120), and toss/catch 66 (36). The remaining beat durations and their order are unchanged. The charge sound moves from toss frame 18 to frame 52, after the catch. All nine original sound cues still occur exactly once.

## Rendering and assets

The three original ending PNGs and all gameplay artwork remain unchanged. Supplemental PNGs are generated from those existing ending sheets and copied without pixel editing. Source hashes and provenance are recorded in `Inferno-Ascent-Game/assets/ending-polish-art-metadata.json`.

Native-resolution connected-component crops remain cached at full source resolution, with nearest-neighbor scaling only in the final draw. Feet stay on the existing world baseline. Fixed authoring scales normalize the new atlas sizes; no animated scaling, stretching, camera zoom or intermediate low-resolution character raster is introduced.

## Validation

- `node --test`: **177 passed, zero failures or skips**.
- Complete 483-frame, 1080p/30fps rendered replay: all 16 beats, nine cues, no page errors; camera, game clock and statistics stay fixed. Asset retry, pause/resume and act switching passed.
- Manual inspection of the rendered kick, landing, offer/nod, toss/catch, surprise and final sigh sequences. A fresh review caught hidden rocket smoke after the anchor change; the fix has a regression test and was rechecked in Chromium.
- Normal-input boss-to-ending replay: three hits/three bites, four tail strikes, three laser shots, no damage or deaths, final results shown after the ending.
- Existing browser checks passed for both acts, movement/boost, pool, facade parity, actual MP3/SFX wiring, keyboard/fullscreen and tablet/mobile layout.
- `scripts/verify-ending-polish.cjs` exercises every exposed cel, compares desktop 1440×1000/DPR1 and laptop 1280×800/DPR2 layouts against an unchanged checkout, and blocks/retries a supplemental atlas download. Warm draw batches allocate no additional ending or world canvases after cache warm-up. Measurements are in [ending-polish-profile.json](validation/ending-polish-profile.json).

Native ending-cel storage increases from **12.42 MiB to 25.41 MiB**, plus browser image/texture overhead; the supplemental downloads total approximately 5.8 MiB. This is a one-time loading/cache cost. Final batch-median draw times ranged from 3.18–5.23 ms before / 3.47–5.98 ms after at the desktop viewport, and 2.95–5.43 ms before / 2.79–5.68 ms after at the laptop viewport. Some poses cost slightly more to draw; the toss samples contain fewer teleport effects because activation now follows the catch. Drawing profiles measure this cloud Chromium instance, not physical-device FPS. Firefox, Safari and physical laptop hardware were not exercised.

The [preview](validation/ending-polished-preview.mp4) is a **silent** capture of the actual 1920×1080 canvas at 30fps. The playable game retains its music and sound effects. [Replay results](validation/ending-polish-replay.json) and [a catch frame](validation/ending-polish-catch.png) are included.

For local playback, serve `Inferno-Ascent-Game` with `python3 -m http.server`, play Act 2 and defeat Egg Scorpion. Run `ENDING_SKIP_CAPTURE=1 ENDING_OUTPUT=/tmp/ending-check node scripts/verify-ending.cjs <local URL>` for lifecycle verification without modifying tracked preview files.
