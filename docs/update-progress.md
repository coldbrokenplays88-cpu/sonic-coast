# Sonic update coverage — October 7, 2026

Continued from saved commit `1c4c473` on `codex/sonic-update-oct7`, using original repository base `bcda37b`. This records the original 27 requirements plus the approved boost-bar redesign. Implementation and verification are separate: the remaining hardware/full manual run checks below prevent claiming all 28 items fully validated.

This continuation adds 40 Sonic poses, the supplied music, damaged architecture, wider vent landings and a reliable wrong-choice fall to the lower route. Existing recovered October 7 PNGs and all previously tracked PNGs remain byte-identical; supplements use separate files. The eight route mockups and visual references are now preserved under `docs/references`, with hashes.

| # | Requirement | Current implementation and evidence |
|---|---|---|
| 1 | Full pixel-art pass | Pixel roofs/facades, ramps, loops, rails/supports, hazards, enemies, devices, signs, water, effects and HUD. Object renderer/cache tests and scene inspection; final art acceptance remains subjective. |
| 2 | Foreground architecture | Solid buildings extend below roofs, clipped sloped facades, district details and connected supports. Six facade comparisons match uncached pixels exactly. |
| 3 | Background refinement | New burning panorama has priority in Act 2, nearest-neighbor rendering, independent fire/smoke/sky motion and altitude-driven skyline movement. Core source PNG unchanged. |
| 4 | Scenery glitches/visibility | Vertical culling, leaning-tower visibility, facade seams and downstream insertion offsets corrected. Inspected 22 checkpoint scenes across both acts and middle-route scenes. |
| 5 | Secret interiors | Opaque covers fade smoothly to partial opacity and restore on exit; closed gates stay opaque. Rendering order keeps interiors visible. Regression tests pass. |
| 6 | Camera | Continuous speed zoom; spring/landing prediction and vertical-climb framing. Threshold regression test and launch/climb scene checks. |
| 7 | Early tilted platform | Opening slopes collide at sampled speeds 3/9/14/23; upward roofs have cracks, rubble and broken braces. Exact 0:06 platform identity remains unconfirmed because the full recording exceeds transfer limits. |
| 8 | Debris warnings | Animated pixel warning covers the impact corridor; advance activation accounts for speed. Warning/fall renderer tests pass. |
| 9 | Low middle route | Fallen building → lower spring → scripted burning-H-tower pool → underwater launcher → leaning roof → right enemy/roof transfers → junction → original tower. Actual launch arcs and full transfer replay pass. |
| 10 | High middle route | Six-spring chain, aimed choice, horizontal spring hoist, unlimited-boost rail/enemies and wide shared merge. Seven hoist phases pass. Wrong-side enemy fall reaches the lower route from either side with either direction held. |
| 11 | Momentum transitions | Continuous four-segment rail ends at a 1300-unit landing. Earlier momentum vent roof widened for full boost; downhill vent catches ordinary speed after braking with empty gauge. Regression tests preserve momentum. |
| 12 | Lift balance | Existing lifts retained. Lowest-point lift-to-crown timings ~2.88–3.28 s; TransitStack six-platform climb ~3.22 s, matching its lift before extra approach time. Circular three-platform replacement remains a proposal awaiting its mockup. |
| 13 | Base speed/precision | Higher 14-unit normal speed retained; stronger opposition braking and low-speed recovery grip. Lower/recovery/moving decks stop from speed 5 without sliding off. |
| 14 | Spindash | Held charge, stronger release, sustained roll momentum, changing charge poses and original charge/release cues. Native input and mechanics tests pass. |
| 15 | Boost monitors | One full gauge at act start; only lightning monitors refill. Release preserves balance; rings/enemies/grinding do not refill. Scarce mandatory/secret pickups reset for retries without gifting boost. |
| 16 | Unlimited skip rails | Designated grinding rails permit boost at zero stored gauge; neither consume nor refill it. Complete rail/merge replay and enemy visibility inspection. |
| 17 | Sonic design | Recovered lighter-blue expressive atlases remain primary; supplied expression reference guided separate supplements. Original expression poses retained for future cutscenes. |
| 18 | Animation renewal | Eight open-handed circular-shoe fast-run poses, eight closed-fist boost poses, eight quill-flow grinds, plus entry/exit/landing/charge pairs. Existing idle/jump/spin/brake/hurt poses remain. All 136 descriptor bounds validated; gameplay-scale contact sheet inspected. |
| 19 | Springs | Red/yellow cap, silver coils, directional launches, compression/extension/rebound/idle; moving devices follow their actual platforms. Animation/anchor tests pass. |
| 20 | Pool booster | Original pixel arrows/rollers inspired by the supplied mechanism direction; animated underwater and launches to the leaning tower. Scripted capture plus real exit arc tested. |
| 21 | Sound effects | Original bounded WebAudio synthesis covers both acts' movement, devices, hazards, pickups, damage, checkpoints, menus and clear. Opt-in, balanced/throttled voices; native action wiring and graph lifecycle tests pass. |
| 22 | HUD | Ring icon/count left, unlabeled centered timer, lives/pause right with the actual standing-sprite head cropped from the newest atlas; score hidden during play and visible at clear. Pixel stat rendering and pause semantics tested. |
| 23 | Fullscreen/keyboard | Fullscreen entry/exit and fallback sizing; touchscreen buttons removed. Actual Chromium keyboard movement/P/F and desktop/tablet/mobile layouts pass. Safari/MagicKeyboard hardware check pending. |
| 24 | Recovery/checkpoints | Controllable recovery decks, wrong-choice drop, pool capture and safe junction retry. Secret route returns to original tower without repositioning after its initial start. Death at junction keeps gauge empty and resets monitors. |
| 25 | Speed display | Full slope-tangent/loop speed, converted to units/second consistently, including rails. Regression tests pass. |
| 26 | Performance | Bounded facade/object caches and normalized sprite textures. Four matching before/after renderer samples show lower median draw time; report below. Actual iPad FPS/temperature/long-session behavior pending. |
| 27 | Finished-game verification | 95 Node checks pass, including complete new-route/secret replays. Integrated Chromium checks and independent review pass with zero page errors. Checkpoint scene inspection covers both acts. An uninterrupted manual full-game run and actual iPad playtest remain pending. |
| 28 | Sonic-shaped boost bar | Empty outline/full indigo silhouette ends in Sonic's muzzle/quills; cyan lightning animates through bar/head. Mask/clipping/phase and HUD tests pass; reference retained. |

