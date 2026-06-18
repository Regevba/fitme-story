// src/components/bespoke/framework-universe/scenes/Act3-Architecture.test.tsx
//
// Smoke tests for Act III + a real-data integration test for FR-13
// pattern overlay binding. Render-correctness comes at Phase 4.J.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Act3Architecture } from './Act3-Architecture';
import { patternsForSkill, hadfPhase3aHooks } from '../../../../lib/framework-snapshot';

test('Act3Architecture: module loads + exports a memo-wrapped component', () => {
  assert.equal(typeof Act3Architecture, 'object');
  const inner = (Act3Architecture as unknown as { type: unknown }).type;
  assert.equal(typeof inner, 'function');
});

test('Act3Architecture: memo wrapper preserves the impl function name', () => {
  const inner = (Act3Architecture as unknown as { type: { name?: string } }).type;
  assert.equal(inner.name, 'Act3ArchitectureImpl');
});

test('Act3Architecture: FR-13 pattern overlay can resolve real IDs from the snapshot', () => {
  // Verifies the actual lookup the scene uses produces real W-IDs from
  // the mirrored pattern-skill-map.json. If this regresses, the act's
  // overlay annotations will silently degrade to empty Signage tags.
  for (const skill of ['qa', 'pm-workflow', 'ops'] as const) {
    const matches = patternsForSkill(skill);
    assert.ok(matches.length > 0, `${skill} must map to ≥1 pattern in the snapshot`);
    // Verify the IDs look like real W-numbered or gate-numbered patterns.
    for (const p of matches.slice(0, 2)) {
      assert.match(p.id, /^(W\d+|#\d+|\d+)$/, `pattern ID "${p.id}" matches expected format`);
    }
  }
});

test('Act3Architecture: D3 sensing chamber resolves ≥1 present hook from the roster', () => {
  // Path-1 scene consumer (operator decision 2026-06-18 D3): the sensing
  // chamber renders only when hadfPhase3aHooks() is non-null, and shows a
  // labelled annotation per present hook. If the aggregator block regresses
  // to null, the chamber is skipped entirely (no dead chamber) — but at
  // current data it must resolve at least one present hook.
  const hooks = hadfPhase3aHooks();
  assert.ok(hooks, 'sensing hook block must be present for Act III to render the chamber');
  const presentCount = [
    hooks?.reference_store_present,
    hooks?.attestation_present,
    hooks?.drift_monitor_present,
  ].filter(Boolean).length;
  assert.ok(presentCount >= 1, 'at least one sensing hook must be present to annotate');
});
