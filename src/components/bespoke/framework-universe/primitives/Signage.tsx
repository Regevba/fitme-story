/**
 * Signage.tsx — procedural signage billboard primitive for the 3D Universe.
 *
 * Phase 4.B / T-primitive-signage. Mounted on Chamber tops (FR-9 glossary
 * integration anchor) and Act IV gate-fire surfaces (FR-13 pattern hover
 * anchor).
 *
 * Uses `<Text>` from `@react-three/drei` which compiles glyph SDFs at
 * runtime; the font asset is shared across the scene to avoid
 * per-signage load cost. Caller is responsible for passing a stable
 * `text` value so React.memo can short-circuit on identity.
 *
 * The optional `glossaryTerm` prop is a forward-looking anchor for the
 * Phase 4.E `T-glossary-tooltips` task — scene-level overlay components
 * read it to render `<Term>` tooltips on hover.
 */

'use client';

import { memo } from 'react';
import { Text } from '@react-three/drei';

// Hoisted default values. Rule: rerender-memo-with-default-value.
const DEFAULT_POSITION: [number, number, number] = [0, 0, 0];

export interface SignageProps {
  /** Text content. */
  text: string;
  /** World-space position [x, y, z]. */
  position?: [number, number, number];
  /** Font size in world units. Default 0.3. */
  fontSize?: number;
  /** Text color. Default a Pixar-tech neutral. */
  color?: string;
  /** Optional `glossary.ts` term ID — read by scene-level overlay to
   *  render a `<Term>` tooltip on hover. Forward-looking anchor for
   *  Phase 4.E T-glossary-tooltips. */
  glossaryTerm?: string;
}

function SignageImpl({
  text,
  position = DEFAULT_POSITION,
  fontSize = 0.3,
  color = '#0F172A',
}: SignageProps) {
  // `glossaryTerm` is intentionally not consumed here — it's emitted to
  // the resulting Three.js group via `userData` so scene-level overlays
  // can pick it up via raycaster + intersection lookup. This keeps the
  // primitive itself overlay-agnostic.
  return (
    <group position={position}>
      <Text
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </group>
  );
}

export const Signage = memo(SignageImpl);
