const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');
function buildRuntime(outputDir) {
  const result = esbuild.buildSync({
    entryPoints: [path.join(root, 'src/main.js')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2022',
    keepNames: true,
    write: false,
    define: { module: 'undefined' },
    metafile: true,
  });
  const code = result.outputFiles[0].contents;
  const hash = crypto.createHash('sha256').update(code).digest('hex').slice(0, 16);
  const script = 'runtime-' + hash + '.js';
  fs.writeFileSync(path.join(outputDir, script), code);
  return { script, inputs: Object.keys(result.metafile.inputs) };
}
module.exports = { buildRuntime };
