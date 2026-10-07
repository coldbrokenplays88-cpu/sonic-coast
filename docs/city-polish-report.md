# Pixel city object integration

`Inferno-Ascent-Game/city-polish.js` supplies original pixel sprites matched to the red/yellow spring and gray CRT lightning-monitor references. The underwater roller-and-arrow launcher is original artwork inspired by the described Chemical Plant mechanism. Supplied references and recovered PNGs remain unchanged.

Load after `pixel-world.js` and before `game.js`. All APIs draw in the already-transformed world canvas. Spring, monitor, pool booster and vent `x,y` are ground anchors; enemies use their existing centered coordinates. Root should resolve moving-device coordinates before drawing. Every renderer culls on both camera axes.

| API | Integration |
| --- | --- |
| `drawPolishedSpring(device)` | Replace generic spring draws. `firedAt` drives six compression/extension/rebound stages over 24 ticks. `launchX` or `vx`, plus `power` or `up`, determines cap orientation, quantized to 22.5-degree pixel orientations. Does not mutate physics. |
| `drawBoostMonitor(monitor)` | Ground-anchored 54×62 CRT. `broken` selects shattered shell. Intact lightning and glass animate; broken displays no pickup symbol. |
| `drawPoolBooster(device)` | Ground-anchored animated red/white rollers and upward chevrons. Supports the same direction fields as springs. |
| `drawPolishedVent(device)` | Detailed fixed grate with animated upward air chevrons. `hidden` uses restrained particles to preserve secrets. |
| `drawPixelEnemy(enemy)` | Outlined articulated ground crab or twin-engine drone; high-contrast red eyes. `alive:false` draws nothing. `bounceRoute` adds a pixel jump chevron. |
| `drawPixelSpikes(hazard)` | Stepped metallic spikes fitting existing `x,y,w,h` collision rectangle. |
| `drawDebrisWarning(debris)` | Replace warning corridor and old beacon together. Larger outlined triangle, animated downward chevrons, impact stripes spanning `w`, corner markers. Only draws while `triggered && age < warn`. |
| `drawPixelDebris(debris)` | Replace falling-debris rectangle. Detailed fractured facade chunk follows the same `y-460+460*t*t` trajectory as existing hazard physics. Does not change timing/collision. |
| `drawPixelSign(x,y,text,type)` | Original 5×7 pixel letters, riveted panel and physical post; no browser-font rendering. |
| `updateCityInteriors()` | Call once per physics tick. Smoothly updates `building.interiorOpacity` from 1 to .24 while inside accessible rooms/ducts, then restores it on exit. Closed gates remain opaque. |
| `drawCityDetails()` | Call behind actual collision decks. Adds subdued service vents, downpipes, cracked masonry and fragments below roofs, with existing facade opacity. |

When rendering a room building, apply `interiorOpacity` to its covering facade only; draw room cutaways at full opacity. Do not apply the facade opacity to actual collision decks, Sonic or hazards. Warning lead time and moving-spring trajectory remain the mechanics integration's responsibility.

Sprites use a shared bounded 192-entry cache. The first render compiles two-unit horizontal pixel runs into a small nearest-neighbor canvas; warmed sprites use one `drawImage` each. Test/noncanvas environments use the identical runs directly. No asset downloads, gradients, antialiased paths or image smoothing are used.

Validation: `node --test test-city-polish.cjs` passed all 14 tests covering frame changes, cap direction, monitor breakage, moving visual mechanisms, readable enemy colors, warning lifecycle/impact span, accessible-interior fade, roof clearance, camera culling, bounded caching and warm-frame texture reuse. Chromium rendered `/tmp/sonic-city-object-atlas.png` with zero page errors; the atlas was visually inspected. A full-suite run during concurrent integration passed 52/57 tests, with the five failures confined to the not-yet-integrated new middle section (route reconnect, free rail, pool launch, moving spring, hidden branch); root must rerun the integrated suite before delivery.

Synthetic Chromium sprite benchmark (five batches, median per 10,000 calls): previous minimal spring 25.9 ms, new cached detailed spring 88.2 ms, approximately .009 ms per new spring. The new art is more detailed and larger; the cache reduces drawing calls but this benchmark does not prove a net speedup. Whole-frame profiling is required.

Remaining checks: final in-level scenery ordering and all directional springs must be reviewed in the integrated game. Desktop sprite microbenchmarks do not establish actual iPad performance.
