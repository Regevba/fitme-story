// src/components/bespoke/framework-universe/scenes/Act2-Emergence.test.tsx
//
// Smoke tests for Act II. Same posture as Act I: verify the module
// imports cleanly + exports a memo-wrapped component. Render-correctness
// (5-chamber stagger + title binding) gets verified in Phase 4.J with
// real WebGL context. See Act1-Threshold.test.tsx for the rationale.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Act2Emergence } from './Act2-Emergence';

test('Act2Emergence: module loads + exports a memo-wrapped component', () => {
  assert.equal(typeof Act2Emergence, 'object');
  const inner = (Act2Emergence as unknown as { type: unknown }).type;
  assert.equal(typeof inner, 'function');
});

test('Act2Emergence: memo wrapper preserves the impl function name', () => {
  const inner = (Act2Emergence as unknown as { type: { name?: string } }).type;
  assert.equal(inner.name, 'Act2EmergenceImpl');
});
