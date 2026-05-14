/**
 * Tests for analytics-fixtures.ts.
 *
 * Validates fixture shape conforms to the contract in analytics-types.ts so
 * tile components fed fixtures behave the same as when fed live data
 * (post-2026-06-04). Catches a class of bug where a fixture drifts from
 * its type definition.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  fixtureDashboard,
  fixtureDriftTrend,
  fixtureEventVolume,
  fixtureForwardDeclared,
  fixtureRecentEvents,
  fixtureTaxonomyHealth,
} from '../analytics-fixtures';

// ────────────────────────────────────────────────────────────────────────────
// Per-tile fixture shape
// ────────────────────────────────────────────────────────────────────────────

test('fixtureEventVolume: matches EventVolumeData contract', () => {
  assert.equal(typeof fixtureEventVolume.events_24h, 'number');
  assert.equal(typeof fixtureEventVolume.events_24h_prior, 'number');
  assert.equal(typeof fixtureEventVolume.events_7d_avg, 'number');
  assert.equal(fixtureEventVolume.sparkline_14d.length, 14);
  assert.ok(fixtureEventVolume.sparkline_14d.every((v) => typeof v === 'number'));
  assert.ok(['green', 'amber', 'red', 'gray'].includes(fixtureEventVolume.band));
  assert.equal(fixtureEventVolume.meta.status, 'fixture');
});

test('fixtureDriftTrend: matches DriftTrendData contract', () => {
  assert.equal(typeof fixtureDriftTrend.current_drift, 'number');
  assert.equal(typeof fixtureDriftTrend.prior_snapshot, 'number');
  assert.equal(fixtureDriftTrend.sparkline_14d.length, 14);
  assert.equal(fixtureDriftTrend.current_drift, 0, 'drift target met at Phase 1.A close');
});

test('fixtureTaxonomyHealth: matches TaxonomyHealthData contract', () => {
  assert.equal(typeof fixtureTaxonomyHealth.health_pct, 'number');
  assert.ok(
    fixtureTaxonomyHealth.health_pct >= 0 && fixtureTaxonomyHealth.health_pct <= 100,
    'health_pct in [0, 100]',
  );
  assert.equal(fixtureTaxonomyHealth.events_missing_csv, 0);
  assert.equal(fixtureTaxonomyHealth.events_orphan_csv, 0);
});

test('fixtureRecentEvents: matches RecentEventsStreamData contract', () => {
  assert.ok(Array.isArray(fixtureRecentEvents.events));
  assert.ok(fixtureRecentEvents.events.length > 0, 'has at least 1 fixture event');
  assert.ok(fixtureRecentEvents.events.length <= 100, 'capped at 100 per RecentEventsStream');
  for (const e of fixtureRecentEvents.events) {
    assert.equal(typeof e.timestamp, 'string');
    assert.equal(typeof e.event_name, 'string');
    assert.equal(typeof e.top_params, 'object');
  }
});

test('fixtureForwardDeclared: matches ForwardDeclaredEventsData contract', () => {
  assert.ok(Array.isArray(fixtureForwardDeclared.events));
  assert.equal(
    fixtureForwardDeclared.events.length,
    2,
    'matches actual canonical CSV [FORWARD-DECLARED] count',
  );
  for (const e of fixtureForwardDeclared.events) {
    assert.equal(typeof e.event_name, 'string');
    assert.equal(typeof e.screen_scope, 'string');
    assert.equal(typeof e.notes, 'string');
  }
});

// ────────────────────────────────────────────────────────────────────────────
// Bundle shape
// ────────────────────────────────────────────────────────────────────────────

test('fixtureDashboard: bundles all 5 tiles', () => {
  assert.ok(fixtureDashboard.event_volume);
  assert.ok(fixtureDashboard.drift_trend);
  assert.ok(fixtureDashboard.taxonomy_health);
  assert.ok(fixtureDashboard.recent_events_stream);
  assert.ok(fixtureDashboard.forward_declared);
});

// ────────────────────────────────────────────────────────────────────────────
// Calibration safety: fixture status assertion
// ────────────────────────────────────────────────────────────────────────────

test('all fixtures: meta.status === "fixture" (calibration-safety guarantee)', () => {
  assert.equal(fixtureEventVolume.meta.status, 'fixture');
  assert.equal(fixtureDriftTrend.meta.status, 'fixture');
  assert.equal(fixtureTaxonomyHealth.meta.status, 'fixture');
  assert.equal(fixtureRecentEvents.meta.status, 'fixture');
  assert.equal(fixtureForwardDeclared.meta.status, 'fixture');
});
