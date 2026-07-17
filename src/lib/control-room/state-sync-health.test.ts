// FIT-183 (R17) — tests for computeSyncHealth (the pure logic behind the
// /api/control-room/state-sync-health endpoint).

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { computeSyncHealth, STALE_THRESHOLD_MINUTES } from './state-sync-health';

const NOW = Date.parse('2026-07-03T12:00:00Z');

describe('computeSyncHealth', () => {
  test('fresh sync → healthy with computed age', () => {
    const v = computeSyncHealth({
      syncedAt: '2026-07-03T11:30:00Z', // 30 min ago
      ft2StateCount: 113,
      gateCoverageLines: 4024,
      now: NOW,
    });
    assert.equal(v.healthy, true);
    assert.equal(v.reason, 'ok');
    assert.equal(v.age_minutes, 30);
    assert.equal(v.ft2_state_count, 113);
    assert.equal(v.gate_coverage_lines, 4024);
    assert.equal(v.last_sync_ts, '2026-07-03T11:30:00Z');
  });

  test('within 48h manual-sync cadence → still healthy', () => {
    const v = computeSyncHealth({
      syncedAt: '2026-07-02T05:00:00Z', // 31h ago — normal manual-sync gap
      ft2StateCount: 113,
      gateCoverageLines: 4024,
      now: NOW,
    });
    assert.equal(v.healthy, true);
    assert.equal(v.reason, 'ok');
    assert.equal(v.age_minutes, 1860);
  });

  test('older than 48h → stale + unhealthy', () => {
    const v = computeSyncHealth({
      syncedAt: '2026-07-01T10:00:00Z', // 50h ago
      ft2StateCount: 113,
      gateCoverageLines: 4024,
      now: NOW,
    });
    assert.equal(v.healthy, false);
    assert.equal(v.reason, 'stale');
    assert.equal(v.age_minutes, 3000);
  });

  test('exactly at threshold is still healthy; one minute over is stale', () => {
    const atThreshold = computeSyncHealth({
      syncedAt: new Date(NOW - STALE_THRESHOLD_MINUTES * 60_000).toISOString(),
      ft2StateCount: 5,
      gateCoverageLines: 1,
      now: NOW,
    });
    assert.equal(atThreshold.healthy, true);

    const overThreshold = computeSyncHealth({
      syncedAt: new Date(NOW - (STALE_THRESHOLD_MINUTES + 1) * 60_000).toISOString(),
      ft2StateCount: 5,
      gateCoverageLines: 1,
      now: NOW,
    });
    assert.equal(overThreshold.healthy, false);
    assert.equal(overThreshold.reason, 'stale');
  });

  test('missing syncedAt → no_sync_timestamp', () => {
    const v = computeSyncHealth({ syncedAt: null, ft2StateCount: 113, gateCoverageLines: 4024, now: NOW });
    assert.equal(v.healthy, false);
    assert.equal(v.reason, 'no_sync_timestamp');
    assert.equal(v.age_minutes, null);
  });

  test('unparseable syncedAt → unparseable_timestamp', () => {
    const v = computeSyncHealth({ syncedAt: 'not-a-date', ft2StateCount: 113, gateCoverageLines: 4024, now: NOW });
    assert.equal(v.healthy, false);
    assert.equal(v.reason, 'unparseable_timestamp');
    assert.equal(v.age_minutes, null);
  });

  test('empty mirror (0 state files) → unhealthy even when fresh', () => {
    const v = computeSyncHealth({
      syncedAt: '2026-07-03T11:59:00Z', // 1 min ago
      ft2StateCount: 0,
      gateCoverageLines: 0,
      now: NOW,
    });
    assert.equal(v.healthy, false);
    assert.equal(v.reason, 'empty_mirror');
    assert.equal(v.age_minutes, 1);
  });

  test('future syncedAt clamps age to 0 (clock skew safety)', () => {
    const v = computeSyncHealth({
      syncedAt: '2026-07-03T12:05:00Z', // 5 min in the future
      ft2StateCount: 113,
      gateCoverageLines: 4024,
      now: NOW,
    });
    assert.equal(v.age_minutes, 0);
    assert.equal(v.healthy, true);
  });
});
