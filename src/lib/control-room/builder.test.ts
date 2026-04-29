/**
 * Integration test for builder.ts — port from
 * dashboard/tests/control-center-builders.test.js (FT2 vitest source).
 *
 * Exercises the full top-level orchestrator against the synced snapshot
 * (shared JSONs + per-feature state.json + four source markdowns) plus the
 * committed control-room-seeds. Requires `npm run prebuild` to have
 * populated src/data/.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildDashboardData,
  isPrimaryView,
  isSecondaryWorkspace,
} from './builder';

describe('control-room builder', () => {
  test('recognizes primary and secondary workspace ids', () => {
    assert.equal(isPrimaryView('knowledge'), true);
    assert.equal(isPrimaryView('claude-research'), false);
    assert.equal(isSecondaryWorkspace('claude-research'), true);
    assert.equal(isSecondaryWorkspace('control'), false);
  });

  test('builds a non-empty dashboard data shape from the synced snapshot', async () => {
    const data = await buildDashboardData();

    // frameworkManifest is whatever shape the synced JSON has — just verify
    // it loaded and has at least one key (the FT2 source asserted on
    // framework_version === '7.1' but that's brittle as v7.x bumps).
    assert.equal(typeof data.frameworkManifest, 'object');
    assert.notEqual(data.frameworkManifest, null);
    assert.ok(Object.keys(data.frameworkManifest as object).length > 0);

    // documentationDebt summary is wired through.
    assert.ok(
      (data.documentationDebt as { summary: { case_studies_scanned: number } }).summary
        .case_studies_scanned > 0,
    );

    // Workspace meta exposes the canonical primary/secondary IDs.
    assert.ok(data.workspaceMeta.primaryViews.map((item) => item.id).includes('knowledge'));
    assert.ok(
      data.workspaceMeta.secondaryWorkspaces.map((item) => item.id).includes('case-studies'),
    );

    // Case study feed surfaces the cleanup case-study seeded in
    // control-room-seeds/caseStudies.json.
    assert.ok(
      data.caseStudyFeed.some((item) => item.id === 'cleanup-control-room-2026-04'),
    );

    // Knowledge hub has the tracked-case-studies group.
    assert.ok(
      data.knowledgeHub.groups.some((group) => group.id === 'tracked-case-studies'),
    );

    // At least one feature is sourced from the shared layer (i.e.
    // feature-registry merged into the dataset).
    assert.ok(data.features.some((feature) => feature.truthMode === 'shared-layer'));

    // The docs source entry exists.
    assert.notEqual(data.sources['docs'], undefined);

    // Worktree paths must NOT leak into the knowledge hub (prevents stale
    // working-copy docs from polluting the published surface).
    const allDocs = data.knowledgeHub.groups.flatMap((group) => group.docs);
    assert.ok(!allDocs.some((doc) => String(doc.path).includes('.claude/worktrees')));
  });

  test('caseStudyFeed entries all have a string id', async () => {
    const data = await buildDashboardData();
    assert.ok(Array.isArray(data.caseStudyFeed));
    for (const item of data.caseStudyFeed) {
      assert.equal(typeof item.id, 'string');
    }
  });
});
