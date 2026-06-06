/**
 * Act6-LegacyCalibration.tsx — Act VI of the 3D Universe walkthrough.
 *
 * Phase 4.C / T-act6-legacy. The closing scene of the cinematic
 * walkthrough.
 *
 * Scene narrative: every shipped feature stands as a monument. The
 * architecture stack from prior acts retreats into the background; the
 * foreground becomes a **monument grid** — one small chamber per
 * complete feature in the framework's history. Each monument's accent
 * color encodes the framework version that shipped it, so the grid
 * reads as a chronological mosaic of the framework's evolution.
 *
 * Data binding (FR-6, AC-6): reads
 * `framework-snapshot.featureRoster.entries` and renders one monument
 * per `status === 'complete'` entry. The roster is alphabetically
 * sorted per the locked OQ-2 contract, so monument layout is stable
 * across rebuilds.
 *
 * Title: "v7.9.1 — Every feature a monument".
 *
 * Composition:
 *   - Terrain (primitive)        — base slab
 *   - 8-chamber stack            — Acts I-V architecture, pushed back
 *                                  and slightly downscaled
 *   - Monument grid (Chamber × N) — one per complete feature; grid
 *                                  laid out in front of the stack;
 *                                  each chamber is small (cube ~0.4u)
 *   - Per-monument signage       — feature slug + framework version
 *                                  (sparse; only on hover-anchor surfaces)
 *
 * Motion:
 *   - Monuments materialize one-by-one with a tiny stagger (50ms each)
 *   - Each monument has a small flyInTick — drops from y=0.5 → 0 in 0.3s
 *   - With ~92 complete features, the materialization takes
 *     ~92 × 0.05s ≈ 4.6s
 *
 * Performance: 92 chambers + signage = up to ~270 mesh nodes. Each
 * Chamber primitive has 3 mesh children, so worst-case ~830 nodes.
 * Three.js handles this fine with shadow-mapping turned off on the
 * monuments (only the carry-over stack casts shadows).
 *
 * Default act duration: 10 seconds (longest act — gives the eye time
 * to scan the grid).
 */

'use client';

import { memo, useMemo } from 'react';
import { Chamber } from '../primitives/Chamber';
import { Terrain } from '../primitives/Terrain';
import { Signage } from '../primitives/Signage';
import { flyInTick } from '../../../../lib/motion-3d/primitives';
import { featureRoster } from '../../../../lib/framework-snapshot';
import type { ActProps } from './types';

// ─── Monument grid layout ──────────────────────────────────────────────

const MONUMENT_BASE_Y = 0.2;
const MONUMENT_SIZE: [number, number, number] = [0.5, 0.5, 0.5];
const MONUMENT_FLY_IN_DURATION_SEC = 0.3;
const MONUMENT_STAGGER_SEC = 0.05;
const MONUMENT_DROP_HEIGHT = 0.5;
const GRID_ROWS = 10;
const GRID_COL_SPACING = 1.0;
const GRID_ROW_SPACING = 1.0;
const GRID_Z_OFFSET = 4.5;
const GRID_X_OFFSET = -5.0;

/** Map a framework-version string to an accent color matching the
 *  8-region palette from blueprint-data.ts. Unknown versions get a
 *  neutral slate.
 *
 *  This is a coarse mapping — the version string in state.json can be
 *  any v-prefixed semver (v7.9.1, v7.8.6, v7.8, v6.0, etc.), so we
 *  group by major.minor and assign to the corresponding region's color.
 */
function versionToAccent(framework_version: string | null): string {
  if (!framework_version) return '#94A3B8';
  const v = framework_version.replace(/^v/, '');
  if (v.startsWith('7.9')) return '#06B6D4';       // v7.8 cyan extended to v7.9
  if (v.startsWith('7.8')) return '#06B6D4';
  if (v.startsWith('7.7')) return '#0EA5E9';
  if (v.startsWith('7.6')) return '#0EA5E9';
  if (v.startsWith('7.5')) return '#0EA5E9';
  if (v.startsWith('7.1')) return '#0EA5E9';
  if (v.startsWith('7')) return '#0EA5E9';
  if (v.startsWith('6')) return '#A855F7';         // v6.0 purple
  if (v.startsWith('5.2')) return '#EC4899';       // v5.2 pink
  if (v.startsWith('5.1')) return '#F97066';       // v5.1 coral
  if (v.startsWith('5')) return '#F59E0B';         // v5.0 amber
  if (v.startsWith('4')) return '#10B981';         // pre-v5 emerald
  return '#94A3B8';                                 // unknown
}

// ─── Background carry-over stack — pushed back + downscaled ────────────

interface ChamberSlot {
  level: number;
  accent: string;
  to: [number, number, number];
  size: [number, number, number];
}

const STACK_Z = -10.0; // way back; just a visual reference
const STACK_SCALE = 0.55;

