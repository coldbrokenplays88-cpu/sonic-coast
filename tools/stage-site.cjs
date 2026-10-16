const fs = require('node:fs'),
  path = require('node:path');
const { buildRuntime } = require('./build-runtime.cjs');
const crypto = require('node:crypto');
const repo = path.resolve(__dirname, '..');
// Resolve existing links, including parents of a not-yet-created output directory.
function filesystemPath(value) {
  let current = path.resolve(value);
  const missing = [];
  for (;;) {
    try {
      return path.join(fs.realpathSync(current), ...missing.reverse());
    } catch (error) {
      if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error;
      const parent = path.dirname(current);
      if (parent === current) throw error;
      missing.push(path.basename(current));
      current = parent;
    }
  }
}

function stageSite({
  gameDir = path.join(repo, 'Inferno-Ascent-Game'),
  outputDir = path.join(repo, 'dist', 'site'),
} = {}) {
  gameDir = filesystemPath(gameDir);
  outputDir = filesystemPath(outputDir);
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
  const sourcePath = path.resolve(gameDir),
    targetPath = path.resolve(outputDir);
  const inside = (parent, child) => {
    const relative = path.relative(parent, child);
    return (
      relative === '' ||
      (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))
    );
  };
  if (inside(sourcePath, targetPath) || inside(targetPath, sourcePath))
    throw Error('Output directory must not contain or overlap the source');
  fs.mkdirSync(outputDir, { recursive: true });
  // Only this dedicated build directory is cleared; never the source game.
  for (const file of fs.readdirSync(outputDir))
    fs.rmSync(path.join(outputDir, file), { recursive: true, force: true });
  const { script } = buildRuntime(outputDir);
  const css = fs.readFileSync(path.join(gameDir, 'style.css'));
  const style =
    'style-' + crypto.createHash('sha256').update(css).digest('hex').slice(0, 16) + '.css';
  fs.writeFileSync(path.join(outputDir, style), css);
  const entry = html
    .replace(/<script\s+src="[^"]+"[^>]*><\/script>/g, '')
    .replace('href="style.css"', 'href="' + style + '"')
    .replace('</body>', '<script src="' + script + '"></script>\n</body>');
  fs.writeFileSync(path.join(outputDir, 'index.html'), entry);
  fs.cpSync(path.join(gameDir, 'assets'), path.join(outputDir, 'assets'), { recursive: true });
  return { outputDir, resources: [script, style] };
}
module.exports = { stageSite };
if (require.main === module) {
  const result = stageSite();
  console.log('Playable site staged at ' + result.outputDir);
}
