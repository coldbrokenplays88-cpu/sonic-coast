# Playtest the unmerged update

The finale development branch is `codex/egg-scorpion`. Previous updates [#1](https://github.com/coldbrokenplays88-cpu/sonic-coast/pull/1) and [#2](https://github.com/coldbrokenplays88-cpu/sonic-coast/pull/2) were merged. GitHub Pages receives the boss update after its new PR is merged and the Pages workflow succeeds.

1. Open the development branch on GitHub, choose **Code → Download ZIP**, and extract it.
2. Open the extracted **Inferno-Ascent-Game** folder and double-click **RUN-GAME-WINDOWS.bat**. It uses Python to serve/open the game; leave its terminal open. Alternatively open `index.html` directly in your browser.
3. Select **NEON EXPRESS ACT 2** and play. Click **Sound on** for the supplied track and original effects.

Move with arrows/WASD. Space jumps; release early for a short hop. Down rolls; at rest hold Down+Space to charge, release Down to launch. Shift/X/left mouse boosts. P pauses, F toggles fullscreen, R restarts.

The new middle section follows the existing shared rooftop before the original Neon Switchback tower. Lower route: let momentum carry you to the fallen-building spring, land naturally in the curved pool, roll over its floor dash panel and up to the leaning roof, then jump to the first raised platform and go right via the enemy roof toward the junction. The left zigzag leads to the optional monitor on the wide upper deck; further hidden ledges allow a climb back to the upper spring route. Higher route: brake/jump to the upper spring, aim through the narrow spring chain (the first two transfers are forgiving), choose left, then steer and time the narrow moving spring. Hold boost on the designated rail even at an empty gauge; use the broad junction to brake before the tower climb.

For the iPad/MagicKeyboard check, assess fast rail camera framing, spring aiming, recovery-platform braking, enemy readability, fullscreen exit, sound interruption/resume and sustained frame pacing in busy city scenes. Desktop Chromium validation cannot establish Safari/device behavior. Record any failure's route/section and the input being held; those details make it reproducible.

Cloud development: from `Inferno-Ascent-Game`, run `node --test`, start `python3 -m http.server 8000 --bind 127.0.0.1`, then run `node scripts/verify-browser.cjs` against that internal server. Optional Playwright/Chromium is needed for browser checks; the game has no build step. Preserve the current checkout and newer assets.

## Egg Scorpion update

The finale update is on `codex/egg-scorpion`. Preview that branch by downloading it and following the local launch steps above; GitHub Pages changes after the new update PR is merged and deployed.

Reach the summit normally. Egg Scorpion climbs over the edge and anchors its pincers. Move off the marked spot before a tail strike. Stay out of the moustache bite, then jump into a blue eye while the head is lowered and the weakspot brackets appear. Each of the first two hits breaks a different glass panel. Once the tail opens, move out of its thin laser sight before the beam fires. After the next bite, hit an exposed socket to destroy the armor. Missed openings repeat.

Deaths during the boss return to the arena and reset the boss. Even losing all lives allows an arena retry; using Restart deliberately restarts the whole act. Pause/blur freezes the entrance and fight. Shadow's ending scene is deferred, so armor destruction currently leads to the act results.

Check the camera at both early rooftop climbs from the October 7 23:13 clip, eye damage readability, attack warnings, landing control, performance on your actual device, and music selection in both acts.
