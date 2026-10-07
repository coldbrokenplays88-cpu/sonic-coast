# Supplied city music

The user-provided `ScreenRecording_10-07-2026 15-35-15_1.mp3` is preserved byte-for-byte as `Inferno-Ascent-Game/assets/city-music.mp3`. No transcoding, trimming, normalization or other changes were made to the supplied audio.

- Size: 4,918,443 bytes.
- SHA-256 of both source and destination: `5a86880a8af816681a6637e648e56e72a1c5ad05a1d3e8518d6ee4b2fe1b0a99`.
- MP3, stereo, 44.1 kHz. Container duration: 176.404898 seconds; Chromium's decoded media duration: 176.373333 seconds (encoder padding excluded).
- File provenance is also recorded in `assets/city-music-provenance.json`.

## Integration contract

Load `game-music.js` after `game-audio.js` and before `game.js`. The module uses one native `Audio` element and streams the MP3; it creates no additional Web Audio graph, sample buffers or per-frame media elements.

```js
window.syncGameMusic({enabled: sound, mode});
window.syncGameMusic({enabled: sound, mode, restart: true});
window.syncGameMusic({enabled: sound, mode, gesture: true});
window.setGameMusicVolume(0.15);
```

Normal synchronization should run after mode updates, including non-playing frames and UI transitions. Only `enabled === true` together with `mode === 'playing'` permits playback. Sound is never enabled by the module itself. `ready`, paused states, `over`, `win`, and disabling Sound pause the native stream and preserve its playhead.

Pass `restart: true` once when starting a fresh act, selecting another act, or restarting a run. It resets the playhead even while muted. Do not pass it on ordinary deaths when lives remain; the existing song continues. Do not include `restart: true` in a repeated normal-frame call.

`gesture: true` can be passed directly inside Sound/Play/Resume button or keyboard handlers. The module also listens to genuine pointer-down and key-down gestures to retry an autoplay-blocked request. It does not repeat rejected `play()` calls on every game frame. Pending play promises, pause/resume races and rejections are handled without unhandled promise errors.

Volume defaults to 0.3 and cannot exceed 0.3, keeping music below full media gain alongside the synthesized effects. `setGameMusicVolume(value)` and the optional sync `volume` parameter accept 0–0.3; zero preserves playback while silencing music. The original MP3 bytes remain unchanged regardless of volume. Final speaker/headphone balance can be adjusted with this API; no extra UI is required.

`syncGameMusic` returns true when playback is already active or its request is accepted, and false when paused, blocked, unavailable or failed. A media-load error safely pauses music while gameplay and the independent original sound effects remain usable. Unsupported media constructors fail without breaking the game.

## Verification

- `node --test test-music.cjs`: **16/16 passed** after observing the missing-module failures before implementation. Tests cover muted allocation, one streamed loop, volume bounds, every non-playing mode, resume versus fresh-act resets, ordinary deaths, reset while muted, unsupported media, blocked-autoplay throttling and gesture retry, pending-play/mute races, failed load, and delayed seeking until metadata is available.
- Source/destination SHA-256 match verified after copying; `ffprobe` verified the MP3 format and duration.
- Native Chromium playback of the actual asset passed: a real click initiated playback, media error stayed null, loop enabled, volume 0.3, and playback time advanced. Muted initial state created no media element. Pause held the exact playhead through a 250 ms wait; resume advanced it, fresh restart reset to zero, and disabling Sound remained paused through a further wait. No page errors were observed.
- Latest full-repository test snapshot: **85/89 passed**. All audio, music, objects, HUD, existing inputs/mechanics and middle-route tests passed. The four failing tests were the root agent's then-unimplemented supplemental animation behavior: fast-run eight-frame cycle, distinct boost/grind eight-frame poses, grind entry/exit transitions, and held-charge pose variation. Final integrated test results belong to the root completion pass.

Browser autoplay and lifecycle behavior are verified in Chromium. Final audible balance and native media behavior on the user's iPad require the actual device check; these tests do not claim a physical listening review.
