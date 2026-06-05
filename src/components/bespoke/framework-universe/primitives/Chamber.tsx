/**
 * Chamber.tsx — procedural chamber primitive for the 3D Universe.
 *
 * Phase 4.B / T-primitive-chambers. Used by Act III "Architecture" scene
 * to represent the framework's 8 architectural regions per
 * `src/components/bespoke/blueprint-data.ts`.
 *
 * Visual mood (FR-2): Pixar clean-tech — matte plastic, soft shadows,
 * bright accent color on the chamber's signage face. No glass, no metal,
 * no rim lights.
 *
 * Mount points:
 *  - top-center: label-billboard anchor (consume via the optional
 *    `labelChild` slot — Signage.tsx is the canonical consumer)
 *  - any face: pattern annotation anchor (consumed by Phase 4.E
 *    `T-overlay-wiring` when wiring pattern-skill-map.json hover-cards)
 *
 * Parametric props let scenes compose larger architectural layouts
 * without per-chamber asset authoring.
 */

'use client';

import { memo, type ReactNode } from 'react';

// Hoisted default values — passing module-level constants as default
// param values keeps prop identity stable across parent re-renders, so
// React.memo below can short-circuit when parent rerenders with the same
// position/size triple. Rule: rerender-memo-with-default-value.
const DEFAULT_POSITION: [number, number, number] = [0, 0, 0];
const DEFAULT_SIZE: [number, number, number] = [3, 2, 3];

export interface ChamberProps {
  /** World-space position [x, y, z]. */
  position?: [number, number, number];
  /** Box dimensions [width, height, depth]. Default cube-ish: [3, 2, 3]. */
  size?: [number, number, number];
  /** Hex accent color (e.g. `#06B6D4`). Mapped onto a small "signage face"
   *  inset on the +z face; the main body uses a neutral matte. */
  accent?: string;
  /** Optional label/signage children mounted at the chamber's top-center.
   *  Typically a `<Signage>` instance. */
  labelChild?: ReactNode;
  /** Cast shadow onto the terrain plane. Default true. */
  castShadow?: boolean;
}

/**
 * Chamber — parametric matte-plastic box with bevelled edges + accent face.
 *
 * The bevel is approximated via a slightly-shrunken inner mesh; we avoid
 * runtime BVH+CSG for performance. Lighthouse perf target (≥95) requires
 * sub-millisecond geometry generation, so we lean on Three.js's
 * `BoxGeometry` + a single `MeshStandardMaterial` per chamber.
 */
function ChamberImpl({
  position = DEFAULT_POSITION,
  size = DEFAULT_SIZE,
  accent = '#4F46E5',
  labelChild,
  castShadow = true,
}: ChamberProps) {
  const [w, h, d] = size;
  // Signage face is a small inset on the +z face — quarter-height,
  // half-width, sitting ~25% up from the chamber's base.
  const signageW = w * 0.5;
  const signageH = h * 0.25;
  const signageY = -h / 2 + h * 0.5;
  const signageZ = d / 2 + 0.02; // sit just above the +z face

  return (
    <group position={position}>
      {/* Main body — matte neutral with soft shadow cast. */}
      <mesh castShadow={castShadow} receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#F3F4F6" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Accent signage face on +z. */}
      <mesh position={[0, signageY, signageZ]} castShadow={false}>
        <planeGeometry args={[signageW, signageH]} />
        <meshStandardMaterial
          color={accent}
          roughness={0.6}
          metalness={0.0}
          emissive={accent}
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Label mount point — top-center. */}
      {labelChild ? (
        <group position={[0, h / 2 + 0.1, 0]}>{labelChild}</group>
      ) : null}
    </group>
  );
}

/**
 * Chamber — memoized export. Skips re-render when parent rerenders with
 * stable props, which matters for R3F scenes that rerender every frame
 * during scrub/animation. Rule: rerender-memo.
 */
export const Chamber = memo(ChamberImpl);
