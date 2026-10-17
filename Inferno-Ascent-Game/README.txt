INFERNO ASCENT — PLAYABLE GAME BUILD

This ZIP contains the complete game site and its art assets.

START HERE
1. Extract the ZIP completely, keeping the assets folder in place.
2. Open PLAY.html in Chrome, Edge, or Firefox if it is present.
   In the smaller player ZIP, open index.html instead.
3. You do not need to install coding tools or type commands.

If the game appears blank on Windows, double-click RUN-GAME-WINDOWS.bat.
This optional fallback requires Python already installed. It opens the game
in your browser. Leave its command window open while playing.

Controls are shown below the game.

EXPERIMENTAL BRANCH: codex/playtest-physics
Select PLAYTEST — GROUND in the STAGE menu, then choose OPEN PLAYTEST.
Left/right or A/D runs; opposite input brakes. Tap Down/S while moving to roll.
Holding forward while rolled adds no propulsion. Rolling automatically ends
only after sustained rest. Jump, boost, Spin Dash and airborne movement are disabled.
Use Flat reset / Valley reset to select benchmarks; R or Restart resets to the
selected course's safe flat spawn. Visible course boundaries also reset.
P/Escape pauses or resumes, F toggles fullscreen. Contact outlines and debug HUD
show the experimental body's anchor, speed, velocity, angle and controller ticks.
Use STAGE to return to Act 1 or Act 2; their movement is unchanged.

LOCAL SERVER FALLBACK (if opening the HTML file directly fails)
Windows: RUN-GAME-WINDOWS.bat requires Python and serves this folder locally.
Linux/macOS: from this folder, run python3 -m http.server 8000 --bind 127.0.0.1
and open http://127.0.0.1:8000/ (or /PLAY.html in a source ZIP).
Python 3 is required for that fallback; Node.js is not required to play.

OCTOBER 7 UPDATE
Sound is off initially. Click Sound on to hear the supplied looping music and original effects.
Arrow keys/WASD move; Space jumps (release for shorter hops). Down rolls. At rest hold Down + Space, then release Down for a charged spindash. Shift/X/left mouse boosts; release preserves the gauge. Lightning monitors refill it. Marked skip rails allow free boost even when empty. P pauses, F toggles fullscreen, R restarts.
The new low/high routes join before the original Neon Switchback tower in Act 2.
This development build can be playtested before merging its GitHub pull request.
