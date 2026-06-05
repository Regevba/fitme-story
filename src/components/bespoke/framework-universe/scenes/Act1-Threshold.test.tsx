// src/components/bespoke/framework-universe/scenes/Act1-Threshold.test.tsx
//
// Smoke tests for Act I — module loads cleanly + exports a memoized
// component. The full visual / behavioral testing for R3F scenes happens
// in Phase 4.J alongside Playwright + Lighthouse harnesses that run with
// a real WebGL context (the `tsx --test` runner uses node's classic JSX
// runtime which lacks the WebGL context needed to actually render Three.js
// scenes — see commit message for rationale).
//
// At this layer we just verify:
//
//   1. The module imports without runtime error (catches dep cycle
//      regressions, missing primitive imports, motion-3d path resolution).
//   2. `Act1Threshold` is a memo-wrapped function export with the
//      expected shape.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Act1Threshold } from './Act1-Threshold';

test('Act1Threshold: module loads + exports a memo-wrapped component', () => {
  // React.memo returns an object with $$typeof + type props; the inner
  // type must be a callable function. We don't invoke it here because
  // doing so requires a JSX runtime that's only present in Next.js's
  // build, not the test runner.
  assert.equal(typeof Act1Threshold, 'object');
  const inner = (Act1Threshold as unknown as { type: unknown }).type;
  assert.equal(typeof inner, 'function', 'memo-wrapped impl is a function');
});

test('Act1Threshold: memo wrapper has the expected display name', () => {
  // React assigns `displayName` from the wrapped fn name. We named the
  // impl `Act1ThresholdImpl` so the wrapper surfaces that for devtools.
  const inner = (Act1Threshold as unknown as { type: { name?: string } }).type;
  assert.equal(inner.name, 'Act1ThresholdImpl');
});
