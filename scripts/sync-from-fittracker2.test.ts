// scripts/sync-from-fittracker2.test.ts
//
// Task T6 — unit test for the Pattern 4.b sync script. Constructs an
// isolated tmp-dir layout that mimics the FT2 + fitme-story sibling
// structure, calls syncDashboardData() with injected paths, and asserts
// every contract the production prebuild flow depends on:
//
//   1. Happy path — files copied, freshness.json written, counts correct.
//   2. Subdir nesting — shared/{group}/*.json files are copied with
//      their group prefix preserved.
//   3. Per-feature filtering — directories without state.json are skipped.
//   4. JSON validation — corrupt upstream JSON makes the sync fail fast
//      (rather than silently shipping invalid data).
//   5. Option A fallback — when FT2 is absent but a local snapshot
//      exists, the sync logs a warning and returns a fallback report
//      WITHOUT overwriting an existing freshness.json.
//   6. Hard error — when both FT2 and the local snapshot are absent,
//      the sync throws a clear error message.
//
// Each test uses a fresh tmp directory so failures are isolated.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { syncDashboardData, type SyncPaths } from './sync-from-fittracker2';

// Build a SyncPaths object pointing into a fresh tmp root. Caller is
// responsible for creating the FT2 source structure inside ft2Root.
function makePaths(): { paths: SyncPaths; tmpRoot: string; cleanup: () => void } {
  const tmpRoot = mkdtempSync(join(tmpdir(), 't6-sync-'));
  const paths: SyncPaths = {
    ft2Root:        join(tmpRoot, 'FitTracker2'),
    ft2Shared:      join(tmpRoot, 'FitTracker2', '.claude', 'shared'),
    ft2Features:    join(tmpRoot, 'FitTracker2', '.claude', 'features'),
    localShared:    join(tmpRoot, 'fitme-story', 'src', 'data', 'shared'),
    localFeatures:  join(tmpRoot, 'fitme-story', 'src', 'data', 'features'),
    localDocs:      join(tmpRoot, 'fitme-story', 'src', 'data', 'docs'),
    freshnessPath:  join(tmpRoot, 'fitme-story', 'src', 'data', 'freshness.json'),
  };
  // Pre-create the fitme-story output dir so sync can write into it.
  mkdirSync(join(tmpRoot, 'fitme-story', 'src', 'data'), { recursive: true });
  return {
    paths,
    tmpRoot,
    cleanup: () => rmSync(tmpRoot, { recursive: true, force: true }),
  };
}

function writeJson(path: string, obj: unknown) {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, JSON.stringify(obj, null, 2));
}

function writeText(path: string, body: string) {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, body);
}

// Create the four FT2 source markdowns the parsers (and sync) expect. Tests
// that build a complete FT2 root must call this before invoking the sync.
function writeFt2Docs(ft2Root: string) {
  writeText(join(ft2Root, 'docs/product/backlog.md'), '# Backlog\n## Done\n');
  writeText(join(ft2Root, 'docs/product/PRD.md'), '# PRD\n## 1.1 Problem\n');
  writeText(join(ft2Root, 'docs/product/metrics-framework.md'), '# Metrics\n## 1. Core\n');
  writeText(join(ft2Root, 'docs/master-plan/master-backlog-roadmap.md'), '# Roadmap\nRICE PRIORITIZATION MATRIX\n');
}

// ── Test 1: happy path ───────────────────────────────────────────────
test('syncDashboardData copies shared + feature + doc files and writes freshness.json', async () => {
  const { paths, cleanup } = makePaths();
  try {
    // Source layout: 2 top-level shared files + 1 feature with state.json + 4 docs
    writeJson(join(paths.ft2Shared, 'topology.json'), { count: 11 });
    writeJson(join(paths.ft2Shared, 'change-log.json'), [{ id: 1 }]);
    writeJson(join(paths.ft2Features, 'feature-a', 'state.json'), {
      current_phase: 'implementation',
    });
    writeFt2Docs(paths.ft2Root);

    const report = await syncDashboardData(paths);

    // Destination files exist with expected content.
    assert.ok(existsSync(join(paths.localShared, 'topology.json')), 'topology.json copied');
    assert.ok(existsSync(join(paths.localShared, 'change-log.json')), 'change-log.json copied');
    assert.ok(existsSync(join(paths.localFeatures, 'feature-a.json')), 'feature-a.json copied');
    assert.ok(existsSync(join(paths.localDocs, 'docs/product/backlog.md')), 'backlog.md copied');
    assert.ok(existsSync(join(paths.localDocs, 'docs/product/PRD.md')), 'PRD.md copied');
    assert.ok(existsSync(join(paths.localDocs, 'docs/product/metrics-framework.md')), 'metrics-framework.md copied');
    assert.ok(existsSync(join(paths.localDocs, 'docs/master-plan/master-backlog-roadmap.md')), 'roadmap copied');

    // Content roundtrips correctly.
    const copied = JSON.parse(readFileSync(join(paths.localShared, 'topology.json'), 'utf8'));
    assert.deepEqual(copied, { count: 11 });

    // Freshness report is written and reflects the actual sync.
    assert.ok(existsSync(paths.freshnessPath), 'freshness.json written');
    const fresh = JSON.parse(readFileSync(paths.freshnessPath, 'utf8'));
    assert.equal(fresh.counts.sharedFiles, 2);
    assert.equal(fresh.counts.featureFiles, 1);
    assert.equal(fresh.counts.docFiles, 4);
    assert.ok(fresh.counts.bytesTotal > 0);
    assert.ok(fresh.checkedFiles.includes('shared/topology.json'));
    assert.ok(fresh.checkedFiles.includes('features/feature-a.json'));
    assert.ok(fresh.checkedFiles.includes('md/docs/product/backlog.md'));

    // The returned report matches what was written.
    assert.equal(report.counts.sharedFiles, 2);
    assert.equal(report.counts.featureFiles, 1);
    assert.equal(report.counts.docFiles, 4);
  } finally {
    cleanup();
  }
});

