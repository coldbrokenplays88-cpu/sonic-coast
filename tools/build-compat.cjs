// Generate the classic VM-test entry from the canonical ES modules.
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
const scopes = require('eslint-scope');
const root = path.resolve(__dirname, '..');
const manifest = require('../src/runtime-manifest.json');
function walk(node, visit) {
  if (!node || typeof node !== 'object' || !node.type) return;
  visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}
function classicSource(file, kinds) {
  const source = fs.readFileSync(path.join(root, 'src', file), 'utf8');
  const ast = acorn.parse(source, { ecmaVersion: 2024, sourceType: 'module', ranges: true });
  const scope = scopes.analyze(ast, {
    ecmaVersion: 2024,
    sourceType: 'module',
    optimistic: true,
    ignoreEval: true,
  });
  const apiReferences = scope.scopes
    .flatMap((s) => s.variables)
    .filter((v) => v.defs.some((d) => d.type === 'ImportBinding') && manifest.browserApis[v.name])
    .flatMap((v) => v.references.map((r) => r.identifier));
  function legacy(start, end) {
    const edits = apiReferences
      .filter((id) => id.start >= start && id.end <= end)
      .map((id) => ({ start: id.start, end: id.end, text: 'window.' + id.name }));
    walk(ast, (node) => {
      if (node.start < start || node.end > end) return;
      if (node.type === 'MemberExpression' && !node.computed && node.object.name === 'runtimeState')
        edits.push({ start: node.start, end: node.end, text: node.property.name });
    });
    edits.sort((a, b) => a.start - b.start);
    let text = '',
      offset = start;
    for (const edit of edits) {
      text += source.slice(offset, edit.start) + edit.text;
      offset = edit.end;
    }
    return text + source.slice(offset, end);
  }
  const functions = [],
    initializers = [];
  for (const node of ast.body) {
    if (node.type !== 'ExportNamedDeclaration' || node.declaration?.type !== 'FunctionDeclaration')
      continue;
    const declaration = node.declaration;
    if (declaration.id.name === 'getRuntimeBindings') continue;
    if (declaration.id.name !== 'initializeRuntimeModule') {
      functions.push(legacy(declaration.start, declaration.end));
      continue;
    }
    for (const statement of declaration.body.body) {
      const expression = statement.type === 'ExpressionStatement' ? statement.expression : null;
      const name =
        expression?.type === 'AssignmentExpression'
          ? expression.left.type === 'Identifier'
            ? expression.left.name
            : expression.left.object?.name === 'runtimeState'
              ? expression.left.property.name
              : null
          : null;
      initializers.push(
        (kinds[name] ? kinds[name] + ' ' : '') + legacy(statement.start, statement.end)
      );
    }
  }
  return (
    (
      '// Generated from src/' +
      file +
      "; run npm run build:compat after source edits.\n'use strict';\n" +
      functions.join('\n\n') +
      '\n\n' +
      initializers.join('\n')
    ).trimEnd() + '\n'
  );
}
function buildCompat({ check = false } = {}) {
  const stale = [];
  for (const { file, kinds } of manifest.modules) {
    const content = classicSource(file, kinds),
      target = path.join(root, 'Inferno-Ascent-Game', file);
    if (check) {
      if (fs.readFileSync(target, 'utf8') !== content) stale.push(file);
    } else fs.writeFileSync(target, content);
  }
  if (stale.length) throw Error('Classic compatibility files are stale: ' + stale.join(', '));
  return manifest.modules.length;
}
module.exports = { buildCompat };
if (require.main === module)
  console.log(
    'Classic compatibility files checked/generated:',
    buildCompat({ check: process.argv.includes('--check') })
  );
