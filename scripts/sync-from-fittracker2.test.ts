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
import { syncDashboardData, aggregateFeatureRoster, type SyncPaths } from './sync-from-fittracker2';

// Build a SyncPaths object pointing into a fresh tmp root. Caller is
// responsible for creating the FT2 source structure inside ft2Root.
function makePaths(): { paths: SyncPaths; tmpRoot: string; cleanup: () => void } {
  const tmpRoot = mkdtempSync(join(tmpdir(), 't6-sync-'));
  const paths: SyncPaths = {
    ft2Root:                join(tmpRoot, 'FitTracker2'),
    ft2Shared:              join(tmpRoot, 'FitTracker2', '.claude', 'shared'),
    ft2Features:            join(tmpRoot, 'FitTracker2', '.claude', 'features'),
    ft2Logs:                join(tmpRoot, 'FitTracker2', '.claude', 'logs'),
    ft2IntegritySnapshots:  join(tmpRoot, 'FitTracker2', '.claude', 'integrity', 'snapshots'),
    ft2Skills:              join(tmpRoot, 'FitTracker2', '.claude', 'skills'),
    localShared:            join(tmpRoot, 'fitme-story', 'src', 'data', 'shared'),
    localFeatures:          join(tmpRoot, 'fitme-story', 'src', 'data', 'features'),
    localLogs:              join(tmpRoot, 'fitme-story', 'src', 'data', 'logs'),
    localDocs:              join(tmpRoot, 'fitme-story', 'src', 'data', 'docs'),
    localIntegritySnapshots: join(tmpRoot, 'fitme-story', 'src', 'data', 'integrity', 'snapshots'),
    localSkills:            join(tmpRoot, 'fitme-story', 'src', 'data', 'skills'),
    localFramework:         join(tmpRoot, 'fitme-story', 'src', 'data', 'framework'),
    freshnessPath:          join(tmpRoot, 'fitme-story', 'src', 'data', 'freshness.json'),
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

// ── Test 7: v7.8.3 §4.1 gate-coverage-ft2.jsonl forward sync ────────
// Verifies that FT2's .claude/logs/gate-coverage.jsonl is mirrored to
// src/data/integrity/gate-coverage-ft2.jsonl (renamed -ft2 suffix to
// disambiguate from fitme-story's own local .claude/logs/gate-coverage.jsonl).
// Reverses the original Phase C spec §3 explicit exclusion.
test('forward sync mirrors FT2 gate-coverage.jsonl as gate-coverage-ft2.jsonl', async () => {
  const { paths, tmpRoot, cleanup } = makePaths();
  try {
    // Set up a minimal FT2 source tree with .claude/logs/gate-coverage.jsonl.
    writeJson(join(paths.ft2Shared, 'a.json'), {});
    writeJson(join(paths.ft2Features, 'a', 'state.json'), {});
    writeFt2Docs(paths.ft2Root);

    // Create the gate-coverage.jsonl file in FT2's .claude/logs/ dir.
    const ft2LogsDir = join(tmpRoot, 'FitTracker2', '.claude', 'logs');
    mkdirSync(ft2LogsDir, { recursive: true });
    writeFileSync(
      join(ft2LogsDir, 'gate-coverage.jsonl'),
      '{"gate":"V2_FIELD_MISSING","outcome":"PASS","ts":"2026-05-12T00:00:00Z","candidates":3,"checked":3}\n'
    );

    await syncDashboardData(paths);

    // The file must appear at the new -ft2 suffixed destination path.
    const destFile = join(tmpRoot, 'fitme-story', 'src', 'data', 'integrity', 'gate-coverage-ft2.jsonl');
    assert.ok(existsSync(destFile), 'gate-coverage-ft2.jsonl must exist in src/data/integrity/');

    const content = readFileSync(destFile, 'utf8');
    assert.match(content, /"V2_FIELD_MISSING"/, 'content must mirror FT2 source');
    assert.match(content, /"PASS"/, 'content must mirror outcome field');

    // The original name (without -ft2) must NOT exist at the dest — rename only.
    const wrongDest = join(tmpRoot, 'fitme-story', 'src', 'data', 'integrity', 'gate-coverage.jsonl');
    assert.ok(!existsSync(wrongDest), 'gate-coverage.jsonl (no suffix) must NOT be created at dest');
  } finally {
    cleanup();
  }
});

// Phase G (2026-06-05) — T-aggregator (3D Universe Phase 4.A) — tests the
// `src/data/framework/feature-roster.json` aggregator per the OQ-2 locked
// contract in `.claude/features/3d-interactive-framework-flow-diagram/prd.md`
// §Data Contracts.

function writeFt2State(
  ft2FeaturesDir: string,
  slug: string,
  state: Record<string, unknown>,
): void {
  const dir = join(ft2FeaturesDir, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'state.json'), JSON.stringify(state, null, 2));
}

test('Phase G T-aggregator: emits feature-roster.json with schema_version + generated_at + entries', async () => {
  const { paths, tmpRoot, cleanup } = makePaths();
  try {
    const ft2FeaturesDir = join(tmpRoot, 'FitTracker2', '.claude', 'features');
    mkdirSync(paths.ft2Shared, { recursive: true });
    mkdirSync(paths.ft2Logs, { recursive: true });
    // Minimum 4 source markdowns required by FT2_DOC_PATHS.
    mkdirSync(join(tmpRoot, 'FitTracker2', 'docs', 'product'), { recursive: true });
    mkdirSync(join(tmpRoot, 'FitTracker2', 'docs', 'master-plan'), { recursive: true });
    for (const p of ['docs/product/backlog.md', 'docs/product/PRD.md', 'docs/product/metrics-framework.md', 'docs/master-plan/master-backlog-roadmap.md']) {
      writeFileSync(join(tmpRoot, 'FitTracker2', p), '# placeholder\n');
    }
    // 2 feature dirs with valid state.json.
    writeFt2State(ft2FeaturesDir, 'zeta-feature', {
      feature_name: 'zeta-feature',
      current_phase: 'complete',
      framework_version: 'v7.9.1',
      case_study: 'docs/case-studies/zeta-case-study.md',
      state_owner: 'ft2',
      isolation_opt_out: false,
    });
    writeFt2State(ft2FeaturesDir, 'alpha-feature', {
      feature_name: 'alpha-feature',
      current_phase: 'implementation',
      framework_version: 'v7.9.1',
      state_owner: 'fitme-story',
    });

    await syncDashboardData(paths);

    const rosterPath = join(tmpRoot, 'fitme-story', 'src', 'data', 'framework', 'feature-roster.json');
    assert.ok(existsSync(rosterPath), 'feature-roster.json must be emitted');
    const roster = JSON.parse(readFileSync(rosterPath, 'utf8'));
    assert.equal(roster.schema_version, '1.0.0', 'schema_version is locked at 1.0.0');
    assert.match(roster.generated_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'generated_at is ISO-8601 without ms');
    assert.equal(roster.entries.length, 2, 'one entry per state.json parsed successfully');
    // Sort: alphabetical by slug — alpha before zeta.
    assert.equal(roster.entries[0].slug, 'alpha-feature');
    assert.equal(roster.entries[1].slug, 'zeta-feature');
  } finally {
    cleanup();
  }
});

test('Phase G T-aggregator: derives status correctly + drops private fields', async () => {
  const { paths, tmpRoot, cleanup } = makePaths();
  try {
    const ft2FeaturesDir = join(tmpRoot, 'FitTracker2', '.claude', 'features');
    mkdirSync(paths.ft2Shared, { recursive: true });
    mkdirSync(paths.ft2Logs, { recursive: true });
    mkdirSync(join(tmpRoot, 'FitTracker2', 'docs', 'product'), { recursive: true });
    mkdirSync(join(tmpRoot, 'FitTracker2', 'docs', 'master-plan'), { recursive: true });
    for (const p of ['docs/product/backlog.md', 'docs/product/PRD.md', 'docs/product/metrics-framework.md', 'docs/master-plan/master-backlog-roadmap.md']) {
      writeFileSync(join(tmpRoot, 'FitTracker2', p), '# placeholder\n');
    }
    writeFt2State(ft2FeaturesDir, 'priv-leak-test', {
      feature_name: 'priv-leak-test',
      current_phase: 'paused',
      // Private fields that MUST be dropped per locked contract.
      cache_hits: [{ file: 'secret.swift', n: 5 }],
      cu_v2: { computed: 1.8, factors: ['secret_factor'] },
      tasks: [{ id: 'T1', description: 'INTERNAL' }],
      phases: { implementation: { notes: 'INTERNAL NOTES' } },
      timing: { wall_time_seconds: 1234 },
    });
    writeFt2State(ft2FeaturesDir, 'cancelled-test', {
      feature_name: 'cancelled-test',
      current_phase: 'cancelled',
    });
    writeFt2State(ft2FeaturesDir, 'unknown-phase-test', {
      feature_name: 'unknown-phase-test',
      current_phase: 'made-up-phase-name',
    });

    await syncDashboardData(paths);

    const rosterPath = join(tmpRoot, 'fitme-story', 'src', 'data', 'framework', 'feature-roster.json');
    const roster = JSON.parse(readFileSync(rosterPath, 'utf8'));
    const byslug: Record<string, Record<string, unknown>> = {};
    for (const e of roster.entries) byslug[e.slug as string] = e;

    // Status derivation
    assert.equal(byslug['priv-leak-test'].status, 'paused', 'paused phase → paused status');
    assert.equal(byslug['cancelled-test'].status, 'cancelled', 'cancelled phase → cancelled status');
    assert.equal(byslug['unknown-phase-test'].status, 'in_progress', 'any non-terminal phase → in_progress');

    // Privacy posture: dropped fields must not appear ANYWHERE in the entry
    const privEntry = byslug['priv-leak-test'];
    assert.equal('cache_hits' in privEntry, false, 'cache_hits must be dropped');
    assert.equal('cu_v2' in privEntry, false, 'cu_v2 must be dropped');
    assert.equal('tasks' in privEntry, false, 'tasks must be dropped');
    assert.equal('phases' in privEntry, false, 'phases must be dropped');
    assert.equal('timing' in privEntry, false, 'timing must be dropped');

    // Closed enum: only the 10 contracted fields present (10th =
    // hadf_phase3a_hooks, added 2026-06-06 Phase 4.I T-aggregator extension).
    const allowed = new Set([
      'slug', 'status', 'framework_version', 'current_phase',
      'case_study', 'parent_feature', 'state_owner',
      'isolation_opt_out', 'has_brainstorm',
      'hadf_phase3a_hooks',
    ]);
    for (const k of Object.keys(privEntry)) {
      assert.ok(allowed.has(k), `unexpected leaked field: ${k}`);
    }
  } finally {
    cleanup();
  }
});

test('Phase G T-aggregator: corrupted state.json logs warning but does NOT abort aggregator (locked-contract degraded-graceful)', async () => {
  // Tests the aggregator function in isolation. The wider syncDashboardData
  // upstream copy step is strict (hard-fails on invalid JSON in feature dirs
  // — see "throws when an upstream file contains invalid JSON" above). The
  // OQ-2 locked contract's degraded-graceful promise applies to the
  // aggregator surface specifically: a single corrupted state.json must NOT
  // prevent the other 95/96 monuments from being aggregated. Upstream
  // strictness is a separate concern outside this task's scope.
  const tmpRoot = mkdtempSync(join(tmpdir(), 't-agg-corrupt-'));
  try {
    const ft2FeaturesDir = join(tmpRoot, 'features');
    const localFramework = join(tmpRoot, 'framework');
    mkdirSync(ft2FeaturesDir, { recursive: true });
    writeFt2State(ft2FeaturesDir, 'good-feature', {
      feature_name: 'good-feature',
      current_phase: 'complete',
    });
    mkdirSync(join(ft2FeaturesDir, 'corrupt-feature'), { recursive: true });
    writeFileSync(join(ft2FeaturesDir, 'corrupt-feature', 'state.json'), '{not json');

    const result = aggregateFeatureRoster(ft2FeaturesDir, localFramework);
    assert.equal(result.wrote, true, 'aggregator wrote the file despite the corrupt sibling');
    assert.equal(result.entries, 1, 'corrupted state.json skipped; good entry survives');
    const roster = JSON.parse(readFileSync(join(localFramework, 'feature-roster.json'), 'utf8'));
    assert.equal(roster.entries.length, 1);
    assert.equal(roster.entries[0].slug, 'good-feature');
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('Phase G T-aggregator: idempotent — re-running produces stable output (same entries, same sort)', async () => {
  const { paths, tmpRoot, cleanup } = makePaths();
  try {
    const ft2FeaturesDir = join(tmpRoot, 'FitTracker2', '.claude', 'features');
    mkdirSync(paths.ft2Shared, { recursive: true });
    mkdirSync(paths.ft2Logs, { recursive: true });
    mkdirSync(join(tmpRoot, 'FitTracker2', 'docs', 'product'), { recursive: true });
    mkdirSync(join(tmpRoot, 'FitTracker2', 'docs', 'master-plan'), { recursive: true });
    for (const p of ['docs/product/backlog.md', 'docs/product/PRD.md', 'docs/product/metrics-framework.md', 'docs/master-plan/master-backlog-roadmap.md']) {
      writeFileSync(join(tmpRoot, 'FitTracker2', p), '# placeholder\n');
    }
    writeFt2State(ft2FeaturesDir, 'c-feat', { feature_name: 'c-feat', current_phase: 'complete' });
    writeFt2State(ft2FeaturesDir, 'a-feat', { feature_name: 'a-feat', current_phase: 'complete' });
    writeFt2State(ft2FeaturesDir, 'b-feat', { feature_name: 'b-feat', current_phase: 'complete' });

    await syncDashboardData(paths);
    const r1 = JSON.parse(readFileSync(join(tmpRoot, 'fitme-story', 'src', 'data', 'framework', 'feature-roster.json'), 'utf8'));

    await syncDashboardData(paths);
    const r2 = JSON.parse(readFileSync(join(tmpRoot, 'fitme-story', 'src', 'data', 'framework', 'feature-roster.json'), 'utf8'));

    // entries arrays equal modulo generated_at (which IS expected to advance).
    assert.deepEqual(
      r1.entries.map((e: { slug: string }) => e.slug),
      ['a-feat', 'b-feat', 'c-feat'],
      'alphabetical sort observed on first run',
    );
    assert.deepEqual(
      r2.entries.map((e: { slug: string }) => e.slug),
      r1.entries.map((e: { slug: string }) => e.slug),
      'entry order stable across runs',
    );
    assert.deepEqual(r2.entries, r1.entries, 'entry content identical across runs');
    assert.equal(r2.schema_version, r1.schema_version, 'schema_version stable');
  } finally {
    cleanup();
  }
});

// Phase G.2 (2026-06-05) — pure-copy mirrors (T-versions-mirror,
// T-adoption-mirror, T-pattern-skill-mirror). All 3 use the same
// `mirrorJsonFile` helper backing — testing one fully covers the others.

test('Phase G.2 mirrorVersionsJson: copies docs/framework/versions.json verbatim into src/data/framework/', async () => {
  const { mirrorVersionsJson } = await import('./sync-from-fittracker2');
  const tmpRoot = mkdtempSync(join(tmpdir(), 't-versions-mirror-'));
  try {
    const ft2Root = join(tmpRoot, 'FitTracker2');
    const localFramework = join(tmpRoot, 'framework');
    const srcPath = join(ft2Root, 'docs', 'framework', 'versions.json');
    mkdirSync(join(ft2Root, 'docs', 'framework'), { recursive: true });
    const payload = { versions: [{ id: 'v7.9.1', label: 'v7.9.1 Build Window' }] };
    writeFileSync(srcPath, JSON.stringify(payload, null, 2));

    const result = mirrorVersionsJson(ft2Root, localFramework);
    assert.equal(result.wrote, true);
    assert.deepEqual(result.checked, ['framework/versions.json']);
    const dst = JSON.parse(readFileSync(join(localFramework, 'versions.json'), 'utf8'));
    assert.deepEqual(dst, payload, 'content roundtrips verbatim');
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('Phase G.2 mirrorMeasurementAdoption: emits adoption-snapshot.json from measurement-adoption.json', async () => {
  const { mirrorMeasurementAdoption } = await import('./sync-from-fittracker2');
  const tmpRoot = mkdtempSync(join(tmpdir(), 't-adoption-mirror-'));
  try {
    const ft2Shared = join(tmpRoot, 'shared');
    const localFramework = join(tmpRoot, 'framework');
    mkdirSync(ft2Shared, { recursive: true });
    writeFileSync(join(ft2Shared, 'measurement-adoption.json'), JSON.stringify({ totals: { features_post_v6: 60 } }));

    const result = mirrorMeasurementAdoption(ft2Shared, localFramework);
    assert.equal(result.wrote, true);
    assert.deepEqual(result.checked, ['framework/adoption-snapshot.json']);
    assert.ok(existsSync(join(localFramework, 'adoption-snapshot.json')), 'output written under rename');
    assert.ok(!existsSync(join(localFramework, 'measurement-adoption.json')), 'NOT written at source name');
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('Phase G.2 mirrorPatternSkillMap: copies pattern-skill-map.json into framework dir', async () => {
  const { mirrorPatternSkillMap } = await import('./sync-from-fittracker2');
  const tmpRoot = mkdtempSync(join(tmpdir(), 't-pattern-skill-mirror-'));
  try {
    const ft2Shared = join(tmpRoot, 'shared');
    const localFramework = join(tmpRoot, 'framework');
    mkdirSync(ft2Shared, { recursive: true });
    writeFileSync(join(ft2Shared, 'pattern-skill-map.json'), JSON.stringify([
      { id: 'W34', title: 'PR cache window truncation', skills: ['dev', 'ops'] },
    ]));

    const result = mirrorPatternSkillMap(ft2Shared, localFramework);
    assert.equal(result.wrote, true);
    const dst = JSON.parse(readFileSync(join(localFramework, 'pattern-skill-map.json'), 'utf8'));
    assert.equal(dst[0].id, 'W34');
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('Phase G.2 mirrors: missing source returns { wrote: false, error: source_missing } without throwing', async () => {
  const { mirrorVersionsJson, mirrorMeasurementAdoption, mirrorPatternSkillMap } = await import('./sync-from-fittracker2');
  const tmpRoot = mkdtempSync(join(tmpdir(), 't-mirror-missing-'));
  try {
    const localFramework = join(tmpRoot, 'framework');
    // Sources intentionally do not exist.
    for (const fn of [
      () => mirrorVersionsJson(join(tmpRoot, 'FitTracker2'), localFramework),
      () => mirrorMeasurementAdoption(join(tmpRoot, 'shared'), localFramework),
      () => mirrorPatternSkillMap(join(tmpRoot, 'shared'), localFramework),
    ]) {
      const r = fn();
      assert.equal(r.wrote, false, 'soft-fail; does not throw');
      assert.match(r.error ?? '', /source_missing/);
    }
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('Phase G.2 mirrors: corrupted source JSON returns { wrote: false, error: parse_or_io_failed }', async () => {
  const { mirrorVersionsJson } = await import('./sync-from-fittracker2');
  const tmpRoot = mkdtempSync(join(tmpdir(), 't-mirror-corrupt-'));
  try {
    const ft2Root = join(tmpRoot, 'FitTracker2');
    const localFramework = join(tmpRoot, 'framework');
    mkdirSync(join(ft2Root, 'docs', 'framework'), { recursive: true });
    writeFileSync(join(ft2Root, 'docs', 'framework', 'versions.json'), '{not json');
    const r = mirrorVersionsJson(ft2Root, localFramework);
    assert.equal(r.wrote, false);
    assert.match(r.error ?? '', /parse_or_io_failed/);
    assert.ok(!existsSync(join(localFramework, 'versions.json')), 'invalid JSON is NOT written to dest');
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});

// ─── Phase 4.I T-aggregator extension (2026-06-06) ────────────────────────
// HADF Phase 3a sensing-layer hook block. Path-agnostic: aggregator emits
// the block ONLY for the `hadf-phase3a-sensing` slug; every other slug
// carries `hadf_phase3a_hooks: null`.

function setupHadfPhase3aFiles(
  ft2Root: string,
  files: {
    refStoreScript?: boolean;
    refSignatures?: boolean;
    attestScript?: boolean;
    driftScript?: boolean;
  },
): void {
  mkdirSync(join(ft2Root, 'scripts'), { recursive: true });
  mkdirSync(join(ft2Root, '.claude', 'shared', 'hadf'), { recursive: true });
  if (files.refStoreScript) {
    writeFileSync(join(ft2Root, 'scripts', 'hadf-build-reference-store.py'), '# stub\n');
  }
  if (files.refSignatures) {
    writeFileSync(
      join(ft2Root, '.claude', 'shared', 'hadf', 'reference-signatures.json'),
      '{}\n',
    );
  }
  if (files.attestScript) {
    writeFileSync(join(ft2Root, 'scripts', 'hadf-attest.py'), '# stub\n');
  }
  if (files.driftScript) {
    writeFileSync(join(ft2Root, 'scripts', 'hadf-drift-monitor.py'), '# stub\n');
  }
}

test('Phase 4.I HADF hooks: hadf-phase3a-sensing entry populates block when all files present', () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), 't-hadf-hooks-full-'));
  try {
    const ft2Root = join(tmpRoot, 'FitTracker2');
    const ft2FeaturesDir = join(ft2Root, '.claude', 'features');
    const localFramework = join(tmpRoot, 'framework');
    mkdirSync(ft2FeaturesDir, { recursive: true });
    setupHadfPhase3aFiles(ft2Root, {
      refStoreScript: true,
      refSignatures: true,
      attestScript: true,
      driftScript: true,
    });
    writeFt2State(ft2FeaturesDir, 'hadf-phase3a-sensing', {
      feature_name: 'hadf-phase3a-sensing',
      current_phase: 'implementation',
    });
    writeFt2State(ft2FeaturesDir, 'unrelated-feature', {
      feature_name: 'unrelated-feature',
      current_phase: 'complete',
    });

    const r = aggregateFeatureRoster(ft2FeaturesDir, localFramework, ft2Root);
    assert.equal(r.wrote, true);
    const roster = JSON.parse(
      readFileSync(join(localFramework, 'feature-roster.json'), 'utf8'),
    );
    const hadf = roster.entries.find(
      (e: { slug: string }) => e.slug === 'hadf-phase3a-sensing',
    );
    assert.ok(hadf, 'hadf-phase3a-sensing entry present');
    assert.deepEqual(hadf.hadf_phase3a_hooks, {
      reference_store_present: true,
      attestation_present: true,
      drift_monitor_present: true,
      gate_coverage_extras: [],
    });
    const unrelated = roster.entries.find(
      (e: { slug: string }) => e.slug === 'unrelated-feature',
    );
    assert.equal(
      unrelated.hadf_phase3a_hooks,
      null,
      'non-HADF entries get null — block is path-agnostic per-slug',
    );
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('Phase 4.I HADF hooks: reference_store_present requires BOTH script AND signatures', () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), 't-hadf-hooks-partial-'));
  try {
    const ft2Root = join(tmpRoot, 'FitTracker2');
    const ft2FeaturesDir = join(ft2Root, '.claude', 'features');
    const localFramework = join(tmpRoot, 'framework');
    mkdirSync(ft2FeaturesDir, { recursive: true });
    // Script present, signatures absent → reference_store_present false.
    setupHadfPhase3aFiles(ft2Root, {
      refStoreScript: true,
      refSignatures: false,
      attestScript: true,
      driftScript: true,
    });
    writeFt2State(ft2FeaturesDir, 'hadf-phase3a-sensing', {
      feature_name: 'hadf-phase3a-sensing',
      current_phase: 'implementation',
    });

    const r = aggregateFeatureRoster(ft2FeaturesDir, localFramework, ft2Root);
    assert.equal(r.wrote, true);
    const roster = JSON.parse(
      readFileSync(join(localFramework, 'feature-roster.json'), 'utf8'),
    );
    const hadf = roster.entries.find(
      (e: { slug: string }) => e.slug === 'hadf-phase3a-sensing',
    );
    assert.equal(
      hadf.hadf_phase3a_hooks.reference_store_present,
      false,
      'AND-gated: script alone is not enough',
    );
    assert.equal(hadf.hadf_phase3a_hooks.attestation_present, true);
    assert.equal(hadf.hadf_phase3a_hooks.drift_monitor_present, true);
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('Phase 4.I HADF hooks: gate_coverage_extras is v1-reserved empty array', () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), 't-hadf-hooks-extras-'));
  try {
    const ft2Root = join(tmpRoot, 'FitTracker2');
    const ft2FeaturesDir = join(ft2Root, '.claude', 'features');
    const localFramework = join(tmpRoot, 'framework');
    mkdirSync(ft2FeaturesDir, { recursive: true });
    setupHadfPhase3aFiles(ft2Root, {});
    writeFt2State(ft2FeaturesDir, 'hadf-phase3a-sensing', {
      feature_name: 'hadf-phase3a-sensing',
      current_phase: 'implementation',
    });

    const r = aggregateFeatureRoster(ft2FeaturesDir, localFramework, ft2Root);
    assert.equal(r.wrote, true);
    const roster = JSON.parse(
      readFileSync(join(localFramework, 'feature-roster.json'), 'utf8'),
    );
    const hadf = roster.entries.find(
      (e: { slug: string }) => e.slug === 'hadf-phase3a-sensing',
    );
    assert.ok(Array.isArray(hadf.hadf_phase3a_hooks.gate_coverage_extras));
    assert.equal(
      hadf.hadf_phase3a_hooks.gate_coverage_extras.length,
      0,
      'v1 reserves the field; enrichment is forward-only',
    );
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('Phase 4.I HADF hooks: ft2Root defaults to ../../ft2Features when omitted (backward-compat)', () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), 't-hadf-hooks-default-'));
  try {
    const ft2Root = join(tmpRoot, 'FitTracker2');
    const ft2FeaturesDir = join(ft2Root, '.claude', 'features');
    const localFramework = join(tmpRoot, 'framework');
    mkdirSync(ft2FeaturesDir, { recursive: true });
    setupHadfPhase3aFiles(ft2Root, {
      refStoreScript: true,
      refSignatures: true,
      attestScript: true,
      driftScript: true,
    });
    writeFt2State(ft2FeaturesDir, 'hadf-phase3a-sensing', {
      feature_name: 'hadf-phase3a-sensing',
      current_phase: 'implementation',
    });

    // Omit ft2Root — should default to two-dirs-up from ft2Features and
    // resolve to the real ft2Root.
    const r = aggregateFeatureRoster(ft2FeaturesDir, localFramework);
    assert.equal(r.wrote, true);
    const roster = JSON.parse(
      readFileSync(join(localFramework, 'feature-roster.json'), 'utf8'),
    );
    const hadf = roster.entries.find(
      (e: { slug: string }) => e.slug === 'hadf-phase3a-sensing',
    );
    assert.equal(hadf.hadf_phase3a_hooks.reference_store_present, true);
    assert.equal(hadf.hadf_phase3a_hooks.attestation_present, true);
    assert.equal(hadf.hadf_phase3a_hooks.drift_monitor_present, true);
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
});
