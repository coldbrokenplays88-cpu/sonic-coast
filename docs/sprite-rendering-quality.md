# Sprite rendering quality pass

The source atlases already held more detail than the renderer displayed. The main loss happened before drawing: gameplay cels were reduced to roughly one-third of source resolution, and cutscene cels to roughly one-quarter, then enlarged on the game canvas. Nearest-neighbor enlargement kept those reduced pixels crisp but could not recover discarded eyes, mouth lines, shading or quill outlines.

The renderer now retains full-resolution cropped cels and scales them only when drawing onto the main canvas. The original display dimensions, foot anchors, quantized rotations and camera settings remain unchanged. The boss armor follows the same approach; its rotated raster copies are replaced by cached transform descriptors. Warm frames allocate no new sprite canvases.

No original image was edited, regenerated or upscaled. All 27 asset files match the main-branch originals byte-for-byte. Physics, collision boxes, animation choices/timing, level data and camera code have no changes.

## Measured pipeline

The game uses a fixed 1920×1080 backing canvas with a 960×540 world viewport. It displays at approximately 1198×673 CSS pixels in the normal desktop layout. The canvas is not dynamically reduced on mobile. World rendering and these sprite functions explicitly disable image smoothing; CSS uses `image-rendering: pixelated`. Existing integer backing-pixel alignment is preserved.

Representative poses at the same 0.8 camera zoom:

| Pose | Source crop | Old cached raster | New cached raster | Unchanged backing footprint | Desktop height |
| --- | --- | --- | --- | --- | --- |
| Sonic gameplay idle | 131×178 | 44×59 | 131×178 | 88×118 | ~74 CSS px |
| Sonic cutscene idle | 168×220 | 47×62 | 168×220 | 94×124 | ~77 CSS px |
| Shadow Emerald offer | 166×215 | 48×62 | 166×215 | 96×124 | ~77 CSS px |
| Eggman pod idle | 318×352 | 93×103 | 318×352 | 186×206 | ~128 CSS px |

Display dimensions are separate from source crop dimensions. This preserves the established character size rather than allowing larger caches to enlarge the characters. Cutscene component masks still isolate the same bodies from overlapping atlas cells; no new silhouette processing was added.

The source-to-canvas step now samples from the complete artwork, with no small intermediate raster. Responsive CSS still scales the complete game canvas to fit the screen. At 390px viewport width, the cutscene characters are only about 24 CSS pixels tall; tablet height is about 46px. Fine expressions cannot be fully legible at every such size. High-DPI displays also remain bounded by the existing 1920×1080 canvas. Camera zoom, sprite scale and canvas resolution were preserved to avoid changing framing, apparent size or rendering load.

## Comparisons

[Before/after detail comparison](validation/sprite-quality/comparison.png) shows identical frames, positions and camera settings. Crops are displayed at 2× nearest-neighbor magnification solely for inspection.

Full, unmagnified examples are also saved:

- Gameplay: [before](validation/sprite-quality/before-desktop-idle.png) / [after](validation/sprite-quality/after-desktop-idle.png)
- Sonic and Shadow expressions: [before](validation/sprite-quality/before-desktop-nod.png) / [after](validation/sprite-quality/after-desktop-nod.png)
- Kick and Eggman pod: [before](validation/sprite-quality/before-desktop-kick.png) / [after](validation/sprite-quality/after-desktop-kick.png)
- Phone: [before](validation/sprite-quality/before-phone-nod.png) / [after](validation/sprite-quality/after-phone-nod.png)
- Fullscreen: [before](validation/sprite-quality/before-fullscreen-idle.png) / [after](validation/sprite-quality/after-fullscreen-idle.png)

## Validation

- `node --test`: 168 tests pass. Rendering regressions cover full source crops, unchanged display sizes/anchors, rolling diameter, odd boss-part anchor offsets and zero extra warm-frame canvas allocations.
- `node scripts/verify-sprite-quality.cjs <before URL> <after URL>`: compares 12 poses across desktop, high-DPI desktop, tablet, high-DPI phone and fullscreen. Asserts identical pose data, camera values, display size and nominal sprite footprints, with zero page errors. Screenshots include gameplay idle/run/boost/brake/grind/roll and cutscene kick/offer/nod/swing/surprise/jetpack poses.
- Full ending replay: all 16 beats, nine one-shot events, fixed camera/clock/stats, image retry, pause/resume and act-switch behavior pass.
- Full boss replay using ordinary directional/jump inputs: three hits, three bites, four tail strikes, three lasers, zero damage/deaths, ending and results pass.
- Both-act browser regression passes for movement, boost, pause, audio, fullscreen and tablet/mobile layouts, with zero page errors. Shadow is currently a cutscene character; no playable Shadow movement system was introduced.

The optional headless draw benchmark reported median batch-average draw times of 4.04–5.81ms before and 3.76–5.45ms after across four existing scenes. The summit sample changed from 4.10 to 4.54ms; the other samples were lower. These are variable renderer measurements, not device FPS or a guaranteed performance improvement. The 68 cutscene cels now occupy about 12.4 MiB of raw RGBA pixels instead of 1.0 MiB (excluding browser/GPU overhead). These fixed caches require more memory; eliminating rotated canvas copies limits allocation growth. Measurements are saved beside the comparisons.
