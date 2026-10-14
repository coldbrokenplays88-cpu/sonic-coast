# Act 2 momentum blimp shortcut

The original rooftops, Burning Quarter climb, hidden vent, movement constants and character assets are unchanged. The rejected rooftop extension remains reverted.

A held jump near the double-loop ramp's end with Spin Dash or boost reaches a 58-unit spring deck. Ordinary rolling speed and an early jump release fall short. The deck accepts rightward landings at horizontal speed 18 or above. The later-roof air-boost turnaround is deliberately allowed, following the user's clarification; there is no takeoff-origin lock.

The spring sends Sonic left onto an eight-segment curved, scorched blimp. Its left tip launches naturally through existing slope physics. Two intact blimps lie farther left. The first travels 160 units left at 2 units/tick after its actual horizontal AND vertical rendered bounds enter the camera. It docks rather than cycling away indefinitely, and resets on retry. Continuing with momentum clears the transfer without another jump. Braking, waiting and jumping also works; a standing jump from the docked left edge is verified.

The second blimp carries an extra-life monitor, Bubble Shield monitor, then a left-end spring. Both items preserve the current boost gauge. The life icon reuses the existing Sonic head crop. The final spring sends Sonic right onto a rail above the existing hidden-vent arc. The rail descends to the far end of the Burning Quarter hallway exit and meets the original next roof at the same elevation.

Blimp hulls are cached pixel art sampled from their collision tops, with fins, cabins, engines, scorch marks and existing animated fire/smoke. Generic city facades/supports are excluded from these airborne objects. No character artwork is regenerated.

## Verification

- `node --test`: 310 passed.
- `scripts/verify-blimp-timing.cjs`: three clean button-driven normal-route comparisons, from the same loop-roof start/full Spin Dash to the same hallway-exit seam. Normal runs use their available boost through the guarded hallway. Results are saved in `blimp-route-timing.json`; the measured saving is about 1.1–3.2 seconds. These representative runs do not prove a universal difference for every possible execution or platform phase.
- Fast and cautious paths with Spin Dash and boost entry reach the exit, collect both rewards and take no damage.
- Original vent flights match frame-for-frame with the added route removed, at starting speeds 0, 7, 14 and 23. The original missed-building approach still discovers and activates the vent.
- Desktop/laptop Chromium route rendering; generic browser smoke checks cover both acts, native keys, sound/music, pause, fullscreen and responsive layouts, with no page errors.
- The full route is rendered to `momentum-blimp-shortcut-preview.mp4` at native 1920×1080, 30 fps. Rendering measurements in the cloud browser are recorded separately; they are not hardware-wide FPS guarantees.
- Independent review found the vent-rail interception and the air-boost entry. The rail interception was fixed and regression-tested; the user expressly approved the air-boost entry. The follow-up review found no remaining blocker.
