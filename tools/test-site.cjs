const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'),
  os = require('node:os'),
  path = require('node:path');
const { stageSite } = require('./stage-site.cjs');
test('staging includes all referenced game files and assets, but no development files', () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'neon-site-'));
  try {
    const outputDir = path.join(parent, 'site');
    stageSite({ gameDir: path.resolve('Inferno-Ascent-Game'), outputDir });
    const html = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8');
    for (const [, file] of html.matchAll(/(?:src|href)="([^"?]+)(?:\?[^\"]*)?"/g)) {
      if (file.startsWith('data:') || file === './') continue;
      assert.ok(fs.existsSync(path.join(outputDir, file)), file);
    }
    assert.ok(
      fs.existsSync(path.join(outputDir, 'assets', 'sonic-expressive.png')),
      'fallback retained'
    );
    assert.ok(
      fs.existsSync(path.join(outputDir, 'assets', 'ending-shadow.png')),
      'ending retained'
    );
    const files = fs.readdirSync(outputDir);
    assert.ok(
      !files.some(
        (f) => f.endsWith('.cjs') || ['scripts', 'README.txt', 'RUN-GAME-WINDOWS.bat'].includes(f)
      )
    );
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
});
test('staging rejects missing entry resources instead of publishing a broken game', () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'neon-missing-'));
  try {
    const gameDir = path.join(parent, 'source');
    fs.mkdirSync(gameDir);
    fs.writeFileSync(
      path.join(gameDir, 'index.html'),
      '<link rel="stylesheet" href="style.css"><script src="missing.js"></script>'
    );
    assert.throws(
      () => stageSite({ gameDir, outputDir: path.join(parent, 'site') }),
      /Missing game resource/
    );
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
});

test('staging refuses source directories and their ancestors', () => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'neon-protect-'));
  try {
    const gameDir = path.join(parent, 'source');
    fs.mkdirSync(gameDir);
    fs.mkdirSync(path.join(gameDir, 'assets'));
    fs.writeFileSync(path.join(gameDir, 'index.html'), '<link href="style.css">');
    fs.writeFileSync(path.join(gameDir, 'style.css'), 'body{}');
    assert.throws(() => stageSite({ gameDir, outputDir: parent }), /must not contain or overlap/);
    assert.ok(fs.existsSync(path.join(gameDir, 'index.html')));
  } finally {
    fs.rmSync(parent, { recursive: true, force: true });
  }
});
