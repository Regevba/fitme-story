/**
 * Tests for analytics-live.ts — the Phase 3.A.2–3.A.6 live data provider.
 *
 * Covers: the pure CSV forward-declared parser (marker anchoring +
 * comma-in-notes robustness), per-tile provenance (live vs by-design
 * fixture), and full-dashboard shape against the real synced source files.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  getAnalyticsDashboard,
  getDriftTrend,
  getForwardDeclared,
  getTaxonomyHealth,
  parseForwardDeclared,
} from '../analytics-live';

// ── parseForwardDeclared (pure) ──────────────────────────────────────────

test('parseForwardDeclared: extracts marker rows, ignores others', () => {
  const csv = [
    'Category,Event Name,GA4 Type,Notes',
    'Auth,login,Recommended,GA4 recommended event',
    'DesignSystem,design_system_code_copy,Custom,[FORWARD-DECLARED] helper exists, UI not built yet',
  ].join('\n');
  const rows = parseForwardDeclared(csv);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].event_name, 'design_system_code_copy');
  assert.equal(rows[0].screen_scope, 'design_system'); // PascalCase Category → snake
});

test('parseForwardDeclared: keeps unescaped commas inside Notes intact', () => {
  const csv =
    'DesignSystem,design_system_component_expand,Custom,x,y,z,[FORWARD-DECLARED] a, b, and c';
  const rows = parseForwardDeclared(csv);
  assert.equal(rows.length, 1);
  // Notes anchored on the marker, not on comma splitting, so it survives.
  assert.equal(rows[0].notes, 'a, b, and c');
});

test('parseForwardDeclared: returns empty array when no marker present', () => {
  assert.deepEqual(parseForwardDeclared('Category,Event Name\nAuth,login'), []);
});

// ── per-tile provenance ──────────────────────────────────────────────────

test('getDriftTrend: live status + non-negative drift from synced ledger', () => {
  const t = getDriftTrend();
  assert.equal(t.meta.status, 'live');
  assert.ok(t.current_drift >= 0);
  assert.equal(t.sparkline_14d.length, 14);
  assert.equal(t.sparkline_14d.at(-1), t.current_drift); // final point anchored to live value
});

test('getTaxonomyHealth: live status + health_pct within 0..100', () => {
  const t = getTaxonomyHealth();
  assert.equal(t.meta.status, 'live');
  assert.ok(t.health_pct >= 0 && t.health_pct <= 100);
  assert.ok(t.events_in_csv >= 0);
});

test('getForwardDeclared: live status + at least the 2 canonical entries', () => {
  const t = getForwardDeclared();
  assert.equal(t.meta.status, 'live');
  assert.ok(t.events.length >= 2);
});

// ── full dashboard ───────────────────────────────────────────────────────

test('getAnalyticsDashboard: all 5 tiles present; GA4-API tiles stay fixture', () => {
  const d = getAnalyticsDashboard();
  assert.ok(d.event_volume && d.drift_trend && d.taxonomy_health);
  assert.ok(d.recent_events_stream && d.forward_declared);
  // GA4 Reporting/Realtime tiles are fixture BY DESIGN pre-launch.
  assert.equal(d.event_volume.meta.status, 'fixture');
  assert.equal(d.recent_events_stream.meta.status, 'fixture');
  // Calibration-🟢 tiles are live.
  assert.equal(d.drift_trend.meta.status, 'live');
  assert.equal(d.taxonomy_health.meta.status, 'live');
  assert.equal(d.forward_declared.meta.status, 'live');
});
