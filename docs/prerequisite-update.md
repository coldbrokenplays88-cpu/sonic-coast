# Air boost, Bubble Shield and water prerequisites

Implemented on `codex/air-boost-bubble-water`, based on merged main `302098f` plus the archived laboratory design notes. Laboratory implementation remains on hold. No level geometry, enemies, character source images, music assets, camera framing or ending choreography changed.

## Controls and tuning

- **Air boost:** Press Shift, X or the existing mouse boost control while airborne. One horizontal burst per landing, including landings that immediately rebound. Holding ground boost through takeoff retains its previous behavior and does not spend the new burst. Release/repress in the air to request it. A ground press plus jump in one tick retains ordinary boost.
- Burst lasts at most **18 fixed ticks / 0.30 seconds**, at the existing **23 world units/tick (1380/second)**, with vertical velocity held at zero during the burst. Normal gravity resumes afterward. The existing drain is **0.5 gauge units/tick**, so a full burst costs **9 of 90**; release or exhaustion stops it early. Releasing does not refund the once-per-landing allowance. Rings still cannot refill boost. Landing resets the allowance, not the gauge.
- **Bubble Shield:** An airborne jump press after releasing Jump requests a downward slam; ordinary holding or overlapping jump keys does not. Slam starts at **16 units/tick downward**, or **8 underwater**, and gravity still applies. Contact with a surface or solid hazard top rebounds at **13.4 upward**, scaled underwater. The shield absorbs one hit without spilling rings, protects breathing indefinitely, and is lost on death/restart. It does not protect against pits or damage after being consumed. Slamming cancels a burst; it cannot refund air boost before contact.
- The optional **`mid-secret-monitor`** on the low-route bonus climb just beyond the pool now grants a Bubble Shield. Its placement is unchanged. All required boost boxes retain boost. You can return to the pool with the shield; none was placed inside the pool or on a mandatory boost approach.
- Original synthesized shield/bounce/air-warning sounds use the existing audio system. No copied audio. Existing boost and spin frames render the new abilities; source atlases remain untouched.

## Underwater behavior and research

Reference: [Sonic 1 disassembly](https://github.com/sonicretro/s1disasm/tree/2c51d46a0b0682133834db2093292d41da872ecf), `_incObj/01 Sonic.asm` (`Sonic_Water`, `Sonic_Jump`, `Sonic_JumpHeight`), `_incObj/0A LZ Drowning Countdown.asm`, and `_incObj/sub ResumeMusic.asm`. Sonic Retro's physics wiki was inaccessible from the cloud; the source disassembly was retrieved instead. Only numerical behavior was researched; no original game code/audio/art was imported.

| Behavior | Dry baseline | Underwater |
| --- | --- | --- |
| Normal running top speed | 14 units/tick (840/s) | 7 units/tick (420/s) |
| Normal directional acceleration and countersteering | Existing tuned values | ×0.5 |
| Ground stopping drag | Existing tuned values | ×0.5 |
| Base jump velocity | −13.4 | −13.4 × 7/13 = −7.21538 |
| Jump-release cutoff | −5 | −2.5 |
| Gravity | 0.58 units/tick² | 0.58 × 2/7 = 0.165714 |
| Water entry | — | Horizontal velocity ×0.5, vertical ×0.25, once per entry |
| Upward water-surface exit | — | Vertical velocity ×2, capped at −32.9846 (classic cap scaled to our jump baseline) |

Water follows the existing pool's curved floor; neither the dry lips nor space underneath the bowl count as submerged. Existing boosted/rolling/propelled momentum can exceed normal running speed; boost targets, Spin Dash launch values, rails and propulsion device settings remain intact. No continuous automatic horizontal water friction was added in midair. Downward terminal velocity remains the existing 20.

Breathing lasts **30 seconds of active gameplay** with the mouth submerged. Surfacing and acquiring/retaining the shield replenish it. Original warning tones sound at 25, 20 and 15 seconds remaining, then each second during the last 12. Pixel numbers count **5 through 0**, one per two seconds. Pause freezes breathing. Drowning uses the existing death/checkpoint flow rather than adding an unrelated death-animation subsystem. Future laboratory air-bubble placement remains deferred to the user's mockups.

## Verification

- `node --test`: **254 passed, 0 failed** (226 baseline tests before changes). All 61 JS/CJS files pass syntax checks; `git diff --check` passes.
- New mechanics and review regressions cover both acts, fresh/repeated boost presses, same-tick takeoff, partial gauge, release, actual landings, shield damage at zero/nonzero rings, alias-key handling, slam/burst interaction, bulkhead contact, curved water bounds, relative physics, breathing, death/reset and pause.
- `scripts/verify-browser.cjs`: both acts, keyboard controls, sound/music, fullscreen, responsive layouts and existing pool/render checks; zero page errors.
- New reproducible `scripts/verify-prerequisites.cjs`: Chromium native keyboard input, actual monitor collection, slam/rebound, authored spring→pool→ramp traversal, drowning/pause/shield breathing and 1024/1440-wide rendering. Outputs default to `/tmp/sonic-prerequisite-browser`.
- Seven route phases still complete without damage/death. Representative low route: **8.883 s**; high route: **7.217–7.283 s**. These are controlled input replays between the same junctions, not claims about optimal human times.
- Ending browser replay: all 16 beats and 9 events, fixed clock/camera, retry, pause and act switching pass. Source ending files unchanged.
- Independent review found two input/contact defects; both were reproduced with failing tests and fixed. Visual inspection also caught an incomplete monitor icon, fixed with a rendering regression test.
- Warm Chromium pool rendering: median batch draw **6.325 ms without shield**, **6.407 ms with shield**; sampled shielded updates **0.125 ms/tick**. These cloud measurements are not physical-device FPS guarantees. No packages, external asset requests or game image assets added.

[Machine-readable evidence](validation/prerequisite-update.json) · [Air boost](validation/prerequisite-act-2-air-boost.png) · [Shield pickup](validation/prerequisite-bubble-monitor.png) · [Drowning warning](validation/prerequisite-drowning-warning.png)

## Review/playtest

Download this branch using GitHub **Code → Download ZIP**, extract it, then run `Inferno-Ascent-Game/RUN-GAME-WINDOWS.bat` (Python required), or serve that folder with `python -m http.server 8000`. Test air boost in either act. The Bubble Shield box is on the existing low-route optional bonus climb in Act 2.

The update has not been merged or deployed. The live GitHub Pages site changes only after merge and successful Pages deployment. Subjective burst feel and laptop/Safari performance still need the user's device playtest; no known unresolved functional defect remains in the tested cases.
