# Neon Express Act 2 — targeted ending refinement

The ending uses main (`f118a1f`) as its acting baseline and retains the useful action transitions from the previous polish (`8cc8c4c`). All changes stay on `codex/ending-animation-polish`. No new PR or merge is part of this update.

## Character acting

- Sonic keeps his cocky confrontation and excited toothy rocket reaction. He notices Shadow's interception as the rocket is reflected, lowers his hands into the existing clear disappointed frown (`sonic-polish:5`) for **24 ticks / 0.4 seconds** rather than six ticks, and holds the original disappointed side-eye (`sonic:8`) through Eggman's escape. The smiling blink previously inserted into disappointment is removed.
- His invitation uses the original one- and two-handed shrug (`sonic:10/11`), with the broad shrug held **39 ticks / 0.65 seconds** and clean supplemental gesture transitions. After his dash/landing, two brief cocky gesture asides punctuate confident closed-eye head nods. Clean original head-lift keys (`sonic:13/14`) and supplemental dips preserve the stronger performance without malformed hands. He remains obliviously nodding while Shadow becomes annoyed and prepares Chaos Control.
- Sonic opens his eyes, raises both hands, becomes confused, then floats away using all six clean original reaction keys (`sonic:18–23`). The final clean floating pose carries through the fade instead of alternating between facial drawings.
- Shadow's kick anticipation, recoil, airborne return, planted landing, compression and turn remain. The rocket still meets his forward boot, and its smoke begins behind its tail.
- Shadow's original annoyance progression (`shadow:21–23`) returns. The yellow Emerald toss and catch remain intact; afterward, his caught-gem arm rises overhead through the original activation keys (`shadow:25–27`). His restrained smirk, blink, relieved exhale and settle remain, ending in the original eyes-closed, hands-down resting pose (`shadow:31`). The Emerald stays in the same front hand during his sigh.
- Eggman's button press, firing recoil, laughter and returning-rocket reactions remain.

## Visual diagnosis and corrections

The extra-eye appearance came from **supplemental Sonic frame 23's source artwork**: an additional white eye-shaped wedge beside the intended eyes. The same defect was visible in the isolated native crop, so it was not a facial overlay, neighboring cel leaking into the crop or a filtering issue. That cel is excluded from playback; clean original confusion/floating artwork preserves the expressions. The PNG is preserved unchanged rather than regenerated.

A fresh visual review also found **three gloves in original Sonic nod frames 12, 15, 16 and 17**. Those cels are excluded too. Clean existing head nods and separate broad gesture asides carry the same cocky acting. The review caught the held Emerald changing sides when flipped original sigh keys were mixed with unflipped polish keys; a consistent left-facing relief sequence fixes that continuity.

No new images were generated. All six existing ending PNGs, character designs, proportions and native-resolution crop/rendering code remain unchanged. No face layers, animated scaling, interpolation, camera zoom or low-resolution intermediate raster are added. The script URL version is incremented so browsers fetch the revised timeline.

## Timing and scope

**966 ticks / 16.1 seconds**, the same as both comparison versions. All 16 beats and nine sound cues remain in their established order; impact stays at kick tick 18 and charge at toss tick 52, after the catch. The existing polish offer/nod/toss durations remain 90/108/66 ticks. Physics, controls, collision boxes, geometry, routes, boss attacks, music and gameplay animations are unchanged.

## Review and validation

- `node --test`: **184 passed, zero failures or skips**. New regression checks cover readable disappointment, clean expressive gestures, excluded malformed faces/hands, overhead activation and consistent Emerald-hand continuity. They failed before the corrections. Frame existence/count tests are not treated as proof of good acting.
- Complete **483-frame, native 1920×1080, 30fps** replays compare main, previous polish and the refinement using identical character positions, camera and viewport. Actual rendered gesture, kick/landing, toss/catch, reaction and relief sequences and every exposed native cel were inspected. The fresh reviewer identified the extra-glove and hand-continuity issues above; both received regression checks and corrections.
- Full ending integration verifies camera, timer and stats remain frozen, all nine cues occur once, results follow the ending, and asset retry, pause/resume and switching acts work.
- Normal-input boss replay reaches the ending and results after three hits/three bites, four tail attacks and three lasers, without damage or deaths. Existing browser checks cover both acts, boost/controls, pool/facades, audio, keyboard/fullscreen and tablet/mobile layout without page errors.
- Warm Chromium drawing profiles at desktop 1440×1000/DPR1 and laptop 1280×800/DPR2 compare with both baselines. Native ending-cel storage remains **25.41 MiB**, identical to the existing polish; no new PNG downloads are added. Warm draws allocate no additional ending canvases. Compared with the previous polish, per-pose batch-median drawing times were **2.71–5.28 ms → 2.97–5.17 ms** on desktop and **2.78–5.14 ms → 2.97–4.96 ms** on laptop. Detailed measurements are saved with the previews. The original main uses 12.42 MiB; the extra storage remains the earlier polish's cache cost.

The full preview is a **silent capture** of the actual game canvas; the playable scene retains music and effects. The acting comparison crops the same fixed-camera recordings for visibility, without changing the game's framing. The versions keep their authored timing, so a few later beats occur at slightly different timestamps. Drawing profiles describe this cloud Chromium instance, not guaranteed physical-device FPS; Firefox, Safari and physical laptop hardware were not tested.

- [Full updated preview](validation/ending-polished-preview.mp4)
- [Main / previous polish / updated acting comparison](validation/ending-acting-comparison.mp4)
- [Face-source comparison](validation/ending-face-source-comparison.png)
- [Rendered acting comparison](validation/ending-acting-comparison.png)
- [Rendered teleport faces](validation/ending-face-comparison.png)
- [Replay results](validation/ending-polish-replay.json)
- [Main comparison profile](validation/ending-refinement-profile-main.json)
- [Previous polish comparison profile](validation/ending-refinement-profile-previous.json)

For local playback, serve `Inferno-Ascent-Game` with `python3 -m http.server`, play Act 2 and defeat Egg Scorpion. Run `ENDING_SKIP_CAPTURE=1 ENDING_OUTPUT=/tmp/ending-check node scripts/verify-ending.cjs <local URL>` for lifecycle verification without modifying tracked previews. Run `node scripts/verify-ending-polish.cjs <baseline URL> <updated URL>` for cel selection, cache, fixed-camera, drawing-profile and supplemental-download retry checks.
