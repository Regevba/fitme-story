/**
 * useFallbackTier.ts — detect the appropriate FR-4 render tier for
 * the current visitor.
 *
 * Phase 4.F / T-fallback-cascade. Per FR-4 the Universe ships in 3 tiers:
 *
 *   Tier 1 — R3F + Drei + Three.js WebGPURenderer (full 3D)
 *   Tier 2 — Rive state machine (reduced-motion + low-RAM fallback)
 *   Tier 3 — `next/image` poster frame (saved-data + no-JS)
 *
 * Detection signals + cascade order:
 *
 *   1. `prefers-reduced-motion: reduce` → Tier 2 (a11y respect)
 *   2. `navigator.connection.saveData === true` → Tier 3 (save data mode)
 *   3. `navigator.deviceMemory < 4` GB → Tier 2 (low-RAM mobile)
 *   4. WebGPU not available AND WebGL2 not available → Tier 3
 *   5. WebGPU not available BUT WebGL2 is → Tier 2 (Drei + R3F still
 *      work, but we still want degraded mode for some signal)
 *   6. Otherwise → Tier 1
 *
 * The hook is SSR-safe: returns Tier 1 on the server (since the cascade
 * only meaningfully runs client-side), then re-evaluates on hydrate.
 *
 * Returns a stable `FallbackTier` plus a `reason` enum the analytics
 * helper consumes via `logUniverseFallbackTierActivated`. Components
 * that mount the entry decide what to render per tier.
 */

'use client';

import { useEffect, useState } from 'react';

export type FallbackTier = 1 | 2 | 3;

export type FallbackReason =
  | 'tier_1_active'
  | 'prefers_reduced_motion'
  | 'low_memory'
  | 'webgpu_unavailable'
  | 'webgl_unavailable'
  | 'saved_data'
  | 'no_js'
  | 'unknown';

export interface FallbackDecision {
  tier: FallbackTier;
  reason: FallbackReason;
}

// Module-level so the default is identity-stable across renders.
const DEFAULT_TIER_1: FallbackDecision = { tier: 1, reason: 'tier_1_active' };

interface NetworkInformation {
  saveData?: boolean;
}
interface NavigatorMaybeExtended extends Navigator {
  deviceMemory?: number;
  connection?: NetworkInformation;
  // WebGPU presence is detectable via `gpu` on navigator.
  gpu?: unknown;
}

function detectWebgl2(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2'));
  } catch {
    return false;
  }
}

export function detectFallbackTier(): FallbackDecision {
  // SSR path — return Tier 1 placeholder; the client re-runs on mount.
  if (typeof window === 'undefined') return DEFAULT_TIER_1;

  // 1. prefers-reduced-motion.
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return { tier: 2, reason: 'prefers_reduced_motion' };
  }

  const nav = window.navigator as NavigatorMaybeExtended;

  // 2. Save-data → Tier 3 (poster, smallest payload).
  if (nav.connection?.saveData === true) {
    return { tier: 3, reason: 'saved_data' };
  }

  // 3. Low device memory (~mobile mid-tier or worse) → Tier 2.
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) {
    return { tier: 2, reason: 'low_memory' };
  }

  // 4 + 5. WebGPU / WebGL2 capability gating.
  const hasWebgpu = typeof nav.gpu !== 'undefined';
  const hasWebgl2 = detectWebgl2();
  if (!hasWebgpu && !hasWebgl2) {
    return { tier: 3, reason: 'webgl_unavailable' };
  }
  if (!hasWebgpu) {
    // WebGL2 fallback works for R3F too, so we COULD still render Tier 1.
    // We bump to Tier 2 only when the operator explicitly opts into a
    // conservative posture; for now, WebGL2 alone keeps us on Tier 1.
    // This branch preserved as a signal but does NOT downgrade by default.
  }
  // 6. Otherwise — Tier 1 active.
  return DEFAULT_TIER_1;
}

export function useFallbackTier(): FallbackDecision {
  const [decision, setDecision] = useState<FallbackDecision>(DEFAULT_TIER_1);
  useEffect(() => {
    setDecision(detectFallbackTier());
  }, []);
  return decision;
}
