# Artwork loading measurements

No PNG was converted, replaced or deleted. Measurements used Pillow to encode candidate files in memory and decode them again; the measurements do not claim a speedup on real devices.

## Which artwork is needed

Both acts use `recoveredSpeedster`, `recoveredPeelout`, `supplemental`, `peeloutCycle`, `traversalActing` and `traversalLaunch`. Act 1 additionally needs `city`. Act 2 additionally needs `recoveredCity` and `scorpion`. The shipped initial selection remains Act 2.

The eight older Sonic atlases (`sonic`, `motion`, `boost`, `brake`, `grind`, `detail`, `wind`, `transitions`) load only if both recovered Sonic sheets fail. Either recovered sheet can cover for the other. Act 2's city fallback chain is recovered city → collapse city → original city. Switching acts requests the newly needed sheets once; loaded images stay available for switching back. Failed requests also stay recorded, matching the previous lack of gameplay-art retry.

Known sheet names remain present in the `art` registry with null until ready. Renderers still use truthiness to check readiness. Ending artwork uses a separate existing loader and is unchanged, including its six initial PNG requests and retry behavior.

| Gameplay loader | PNG bytes | Nominal decoded RGBA bytes | Sheets |
| --- | ---: | ---: | ---: |
| Before, either act | 34,315,885 | 110,942,816 | 18 |
| Act 1 startup | 13,979,916 | 44,045,592 | 7 |
| Act 2 startup | 16,145,899 | 50,337,048 | 8 |

PNG totals are file sizes, without HTTP headers; decoded memory is width × height × 4 and excludes canvas copies, GPU storage, ending art and browser overhead. Startup gameplay image bytes fall by 59.3% in Act 1 and 52.9% in Act 2. These are not whole-page memory or network measurements.

## Conversion experiment (proposal only)

Across all 18 gameplay sheets, original PNG is **34,315,885 bytes**, lossless WebP is **27,935,542 bytes** (18.6% smaller), and 256-color PNG is **5,851,751 bytes** (82.9% smaller). All 18 lossless WebP round trips preserve every RGBA byte, including transparent pixels. None of the palette versions preserves every pixel. Palette quantization visibly risks changing fine color and transparency detail; no claim of invisible loss is made. Recommend considering lossless WebP separately, after checking target browsers; keep palette conversion off by default.

| Sheet | PNG bytes | Lossless WebP bytes | 256-color PNG bytes |
| --- | ---: | ---: | ---: |
| city-recovered-burning.png | 2,269,251 | 2,023,824 | 443,525 |
| sonic-recovered-speedster.png | 2,190,563 | 1,769,552 | 431,703 |
| sonic-recovered-peelout.png | 2,190,234 | 1,765,860 | 425,845 |
| city.png | 1,939,004 | 1,720,394 | 388,767 |
| city-collapse.png | 2,159,070 | 1,956,442 | 464,374 |
| sonic-expressive.png | 2,352,434 | 1,851,402 | 351,121 |
| sonic-motion.png | 2,387,031 | 1,853,010 | 349,867 |
| sonic-boost.png | 1,209,546 | 1,001,450 | 212,365 |
| sonic-brake.png | 757,504 | 612,460 | 135,758 |
| sonic-grind.png | 1,300,438 | 1,084,900 | 235,380 |
| sonic-detail.png | 2,202,383 | 1,674,402 | 285,642 |
| sonic-wind.png | 2,430,711 | 1,920,328 | 331,670 |
| sonic-transitions.png | 1,431,865 | 1,161,100 | 268,402 |
| sonic-supplemental.png | 1,979,567 | 1,608,566 | 353,670 |
| sonic-peelout-cycle.png | 1,236,334 | 1,002,852 | 206,479 |
| sonic-traversal-acting.png | 2,401,589 | 1,941,644 | 343,703 |
| sonic-traversal-launch.png | 2,042,625 | 1,620,042 | 410,639 |
| egg-scorpion-parts.png | 1,835,736 | 1,367,314 | 212,841 |

Per-channel average absolute palette errors and dimensions are recorded in [review-compression.json](validation/review-compression.json). No human visual comparison of the palette alternatives was performed.

## City cache

`cityTexture()` caches one Scale2x result per source image in a WeakMap. Doubling width and height creates four times the source pixel area; it is intentional reconstruction, not a new canvas per draw. Temporary source/readback buffers can be collected after construction. The long-lived `art` registry retains loaded source images, so their reconstructed canvases remain for the page's lifetime. Separate backdrop and cloud caches reuse that result; the fixed game-canvas size bounds the normal backdrop size variants. This is sensible reuse for the existing renderer, although it is not active eviction when switching acts. No clear cache bug was found, so the cache is unchanged. Lazy loading prevents allocating cities never used.
