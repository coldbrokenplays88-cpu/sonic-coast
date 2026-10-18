const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
function checkEndingCache() {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, 'Inferno-Ascent-Game/assets/ending-cache.json'), 'utf8')
  );
  for (const [file, expected] of Object.entries({ ...manifest.inputs, ...manifest.outputs })) {
    const actual = crypto
      .createHash('sha256')
      .update(fs.readFileSync(path.join(root, file)))
      .digest('hex');
    if (actual !== expected)
      throw Error('Stale ending cache: ' + file + '; run node tools/build-ending-cache.cjs');
  }
}
module.exports = { checkEndingCache };
if (require.main === module) checkEndingCache();
