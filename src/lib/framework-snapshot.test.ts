// src/lib/framework-snapshot.test.ts
//
// Tests for T-snapshot-loader — the typed entry point for the 4 build-time
// framework data files. Uses the committed JSON snapshots in
// src/data/framework/ as live fixtures (real-data tests rather than mocks);
// this catches drift between the loader's TS shapes and the snapshot
// emitter contracts in scripts/sync-from-fittracker2.ts.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  featureRoster,
  frameworkVersions,
  adoptionSnapshot,
  patternSkillMap,
  loadFrameworkSnapshot,
  featuresByStatus,
  patternsForSkill,
  patternById,
  hadfPhase3aHooks,
} from './framework-snapshot';

// ─── feature-roster.json ────────────────────────────────────────────────

test('featureRoster: schema_version is 1.0.0 (locked contract)', () => {
  assert.equal(featureRoster.schema_version, '1.0.0');
});

test('featureRoster: generated_at is ISO-8601 without subseconds', () => {
  assert.match(featureRoster.generated_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
});

test('featureRoster: entries array is non-empty + each entry has all 9 locked fields', () => {
  assert.ok(featureRoster.entries.length > 0, 'roster has entries');
  const requiredFields = new Set([
    'slug',
    'status',
    'framework_version',
    'current_phase',
    'case_study',
    'parent_feature',
    'state_owner',
    'isolation_opt_out',
    'has_brainstorm',
  ]);
  const first = featureRoster.entries[0];
  for (const f of requiredFields) {
    assert.ok(f in first, `field "${f}" present on entry[0]`);
  }
});

test('featureRoster: entries sorted alphabetically by slug', () => {
  for (let i = 1; i < featureRoster.entries.length; i++) {
    assert.ok(
      featureRoster.entries[i - 1].slug <= featureRoster.entries[i].slug,
      `alphabetical sort violated at index ${i}`,
    );
  }
});

// ─── versions.json ───────────────────────────────────────────────────────

test('frameworkVersions: current.version + timeline present', () => {
  assert.ok(frameworkVersions.current.version, 'current.version set');
  assert.ok(Array.isArray(frameworkVersions.timeline), 'timeline is an array');
});

// ─── adoption-snapshot.json ──────────────────────────────────────────────

test('adoptionSnapshot: version + updated fields present', () => {
  assert.ok(adoptionSnapshot.version, 'version set');
  assert.ok(adoptionSnapshot.updated, 'updated set');
});

// ─── pattern-skill-map.json ──────────────────────────────────────────────

test('patternSkillMap: non-empty array of entries with id + skills', () => {
  assert.ok(patternSkillMap.length > 0);
  const first = patternSkillMap[0];
  assert.ok(typeof first.id === 'string');
  assert.ok(Array.isArray(first.skills));
});

// ─── unified accessor ────────────────────────────────────────────────────

test('loadFrameworkSnapshot: returns all 4 surfaces in one object', () => {
  const snap = loadFrameworkSnapshot();
  assert.equal(snap.featureRoster, featureRoster);
  assert.equal(snap.versions, frameworkVersions);
  assert.equal(snap.adoption, adoptionSnapshot);
  assert.equal(snap.patternSkillMap, patternSkillMap);
});

// ─── helper accessors ────────────────────────────────────────────────────

test('featuresByStatus: bucket-sums equal total entry count', () => {
  const buckets = featuresByStatus();
  const totalBucketed =
    buckets.paused.length +
    buckets.in_progress.length +
    buckets.complete.length +
    buckets.cancelled.length +
    buckets.unknown.length;
  assert.equal(totalBucketed, featureRoster.entries.length);
});

test('patternsForSkill: /dev skill has at least one pattern mapped', () => {
  const devPatterns = patternsForSkill('dev');
  assert.ok(devPatterns.length > 0, '/dev has W30/W31/W32/W34 mappings');
  // Every returned pattern must include 'dev' in its skills list.
  for (const p of devPatterns) {
    assert.ok(p.skills.includes('dev'), `${p.id} must include 'dev'`);
  }
});

test('patternById: known W-id resolves to the matching entry; unknown returns undefined', () => {
  // W34 was shipped via FT2 PR #631 + bidirectional sync via FT2 PR #643.
  // It must be present in the mirrored map.
  const w34 = patternById('W34');
  assert.ok(w34, 'W34 must be present in pattern-skill-map snapshot');
  assert.equal(w34?.id, 'W34');
  assert.ok(w34?.skills.includes('dev') || w34?.skills.includes('ops'));

  assert.equal(patternById('W999-does-not-exist'), undefined);
});

test('hadfPhase3aHooks: returns the sensing hook block for the hadf-phase3a-sensing slug', () => {
  // Aggregator half (FT2/fitme-story #203) populates this block for the
  // `hadf-phase3a-sensing` slug only; the Act III sensing chamber (path 1,
  // D3) consumes it. If this regresses, the sensing chamber silently
  // disappears from the scene.
  const hooks = hadfPhase3aHooks();
  assert.ok(hooks, 'hadf-phase3a-sensing hook block must be present in the roster');
  // Each present-flag is a boolean; gate_coverage_extras is a string[].
  assert.equal(typeof hooks?.reference_store_present, 'boolean');
  assert.equal(typeof hooks?.attestation_present, 'boolean');
  assert.equal(typeof hooks?.drift_monitor_present, 'boolean');
  assert.ok(Array.isArray(hooks?.gate_coverage_extras));
});
