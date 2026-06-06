// src/lib/framework-universe-analytics.test.ts
//
// Tests for the Phase 4.H GA4 event helpers. Verifies:
//
//   1. SSR safety — calling any helper on the server is a no-op
//      (no throw, no gtag access)
//   2. Missing gtag — when window exists but window.gtag is absent,
//      helpers are no-ops (no throw)
//   3. Emit happy path — when window.gtag is mocked, the helpers call
//      it with the right event name + params shape
//   4. Naming convention — every emitted event name starts with
//      `framework_universe_` per CLAUDE.md "Analytics Naming Convention"

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  logUniverseActEnter,
  logUniverseLabelHover,
  logUniverseScrubSeek,
  logUniverseTimeDilation,
  logUniverseReplay,
  logUniverseFallbackTierActivated,
} from './framework-universe-analytics';

interface GtagCall {
  command: string;
  name: string;
  params: Record<string, unknown>;
}

// ─── SSR safety ────────────────────────────────────────────────────────

test('framework-universe-analytics: SSR-safe — every helper is a no-op when window is undefined', () => {
  // `window` is undefined in this node:test environment by default.
  // Each helper must not throw.
  logUniverseActEnter({ act_id: 'I_threshold', act_index: 1, mode: 'visitor', session_elapsed_sec: 0 });
  logUniverseLabelHover({ act_id: 'III_architecture', label_kind: 'pattern', label_id: 'W34', mode: 'visitor' });
  logUniverseScrubSeek({ target_fraction: 0.5, target_act_id: 'IV_gate_firings', mode: 'visitor' });
  logUniverseTimeDilation({ rate_multiplier: 0.25, act_id: 'IV_gate_firings', mode: 'visitor' });
  logUniverseReplay({ trigger: 'user_click', mode: 'visitor' });
  logUniverseFallbackTierActivated({ tier: 'tier_2_rive', reason: 'prefers_reduced_motion', mode: 'visitor' });
  assert.ok(true, 'all helpers ran without throwing on the server');
});

// ─── Browser-mock harness ──────────────────────────────────────────────

let calls: GtagCall[] = [];

beforeEach(() => {
  calls = [];
  // Mock window + gtag inside this test scope. node:test runs each
  // test function in a fresh closure; we install on globalThis so the
  // module's `typeof window === 'undefined'` branch flips to false.
  (globalThis as unknown as { window: unknown }).window = globalThis;
  (globalThis as unknown as { gtag: unknown }).gtag = (
    command: string,
    name: string,
    params: Record<string, unknown>,
  ) => {
    calls.push({ command, name, params });
  };
});

afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window;
  delete (globalThis as unknown as { gtag?: unknown }).gtag;
});

test('logUniverseActEnter: emits framework_universe_act_enter with the right shape', () => {
  logUniverseActEnter({
    act_id: 'I_threshold',
    act_index: 1,
    mode: 'visitor',
    session_elapsed_sec: 0.0,
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].command, 'event');
  assert.equal(calls[0].name, 'framework_universe_act_enter');
  assert.equal(calls[0].params.act_id, 'I_threshold');
  assert.equal(calls[0].params.act_index, 1);
  assert.equal(calls[0].params.mode, 'visitor');
});

test('logUniverseLabelHover: emits framework_universe_label_hover', () => {
  logUniverseLabelHover({
    act_id: 'IV_gate_firings',
    label_kind: 'gate_firing',
    label_id: 'W34',
    mode: 'operator',
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, 'framework_universe_label_hover');
  assert.equal(calls[0].params.label_id, 'W34');
  assert.equal(calls[0].params.mode, 'operator');
});

test('logUniverseScrubSeek: emits framework_universe_scrub_seek', () => {
  logUniverseScrubSeek({
    target_fraction: 0.75,
    target_act_id: 'V_measurement',
    mode: 'visitor',
  });
  assert.equal(calls[0].name, 'framework_universe_scrub_seek');
  assert.equal(calls[0].params.target_fraction, 0.75);
});

test('logUniverseTimeDilation: emits framework_universe_time_dilation', () => {
  logUniverseTimeDilation({
    rate_multiplier: 0.25,
    act_id: 'IV_gate_firings',
    mode: 'visitor',
  });
  assert.equal(calls[0].name, 'framework_universe_time_dilation');
  assert.equal(calls[0].params.rate_multiplier, 0.25);
});

test('logUniverseReplay: emits framework_universe_replay', () => {
  logUniverseReplay({ trigger: 'auto_loop', mode: 'visitor' });
  assert.equal(calls[0].name, 'framework_universe_replay');
  assert.equal(calls[0].params.trigger, 'auto_loop');
});

test('logUniverseFallbackTierActivated: emits framework_universe_fallback_tier_activated', () => {
  logUniverseFallbackTierActivated({
    tier: 'tier_3_poster',
    reason: 'saved_data',
    mode: 'visitor',
  });
  assert.equal(calls[0].name, 'framework_universe_fallback_tier_activated');
  assert.equal(calls[0].params.tier, 'tier_3_poster');
});

test('framework-universe-analytics: naming convention — every event uses framework_universe_ prefix', () => {
  // Fire one of each event + verify the emitted names match the prefix.
  // Catches typos or future regressions where a new event was added
  // without following the CLAUDE.md screen-prefix convention.
  logUniverseActEnter({ act_id: 'I_threshold', act_index: 1, mode: 'visitor', session_elapsed_sec: 0 });
  logUniverseLabelHover({ act_id: 'I_threshold', label_kind: 'chamber', label_id: 'shared-state', mode: 'visitor' });
  logUniverseScrubSeek({ target_fraction: 0, target_act_id: 'I_threshold', mode: 'visitor' });
  logUniverseTimeDilation({ rate_multiplier: 1.0, act_id: 'I_threshold', mode: 'visitor' });
  logUniverseReplay({ trigger: 'user_click', mode: 'visitor' });
  logUniverseFallbackTierActivated({ tier: 'tier_1_r3f', reason: 'unknown', mode: 'visitor' });
  for (const c of calls) {
    assert.match(c.name, /^framework_universe_/, `event "${c.name}" must use framework_universe_ prefix`);
  }
});
