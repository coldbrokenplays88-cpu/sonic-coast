# Original game sound implementation

`Inferno-Ascent-Game/game-audio.js` synthesizes every cue with Web Audio oscillators and deterministic procedural noise. No audio recordings, downloaded sound assets, recognizable copied tunes or external audio dependencies are used. Layered attacks, short pitch sweeps, chimes, mechanical tones and filtered noise provide arcade feedback. Movement is quieter than important interaction feedback.

## Integration

Load `game-audio.js` before `game.js`. It exposes:

```js
window.setGameSoundEnabled(enabled); // Boolean effective state; false by default.
window.playGameSound(name, options); // Boolean: scheduled, or muted/throttled/unavailable.
```

Call `setGameSoundEnabled(true)` directly inside the existing Sound button's click handler, and use its return value for the button state. It creates/reuses one context and initiates resume immediately, including Safari's gesture requirement. Disabling stops and disconnects ongoing cues. Do not keep the old `beep()` graph in parallel with these sounds.

Optional parameters are `volume` (0–1, default 1), `charge` (0–1, default 0), `speed` (absolute world units per game frame, clamped at 32), and `pan` (−1–1, default center). Invalid numeric parameters use safe defaults. `pool` additionally accepts `launch: true` to distinguish underwater launch from splash entry.

| Cue | Actual trigger | Useful options |
| --- | --- | --- |
| `start` | Begin/restart an act | — |
| `jump` | Jump accepted by physics | — |
| `land` | Actual airborne-to-ground transition, once | `volume` for hard/soft landings |
| `run` | Ground running; do not play during grinding, boost, rolling or braking | `speed` |
| `brake` | Active grounded braking/skid | `speed` |
| `spindashCharge` | Hold/tap charging while charge is increasing | `charge: charge/maximumCharge` |
| `spindashRelease` | Actual charged launch | `charge` sampled before reset |
| `boost` | Boost actively supplies speed; stop calling on release | `speed` |
| `grind` | Moving on a grindable rail | `speed` |
| `spring` | Spring launch, never visual-only compression | — |
| `vent` | Vertical air-shaft launch | — |
| `pool` | Scripted pool capture/splash | — |
| `pool` | Underwater mechanism launch | `launch: true` |
| `ring` | Normal or spilled-ring pickup | — |
| `monitor` | Intact boost monitor is broken and collected | — |
| `enemy` | Enemy actually defeated | — |
| `hazard` | Environmental collision/break or nearby debris impact | `volume`/`pan` by distance |
| `warning` | Nearby actionable debris warning becomes active | `pan` if appropriate |
| `hurt` | Damage accepted outside invulnerability | — |
| `death` | One death/fall transition | — |
| `checkpoint` | Safe checkpoint newly activates | — |
| `pause` | Enter pause | — |
| `menu` | Menu/stage selection, resume and Sound-enable confirmation | — |
| `clear` | Level completion, once | — |

Continuous movement calls may occur from the normal update loop: the module enforces its own minimum intervals. Use one movement family at a time (charge, braking, boost, grind, run) so mechanical feedback remains clear. Action events should fire at their simulation transitions rather than visual animation frames. Offscreen world events should be culled by the caller; this module has no camera dependencies. Keep sounds absent during automated muted tests and no-play menu animation.

## Bounded scheduling and lifecycle

- Maximum 18 scheduled voices and eight cue events at once. Each cue has two to six layers.
- Same-event throttling: rings at most once every 45 ms; quiet movement every 120–200 ms; warnings every 300 ms. Clusters of rings remain one clean pickup chime per accepted interval.
- Important events preempt movement first. Quiet motion cannot replace ring, impact, warning or checkpoint sounds. Important events can replace older equally important events when required to remain within the budget.
- Each voice has an attack/release envelope and scheduled stop. Sources/envelopes disconnect on completion; other event nodes disconnect when its final voice ends. A shared 0.45-second procedural noise buffer is cached once per context.
- Master level is 0.22 with a compressor when available. Empty volume means no voice allocation. Optional stereo panning falls back safely when unsupported.
- Unsupported Web Audio, failed graph allocations and resume rejections return/settle safely without breaking the game. A closed context can be replaced after disabling old voices. All resume promises have rejection handlers.

## Verification

`node --test test-audio.cjs`: **14/14 passed**. Coverage includes opt-in context allocation, user-gesture resume and reuse, all 23 named cue graphs, finite release envelopes, ring/movement floods, priority under load, mute and natural-end cleanup, charge pitch, splash versus launcher distinction, invalid numeric options, unsupported audio, closed-context recovery, partial graph-allocation cleanup and rejected resume promises. Missing-module, missing-cue, missing-launch and closed-context failures were observed before their corresponding implementation changes.

Chromium checked a native click → unlock → jump → mute sequence: context reached `running`, jump scheduled, and subsequent muted rings remained silent. No page errors were observed.

Chromium `OfflineAudioContext` rendered all 23 cues plus the pool-launch variant through real oscillator, filter, envelope, panner and compressor nodes. Every output had nonzero samples and a clean tail; peaks were 0.0089–0.1341 (below clipping), and significant audio ended within 1.054 seconds. The quiet run texture intentionally had the lowest output. New brake/hazard/underwater-launch variants also rendered correctly (peaks 0.0274/0.0532/0.0883).

The latest full repository suite snapshot was **52/57 passed**, with all audio, HUD, city-polish, inputs and mechanics tests passing. The five then-failing tests were new middle-section work in progress: reconnecting routes, continuous rail/shared landing, scripted pool sequence, moving spring follow, and four initially visible secret ledges. Final integrated validation belongs to the root implementation pass; this audio module alone does not verify event wiring or listening balance on the user's iPad.
