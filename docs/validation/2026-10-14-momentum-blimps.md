# Act 2 momentum blimp shortcut

The original rooftops, Burning Quarter climb, hidden vent, movement constants and character artwork are unchanged.

The entry deck remains solid at every horizontal speed and direction. The entry spring detects swept contact with its visible angled cap, rather than requiring a precise end-of-frame landing at its base. A sufficiently fast jump from the loop ramp qualifies the attempt at takeoff; braking and countersteering while aiming remain allowed. Both ordinary and coyote takeoffs are recorded. The later-roof air-boost entry no longer qualifies, and the return spring requires a successful entry through the loop spring.

The damaged blimp remains an eight-segment curved slope. Its launch comes from the existing slope physics, without scripted movement across the curve.

The intact moving blimp starts only when Sonic lands on it. It initially sits 800 units from the reward blimp, moves 710 units left at 3 units per tick, then docks. A fast player preserves momentum and jumps before the reward blimp appears in the camera. A cautious player brakes, waits for the reward blimp to appear, then jumps across. Running off without jumping or attempting an early standing jump does not clear the gap. Both successful paths can collect the life and Bubble Shield monitors before taking the return spring.

The return rail remains above the original hidden-vent flight and reconnects at the far end of the Burning Quarter hallway exit. All blimp surfaces remain physical; entry restrictions apply to the shortcut springs, rather than disabling collision.

## Verification

- `node --test`: 317 passed, including entry contact at seven different aiming speeds, angled-cap contact, boarding-only activation, fast unseen jump, slow visible jump, insufficient-momentum misses and blocked air-boost shortcut.
- Actual Spin Dash and boost replays complete the fast and cautious paths without damage and collect both rewards.
- Fast traversal takes 687 ticks in the measured Spin Dash replay; cautious traversal takes 872 ticks, about 3.1 seconds longer.
- Three clean normal-route comparisons measure savings of 1.17–3.22 seconds. These are representative input replays, not a universal bound for every possible execution or platform phase.
- Original hidden-vent flights match frame-for-frame at entry speeds 0, 7, 14 and 23; the missed-building approach still discovers the vent.
- Desktop/laptop Chromium replays and full-route rendering are recorded in `blimp-browser-checks.json` and `momentum-blimp-shortcut-preview.mp4`.
- One focused independent review found no remaining blocker in collision, entry eligibility or boarding behavior.