// ── Test 2: shared subdir nesting ────────────────────────────────────
test('syncDashboardData recurses one level into shared/ subdirectories', async () => {
  const { paths, cleanup } = makePaths();
  try {
    writeJson(join(paths.ft2Shared, 'hadf', 'chip-profiles.json'), { v: 1 });
    writeJson(join(paths.ft2Shared, 'hadf', 'cloud-signatures.json'), { v: 2 });
    writeJson(join(paths.ft2Features, 'noop-feature', 'state.json'), {});
    writeFt2Docs(paths.ft2Root);

    const report = await syncDashboardData(paths);

    assert.ok(existsSync(join(paths.localShared, 'hadf', 'chip-profiles.json')));
    assert.ok(existsSync(join(paths.localShared, 'hadf', 'cloud-signatures.json')));
    assert.equal(report.counts.sharedFiles, 2);
    assert.ok(report.checkedFiles.includes('shared/hadf/chip-profiles.json'));
  } finally {
    cleanup();
  }
});

// ── Test 3: feature dirs without state.json are skipped ──────────────
test('syncDashboardData skips feature directories without state.json', async () => {
  const { paths, cleanup } = makePaths();
  try {
    writeJson(join(paths.ft2Shared, 'a.json'), {});
    writeJson(join(paths.ft2Features, 'has-state', 'state.json'), { phase: 'done' });
    // This feature dir has docs but no state.json — should be silently skipped.
    mkdirSync(join(paths.ft2Features, 'no-state'), { recursive: true });
    writeFileSync(join(paths.ft2Features, 'no-state', 'README.md'), '# nothing useful');
    writeFt2Docs(paths.ft2Root);

    const report = await syncDashboardData(paths);

    assert.equal(report.counts.featureFiles, 1, 'only has-state should be copied');
    assert.ok(existsSync(join(paths.localFeatures, 'has-state.json')));
    assert.ok(!existsSync(join(paths.localFeatures, 'no-state.json')), 'no-state must NOT be copied');
  } finally {
    cleanup();
  }
});

// ── Test 4: corrupt JSON fails fast ──────────────────────────────────
test('syncDashboardData throws when an upstream file contains invalid JSON', async () => {
  const { paths, cleanup } = makePaths();
  try {
    // Valid file alongside a corrupt one — sync must fail rather than
    // silently shipping the half-good half-bad set.
    writeJson(join(paths.ft2Shared, 'good.json'), { ok: true });
    mkdirSync(paths.ft2Shared, { recursive: true });
    writeFileSync(join(paths.ft2Shared, 'bad.json'), '{ this is not json');
    writeJson(join(paths.ft2Features, 'a', 'state.json'), {});
    writeFt2Docs(paths.ft2Root);

    await assert.rejects(
      () => syncDashboardData(paths),
      /Invalid JSON/,
      'sync must throw on invalid upstream JSON'
    );
  } finally {
    cleanup();
  }
});

// ── Test 4b: missing FT2 source markdown fails fast ──────────────────
test('syncDashboardData throws when an FT2 source markdown is missing', async () => {
  const { paths, cleanup } = makePaths();
  try {
    writeJson(join(paths.ft2Shared, 'a.json'), {});
    writeJson(join(paths.ft2Features, 'a', 'state.json'), {});
    // Deliberately do not call writeFt2Docs — every doc is missing.

    await assert.rejects(
      () => syncDashboardData(paths),
      /FT2 doc missing/,
      'sync must throw when an expected source markdown is absent'
    );
  } finally {
    cleanup();
  }
});

