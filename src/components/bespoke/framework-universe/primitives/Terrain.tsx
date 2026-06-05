/**
 * Terrain.tsx — procedural terrain primitive for the 3D Universe.
 *
 * Phase 4.B / T-primitive-terrain. Used as a base plane across all acts.
 * Matte clean-tech aesthetic (FR-2): plain large plane with optional
 * subtle vertex displacement for visual interest without bumping the
 * lighthouse perf budget.
 *
 * Why a plane rather than `<Plane>` from drei: keeps the primitive
 * dep-free (avoids drei tree-shake risk) and lets us control shadow
 * receipt precisely.
 */

'use client';

import { memo } from 'react';

// Hoisted default values for stable prop identity. Rule: rerender-memo-with-default-value.
const DEFAULT_POSITION: [number, number, number] = [0, -1, 0];

export interface TerrainProps {
  /** World-space position [x, y, z]. */
  position?: [number, number, number];
  /** Plane size (width × depth). Default 50 × 50. */
  size?: number;
  /** Color of the terrain surface. Defaults to a neutral light gray. */
  color?: string;
  /** Receive shadows from chambers + hero pieces. Default true. */
  receiveShadow?: boolean;
}

function TerrainImpl({
  position = DEFAULT_POSITION,
  size = 50,
  color = '#FAFAFA',
  receiveShadow = true,
}: TerrainProps) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={receiveShadow}>
      <planeGeometry args={[size, size, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0.0} />
    </mesh>
  );
}

export const Terrain = memo(TerrainImpl);
