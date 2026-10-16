const { test } = require('node:test');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  os = require('node:os');
const { stageSite } = require('./stage-site.cjs');
for (const nested of [false, true])
  test(
    'staging preserves source behind ' +
      (nested ? 'a parent-directory link' : 'an output-directory link'),
    () => {
      const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'neon-linked-output-'));
      try {
        const gameDir = path.join(parent, 'game'),
          alias = path.join(parent, 'linked');
        fs.mkdirSync(gameDir);
        fs.mkdirSync(path.join(gameDir, 'assets'));
        fs.writeFileSync(path.join(gameDir, 'index.html'), '<link href="style.css">');
        fs.writeFileSync(path.join(gameDir, 'style.css'), 'body{}');
        fs.writeFileSync(path.join(gameDir, 'assets', 'keep.txt'), 'source artwork');
        fs.symlinkSync(gameDir, alias, 'dir');
        const outputDir = nested ? path.join(alias, 'new-site') : alias;
        assert.throws(() => stageSite({ gameDir, outputDir }), /must not contain or overlap/);
        assert.equal(
          fs.readFileSync(path.join(gameDir, 'assets', 'keep.txt'), 'utf8'),
          'source artwork'
        );
        assert.ok(fs.existsSync(path.join(gameDir, 'index.html')));
        assert.ok(!fs.existsSync(path.join(gameDir, 'new-site')));
      } finally {
        fs.rmSync(parent, { recursive: true, force: true });
      }
    }
  );