// ── Test 4c: knowledge-hub tree + root files are mirrored ────────────
test('syncDashboardData mirrors the full FT2 docs tree and root READMEs into the kb lane', async () => {
  const { paths, cleanup } = makePaths();
  try {
    writeJson(join(paths.ft2Shared, 'a.json'), {});
    writeJson(join(paths.ft2Features, 'a', 'state.json'), {});
    writeFt2Docs(paths.ft2Root);

    // Extra knowledge-hub files at various depths inside docs/.
    writeText(join(paths.ft2Root, 'docs/case-studies/example.md'), '# Example');
    writeText(join(paths.ft2Root, 'docs/skills/README.md'), '# Skills');
    writeText(join(paths.ft2Root, 'docs/skills/sub/nested.md'), '# Nested');
    writeText(join(paths.ft2Root, 'docs/product/analytics-taxonomy.csv'), 'event,scope\nfoo,bar');
    writeText(join(paths.ft2Root, 'docs/.DS_Store'), 'noise'); // should be skipped
    writeText(join(paths.ft2Root, 'docs/skills/foo.txt'), 'wrong ext'); // should be skipped

    // Root-level files the builder explicitly references.
    writeText(join(paths.ft2Root, 'README.md'), '# Root README');
    writeText(join(paths.ft2Root, 'CLAUDE.md'), '# CLAUDE');
    // ai-engine/README.md and backend/README.md deliberately missing —
    // soft-skip should not fail the run.

    const report = await syncDashboardData(paths);

    // Required parser-input docs counted under docFiles (4).
    assert.equal(report.counts.docFiles, 4);

    // Optional kb files: 4 walked into docs subtree + 2 root files = 6.
    // (.DS_Store skipped, .txt skipped, ai-engine/backend READMEs absent.)
    assert.equal(report.counts.kbFiles, 6);

    // Files actually exist on disk under the localDocs lane.
    assert.ok(existsSync(join(paths.localDocs, 'docs/case-studies/example.md')));
    assert.ok(existsSync(join(paths.localDocs, 'docs/skills/README.md')));
    assert.ok(existsSync(join(paths.localDocs, 'docs/skills/sub/nested.md')));
    assert.ok(existsSync(join(paths.localDocs, 'docs/product/analytics-taxonomy.csv')));
    assert.ok(existsSync(join(paths.localDocs, 'README.md')));
    assert.ok(existsSync(join(paths.localDocs, 'CLAUDE.md')));

    // Noise filtered out.
    assert.ok(!existsSync(join(paths.localDocs, 'docs/.DS_Store')));
    assert.ok(!existsSync(join(paths.localDocs, 'docs/skills/foo.txt')));

    // checkedFiles uses the `kb/` lane prefix for these.
    assert.ok(report.checkedFiles.includes('kb/docs/case-studies/example.md'));
    assert.ok(report.checkedFiles.includes('kb/README.md'));
  } finally {
    cleanup();
  }
});

// ── Test 5: Option A fallback ────────────────────────────────────────
test('syncDashboardData falls back to committed snapshot when FT2 is absent', async () => {
  const { paths, cleanup } = makePaths();
  try {
    // FT2 root deliberately not created — simulates Vercel-builder case.
    // Local snapshot exists.
    mkdirSync(paths.localShared, { recursive: true });
    mkdirSync(paths.localFeatures, { recursive: true });
    writeJson(join(paths.localShared, 'snapshot.json'), { stale: true });

    const report = await syncDashboardData(paths);

    assert.equal(report.source, 'committed-snapshot (FT2 not present at build time)');
    assert.equal(report.counts.sharedFiles, 0);
    assert.equal(report.counts.featureFiles, 0);
    assert.equal(report.counts.docFiles, 0);
    assert.equal(report.counts.kbFiles, 0);
    assert.equal(report.syncedAt, new Date(0).toISOString(),
      'fallback report uses epoch timestamp to signal "no fresh sync"');
    // Freshness file written when none existed before.
    assert.ok(existsSync(paths.freshnessPath));
  } finally {
    cleanup();
  }
});

test('Option A fallback preserves an existing freshness.json (does not overwrite)', async () => {
  const { paths, cleanup } = makePaths();
  try {
    mkdirSync(paths.localShared, { recursive: true });
    mkdirSync(paths.localFeatures, { recursive: true });
    writeJson(paths.freshnessPath, {
      syncedAt: '2026-04-15T10:00:00.000Z',
      source: 'previous-real-sync',
      counts: { sharedFiles: 33, featureFiles: 43, bytesTotal: 722000 },
      checkedFiles: ['shared/x.json'],
    });

    await syncDashboardData(paths);

    const after = JSON.parse(readFileSync(paths.freshnessPath, 'utf8'));
    assert.equal(after.syncedAt, '2026-04-15T10:00:00.000Z',
      'pre-existing freshness.json must NOT be clobbered by fallback');
    assert.equal(after.source, 'previous-real-sync');
  } finally {
    cleanup();
  }
});

// ── Test 6: hard error when both FT2 and snapshot are missing ────────
test('syncDashboardData throws when FT2 absent AND no committed snapshot', async () => {
  const { paths, cleanup } = makePaths();
  try {
    // Neither FT2 root nor the local snapshot dirs exist — genuine
    // broken state, must fail loudly.
    await assert.rejects(
      () => syncDashboardData(paths),
      /FitTracker2 repo not found.*AND no committed snapshot/,
      'must throw with a clear actionable message'
    );
  } finally {
    cleanup();
  }
});
