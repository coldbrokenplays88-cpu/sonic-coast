# HUD / fullscreen / boost bar implementation

Implemented checklist 22, 23, 28 in `Inferno-Ascent-Game/hud.js`, `index.html`, `style.css` and `test-hud.cjs`.

Gameplay HUD uses actual integer-coordinate canvas pixels: shaded gold ring/count left, unlabeled centered timer, Sonic life icon/count beside the pixel pause button. Route/checkpoint/title compatibility elements remain hidden. Score becomes visible only for `mode: 'win'`. Touchscreen controls are removed from markup; hardware keyboard controls remain in the game engine.

Boost bar follows the uploaded reference: long slanted streak, integrated left-facing muzzle and three right-facing quills, persistent empty outline, indigo fill and cyan animated lightning extending through the head. Filling drains horizontally; neither outline nor head vanishes when empty. Statistic art redraws only on value changes; bar animation uses six-frame buckets.

Fullscreen works through the standard or prefixed API. An exit button remains inside the game; F toggles fullscreen. A viewport fallback supports browsers lacking the API and exits with the same button, F or Escape. Hardware iPad/Magic Keyboard still requires testing on the user's device.

## Integration

Call after ordinary HUD updates:

```js
updatePixelHud({rings: count, lives, time: clock, score, boost,
  maxBoost: BOOST_MAX, speed: measurementSpeed(), mode, frame: runFrames});
```

`speed` is the final displayed value, so apply any display unit conversion before calling. Call when pause/start mode changes so the pause icon and accessible label change immediately. Boost animation freezes with the simulation frame during pause. `drawPixelBoostBar(canvas, fraction, frame)` is independently callable. Both APIs are exposed as normal classic-script globals.

HTML preserves recovered-art and builder script order, adds the requested independent modules, and loads hud.js before game.js. Root owns the game.js call.

## Verification

- First observed five failing tests for missing HUD/module and controls; then `node --test test-hud.cjs`: 5/5 passed.
- Chromium at `/usr/bin/chromium` on the running local server: accurate values, hidden gameplay score, actual ring artwork, no touch buttons; fullscreen button enter/exit; real F key enter/exit; missing-API fallback with Escape exit. No page errors.
- Inspected desktop 1280×900, tablet 1024×768 and phone 390×844 screenshots. HUD artwork is displayed at integer 1×/2× sizes. Phone playfield is small with a prominent bar; intended keyboard/tablet use has more room.
- Browser timing, 300 actively changing draws: approximately 0.456 ms/draw; 1,000 same-key cached calls: approximately 0.0004 ms/call. Timing is local, not an iPad result.
- Screenshots: `/tmp/sonic-hud-desktop.png`, `/tmp/sonic-hud-tablet.png`, `/tmp/sonic-hud-phone.png`, `/tmp/sonic-hud-bar-full.png`, `/tmp/sonic-hud-bar-empty.png`. Browser checker: `/tmp/sonic-hud-browser.cjs`.
- Interim whole-suite run: 39 passed / 10 failed; all ten failures were city-polish tests whose independent implementation was still in progress (`world objects expose the integration API`, spring state/direction, monitor, underwater launcher, enemy silhouettes, debris warning, interiors, city detail culling, object camera culling). The integrating agent must rerun the whole suite after all modules land.
