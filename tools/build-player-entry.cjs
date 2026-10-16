// Commit a ready-to-play module build so GitHub's source ZIP needs no build tools.
const fs = require('node:fs'),
  path = require('node:path');
const { stageSite } = require('./stage-site.cjs');
const root = path.resolve(__dirname, '..'),
  game = path.join(root, 'Inferno-Ascent-Game');
function buildPlayerEntry({ check = false } = {}) {
  const { outputDir, resources } = stageSite(),
    html = fs.readFileSync(path.join(outputDir, 'index.html'));
  const entry = path.join(game, 'PLAY.html');
  if (check) {
    if (!fs.existsSync(entry) || !fs.readFileSync(entry).equals(html))
      throw Error('PLAY.html is stale; run npm run build:player');
    for (const file of resources)
      if (
        !fs.existsSync(path.join(game, file)) ||
        !fs.readFileSync(path.join(game, file)).equals(fs.readFileSync(path.join(outputDir, file)))
      )
        throw Error('Player build is stale: ' + file);
  } else {
    if (fs.existsSync(entry)) {
      const previous = fs.readFileSync(entry, 'utf8');
      for (const [, file] of previous.matchAll(
        /(?:src|href)="((?:runtime|style)-[a-f0-9]{16}\.(?:js|css))"/g
      ))
        if (!resources.includes(file)) fs.rmSync(path.join(game, file), { force: true });
    }
    for (const file of resources)
      fs.copyFileSync(path.join(outputDir, file), path.join(game, file));
    fs.writeFileSync(entry, html);
  }
  return resources;
}
module.exports = { buildPlayerEntry };
if (require.main === module)
  console.log(
    'Player entry checked/generated:',
    buildPlayerEntry({ check: process.argv.includes('--check') }).join(', ')
  );
