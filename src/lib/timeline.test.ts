import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FRAMEWORK_VERSIONS, buildTimeline } from './timeline';

test('FRAMEWORK_VERSIONS has 8 entries in ascending order', () => {
  assert.equal(FRAMEWORK_VERSIONS.length, 8);
  for (let i = 1; i < FRAMEWORK_VERSIONS.length; i++) {
    assert.ok(
      parseFloat(FRAMEWORK_VERSIONS[i].version) >= parseFloat(FRAMEWORK_VERSIONS[i - 1].version),
      `version ${FRAMEWORK_VERSIONS[i].version} should be >= previous`,
    );
  }
});

test('buildTimeline("versions") returns 8 nodes', async () => {
  const nodes = await buildTimeline('versions');
  assert.equal(nodes.length, 8);
});

test('buildTimeline("cases") returns 13 nodes', async () => {
  const nodes = await buildTimeline('cases');
  assert.equal(nodes.length, 13);
});

test('every case node has a valid href', async () => {
  const nodes = await buildTimeline('cases');
  for (const node of nodes) {
    assert.ok(node.href.startsWith('/case-studies/'), `bad href: ${node.href}`);
  }
});
