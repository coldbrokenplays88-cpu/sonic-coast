# Rooftop momentum trial

This is one representative Act 2 section: the rising Burning Quarter roofs immediately after the two-loop transfer. It is a layout trial, not a level-wide redesign. Baseline: merged PR #13, `a589a2c`.

The first payoff roof and its checkpoint remain intact. The next two roofs retain their 80-unit rises, but have wider landing areas and smaller gaps:

| Roof | Previous width | Trial width |
| --- | ---: | ---: |
| Middle rooftop | 420 | 780 |
| Burning-quarter approach | 480 | 700 |

The intervening gaps are now 100 and 120 units, previously 200 each. The existing climb, moving carrier, hallway, hidden grate, and hidden vent remain connected. Roof facades and supporting structure use the existing city renderer and artwork.

Below the transfers is a continuous service walk, uphill ramp, and 540-unit terrace. Missed jumps lose the upper path; the player can brake on the terrace and make one ordinary return jump. The old immediate death boundary for these gaps is removed; the existing deep-fall limit remains. The ramp stays below the main roofs so it cannot intercept a valid landing. No automatic launch, speed pad, or forced player movement was added.

Physics, controls, boost, camera, enemies, existing hazards, springs, checkpoints, other level geometry, and character artwork are unchanged. The width changes add rings through the existing roof decoration rule. The hidden vent is still reachable by dropping beyond the widened approach roof.

## Validation

- **337 Node tests pass**, including 41 new rooftop cases.
- Chromium: **34 trial replays pass**, with zero page errors. Checks compare against the baseline and verify all unrelated surfaces, hazard/device positions, loops, checkpoint positions, and enemy anchors remain unchanged.
- Continuous Right plus two jumps succeeds at entry speeds 14, 18, 20, 23, and 26 with 6-, 8-, and 10-tick jump holds. There is no countersteering or velocity/position adjustment after the initial placement. Takeoff-offset cases at 14, 20, and 26 cover 50 units early and late.
- At speed 20 with an eight-tick jump, the middle landing provides approximately **24 forward ticks of roof space**, compared with approximately 10 using the old roof edge.
- Standing and Spin Dash rolling misses from both roofs recover at speeds 14, 20, and 26. The literal 80-tick Down + Jump charge/release sequence also recovers safely after a missed second-roof jump.
- An integrated real Spin Dash replay completes both loops, then both rooftop jumps without resetting player position or velocity and without boost. The retained climb then reaches the moving carrier and hallway using ordinary inputs.
- Independent review caught ramp-end interception and insufficient Spin Dash stopping room; both are corrected and have regressions. Review also verified restarting recovery from rest, checkpoint retry, and natural hidden-vent access. No blocking findings remain.
- Browser smoke checks pass for both acts, native input, full-resolution rendering, pool sequence, audio, and responsive layouts. The seven-phase midsection timing replay remains unchanged and passes.

Representative equal-point comparison, starting on the first roof at speed 20 and finishing at the same position on the final roof: the clean upper replay takes **1.833 seconds**; the service recovery takes **2.867 seconds**. These are automated input replays, not optimal human clear times.

[Preview: continuous rooftop flow followed by missed-jump recovery](validation/rooftop-flow-preview.mp4). [Measurements](validation/rooftop-flow.json).

Jump timing still matters. These results do not promise that holding Jump indefinitely, every possible approach speed, or the rest of Act 2 is now safe. Wider rollout should follow the user's playtest of this bounded trial. The trial adds three static surfaces and reuses the existing collision/render passes; no packages or visual effects were introduced.
