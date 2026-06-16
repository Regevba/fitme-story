/**
 * Tests for computeFreshnessView — the pure freshness-mode logic behind the
 * control-room footer (UCC live-feed Phase 2 PR F).
 *
 * Verifies: snapshot mode (no blob) keeps the synced-at behavior; live mode
 * (blob present) uses generated_at + short commit; staleness flips at 6h in
 * either mode; unparseable timestamps degrade to 'unknown'/stale.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { computeFreshnessView } from './DataFreshnessFooter';

const NOW = Date.parse('2026-06-16T12:00:00Z');

describe('computeFreshnessView — snapshot mode', () => {
  test('no blob -> snapshot, drives off syncedAt', () => {
    const v = computeFreshnessView({
      origin: 'snapshot',
      blobGeneratedAt: null,
      commitSha: null,
      syncedAt: '2026-06-16T11:30:00Z', // 30 min ago
      now: NOW,
    });
    assert.equal(v.mode, 'snapshot');
    assert.equal(v.authoritativeTimestamp, '2026-06-16T11:30:00Z');
    assert.equal(v.relative, '30 minutes ago');
    assert.equal(v.isStale, false);
    assert.equal(v.commitShort, null);
  });

  test('snapshot older than 6h -> stale', () => {
    const v = computeFreshnessView({
      origin: 'snapshot',
      blobGeneratedAt: null,
      commitSha: null,
      syncedAt: '2026-06-15T12:00:00Z', // 24h ago
      now: NOW,
    });
    assert.equal(v.isStale, true);
    assert.equal(v.relative, '1 day ago');
  });

  test("origin 'live-blob' but null generated_at -> falls back to snapshot", () => {
    const v = computeFreshnessView({
      origin: 'live-blob',
      blobGeneratedAt: null,
      commitSha: 'abc1234def',
      syncedAt: '2026-06-16T11:00:00Z',
      now: NOW,
    });
    assert.equal(v.mode, 'snapshot');
    assert.equal(v.commitShort, null); // no commit shown when not truly live
  });
});

describe('computeFreshnessView — live mode', () => {
  test('blob present -> live, drives off generated_at + short commit', () => {
    const v = computeFreshnessView({
      origin: 'live-blob',
      blobGeneratedAt: '2026-06-16T11:58:00Z', // 2 min ago
      commitSha: 'abc1234def5678',
      syncedAt: '2026-06-10T00:00:00Z', // stale snapshot, ignored when live
      now: NOW,
    });
    assert.equal(v.mode, 'live');
    assert.equal(v.authoritativeTimestamp, '2026-06-16T11:58:00Z');
    assert.equal(v.relative, '2 minutes ago');
    assert.equal(v.isStale, false);
    assert.equal(v.commitShort, 'abc1234'); // 7 chars
  });

  test('live but generated_at older than 6h -> stale live', () => {
    const v = computeFreshnessView({
      origin: 'live-blob',
      blobGeneratedAt: '2026-06-16T03:00:00Z', // 9h ago
      commitSha: 'deadbeef',
      syncedAt: '2026-06-16T11:00:00Z',
      now: NOW,
    });
    assert.equal(v.mode, 'live');
    assert.equal(v.isStale, true);
    assert.equal(v.commitShort, 'deadbee');
  });

  test('live with missing commit -> live, no commitShort', () => {
    const v = computeFreshnessView({
      origin: 'live-blob',
      blobGeneratedAt: '2026-06-16T11:59:30Z',
      commitSha: null,
      syncedAt: '2026-06-16T11:00:00Z',
      now: NOW,
    });
    assert.equal(v.mode, 'live');
    assert.equal(v.commitShort, null);
    assert.equal(v.relative, 'just now');
  });
});

describe('computeFreshnessView — degenerate', () => {
  test('unparseable timestamp -> unknown + stale', () => {
    const v = computeFreshnessView({
      origin: 'snapshot',
      blobGeneratedAt: null,
      commitSha: null,
      syncedAt: 'not-a-date',
      now: NOW,
    });
    assert.equal(v.relative, 'unknown');
    assert.equal(v.isStale, true);
  });
});
