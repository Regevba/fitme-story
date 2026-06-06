/**
 * Act3-Architecture.tsx — Act III of the 3D Universe walkthrough.
 *
 * Phase 4.C / T-act3-architecture.
 *
 * Scene narrative: framework architecture locks into place. Carrying
 * the level 1-5 stack from Act II, three more chambers ascend to
 * complete the 8-region architecture:
 *
 *   - Level 6 (purple)  — v6.0 Measurement (instrumentation overlay)
 *   - Level 7 (sky)     — v7.7 Validity Closure (mechanical enforcement)
 *   - Level 8 (cyan)    — v7.8 Bridge to v7.9 (observability + advisory)
 *
 * **First scene with live pattern-overlay binding (FR-13)**. Each
 * ascending chamber displays its associated observed-patterns IDs as
 * scene annotations, looked up via the snapshot loader's
 * `patternsForSkill` helper. This proves out the pattern-overlay
 * dual-use loop documented in PRD §3a — the same map that drives
 * `make skill-preflight` SKILL.md annotations now drives the scene.
 *
 * Title: "v7.5 — Architecture Locks In" (last enforced-gates baseline
 * before v7.9 promotion).
 *
 * Composition:
 *   - Terrain                      — base slab carried from Acts I + II
 *   - Chamber × 8 (primitive)      — full stack (levels 1-5 settled,
 *                                    levels 6-8 stagger fly-in)
 *   - Signage (primitive)          — per-chamber labels + pattern
 *                                    annotation pills + scene title
 *   - Lighting                     — cool key + warm fill, mood per FR-2
 *
 * Motion:
 *   - Levels 6, 7, 8 fly in with 0.5s stagger (levels 1-5 stay put)
 *   - flyInTick duration 1.5s; all settled by ~2.5s
 *
 * Default act duration: 7 seconds.
 */

'use client';

import { memo, useMemo } from 'react';
import { Chamber } from '../primitives/Chamber';
import { Terrain } from '../primitives/Terrain';
import { Signage } from '../primitives/Signage';
import { flyInTick } from '../../../../lib/motion-3d/primitives';
import { patternsForSkill } from '../../../../lib/framework-snapshot';
import type { ActProps } from './types';

// ─── Layout constants ───────────────────────────────────────────────────

const FLY_IN_DURATION_SEC = 1.5;
const STAGGER_SEC = 0.5;
const FLY_IN_START_Y_OFFSET = 8;

interface ChamberSlot {
  level: number;
  accent: string;
  label: string;
  to: [number, number, number];
  size: [number, number, number];
  /** Fly-in delay relative to act start. 0 = already settled. */
  delaySec: number;
  /** Optional skill tag for pattern-overlay lookup. Levels 6-8 (the
   *  architectural chambers introduced in this act) use this; the
   *  carried-over levels 1-5 don't display annotations to avoid
   *  visual clutter. */
  skillForOverlay?: string;
}

// Levels 1-5: carried over from Act II (settled, no fly-in, no overlay).
const SETTLED_SLOTS: readonly ChamberSlot[] = [
  { level: 1, accent: '#4F46E5', label: 'Shared State',         to: [0, 0,   0], size: [4.0, 2.5, 4.0], delaySec: 0 },
  { level: 2, accent: '#10B981', label: 'Skills + Cache',       to: [0, 2.6, 0], size: [3.6, 1.8, 3.6], delaySec: 0 },
  { level: 3, accent: '#F59E0B', label: 'v5.0 SoC',             to: [0, 4.5, 0], size: [3.3, 1.6, 3.3], delaySec: 0 },
  { level: 4, accent: '#F97066', label: 'v5.1 Adaptive Batch',  to: [0, 6.2, 0], size: [3.0, 1.4, 3.0], delaySec: 0 },
  { level: 5, accent: '#EC4899', label: 'v5.2 Dispatch',        to: [0, 7.7, 0], size: [2.7, 1.3, 2.7], delaySec: 0 },
] as const;

