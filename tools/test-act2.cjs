const { test } = require('node:test');
const assert = require('node:assert/strict'),
  path = require('node:path');
const fixture = require('./fixtures/act2-baseline.json');
process.chdir(path.resolve(__dirname, '../Inferno-Ascent-Game'));
const { boot } = require('../Inferno-Ascent-Game/test-support.cjs');
test('Act 2 preserves every baseline level value and floor query', () => {
  const a = boot(2);
  const actual = a.run('var comparisonLevel=makeLevel2();JSON.stringify(comparisonLevel)');
  assert.deepEqual(JSON.parse(actual), fixture.level);
  for (const [x, y] of fixture.floorSamples)
    assert.equal(a.run(`comparisonLevel.floorAt(${x})`), y, 'floor at ' + x);
});
test('Act 2 preserves challenge aliases and gives each run fresh mutable data', () => {
  const a = boot(2);
  assert.equal(
    a.run(
      'var firstLevel=makeLevel2();var secondLevel=makeLevel2();firstLevel.challenges===firstLevel.routeChallenges'
    ),
    true
  );
  assert.equal(a.run('firstLevel.ventSections[0]===firstLevel.routeChallenges[1]'), true);
  a.run(
    'firstLevel.surfaces[0].x1+=100;firstLevel.routeChallenges[0].steps.push("changed");firstLevel.surfaces.find(s=>s.motion).motion.startedAt=999'
  );
  assert.equal(a.run('JSON.stringify(secondLevel)'), JSON.stringify(fixture.level));
});