Additional requested music: the 176-second MP 3 is preserved byte-for-byte. One opt-in native looping player runs during gameplay; pause/mute/death retries preserve time, fresh restart resets it. Actual Chromium MP 3 playback and 16 focused lifecycle tests pass. See [music report](music-report.md).

## Validation and limitations

`node --test` reports 95 passed,0 failed,0 skipped (including the test-support module discovered by Node). `scripts/verify-browser.cjs` checks both acts, release gauge, pause HUD, six facade pixel comparisons, pool arc, all loaded atlases, actual MP 3 playback/pause/mute/restart, original sound-event wiring, fullscreen, native keyboard and 1024×768/390×844 layouts. An independent read-only reviewer found no critical/important regression; original-image hashes and all 136 descriptors were checked.

Saved review images: [animation frames](validation/animation-frames.png), [fallen building](validation/fallen-building.png), [glass pool](validation/glass-pool.png), [upper rail](validation/upper-rail.png), [22 checkpoint scenes](validation/checkpoint-scenes.png). These are captured game renders, not replacements for source art.

Renderer profile: Linux/headless Chromium, matching surface IDs and camera/zoom,20 warm-up draws then 7 batches of 60 draws. Values are median batch-average milliseconds, not measured device FPS or end-to-end input/physics timings. Baseline is `bcda37b`; working update includes all new art. Raw results:[render-profile.json](validation/render-profile.json).

| Scene | Before(ms/draw) | After(ms/draw) |
|---|---:|---:|
| Neon Switchback |9.30|4.72|
| Shared rooftop |7.61|3.60|
| Vent entry |6.85|3.90|
| Summit arena |7.19|3.66|

No merge or GitHub Pages deployment is claimed. The existing workflow publishes only a push to `main`; updating the development branch updates the unmerged PR. Hardware playtest and aesthetic approval should inform any further tuning. See [playtest guide](playtest-guide.md).