// Levels 6-8: new in Act III. Each carries a `skillForOverlay` so the
// snapshot loader's pattern lookup surfaces real observed-patterns IDs
// as scene annotations (FR-13).
const ASCENDING_SLOTS: readonly ChamberSlot[] = [
  {
    level: 6,
    accent: '#A855F7',
    label: 'v6.0 Measurement',
    to: [0, 9.1, 0],
    size: [2.5, 1.2, 2.5],
    delaySec: 0 * STAGGER_SEC,
    // Measurement layer's natural skill anchor: `qa` (test discipline,
    // adoption checks) — surfaces W3 / W16 / W22-style measurement
    // patterns.
    skillForOverlay: 'qa',
  },
  {
    level: 7,
    accent: '#0EA5E9',
    label: 'v7.7 Validity Closure',
    to: [0, 10.4, 0],
    size: [2.3, 1.1, 2.3],
    delaySec: 1 * STAGGER_SEC,
    // Validity closure → `pm-workflow` skill (closure discipline,
    // phase enforcement, schema gates).
    skillForOverlay: 'pm-workflow',
  },
  {
    level: 8,
    accent: '#06B6D4',
    label: 'v7.8 Bridge',
    to: [0, 11.6, 0],
    size: [2.1, 1.0, 2.1],
    delaySec: 2 * STAGGER_SEC,
    // v7.8 Bridge → `ops` skill (observability + advisory mechanisms).
    skillForOverlay: 'ops',
  },
] as const;

const MAX_OVERLAY_PATTERNS_PER_CHAMBER = 2;

// ─── Helpers ────────────────────────────────────────────────────────────

function getFlyInPosition(
  slot: ChamberSlot,
  elapsedSec: number,
): [number, number, number] {
  if (slot.delaySec === 0 && (slot.level <= 5)) return slot.to;
  const { position } = flyInTick({
    from: [slot.to[0], slot.to[1] + FLY_IN_START_Y_OFFSET, slot.to[2]],
    to: slot.to,
    durationSec: FLY_IN_DURATION_SEC,
    delaySec: slot.delaySec,
    elapsedSec,
  });
  return position;
}

// ─── Component ──────────────────────────────────────────────────────────

function Act3ArchitectureImpl({ elapsedSec }: ActProps) {
  // Precompute per-chamber pattern annotations. Snapshot loader is
  // static (build-time JSON imports) so this is a stable, render-cheap
  // memo — keyed only on the slot identity (which never changes within
  // the act). Re-running per frame would be wasteful.
  const overlayAnnotations = useMemo(() => {
    return ASCENDING_SLOTS.map((slot) => {
      if (!slot.skillForOverlay) return { level: slot.level, ids: [] as string[] };
      const patterns = patternsForSkill(slot.skillForOverlay);
      return {
        level: slot.level,
        ids: patterns.slice(0, MAX_OVERLAY_PATTERNS_PER_CHAMBER).map((p) => p.id),
      };
    });
  }, []);

  return (
    <>
      {/* Lighting — cool key + warm fill per FR-2. */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 16, 6]}
        intensity={1.25}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        color="#FFFAF0"
      />
      <directionalLight
        position={[-6, 8, -4]}
        intensity={0.35}
        color="#BFDBFE"
      />

      <Terrain />

      {/* Carried-over chambers: levels 1-5, settled. */}
      {SETTLED_SLOTS.map((slot) => (
        <Chamber
          key={slot.level}
          position={slot.to}
          size={slot.size}
          accent={slot.accent}
          labelChild={<Signage text={slot.label} fontSize={0.28} />}
        />
      ))}

      {/* New chambers: levels 6-8, stagger fly-in + pattern-overlay
          annotations. */}
      {ASCENDING_SLOTS.map((slot, i) => {
        const position = getFlyInPosition(slot, elapsedSec);
        const overlay = overlayAnnotations[i];
        // Offset the pattern annotations to the right of the chamber so
        // they don't overlap the level label (which sits on the top).
        const annotationX = slot.to[0] + slot.size[0] / 2 + 0.6;
        return (
          <group key={slot.level}>
            <Chamber
              position={position}
              size={slot.size}
              accent={slot.accent}
              labelChild={<Signage text={slot.label} fontSize={0.26} />}
            />
            {/* Pattern overlay annotations — one signage per pattern ID,
                stacked vertically next to the chamber. */}
            {overlay.ids.map((id, idx) => (
              <Signage
                key={id}
                text={id}
                position={[annotationX, position[1] + (idx - (overlay.ids.length - 1) / 2) * 0.4, slot.to[2]]}
                fontSize={0.2}
                color="#475569"
                glossaryTerm={id}
              />
            ))}
          </group>
        );
      })}

      {/* Title above the completed stack. */}
      <Signage
        text="v7.5 — Architecture Locks In"
        position={[0, 14.0, 0]}
        fontSize={0.55}
      />
    </>
  );
}

export const Act3Architecture = memo(Act3ArchitectureImpl);
