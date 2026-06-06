// src/components/bespoke/framework-universe/scenes/scenes-analytics.test.tsx
//
// Phase 4.H follow-up — verifies the analytics props introduced by the
// HoverCard wiring (PR #201) are actually passed through from the
// scene-level call-sites in Act 3 + Act 4.
//
// Without these props, the just-merged emitter is a silent seam — it
// compiles, the unit tests pass, but `framework_universe_label_hover`
// never fires because the `if (analyticsActId && ...)` guard inside
// HoverCard short-circuits.
//
// At this layer (no R3F render) we verify by source-grep that the
// canonical analytics-prop set is present on every HoverCard in the
// scene tree. Render-side firing on real pointer events lands in
// Phase 4.J with Playwright.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface CallSite {
  file: string;
  expectedActId: string;
  expectedLabelKind: string;
}

const SCENE_CALL_SITES: readonly CallSite[] = [
  {
    file: 'Act3-Architecture.tsx',
    expectedActId: 'III_architecture',
    expectedLabelKind: 'pattern',
  },
  {
    file: 'Act4-GateFirings.tsx',
    expectedActId: 'IV_gate_firings',
    expectedLabelKind: 'gate_firing',
  },
];

for (const site of SCENE_CALL_SITES) {
  test(`${site.file}: HoverCard call-site supplies analyticsActId="${site.expectedActId}"`, () => {
    const src = readFileSync(join(__dirname, site.file), 'utf8');
    // The grep needs to be tolerant of either single-line or multi-line
    // JSX — the source uses both styles, so we check for the substring
    // anywhere in the file rather than asserting against a tight regex.
    assert.ok(
      src.includes(`analyticsActId="${site.expectedActId}"`),
      `${site.file} must pass analyticsActId="${site.expectedActId}" to HoverCard`,
    );
  });

  test(`${site.file}: HoverCard call-site supplies analyticsLabelKind="${site.expectedLabelKind}"`, () => {
    const src = readFileSync(join(__dirname, site.file), 'utf8');
    assert.ok(
      src.includes(`analyticsLabelKind="${site.expectedLabelKind}"`),
      `${site.file} must pass analyticsLabelKind="${site.expectedLabelKind}" to HoverCard`,
    );
  });

  test(`${site.file}: HoverCard call-site supplies analyticsLabelId`, () => {
    const src = readFileSync(join(__dirname, site.file), 'utf8');
    assert.ok(
      src.includes('analyticsLabelId='),
      `${site.file} must pass analyticsLabelId to HoverCard`,
    );
  });
}
