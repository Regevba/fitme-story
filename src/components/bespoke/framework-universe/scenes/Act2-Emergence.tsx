/**
 * Act2-Emergence.tsx — Act II of the 3D Universe walkthrough.
 *
 * Phase 4.C / T-act2-emergence.
 *
 * Scene narrative: framework evolves from v1.0 → v5.0. Building on the
 * level-1 "Shared State" slab from Act I, four new chambers ascend from
 * below in staggered succession, each representing a framework era:
 *
 *   - Level 2 (emerald)  — Skills + Cache         (v2-v4 era, hub-and-spoke)
 *   - Level 3 (amber)    — v5.0 SoC-on-Software   (reclaim context)
 *   - Level 4 (coral)    — v5.1 Adaptive Batch    (throughput primitives)
 *   - Level 5 (pink)     — v5.2 Dispatch Intelligence (parallel write safety)
 *
 * Title: "v5.0 — Phase Discipline Emerges".
 *
 * Like Act I, no live data binding — Act II is still establishing
 * narrative (Act III onwards introduces the typed loader). The minimal
 * tie to `frameworkVersions` is for verifying the snapshot pipeline is
 * wired before Act III needs it for real binding.
 *
 * Composition:
 *   - Terrain (primitive)        — base slab (reused from Act I narrative)
 *   - Chamber × 5 (primitive)    — levels 1-5, level 1 already settled,
 *                                  levels 2-5 staggered fly-in
 *   - Signage (primitive)        — per-chamber labels + scene title
 *   - Lighting                   — slightly warmer than Act I's neutral
 *
 * Motion:
 *   - Each ascending chamber has flyInTick with a 0.4s stagger so the
 *     scene reads as deliberate construction, not chaotic appearance
 *   - Delay sequence: 0.0s, 0.4s, 0.8s, 1.2s (level 2, 3, 4, 5)
 *   - flyInTick duration 1.5s each → all chambers settled by ~2.7s
 *
 * Default act duration: 6 seconds (slightly longer than Act I to let
 * the eye trace the level-by-level ascent).
 */

'use client';

import { memo } from 'react';
import { Chamber } from '../primitives/Chamber';
import { Terrain } from '../primitives/Terrain';
import { Signage } from '../primitives/Signage';
import { flyInTick } from '../../../../lib/motion-3d/primitives';
import { frameworkVersions } from '../../../../lib/framework-snapshot';
import type { ActProps } from './types';

// Per-level chamber config. Matches the 8-region accent palette in
// `src/components/bespoke/blueprint-data.ts` levels 1-5. The y-coordinate
// places each chamber stacked on top of the previous; the x-staggering
// lets all 5 read as a single architectural "stack" from the front.
interface ChamberSlot {
  level: 1 | 2 | 3 | 4 | 5;
  accent: string;
  label: string;
  /** Final destination position [x, y, z]. */
  to: [number, number, number];
  size: [number, number, number];
  /** Fly-in delay relative to act start. 0 = already settled. */
  delaySec: number;
}

const SHARED_FLY_IN_DURATION_SEC = 1.5;
const STAGGER_SEC = 0.4;
const FLY_IN_START_Y_OFFSET = 8;

// Level 1 — Shared State (from Act I; carried into Act II as the base).
const LEVEL_1: ChamberSlot = {
  level: 1,
  accent: '#4F46E5',
  label: 'Shared State',
  to: [0, 0, 0],
  size: [4, 2.5, 4],
  delaySec: 0, // already settled at scene start
};

// Levels 2-5 ascend in staggered succession.
const ASCENDING_SLOTS: readonly ChamberSlot[] = [
  {
    level: 2,
    accent: '#10B981',
    label: 'Skills + Cache',
    to: [0, 2.6, 0],
    size: [3.6, 1.8, 3.6],
    delaySec: 0 * STAGGER_SEC,
  },
  {
    level: 3,
    accent: '#F59E0B',
    label: 'v5.0 SoC',
    to: [0, 4.5, 0],
    size: [3.3, 1.6, 3.3],
    delaySec: 1 * STAGGER_SEC,
  },
  {
    level: 4,
    accent: '#F97066',
    label: 'v5.1 Adaptive Batch',
    to: [0, 6.2, 0],
    size: [3.0, 1.4, 3.0],
    delaySec: 2 * STAGGER_SEC,
  },
  {
    level: 5,
    accent: '#EC4899',
    label: 'v5.2 Dispatch',
    to: [0, 7.7, 0],
    size: [2.7, 1.3, 2.7],
    delaySec: 3 * STAGGER_SEC,
  },
] as const;

function getFlyInPosition(
  slot: ChamberSlot,
  elapsedSec: number,
): [number, number, number] {
  // Level 1 doesn't animate — it's the carried-over slab.
  if (slot.level === 1) return slot.to;
  const { position } = flyInTick({
    from: [slot.to[0], slot.to[1] + FLY_IN_START_Y_OFFSET, slot.to[2]],
    to: slot.to,
    durationSec: SHARED_FLY_IN_DURATION_SEC,
    delaySec: slot.delaySec,
    elapsedSec,
  });
  return position;
}

function Act2EmergenceImpl({ elapsedSec }: ActProps) {
  // The minimal binding to the live versions snapshot: pull the current
  // version label for the title so Act II reflects whatever framework
  // version the build was synced from. Defensive fallback to a hard
  // string keeps the act renderable on cold starts.
  const currentVersion = frameworkVersions.current?.version ?? 'v5.0';

  return (
    <>
      {/* Lighting — slightly warmer than Act I (intensity +0.1 on the
          directional, key offset slightly more to camera right) so the
          stacking chambers cast distinguishing shadows on each other. */}
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[10, 14, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Terrain />

      {/* Level 1 — already settled from Act I narrative. */}
      <Chamber
        position={LEVEL_1.to}
        size={LEVEL_1.size}
        accent={LEVEL_1.accent}
        labelChild={<Signage text={LEVEL_1.label} fontSize={0.3} />}
      />

      {/* Levels 2-5 — staggered ascent. */}
      {ASCENDING_SLOTS.map((slot) => (
        <Chamber
          key={slot.level}
          position={getFlyInPosition(slot, elapsedSec)}
          size={slot.size}
          accent={slot.accent}
          labelChild={<Signage text={slot.label} fontSize={0.28} />}
        />
      ))}

      {/* Title above the stack. */}
      <Signage
        text={`${currentVersion} — Phase Discipline Emerges`}
        position={[0, 10.5, 0]}
        fontSize={0.55}
      />
    </>
  );
}

export const Act2Emergence = memo(Act2EmergenceImpl);
