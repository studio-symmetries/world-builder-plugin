// Offline source-consistency checks; does not install or invoke any agent.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const plugin = JSON.parse(read('packages/plugin/.claude-plugin/plugin.json'));
const marketplace = JSON.parse(read('.claude-plugin/marketplace.json'));
const expected = ['ai-thinker', 'api-engineer', 'app-engineer', 'business-strategist',
  'canon-memory', 'continuity-governance', 'marketing-strategist', 'navigator', 'product-strategist'];

test('candidate roster consists of exactly nine matching named definitions', () => {
  const actual = fs.readdirSync(path.join(root, 'packages/plugin/agents'))
    .filter(f => f.endsWith('.md')).map(f => f.slice(0, -3)).sort();
  assert.deepEqual(actual, expected);
  for (const name of actual) {
    assert(read(`packages/plugin/agents/${name}.md`).startsWith(`---\nname: ${name}\n`));
    assert(plugin.description.includes(name));
  }
});
test('candidate marketplace and plugin versions agree and source resolves', () => {
  assert.equal(plugin.version, '0.1.4');
  assert.equal(marketplace.plugins[0].version, plugin.version);
  assert.equal(marketplace.plugins[0].name, plugin.name);
  assert.equal(path.resolve(root, marketplace.plugins[0].source), path.join(root, 'packages/plugin'));
});
test('eight rule definitions are present', () => {
  assert.equal(fs.readdirSync(path.join(root, 'packages/plugin/rules'))
    .filter(f => f.endsWith('.md')).length, 8);
});
test('current roster instructions do not retain known obsolete counts or phases', () => {
  for (const [file, stale] of [
    ['README.md', 'the three agents'],
    ['packages/plugin/CLAUDE.md', 'currently wires five agents'],
    ['packages/plugin/agents/navigator.md', 'Phase 2 adds `app-engineer`'],
    ['packages/plugin/agents/navigator.md', 'continuity-governance (Phase 3 — not yet wired)'],
  ]) assert(!read(file).includes(stale), `${file} retains: ${stale}`);
});
