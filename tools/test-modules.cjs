const { test } = require('node:test');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
const acorn = require('acorn'),
  scopes = require('eslint-scope');
const { buildCompat } = require('./build-compat.cjs');
const manifest = require('../src/runtime-manifest.json');
test('all runtime dependencies resolve through module imports or known browser APIs', () => {
  const allowed = new Set([
    'Array',
    'Object',
    'Math',
    'Number',
    'String',
    'Boolean',
    'JSON',
    'Set',
    'Map',
    'WeakMap',
    'Uint8Array',
    'Uint32Array',
    'Int32Array',
    'Float32Array',
    'Promise',
    'Error',
    'Infinity',
    'undefined',
    'window',
    'document',
    'Image',
    'AbortController',
    'requestAnimationFrame',
    'globalThis',
    'module',
    'Date',
  ]);
  for (const { file } of manifest.modules) {
    const source = fs.readFileSync(path.join(__dirname, '../src', file), 'utf8');
    const ast = acorn.parse(source, { ecmaVersion: 2024, sourceType: 'module', ranges: true });
    const scope = scopes.analyze(ast, {
      ecmaVersion: 2024,
      sourceType: 'module',
      optimistic: true,
      ignoreEval: true,
    });
    const unexpected = [...new Set(scope.globalScope.through.map((r) => r.identifier.name))].filter(
      (name) => !allowed.has(name)
    );
    assert.deepEqual(unexpected, [], file + ' must import its dependencies');
  }
});
test('classic compatibility files match their canonical module sources', () => {
  assert.equal(buildCompat({ check: true }), manifest.modules.length);
});
