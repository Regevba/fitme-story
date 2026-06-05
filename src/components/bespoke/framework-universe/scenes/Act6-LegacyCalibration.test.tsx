// src/components/bespoke/framework-universe/scenes/Act6-LegacyCalibration.test.tsx
//
// Smoke + integration tests for Act VI. Render-correctness at Phase 4.J.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Act6LegacyCalibration } from './Act6-LegacyCalibration';
import { featureRoster, featuresByStatus } from '../../../../lib/framework-snapshot';

test('Act6LegacyCalibration: module loads + exports a memo-wrapped component', () => {
  assert.equal(typeof Act6LegacyCalibration, 'object');
  const inner = (Act6LegacyCalibration as unknown as { type: unknown }).type;
  assert.equal(typeof inner, 'function');
});

test('Act6LegacyCalibration: memo wrapper preserves the impl function name', () => {
  const inner = (Act6LegacyCalibration as unknown as { type: { name?: string } }).type;
  assert.equal(inner.name, 'Act6LegacyCalibrationImpl');
});

test('Act6LegacyCalibration: feature-roster has enough complete monuments to populate the grid', () => {
  // The grid is laid out for ≥10 monuments to avoid awkward single-row
  // visuals. Surfacing this as a test means a major roster regression
  // (e.g., sync script silently emitting 0 entries) is caught here.
  assert.ok(featureRoster.entries.length > 0, 'feature roster is non-empty');
  const completeCount = featureRoster.entries.filter((e) => e.status === 'complete').length;
  assert.ok(completeCount >= 10, `expect ≥10 complete features for monument grid, got ${completeCount}`);
});

test('Act6LegacyCalibration: featuresByStatus helper agrees with raw filter', () => {
  // Sanity check that the snapshot helper exposed in Phase 4.A matches
  // the inline filter Act VI uses. If these diverge, the monument count
  // surfaced as a subtitle could mislead operators.
  const buckets = featuresByStatus();
  const completeFromHelper = buckets.complete.length;
  const completeFromInline = featureRoster.entries.filter((e) => e.status === 'complete').length;
  assert.equal(completeFromHelper, completeFromInline);
});
