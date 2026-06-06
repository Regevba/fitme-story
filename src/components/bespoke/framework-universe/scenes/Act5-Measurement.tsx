/**
 * Act5-Measurement.tsx — Act V of the 3D Universe walkthrough.
 *
 * Phase 4.C / T-act5-measurement.
 *
 * Scene narrative: the v6.0 Measurement layer becomes the
 * instrumentation surface for the framework's own adoption. The
 * architecture stack from Act IV remains visible in the background;
 * in front of it, **4 vertical bars rise from zero** representing the
 * post-v6 adoption percentage for each instrumentation dimension:
 *
 *   1. timing_wall_time   — wall-clock duration captured
 *   2. per_phase_timing   — per-phase start/end timestamps captured
 *   3. cache_hits         — cache_hits[] populated by Mechanism C
 *   4. cu_v2              — complexity / cu_v2 factor block populated
 *
 * Real percentages pulled from `adoption-snapshot.json` via the Phase 4.A
 * snapshot loader. Each bar's height is interpolated from zero to its
 * actual percentage using `flyInTick` so the act reads as a
 * progressive reveal.
 *
 * Title: "v6.0 — Measurement (post-V6 adoption)".
 *
 * Composition:
 *   - Terrain                       — base slab
 *   - Chamber × 8 (settled stack)   — Acts I-IV background carry-over
 *   - 4 AdoptionBar instances       — bars rise from zero
 *   - Per-bar Signage               — dimension name + live percentage
 *   - Title Signage
 *
 * Motion:
 *   - Each bar rises with `flyInTick` (height interpolation)
 *   - 0.4s stagger between bars so they read as sequential reveal
 *   - 1.6s rise duration per bar → all 4 settled by ~3s
 *
 * Default act duration: 7 seconds.
 */

'use client';

import { memo, useMemo } from 'react';
import { Chamber } from '../primitives/Chamber';
import { Terrain } from '../primitives/Terrain';
import { Signage } from '../primitives/Signage';
import { flyInTick } from '../../../../lib/motion-3d/primitives';
import { adoptionSnapshot } from '../../../../lib/framework-snapshot';
import type { ActProps } from './types';

// ─── Per-dimension bar config ──────────────────────────────────────────

interface AdoptionBarConfig {
  /** Key in `adoptionSnapshot.dimension_coverage` to read from. */
  key: 'timing_wall_time' | 'per_phase_timing' | 'cache_hits' | 'cu_v2';
  label: string;
  /** x-position offset for the bar. */
  x: number;
  /** Accent color — uses the v6.0 purple as the canonical Measurement
   *  layer color, with each bar getting a slight hue variation so they
   *  read as 4 distinct surfaces rather than a uniform stripe. */
  color: string;
  /** Fly-in delay relative to act start. */
  delaySec: number;
}

const BAR_FLY_IN_DURATION_SEC = 1.6;
const BAR_STAGGER_SEC = 0.4;
const MAX_BAR_HEIGHT = 6.0;
const BAR_WIDTH = 0.8;
const BAR_DEPTH = 0.8;
const BAR_BASE_Y = -1.0; // sit below the terrain so they look anchored

const BARS: readonly AdoptionBarConfig[] = [
  { key: 'timing_wall_time', label: 'wall_time',        x: -3.6, color: '#7E22CE', delaySec: 0 * BAR_STAGGER_SEC },
  { key: 'per_phase_timing', label: 'per_phase_timing', x: -1.2, color: '#A855F7', delaySec: 1 * BAR_STAGGER_SEC },
  { key: 'cache_hits',       label: 'cache_hits',       x:  1.2, color: '#C084FC', delaySec: 2 * BAR_STAGGER_SEC },
  { key: 'cu_v2',            label: 'cu_v2',            x:  3.6, color: '#D8B4FE', delaySec: 3 * BAR_STAGGER_SEC },
] as const;

// ─── 8-chamber stack (carry-over from Acts III + IV) ───────────────────

interface ChamberSlot {
  level: number;
  accent: string;
  label: string;
  to: [number, number, number];
  size: [number, number, number];
}

const STACK_SLOTS: readonly ChamberSlot[] = [
  { level: 1, accent: '#4F46E5', label: 'Shared State',          to: [0, 0,    0], size: [4.0, 2.5, 4.0] },
  { level: 2, accent: '#10B981', label: 'Skills + Cache',        to: [0, 2.6,  0], size: [3.6, 1.8, 3.6] },
  { level: 3, accent: '#F59E0B', label: 'v5.0 SoC',              to: [0, 4.5,  0], size: [3.3, 1.6, 3.3] },
  { level: 4, accent: '#F97066', label: 'v5.1 Adaptive Batch',   to: [0, 6.2,  0], size: [3.0, 1.4, 3.0] },
  { level: 5, accent: '#EC4899', label: 'v5.2 Dispatch',         to: [0, 7.7,  0], size: [2.7, 1.3, 2.7] },
  { level: 6, accent: '#A855F7', label: 'v6.0 Measurement',      to: [0, 9.1,  0], size: [2.5, 1.2, 2.5] },
  { level: 7, accent: '#0EA5E9', label: 'v7.7 Validity Closure', to: [0, 10.4, 0], size: [2.3, 1.1, 2.3] },
  { level: 8, accent: '#06B6D4', label: 'v7.8 Bridge',           to: [0, 11.6, 0], size: [2.1, 1.0, 2.1] },
] as const;

