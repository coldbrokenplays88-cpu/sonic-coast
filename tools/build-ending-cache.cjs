// Offline, lossless cache of existing ending artwork. Requires the optional
// Playwright/Chromium verification tools only when regenerating these assets.
const fs = require('node:fs'),
  path = require('node:path'),
  http = require('node:http'),
  crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..'),
  game = path.join(root, 'Inferno-Ascent-Game');
const digest = (b) => crypto.createHash('sha256').update(b).digest('hex');
async function main() {
  const original = await import(pathToFileURL(path.join(root, 'src/ending-frames.js')));
  original.initializeRuntimeModule();
  const polish = await import(pathToFileURL(path.join(root, 'src/ending-polish-frames.js')));
  polish.initializeRuntimeModule();
  const frames = original.endingFrames;
  const server = http.createServer((req, res) => {
    const name = path.basename(new URL(req.url, 'http://local').pathname);
    if (!name.startsWith('ending-') || !name.endsWith('.png'))
      return res.end('<!doctype html><title>Ending cache build</title>');
    res.setHeader('Content-Type', 'image/png');
    fs.createReadStream(path.join(game, 'assets', name))
      .on('error', () => {
        res.statusCode = 404;
        res.end();
      })
      .pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  let browser;
  try {
    const { chromium } = require('playwright');
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:' + server.address().port);
    const output = await page.evaluate(async (frames) => {
      const endingFrames = frames,
        endingSprites = new Map(),
        endingLoadErrors = new Set();
      function prepareEndingArt(name, image) {
        const source = document.createElement('canvas');
        source.width = image.width;
        source.height = image.height;
        const sc = source.getContext('2d', { willReadFrequently: true });
        sc.drawImage(image, 0, 0);
        const frames = [];
        for (const d of endingFrames[name]) {
          const [l, t, r, b] = d.bounds,
            w = r - l,
            h = b - t,
            data = sc.getImageData(l, t, w, h),
            pixels = data.data;
          // A connected-component mask prevents neighboring extended limbs leaking
          // into a crop even when generated cel bounds overlap. Keep every hard pixel.
          const keep = new Uint8Array(w * h);
          if (d.islands) {
            for (let i = 0; i < keep.length; i++) keep[i] = pixels[i * 4 + 3] > 160 ? 1 : 0;
          } else {
            const queue = new Int32Array(w * h),
              seed = (d.seed[1] - t) * w + d.seed[0] - l;
            let head = 0,
              tail = 1;
            queue[0] = seed;
            keep[seed] = 1;
            while (head < tail) {
              const i = queue[head++],
                x = i % w;
              for (const j of [x ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w])
                if (j >= 0 && j < keep.length && !keep[j] && pixels[j * 4 + 3] > 160) {
                  keep[j] = 1;
                  queue[tail++] = j;
                }
            }
          }
          for (let i = 0; i < keep.length; i++) pixels[i * 4 + 3] = keep[i] ? 255 : 0;
          const crop = document.createElement('canvas');
          crop.width = w;
          crop.height = h;
          crop.getContext('2d').putImageData(data, 0, 0);
          // Retain the complete masked source crop. Scale only in the final draw.
          const width = Math.ceil(w * d.scale),
            height = Math.ceil(h * d.scale);
          frames.push({
            image: crop,
            width,
            height,
            x: Math.round((d.anchor[0] - l) * d.scale),
            y: height,
            gem: d.gem
              ? {
                  x: Math.round((d.gem[0] - d.anchor[0]) * d.scale),
                  y: Math.round((d.gem[1] - b) * d.scale),
                }
              : null,
          });
        }
        endingSprites.set(name, frames);
        endingLoadErrors.delete(name);
        if (name === 'shadow') prepareEndingEmerald(source);
      }

      function prepareEndingEmerald(source) {
        // Extract the existing yellow Emerald at native resolution; the source PNG
        // stays unchanged. This silhouette excludes the supporting glove and ring.
        const crop = document.createElement('canvas');
        crop.width = 50;
        crop.height = 40;
        const c = crop.getContext('2d');
        c.drawImage(source, 738, 622, 50, 40, 0, 0, 50, 40);
        const data = c.getImageData(0, 0, 50, 40),
          poly = [
            [12, 7],
            [15, 5],
            [33, 5],
            [44, 16],
            [44, 18],
            [41, 22],
            [36, 28],
            [32, 32],
            [23, 35],
            [21, 35],
            [12, 27],
            [11, 26],
            [4, 18],
            [4, 16],
            [6, 13],
          ];
        for (let y = 0; y < 40; y++)
          for (let x = 0; x < 50; x++) {
            let inside = false;
            for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
              const [xi, yi] = poly[i],
                [xj, yj] = poly[j];
              if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
                inside = !inside;
            }
            data.data[(y * 50 + x) * 4 + 3] =
              inside && data.data[(y * 50 + x) * 4 + 3] > 160 ? 255 : 0;
          }
        c.putImageData(data, 0, 0);
        endingSprites.set('emerald', [{ image: crop, width: 14, height: 12, x: 7, y: 6 }]);
      }

      const result = {};
      const pixelHash = async (canvas) => {
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        const hash = await crypto.subtle.digest('SHA-256', data);
        return [...new Uint8Array(hash)].map((x) => x.toString(16).padStart(2, '0')).join('');
      };
      for (const name of Object.keys(frames)) {
        const image = new Image();
        image.src = '/ending-' + name + '.png';
        await image.decode();
        prepareEndingArt(name, image);
        const cels = endingSprites.get(name),
          cellW = Math.max(...cels.map((c) => c.image.width)),
          cellH = Math.max(...cels.map((c) => c.image.height));
        const rows = Math.ceil(cels.length / 4),
          atlas = document.createElement('canvas');
        atlas.width = cellW * 4;
        atlas.height = rows * cellH + (name === 'shadow' ? 40 : 0);
        const ctx = atlas.getContext('2d'),
          hashes = [];
        for (let i = 0; i < cels.length; i++) {
          ctx.drawImage(cels[i].image, (i % 4) * cellW, Math.floor(i / 4) * cellH);
          hashes.push(await pixelHash(cels[i].image));
        }
        if (name === 'shadow') {
          const gem = endingSprites.get('emerald')[0].image;
          ctx.drawImage(gem, 0, rows * cellH);
          hashes.push(await pixelHash(gem));
        }
        result[name] = { png: atlas.toDataURL('image/png').split(',')[1], hashes };
      }
      return result;
    }, frames);
    const manifest = { inputs: {}, outputs: {}, pixels: {} };
    for (const relative of [
      'src/ending-frames.js',
      'src/ending-polish-frames.js',
      ...Object.keys(frames).map((n) => 'Inferno-Ascent-Game/assets/ending-' + n + '.png'),
    ])
      manifest.inputs[relative] = digest(fs.readFileSync(path.join(root, relative)));
    for (const [name, entry] of Object.entries(output)) {
      const relative = 'Inferno-Ascent-Game/assets/ending-' + name + '-cache.png',
        bytes = Buffer.from(entry.png, 'base64');
      fs.writeFileSync(path.join(root, relative), bytes);
      manifest.outputs[relative] = digest(bytes);
      manifest.pixels[name] = entry.hashes;
      console.log(name + ': ' + entry.hashes.length + ' native crops, ' + bytes.length + ' bytes');
    }
    fs.writeFileSync(
      path.join(game, 'assets/ending-cache.json'),
      JSON.stringify(manifest, null, 2) + '\n'
    );
  } finally {
    await browser?.close();
    server.close();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
