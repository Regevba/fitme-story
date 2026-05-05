/**
 * Tests for reconcile.ts — port from
 * dashboard/tests/reconcile.test.js (FT2 vitest source).
 *
 * Pure-logic tests; uses node:test runner.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { reconcile } from './reconcile';
import type { GitHubIssue } from './github';

describe('reconcile', () => {
  test('returns empty alerts when all sources are empty', () => {
    const result = reconcile({ githubIssues: [], staticFeatures: [], stateFiles: [] });
    assert.deepEqual(result.alerts, []);
    assert.equal(result.sources.github.healthy, true);
    assert.equal(result.sources.static.healthy, true);
    assert.equal(result.sources.state.healthy, true);
  });

  test('detects features in static data missing from GitHub', () => {
    const result = reconcile({
      githubIssues: [{ number: 99, title: 'Other Feature', labels: [], state: 'open' } as GitHubIssue],
      staticFeatures: [{ name: 'Training Tracking', phase: 'done' }],
      stateFiles: [],
    });
    const missing = result.alerts.filter(
      (a) => a.type === 'missing' && a.message.includes('Training Tracking'),
    );
    assert.equal(missing.length, 1);
    assert.equal(missing[0].severity, 'amber');
    assert.equal(result.sources.github.healthy, false);
  });

  test('detects GitHub issues not in static data', () => {
    const result = reconcile({
      githubIssues: [{ number: 1, title: 'New Feature', labels: [], state: 'open' } as GitHubIssue],
      staticFeatures: [],
      stateFiles: [],
    });
    assert.equal(result.alerts.length, 1);
    assert.equal(result.alerts[0].type, 'missing');
    assert.equal(result.alerts[0].source, 'static');
  });

  test('detects no missing alerts when sources match', () => {
    const result = reconcile({
      githubIssues: [
        { number: 1, title: 'Training Tracking', labels: [{ name: 'phase:done', color: '' }], state: 'closed' } as GitHubIssue,
      ],
      staticFeatures: [{ name: 'Training Tracking', phase: 'done' }],
      stateFiles: [],
    });
    const missingAlerts = result.alerts.filter((a) => a.type === 'missing');
    assert.equal(missingAlerts.length, 0);
  });

  test('detects phase conflicts between GitHub and state files', () => {
    const result = reconcile({
      githubIssues: [
        {
          number: 12,
          title: 'development-dashboard',
          labels: [{ name: 'phase:testing', color: '' }],
          state: 'open',
          phase: 'testing',
        } as GitHubIssue,
      ],
      staticFeatures: [],
      stateFiles: [{ feature: 'development-dashboard', current_phase: 'implement' }],
    });
    const conflicts = result.alerts.filter((a) => a.type === 'conflict');
    assert.ok(conflicts.length >= 1);
    assert.equal(conflicts[0].severity, 'red');
    assert.ok(conflicts[0].message.includes('testing'));
    assert.ok(conflicts[0].message.includes('implement'));
  });

  test('detects done feature with open GitHub issue', () => {
    const result = reconcile({
      githubIssues: [
        {
          number: 1,
          title: 'Auth Feature',
          labels: [{ name: 'phase:done', color: '' }],
          state: 'open',
        } as GitHubIssue,
      ],
      staticFeatures: [{ name: 'Auth Feature', phase: 'done' }],
      stateFiles: [],
    });
    const conflicts = result.alerts.filter((a) => a.type === 'conflict');
    assert.ok(conflicts.length >= 1);
    assert.ok(conflicts[0].message.includes('still open'));
  });

  test('detects possible duplicates via fuzzy matching', () => {
    const result = reconcile({
      githubIssues: [],
      staticFeatures: [
        { name: 'Training Tracking', phase: 'done' },
        { name: 'Training Trackng', phase: 'done' },
      ],
      stateFiles: [],
    });
    const dupes = result.alerts.filter((a) => a.type === 'duplicate');
    assert.ok(dupes.length >= 1);
    assert.equal(dupes[0].severity, 'blue');
  });

  test('detects state files without GitHub issues', () => {
    const result = reconcile({
      githubIssues: [{ number: 99, title: 'Other Feature', labels: [], state: 'open' } as GitHubIssue],
      staticFeatures: [],
      stateFiles: [{ feature: 'new-feature', current_phase: 'research' }],
    });
    const missing = result.alerts.filter(
      (a) => a.type === 'missing' && a.message.includes('PM workflow'),
    );
    assert.equal(missing.length, 1);
    assert.equal(missing[0].severity, 'amber');
    assert.equal(result.sources.github.healthy, false);
  });

  test('reports correct source counts', () => {
    const result = reconcile({
      githubIssues: [{ number: 1, title: 'A', labels: [], state: 'open' } as GitHubIssue],
      staticFeatures: [
        { name: 'B', phase: 'backlog' },
        { name: 'C', phase: 'done' },
      ],
      stateFiles: [{ feature: 'D', current_phase: 'prd' }],
    });
    assert.equal(result.sources.github.count, 1);
    assert.equal(result.sources.static.count, 2);
    assert.equal(result.sources.state.count, 1);
  });
});
