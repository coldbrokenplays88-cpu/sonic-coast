# Shadow ending

The Act 2 Egg Scorpion defeat now leads into a 16.1-second, dialogue-free pixel-art scene before the results screen. The camera stays fixed. The level timer and gameplay statistics freeze while the scene plays; pause, restart and act selection still work.

Sequence: Eggman's pod escapes and fires a rocket; an excited Sonic watches Shadow teleport in and kick it back. The pod explodes and Eggman escapes by jetpack. Shadow offers a yellow Chaos Emerald. Sonic approaches and nods with closed eyes; an annoyed Shadow swings his arm upward to activate teleportation. Sonic realizes what is happening, disappears, and Shadow remains to sigh.

Three new transparent atlases supply Sonic's acting, Shadow's arrival/kick/acting, and Eggman's pod/jetpack/rocket. Original generated PNGs are retained. Runtime extraction caches pixel cels with fixed foot anchors and nearest-neighbor integer scaling. Existing sound preferences apply to nine original procedural effects.

## Verification

- `node --test`: 162 passing tests, including timeline order, rocket contact, upward gesture, Sonic-only disappearance, frozen gameplay, pause, reset, late art and missing reused run atlas.
- `node scripts/verify-ending.cjs http://127.0.0.1:8004`: captures the entire timeline at 20 fps, asserts camera/clock/stat stability, all 16 beats and nine one-shot events; tests failed atlas download/retry, pause and act switching. Output defaults to `/tmp/sonic-ending-validation`.
- Existing Chromium boss replay passed with normal directional/jump controls: three hits, three bites, four tail strikes, three lasers, zero damage/deaths, then ending and results.
- Existing both-act browser regression passed with zero page errors, including keyboard, audio, fullscreen and tablet/mobile layout.
- Full timeline captured as `docs/validation/ending-preview.mp4` (silent visual capture); scene sound effects are tested separately. Key poses and motion strips reviewed for transparency, contact, Emerald gesture and expressions.

## Try it

After merging this branch and a successful GitHub Pages deployment, finish the Act 2 boss normally. The ending starts after the armor collapse. Use the existing sound toggle to hear effects. Until merged, the Pages site continues to serve the currently deployed version.

If a new atlas fails to load, the scene waits and provides Retry. If the existing run atlas is unavailable, its short cutscene run uses a loaded Sonic acting cel while retaining the movement trajectory.
