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
import { FrameworkUniverse, analyticsIdAtElapsed, __testing } from './FrameworkUniverse';

test('FrameworkUniverse: module exports a function component', () => {
  assert.equal(typeof FrameworkUniverse, 'function');
});

test('FrameworkUniverse: name property preserved (no double-memo wrap)', () => {
  assert.equal(FrameworkUniverse.name, 'FrameworkUniverse');
});

test('TOTAL_DURATION_SEC equals the sum of act durations (43s)', () => {
  const sum = __testing.ACT_SEQUENCE.reduce((a, x) => a + x.durationSec, 0);
  assert.equal(__testing.TOTAL_DURATION_SEC, sum);
  assert.equal(__testing.TOTAL_DURATION_SEC, 43);
});

test('analyticsIdAtElapsed: resolves the right act id across the timeline (scrub-seek labelling)', () => {
  // Boundaries: I 0-5, II 5-11, III 11-18, IV 18-26, V 26-33, VI 33-43.
  assert.equal(analyticsIdAtElapsed(0), 'I_threshold');
  assert.equal(analyticsIdAtElapsed(7), 'II_emergence');
  assert.equal(analyticsIdAtElapsed(12), 'III_architecture');
  assert.equal(analyticsIdAtElapsed(20), 'IV_gate_firings');
  assert.equal(analyticsIdAtElapsed(30), 'V_measurement');
  assert.equal(analyticsIdAtElapsed(40), 'VI_legacy');
  // Past total runtime pins to the final act (the held last frame).
  assert.equal(analyticsIdAtElapsed(999), 'VI_legacy');
});
