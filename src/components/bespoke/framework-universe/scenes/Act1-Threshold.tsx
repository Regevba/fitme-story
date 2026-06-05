/**
 * Act1-Threshold.tsx — Act I of the 3D Universe walkthrough.
 *
 * Phase 4.C / T-act1-threshold.
 *
 * Scene narrative: framework v1.0 emerges. The Universe starts empty
 * (just terrain), then the first foundational chamber — "Shared State"
 * (level 1, the load-bearing slab) — flies in from above and settles.
 * Signage anchors the moment in framework time: "v1.0 — Genesis".
 *
 * No live data binding here (per PRD): Act I is the establishing shot.
 * Act II onwards introduces phase-discipline emergence, and from Act III
 * onwards the framework-snapshot data drives the composition.
 *
 * Composition:
 *   - Terrain (primitive)         — the slab
 *   - Chamber × 1 (primitive)     — Shared State, level 1
 *   - Signage (primitive)         — "v1.0 — Genesis" label
 *   - Lighting                    — ambient + directional with soft shadows
 *
 * Motion:
 *   - flyInTick over 1.5s        — chamber descends from y=8 → y=0
 *   - delaySec=0.3                — small breath before motion starts
 *
 * Default act duration: 5 seconds (enough to read the title + see the
 * chamber settle + leave a moment of stillness before Act II starts).
 */

'use client';

import { memo } from 'react';
import { Chamber } from '../primitives/Chamber';
import { Terrain } from '../primitives/Terrain';
import { Signage } from '../primitives/Signage';
import { flyInTick } from '../../../../lib/motion-3d/primitives';
import type { ActProps } from './types';

// Constants pulled from the level-1 accent in blueprint-data.ts — keeps
// Act I in step with the rest of the Universe's color story.
const SHARED_STATE_ACCENT = '#4F46E5';
const CHAMBER_SIZE: [number, number, number] = [4, 2.5, 4];
const CHAMBER_DEST: [number, number, number] = [0, 0, 0];
const CHAMBER_START: [number, number, number] = [0, 8, 0];
const FLY_IN_DELAY_SEC = 0.3;
const FLY_IN_DURATION_SEC = 1.5;

function Act1ThresholdImpl({ elapsedSec }: ActProps) {
  // Chamber fly-in: compute current position via the Phase 4.B motion
  // primitive. Pure function; no React state. Re-evaluated on every
  // `useFrame` tick by the parent.
  const { position: chamberPos } = flyInTick({
    from: CHAMBER_START,
    to: CHAMBER_DEST,
    durationSec: FLY_IN_DURATION_SEC,
    delaySec: FLY_IN_DELAY_SEC,
    elapsedSec,
  });

  return (
    <>
      {/* Lighting — bright Pixar-tech mood per FR-2.
          Soft shadow via shadow-map-size sized for performance + quality. */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Base terrain. */}
      <Terrain />

      {/* The level-1 chamber — Shared State, the framework's load-bearing
          slab. Fly-in motion gives the scene a moment of arrival. */}
      <Chamber
        position={chamberPos}
        size={CHAMBER_SIZE}
        accent={SHARED_STATE_ACCENT}
        labelChild={<Signage text="Shared State" fontSize={0.32} />}
      />

      {/* Top-of-scene title. Positioned high so it reads even before the
          chamber lands. */}
      <Signage
        text="v1.0 — Genesis"
        position={[0, 5.5, 0]}
        fontSize={0.5}
      />
    </>
  );
}

export const Act1Threshold = memo(Act1ThresholdImpl);
