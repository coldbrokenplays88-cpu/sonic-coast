const fs = require('node:fs'),
  path = require('node:path');
const repo = path.resolve(__dirname, '..');
function stageSite({
  gameDir = path.join(repo, 'Inferno-Ascent-Game'),
  outputDir = path.join(repo, 'dist', 'site'),
} = {}) {
  const html = fs.readFileSync(path.join(gameDir, 'index.html'), 'utf8');
  const resources = [
    'style.css',
    ...[...html.matchAll(/<script\s+src="([^"?]+)(?:\?[^\"]*)?"/g)].map((m) => m[1]),
  ];
  for (const file of resources) {
    if (file !== path.basename(file) || !fs.existsSync(path.join(gameDir, file)))
      throw Error('Missing game resource or invalid path: ' + file);
  }
  if (!fs.existsSync(path.join(gameDir, 'assets'))) throw Error('Missing game resource: assets');
  if (path.resolve(outputDir) === path.resolve(gameDir))
    throw Error('Output directory must differ from the source');
  fs.mkdirSync(outputDir, { recursive: true });
  // Only this dedicated build directory is cleared; never the source game.
  for (const file of fs.readdirSync(outputDir))
    fs.rmSync(path.join(outputDir, file), { recursive: true, force: true });
  for (const file of resources)
    fs.copyFileSync(path.join(gameDir, file), path.join(outputDir, file));
  fs.writeFileSync(path.join(outputDir, 'index.html'), html);
  fs.cpSync(path.join(gameDir, 'assets'), path.join(outputDir, 'assets'), { recursive: true });
  return { outputDir, resources };
}
module.exports = { stageSite };
if (require.main === module) {
  const result = stageSite();
  console.log('Playable site staged at ' + result.outputDir);
}