// ─── Snapshot read helper ──────────────────────────────────────────────

/** Reads the post-v6 percentage for a given dimension from the adoption
 *  snapshot. The snapshot loader intentionally under-types the wider
 *  surface (per Phase 4.A design intent), so we narrow inside the scene
 *  to the specific shape Act V consumes. Defensive fallback: 0 if the
 *  field is absent at cold-start. */
function readPostV6Percent(key: string): number {
  const coverage = adoptionSnapshot.dimension_coverage as
    | Record<string, { post_v6_percent?: number } | undefined>
    | undefined;
  const dim = coverage?.[key];
  if (typeof dim?.post_v6_percent === 'number') return dim.post_v6_percent;
  return 0;
}

// ─── Component ──────────────────────────────────────────────────────────

interface AdoptionBarProps {
  config: AdoptionBarConfig;
  /** Target height (the fully-extended bar height for this dimension). */
  targetHeight: number;
  elapsedSec: number;
}

function AdoptionBar({ config, targetHeight, elapsedSec }: AdoptionBarProps) {
  // Use flyInTick to interpolate the bar's height from 0 to target.
  // Repurposing flyInTick by using its y-axis only — the from is
  // [x, BAR_BASE_Y, 0] and to is [x, BAR_BASE_Y + targetHeight, 0], so
  // the resulting `position[1]` minus BAR_BASE_Y gives the live height.
  const { position } = flyInTick({
    from: [config.x, BAR_BASE_Y, 0],
    to: [config.x, BAR_BASE_Y + targetHeight, 0],
    durationSec: BAR_FLY_IN_DURATION_SEC,
    delaySec: config.delaySec,
    elapsedSec,
  });
  const liveHeight = position[1] - BAR_BASE_Y;
  // Box position must be midpoint between base and live top so the box's
  // geometry stays anchored at BAR_BASE_Y.
  const boxCenterY = BAR_BASE_Y + liveHeight / 2;
  return (
    <group>
      {/* The rising bar itself. */}
      <mesh position={[config.x, boxCenterY, 0]} castShadow receiveShadow>
        <boxGeometry args={[BAR_WIDTH, liveHeight, BAR_DEPTH]} />
        <meshStandardMaterial
          color={config.color}
          roughness={0.5}
          metalness={0.0}
        />
      </mesh>
      {/* Label below the base. */}
      <Signage
        text={config.label}
        position={[config.x, BAR_BASE_Y - 0.5, 0]}
        fontSize={0.16}
        color="#475569"
      />
      {/* Percentage above the live top. */}
      <Signage
        text={`${targetHeight === 0 ? '—' : (targetHeight / MAX_BAR_HEIGHT * 100).toFixed(0)}%`}
        position={[config.x, BAR_BASE_Y + liveHeight + 0.35, 0]}
        fontSize={0.22}
        color={config.color}
      />
    </group>
  );
}

function Act5MeasurementImpl({ elapsedSec }: ActProps) {
  // Precompute each bar's target height from the live snapshot. Memoized
  // because the snapshot is build-time static; recomputing per frame
  // would be wasted work.
  const barsWithHeights = useMemo(() => {
    return BARS.map((b) => {
      const pct = readPostV6Percent(b.key); // 0-100
      const targetHeight = (pct / 100) * MAX_BAR_HEIGHT;
      return { config: b, targetHeight };
    });
  }, []);

  return (
    <>
      {/* Lighting — directional with slight purple tint to echo the
          v6.0 Measurement chamber's accent and tie the bars visually
          back to their conceptual origin. */}
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[8, 14, 8]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        color="#FDF4FF"
      />

      <Terrain />

      {/* 8-chamber stack — settled background. Pushed back on z so the
          bars are clearly the foreground subject. */}
      {STACK_SLOTS.map((slot) => (
        <Chamber
          key={slot.level}
          position={[slot.to[0], slot.to[1], slot.to[2] - 6.0]}
          size={slot.size}
          accent={slot.accent}
          labelChild={<Signage text={slot.label} fontSize={0.22} />}
        />
      ))}

      {/* Foreground: 4 adoption bars. */}
      {barsWithHeights.map(({ config, targetHeight }) => (
        <AdoptionBar
          key={config.key}
          config={config}
          targetHeight={targetHeight}
          elapsedSec={elapsedSec}
        />
      ))}

      {/* Title above the bars. */}
      <Signage
        text="v6.0 — Measurement (post-V6 adoption)"
        position={[0, 7.0, 0]}
        fontSize={0.5}
      />
    </>
  );
}

export const Act5Measurement = memo(Act5MeasurementImpl);
