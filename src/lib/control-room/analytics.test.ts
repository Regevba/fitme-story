/**
 * Analytics unit tests — UCC T38.
 *
 * Exercises the typed track* helpers in `analytics.ts`. Pattern follows
 * the existing builder.test.ts / reconcile.test.ts in this repo:
 * `node:test` + `node:assert/strict`, no extra runner dependency. Picked
 * up by `npm test` via the `tsx --test 'src/**\/*.test.ts'` glob.
 *
 * Coverage:
 *   - One round-trip test per public track* helper (8 events). Each call
 *     should reach `window.gtag('event', <name>, <params>)` once with the
 *     exact payload shape PRD §10.1 declares.
 *   - Server-safety: no `window` global → no throw, no call.
 *   - gtag-missing safety: `window.gtag` undefined → no throw, no call.
 *   - Error tolerance: a throwing `window.gtag` does not propagate.
 *   - `timeSinceLoadMs()` returns a non-negative integer.
 *
 * The "MockAnalyticsAdapter" pattern from the iOS side (PRD §10) maps to
 * a per-test mock `window.gtag` here — same intent, different platform.
 */

import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  trackDashboardLoad,
  trackBlockerAcknowledged,
  trackViewChange,
  trackFilterApply,
  trackKanbanDrag,
  trackKnowledgeOpen,
  trackExternalLink,
  trackSyncWarningShown,
  timeSinceLoadMs,
} from './analytics';

// ────────────────────────────────────────────────────────────────────────────
// Mock window helpers
// ────────────────────────────────────────────────────────────────────────────

interface GtagCall {
  command: string;
  eventName: string;
  params: Record<string, unknown>;
}

type GlobalWithWindow = typeof globalThis & { window?: unknown };

function installMockWindow(gtagImpl?: (...args: unknown[]) => void): GtagCall[] {
  const calls: GtagCall[] = [];
  const defaultImpl = (
    command: string,
    eventName: string,
    params: Record<string, unknown>,
  ) => {
    calls.push({ command, eventName, params });
  };
  (globalThis as GlobalWithWindow).window = { gtag: gtagImpl ?? defaultImpl };
  return calls;
}

function installMockWindowWithoutGtag(): void {
  (globalThis as GlobalWithWindow).window = {};
}

function uninstallMockWindow(): void {
  delete (globalThis as GlobalWithWindow).window;
}

// ────────────────────────────────────────────────────────────────────────────
// Round-trip — every track* helper reaches window.gtag with correct payload
// ────────────────────────────────────────────────────────────────────────────

