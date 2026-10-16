const fs = require('node:fs'),
  path = require('node:path');
const { zipSync } = require('fflate');
const { stageSite } = require('./stage-site.cjs');
function packagePlayer() {
  const { outputDir } = stageSite(),
    files = {};
  function add(dir, prefix = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const relative = prefix + entry.name,
        full = path.join(dir, entry.name);
      if (entry.isDirectory()) add(full, relative + '/');
      else
        files['Neon-Express/' + relative] = [
          new Uint8Array(fs.readFileSync(full)),
          { mtime: new Date('2026-01-01T00:00:00Z') },
        ];
    }
  }
  add(outputDir);
  const game = path.resolve(__dirname, '../Inferno-Ascent-Game');
  for (const file of ['RUN-GAME-WINDOWS.bat', 'README.txt'])
    files['Neon-Express/' + file] = [
      new Uint8Array(fs.readFileSync(path.join(game, file))),
      { mtime: new Date('2026-01-01T00:00:00Z') },
    ];
  const output = path.resolve(__dirname, '../dist/Neon-Express-player.zip');
  fs.writeFileSync(output, zipSync(files, { level: 6 }));
  console.log('Player ZIP: ' + output);
  return output;
}
module.exports = { packagePlayer };
if (require.main === module) packagePlayer();