const STACK_SLOTS: readonly ChamberSlot[] = [
  { level: 1, accent: '#4F46E5', to: [0, 0,    STACK_Z], size: [4.0 * STACK_SCALE, 2.5 * STACK_SCALE, 4.0 * STACK_SCALE] },
  { level: 2, accent: '#10B981', to: [0, 1.4,  STACK_Z], size: [3.6 * STACK_SCALE, 1.8 * STACK_SCALE, 3.6 * STACK_SCALE] },
  { level: 3, accent: '#F59E0B', to: [0, 2.5,  STACK_Z], size: [3.3 * STACK_SCALE, 1.6 * STACK_SCALE, 3.3 * STACK_SCALE] },
  { level: 4, accent: '#F97066', to: [0, 3.4,  STACK_Z], size: [3.0 * STACK_SCALE, 1.4 * STACK_SCALE, 3.0 * STACK_SCALE] },
  { level: 5, accent: '#EC4899', to: [0, 4.2,  STACK_Z], size: [2.7 * STACK_SCALE, 1.3 * STACK_SCALE, 2.7 * STACK_SCALE] },
  { level: 6, accent: '#A855F7', to: [0, 5.0,  STACK_Z], size: [2.5 * STACK_SCALE, 1.2 * STACK_SCALE, 2.5 * STACK_SCALE] },
  { level: 7, accent: '#0EA5E9', to: [0, 5.7,  STACK_Z], size: [2.3 * STACK_SCALE, 1.1 * STACK_SCALE, 2.3 * STACK_SCALE] },
  { level: 8, accent: '#06B6D4', to: [0, 6.3,  STACK_Z], size: [2.1 * STACK_SCALE, 1.0 * STACK_SCALE, 2.1 * STACK_SCALE] },
] as const;

// ─── Component ──────────────────────────────────────────────────────────

interface MonumentEntry {
  slug: string;
  framework_version: string | null;
  /** Grid cell index — drives both layout position and stagger order. */
  gridIndex: number;
  /** Resolved accent color. */
  accent: string;
}

function Act6LegacyCalibrationImpl({ elapsedSec }: ActProps) {
  // Precompute monuments: filter the alphabetically-sorted roster down
  // to complete entries, then assign grid indices. The alphabetical
  // ordering means each rebuild produces a stable layout — operators
  // can verify a specific feature stays in the same monument cell
  // across snapshots.
  const monuments = useMemo<readonly MonumentEntry[]>(() => {
    return featureRoster.entries
      .filter((e) => e.status === 'complete')
      .map((e, idx) => ({
        slug: e.slug,
        framework_version: e.framework_version,
        gridIndex: idx,
        accent: versionToAccent(e.framework_version),
      }));
  }, []);

  return (
    <>
      {/* Lighting — bright + soft. The monument grid needs even
          illumination so no monument is in shadow. The carry-over stack
          in the background reads softer per its z-distance. */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[6, 14, 8]}
        intensity={1.0}
        castShadow={false}
        color="#FFFAF0"
      />
      <directionalLight
        position={[-6, 14, 8]}
        intensity={0.7}
        castShadow={false}
        color="#FFFAF0"
      />

      <Terrain />

      {/* Background carry-over stack (no shadows; visual reference only). */}
      {STACK_SLOTS.map((slot) => (
        <Chamber
          key={slot.level}
          position={slot.to}
          size={slot.size}
          accent={slot.accent}
          castShadow={false}
        />
      ))}

      {/* Foreground monument grid. */}
      {monuments.map((m) => {
        const row = Math.floor(m.gridIndex / Math.ceil(monuments.length / GRID_ROWS));
        const col = m.gridIndex % Math.ceil(monuments.length / GRID_ROWS);
        const dst: [number, number, number] = [
          GRID_X_OFFSET + col * GRID_COL_SPACING,
          MONUMENT_BASE_Y,
          GRID_Z_OFFSET - row * GRID_ROW_SPACING,
        ];
        const start: [number, number, number] = [
          dst[0],
          dst[1] + MONUMENT_DROP_HEIGHT,
          dst[2],
        ];
        const { position: livePos } = flyInTick({
          from: start,
          to: dst,
          durationSec: MONUMENT_FLY_IN_DURATION_SEC,
          delaySec: m.gridIndex * MONUMENT_STAGGER_SEC,
          elapsedSec,
        });
        return (
          <Chamber
            key={m.slug}
            position={livePos}
            size={MONUMENT_SIZE}
            accent={m.accent}
            castShadow={false}
          />
        );
      })}

      {/* Title — closing line of the walkthrough. */}
      <Signage
        text="v7.9.1 — Every feature a monument"
        position={[0, 9.5, 0]}
        fontSize={0.55}
      />
      {/* Subtitle with monument count. */}
      <Signage
        text={`${monuments.length} complete features`}
        position={[0, 8.7, 0]}
        fontSize={0.28}
        color="#475569"
      />
    </>
  );
}

export const Act6LegacyCalibration = memo(Act6LegacyCalibrationImpl);
