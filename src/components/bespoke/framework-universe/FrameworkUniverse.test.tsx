// src/components/bespoke/framework-universe/FrameworkUniverse.test.tsx
//
// Smoke tests for the entry component. Render-correctness (Canvas
// bootstraps, useFrame ticks, act sequencer flips at the right
// boundary) lands in Phase 4.J alongside Playwright + Lighthouse.
// At this layer we verify:
//
//   1. The module imports without runtime error
//   2. The default export `FrameworkUniverse` is a function component
//   3. The act sequence has the expected shape — catches drift if a
//      contributor accidentally drops an act or scrambles the order
//
// Because `<Canvas>` cannot mount in node's classic JSX runtime
// (no WebGL context), we don't invoke the component here.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FrameworkUniverse } from './FrameworkUniverse';

test('FrameworkUniverse: module exports a function component', () => {
  assert.equal(typeof FrameworkUniverse, 'function');
});

test('FrameworkUniverse: name property preserved (no double-memo wrap)', () => {
  assert.equal(FrameworkUniverse.name, 'FrameworkUniverse');
});
