// src/components/bespoke/framework-universe/FrameworkUniverse.wiring.test.tsx
//
// Phase 4.H follow-up — verifies the `framework_universe_act_enter`
// emitter is wired to the ActSequencer scene-id mapping. Render-side
// behavior (firing on each act boundary crossing as `useFrame` ticks)
// lands in Phase 4.J with Playwright + a real Canvas.
//
// What this file proves:
//   1. `__testing.ANALYTICS_ID_BY_SCENE_ID` covers every act in
//      `__testing.ACT_SEQUENCE` — no scene id can silently drop off the
//      mapping (a regression would emit `undefined` as act_id).
//   2. Every mapped UniverseActId is a known enum member — so a typo in
//      the canonical id is caught at the unit layer rather than at GA4
//      ingest time.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { __testing } from './FrameworkUniverse';
import type { UniverseActId } from '../../../lib/framework-universe-analytics';

const VALID_ANALYTICS_IDS: readonly UniverseActId[] = [
  'I_threshold',
  'II_emergence',
  'III_architecture',
  'IV_gate_firings',
  'V_measurement',
  'VI_legacy',
] as const;

test('ActSequencer: every act in ACT_SEQUENCE has an ANALYTICS_ID_BY_SCENE_ID entry', () => {
  for (const act of __testing.ACT_SEQUENCE) {
    const mapped = __testing.ANALYTICS_ID_BY_SCENE_ID[act.id];
    assert.ok(
      mapped,
      `scene id "${act.id}" must have a canonical UniverseActId mapping`,
    );
  }
});

test('ActSequencer: every mapped UniverseActId is a known enum member', () => {
  for (const [sceneId, analyticsId] of Object.entries(
    __testing.ANALYTICS_ID_BY_SCENE_ID,
  )) {
    assert.ok(
      VALID_ANALYTICS_IDS.includes(analyticsId),
      `${sceneId} → ${analyticsId} must be a valid UniverseActId`,
    );
  }
});

test('ActSequencer: ANALYTICS_ID_BY_SCENE_ID size matches ACT_SEQUENCE length (no extras, no gaps)', () => {
  const sceneIdsInSequence = new Set(__testing.ACT_SEQUENCE.map((a) => a.id));
  const sceneIdsInMap = new Set(Object.keys(__testing.ANALYTICS_ID_BY_SCENE_ID));
  assert.equal(
    sceneIdsInSequence.size,
    sceneIdsInMap.size,
    'mapping size must equal ACT_SEQUENCE length',
  );
  for (const id of sceneIdsInSequence) {
    assert.ok(sceneIdsInMap.has(id), `mapping must include scene id "${id}"`);
  }
});
