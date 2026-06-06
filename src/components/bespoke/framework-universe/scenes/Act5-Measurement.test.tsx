// src/components/bespoke/framework-universe/scenes/Act5-Measurement.test.tsx
//
// Smoke + integration tests for Act V. Render-correctness at Phase 4.J.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Act5Measurement } from './Act5-Measurement';
import { adoptionSnapshot } from '../../../../lib/framework-snapshot';

test('Act5Measurement: module loads + exports a memo-wrapped component', () => {
  assert.equal(typeof Act5Measurement, 'object');
  const inner = (Act5Measurement as unknown as { type: unknown }).type;
  assert.equal(typeof inner, 'function');
});

test('Act5Measurement: memo wrapper preserves the impl function name', () => {
  const inner = (Act5Measurement as unknown as { type: { name?: string } }).type;
  assert.equal(inner.name, 'Act5MeasurementImpl');
});

test('Act5Measurement: snapshot has the 4 dimensions Act V renders bars for', () => {
  // The scene reads `adoptionSnapshot.dimension_coverage.{timing_wall_time,
  // per_phase_timing, cache_hits, cu_v2}.post_v6_percent` to drive bar
  // heights. If the upstream schema changes shape, the act will silently
  // fall back to 0-height bars; this test catches that drift.
  const coverage = adoptionSnapshot.dimension_coverage as
    | Record<string, { post_v6_percent?: number } | undefined>
    | undefined;
  assert.ok(coverage, 'adoptionSnapshot.dimension_coverage must be present');
  for (const dim of ['timing_wall_time', 'per_phase_timing', 'cache_hits', 'cu_v2']) {
    assert.ok(coverage[dim], `dimension "${dim}" must be present in snapshot`);
    assert.equal(
      typeof coverage[dim]?.post_v6_percent,
      'number',
      `${dim}.post_v6_percent must be a number`,
    );
  }
});
