// src/components/bespoke/framework-universe/fallbacks/useFallbackTier.test.ts
//
// Unit tests for the FR-4 fallback tier detection logic. We test the
// `detectFallbackTier()` function directly (pure-ish; consumes only
// window APIs we can mock) rather than the `useFallbackTier` hook
// itself — the hook's behavior is "call detect on mount, set state",
// which is plumbing rather than logic worth a dedicated render harness.

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { detectFallbackTier } from './useFallbackTier';

// ─── Mock window harness ────────────────────────────────────────────────

interface MockWindow {
  matchMedia?: (q: string) => { matches: boolean };
  navigator: {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
    gpu?: unknown;
  };
}

beforeEach(() => {
  // Tests install window + document on globalThis to flip the
  // `typeof window === 'undefined'` branch.
  const mockNav: MockWindow['navigator'] = {};
  (globalThis as unknown as { window: MockWindow }).window = {
    matchMedia: (_q: string) => ({ matches: false }),
    navigator: mockNav,
  };
  // Document needed for canvas/WebGL2 detection.
  (globalThis as unknown as { document: { createElement: (t: string) => unknown } }).document = {
    createElement: (_t: string) => ({
      getContext: (_kind: string) => null,
    }),
  };
  // Note: we do NOT touch globalThis.navigator — node:test exposes it as
  // a getter. The source code uses `window.navigator`, which we control.
});

afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window;
  delete (globalThis as unknown as { document?: unknown }).document;
});

// ─── Tier 1 happy path (everything available) ──────────────────────────

test('detectFallbackTier: WebGPU + WebGL2 both available → Tier 1', () => {
  // Add gpu + working webgl2.
  const w = (globalThis as unknown as { window: MockWindow }).window;
  w.navigator.gpu = {};
  (globalThis as unknown as { document: { createElement: (t: string) => unknown } }).document.createElement =
    (_t: string) => ({ getContext: (k: string) => (k === 'webgl2' ? {} : null) });
  const d = detectFallbackTier();
  assert.equal(d.tier, 1);
  assert.equal(d.reason, 'tier_1_active');
});

// ─── Reduced-motion → Tier 2 ────────────────────────────────────────────

test('detectFallbackTier: prefers-reduced-motion → Tier 2', () => {
  const w = (globalThis as unknown as { window: MockWindow }).window;
  w.matchMedia = (q: string) => ({
    matches: q === '(prefers-reduced-motion: reduce)',
  });
  const d = detectFallbackTier();
  assert.equal(d.tier, 2);
  assert.equal(d.reason, 'prefers_reduced_motion');
});

// ─── Save-data → Tier 3 ────────────────────────────────────────────────

test('detectFallbackTier: navigator.connection.saveData → Tier 3', () => {
  const w = (globalThis as unknown as { window: MockWindow }).window;
  w.navigator.connection = { saveData: true };
  const d = detectFallbackTier();
  assert.equal(d.tier, 3);
  assert.equal(d.reason, 'saved_data');
});

// ─── Low memory → Tier 2 ───────────────────────────────────────────────

test('detectFallbackTier: navigator.deviceMemory < 4 → Tier 2', () => {
  const w = (globalThis as unknown as { window: MockWindow }).window;
  w.navigator.deviceMemory = 2;
  const d = detectFallbackTier();
  assert.equal(d.tier, 2);
  assert.equal(d.reason, 'low_memory');
});

test('detectFallbackTier: navigator.deviceMemory >= 4 + WebGPU absent + WebGL2 present → Tier 1 (WebGL2 path holds)', () => {
  const w = (globalThis as unknown as { window: MockWindow }).window;
  w.navigator.deviceMemory = 8;
  // WebGPU absent → gpu undefined (default). WebGL2 present.
  (globalThis as unknown as { document: { createElement: (t: string) => unknown } }).document.createElement =
    (_t: string) => ({ getContext: (k: string) => (k === 'webgl2' ? {} : null) });
  const d = detectFallbackTier();
  assert.equal(d.tier, 1, 'WebGL2 alone keeps the visitor on Tier 1 by design');
});

// ─── Neither WebGPU nor WebGL2 → Tier 3 ────────────────────────────────

test('detectFallbackTier: no WebGPU + no WebGL2 → Tier 3', () => {
  // Defaults are both unavailable.
  const d = detectFallbackTier();
  assert.equal(d.tier, 3);
  assert.equal(d.reason, 'webgl_unavailable');
});

// ─── SSR safety ────────────────────────────────────────────────────────

test('detectFallbackTier: SSR (window undefined) returns Tier 1 placeholder', () => {
  // Clear our installed mocks so window is undefined.
  delete (globalThis as unknown as { window?: unknown }).window;
  delete (globalThis as unknown as { document?: unknown }).document;
  const d = detectFallbackTier();
  assert.equal(d.tier, 1);
  assert.equal(d.reason, 'tier_1_active');
});

// ─── Cascade precedence ────────────────────────────────────────────────

test('detectFallbackTier: reduced-motion wins over save-data (a11y first)', () => {
  const w = (globalThis as unknown as { window: MockWindow }).window;
  w.matchMedia = (q: string) => ({
    matches: q === '(prefers-reduced-motion: reduce)',
  });
  w.navigator.connection = { saveData: true };
  const d = detectFallbackTier();
  assert.equal(d.tier, 2);
  assert.equal(d.reason, 'prefers_reduced_motion');
});