describe('analytics — payload routing for the 8 PRD events', () => {
  let calls: GtagCall[];

  beforeEach(() => {
    calls = installMockWindow();
  });

  afterEach(() => {
    uninstallMockWindow();
  });

  test('trackDashboardLoad emits dashboard_load', () => {
    trackDashboardLoad({
      route: 'overview',
      data_freshness_minutes: 5,
      auth_method: 'basic',
    });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].command, 'event');
    assert.equal(calls[0].eventName, 'dashboard_load');
    assert.deepEqual(calls[0].params, {
      route: 'overview',
      data_freshness_minutes: 5,
      auth_method: 'basic',
    });
  });

  test('trackBlockerAcknowledged emits dashboard_blocker_acknowledged', () => {
    trackBlockerAcknowledged({
      feature_id: 'unified-control-center',
      alert_severity: 'red',
      time_since_load_ms: 4321,
    });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].eventName, 'dashboard_blocker_acknowledged');
    assert.deepEqual(calls[0].params, {
      feature_id: 'unified-control-center',
      alert_severity: 'red',
      time_since_load_ms: 4321,
    });
  });

  test('trackViewChange emits dashboard_view_change', () => {
    trackViewChange({ from_view: 'overview', to_view: 'board' });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].eventName, 'dashboard_view_change');
    assert.deepEqual(calls[0].params, { from_view: 'overview', to_view: 'board' });
  });

  test('trackFilterApply emits dashboard_filter_apply', () => {
    trackFilterApply({ filter_field: 'sort:phase:asc', filter_value_count: 1 });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].eventName, 'dashboard_filter_apply');
    assert.deepEqual(calls[0].params, {
      filter_field: 'sort:phase:asc',
      filter_value_count: 1,
    });
  });

  test('trackKanbanDrag emits dashboard_kanban_drag (stub helper, real call)', () => {
    trackKanbanDrag({
      feature_id: 'auth-polish-v2',
      from_phase: 'review',
      to_phase: 'merge',
    });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].eventName, 'dashboard_kanban_drag');
    assert.deepEqual(calls[0].params, {
      feature_id: 'auth-polish-v2',
      from_phase: 'review',
      to_phase: 'merge',
    });
  });

  test('trackKnowledgeOpen emits dashboard_knowledge_open', () => {
    trackKnowledgeOpen({
      doc_path: 'docs/case-studies/foo.md',
      doc_group: 'case-studies',
    });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].eventName, 'dashboard_knowledge_open');
    assert.deepEqual(calls[0].params, {
      doc_path: 'docs/case-studies/foo.md',
      doc_group: 'case-studies',
    });
  });

  test('trackExternalLink emits dashboard_external_link', () => {
    trackExternalLink({ link_type: 'github', target_id: 'FitTracker2' });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].eventName, 'dashboard_external_link');
    assert.deepEqual(calls[0].params, {
      link_type: 'github',
      target_id: 'FitTracker2',
    });
  });

  test('trackSyncWarningShown emits dashboard_sync_warning_shown', () => {
    trackSyncWarningShown({ staleness_hours: 7.2, source: '/Volumes/DevSSD/FitTracker2' });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].eventName, 'dashboard_sync_warning_shown');
    assert.deepEqual(calls[0].params, {
      staleness_hours: 7.2,
      source: '/Volumes/DevSSD/FitTracker2',
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Safety — server, missing gtag, throwing gtag
// ────────────────────────────────────────────────────────────────────────────

describe('analytics — server safety (no window global)', () => {
  beforeEach(() => {
    uninstallMockWindow();
  });

  test('all 8 helpers are no-ops on the server (no throw)', () => {
    assert.doesNotThrow(() => {
      trackDashboardLoad({ route: 'overview', data_freshness_minutes: 0, auth_method: 'basic' });
      trackBlockerAcknowledged({
        feature_id: 'x',
        alert_severity: 'info',
        time_since_load_ms: 0,
      });
      trackViewChange({ from_view: 'overview', to_view: 'overview' });
      trackFilterApply({ filter_field: 'x', filter_value_count: 0 });
      trackKanbanDrag({ feature_id: 'x', from_phase: 'a', to_phase: 'b' });
      trackKnowledgeOpen({ doc_path: 'x', doc_group: 'y' });
      trackExternalLink({ link_type: 'github', target_id: 'x' });
      trackSyncWarningShown({ staleness_hours: 0, source: 'x' });
    });
  });
});

describe('analytics — gtag-missing safety (window without gtag)', () => {
  beforeEach(() => {
    installMockWindowWithoutGtag();
  });

  afterEach(() => {
    uninstallMockWindow();
  });

  test('helpers do not throw when window.gtag is undefined', () => {
    assert.doesNotThrow(() => {
      trackDashboardLoad({
        route: 'overview',
        data_freshness_minutes: 0,
        auth_method: 'basic',
      });
      trackExternalLink({ link_type: 'linear', target_id: 'FIT-1' });
    });
  });
});

describe('analytics — error tolerance (throwing gtag)', () => {
  beforeEach(() => {
    installMockWindow(() => {
      throw new Error('GA blocked');
    });
  });

  afterEach(() => {
    uninstallMockWindow();
  });

  test('a throwing gtag does not propagate to the caller', () => {
    assert.doesNotThrow(() => {
      trackDashboardLoad({
        route: 'board',
        data_freshness_minutes: 1,
        auth_method: 'public',
      });
      trackBlockerAcknowledged({
        feature_id: 'x',
        alert_severity: 'red',
        time_since_load_ms: 0,
      });
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// timeSinceLoadMs — boundary check
// ────────────────────────────────────────────────────────────────────────────

describe('timeSinceLoadMs', () => {
  test('returns a non-negative integer', () => {
    const value = timeSinceLoadMs();
    assert.equal(typeof value, 'number');
    assert.ok(value >= 0, `expected >= 0 but got ${value}`);
    assert.equal(Math.floor(value), value, 'expected integer');
  });

  test('grows monotonically across calls (or stays equal)', () => {
    const a = timeSinceLoadMs();
    const b = timeSinceLoadMs();
    assert.ok(b >= a, `expected b (${b}) >= a (${a})`);
  });
});
