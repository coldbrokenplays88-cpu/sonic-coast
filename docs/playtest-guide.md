# Playtest the unmerged update

The development branch is `codex/sonic-update-oct7`; its existing pull request is [#1](https://github.com/coldbrokenplays88-cpu/sonic-coast/pull/1). GitHub Pages still serves `main` until this PR is merged and its Pages workflow succeeds.

1. Open the development branch on GitHub, choose **Code → Download ZIP**, and extract it.
2. Open the extracted **Inferno-Ascent-Game** folder and double-click **RUN-GAME-WINDOWS.bat**. It uses Python to serve/open the game; leave its terminal open. Alternatively open `index.html` directly in your browser.
3. Select **ACT 02 · INFERNO ASCENT** and play. Click **Sound on** for the supplied track and original effects.

Move with arrows/WASD. Space jumps; release early for a short hop. Down rolls; at rest hold Down+Space to charge, release Down to launch. Shift/X/left mouse boosts. P pauses, F toggles fullscreen, R restarts.

The new middle section follows the existing shared rooftop before the original Neon Switchback tower. Lower route: let momentum carry you to the fallen-building spring, land in the pool, launch to the leaning roof, then go right toward the junction. Left rooftop exploration leads to the optional monitor; farther ledges reveal as you explore. Higher route: brake/jump to the upper spring, aim through the spring chain, choose left, then time the moving spring. Hold boost on the designated rail even at an empty gauge; use the broad junction to brake before the tower climb.

For the iPad/MagicKeyboard check, assess fast rail camera framing, spring aiming, recovery-platform braking, enemy readability, fullscreen exit, sound interruption/resume and sustained frame pacing in busy city scenes. Desktop Chromium validation cannot establish Safari/device behavior. Record any failure's route/section and the input being held; those details make it reproducible.

Cloud development: from `Inferno-Ascent-Game`, run `node --test`, start `python3 -m http.server 8000 --bind 127.0.0.1`, then run `node scripts/verify-browser.cjs` against that internal server. Optional Playwright/Chromium is needed for browser checks; the game has no build step. Preserve the current checkout and newer assets.
