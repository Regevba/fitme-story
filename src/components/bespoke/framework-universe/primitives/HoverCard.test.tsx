// src/components/bespoke/framework-universe/primitives/HoverCard.test.tsx
//
// Smoke + integration tests for the HoverCard primitive. Render-side
// hover behavior (pointer-over triggers card mount, pointer-out
// unmounts, link click opens new tab) is verified in Phase 4.J with
// Playwright + real WebGL context.
//
// At this layer we verify:
//   1. The module imports + exports a memo-wrapped component
//   2. Real-data integration — the AC-11 pattern lookup the scenes use
//      via HoverCard does resolve real patterns from the snapshot

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HoverCard } from './HoverCard';
import { patternById } from '../../../../lib/framework-snapshot';

test('HoverCard: module exports a memo-wrapped component', () => {
  assert.equal(typeof HoverCard, 'object');
  const inner = (HoverCard as unknown as { type: unknown }).type;
  assert.equal(typeof inner, 'function');
});

test('HoverCard: memo wrapper preserves the impl function name', () => {
  const inner = (HoverCard as unknown as { type: { name?: string } }).type;
  assert.equal(inner.name, 'HoverCardImpl');
});

test('HoverCard: AC-11 anchor — all Act IV gate-firing patternIds resolve via patternById', () => {
  // The HoverCard inside Act IV's GateFiringEmitter passes
  // patternId={firing.patternId}. The 5 curated firings in Act IV
  // use W34/W30/W31/W32/W11 — every one must resolve to a real entry
  // with a non-empty title (the hover-card surfaces title + remediation).
  for (const id of ['W34', 'W30', 'W31', 'W32', 'W11']) {
    const p = patternById(id);
    assert.ok(p, `HoverCard for ${id} must resolve to a real pattern`);
    assert.ok(typeof p?.title === 'string' && p.title.length > 0);
  }
});
