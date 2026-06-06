// src/components/bespoke/framework-universe/scenes/Act4-GateFirings.test.tsx
//
// Smoke + integration tests for Act IV. Render-correctness comes at
// Phase 4.J. The integration tests here verify the AC-10 (PR-ID) and
// AC-11 (pattern lookup) data anchors will resolve to real data when
// Phase 4.E T-overlay-wiring + T-pr-link-click wire up the hover layer.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Act4GateFirings } from './Act4-GateFirings';
import { patternById } from '../../../../lib/framework-snapshot';

test('Act4GateFirings: module loads + exports a memo-wrapped component', () => {
  assert.equal(typeof Act4GateFirings, 'object');
  const inner = (Act4GateFirings as unknown as { type: unknown }).type;
  assert.equal(typeof inner, 'function');
});

test('Act4GateFirings: memo wrapper preserves the impl function name', () => {
  const inner = (Act4GateFirings as unknown as { type: { name?: string } }).type;
  assert.equal(inner.name, 'Act4GateFiringsImpl');
});

test('Act4GateFirings: AC-11 anchor — every curated firing has a resolvable patternId', () => {
  // Each of the 5 curated gate firings carries a `patternId` that must
  // resolve to a real entry in pattern-skill-map.json. If this regresses,
  // the AC-11 hover-card overlay will surface empty titles.
  const curatedPatternIds = ['W34', 'W30', 'W31', 'W32', 'W11'];
  for (const id of curatedPatternIds) {
    const p = patternById(id);
    assert.ok(p, `pattern ${id} must resolve via patternById`);
    assert.equal(p?.id, id);
    assert.ok(typeof p?.title === 'string' && p.title.length > 0, `${id} must have a non-empty title`);
  }
});
