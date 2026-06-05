/**
 * FrameworkUniverse.tsx — entry component for the 3D Universe walkthrough.
 *
 * Phase 4.G / T-route-framework. Composes the 6 Phase 4.C acts into a
 * single continuous cinematic walkthrough at `/framework`. The page
 * route at `src/app/framework/page.tsx` `next/dynamic` imports this
 * component with `ssr: false` so the R3F + Three.js stack never lands
 * in the main-bundle JS.
 *
 * Act sequencing:
 *   - Acts play in canonical order (I → II → III → IV → V → VI)
 *   - Each act has a `durationSec` that determines when the next
 *     act swaps in
 *   - The active act receives `elapsedSec` relative to its own start
 *   - After Act VI completes, the sequence holds on the final act's
 *     last frame
 *
 * The internal `ActSequencer` is a Canvas child so it can use
 * `useFrame` to advance the clock without re-rendering the whole
 * Canvas tree (only the active act re-renders, gated by React.memo
 * per Phase 4.B/4.C primitives).
 *
 * Camera default position: [10, 8, 12], fov 50 — a comfortable
 * isometric-ish vantage that frames the architecture stack with
 * headroom for taller scenes (Act III adds 3 chambers; Act V's bars
 * sit in front).
 *
 * Mode prop ('visitor' | 'operator') is reserved for FR-8 — operator
 * mode at `/control-room/framework` will pass the same scene tree
 * with live WebSocket telemetry overlay. For T-route-framework this
 * PR, only the visitor surface ships.
 */

'use client';

import { useState, type ComponentType } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Act1Threshold } from './scenes/Act1-Threshold';
import { Act2Emergence } from './scenes/Act2-Emergence';
import { Act3Architecture } from './scenes/Act3-Architecture';
import { Act4GateFirings } from './scenes/Act4-GateFirings';
import { Act5Measurement } from './scenes/Act5-Measurement';
import { Act6LegacyCalibration } from './scenes/Act6-LegacyCalibration';
import type { ActProps } from './scenes/types';

// ─── Act sequence ────────────────────────────────────────────────────────

interface ActDef {
  id: string;
  Component: ComponentType<ActProps>;
  durationSec: number;
}

const ACT_SEQUENCE: readonly ActDef[] = [
  { id: 'I',   Component: Act1Threshold,         durationSec: 5  },
  { id: 'II',  Component: Act2Emergence,         durationSec: 6  },
  { id: 'III', Component: Act3Architecture,      durationSec: 7  },
  { id: 'IV',  Component: Act4GateFirings,       durationSec: 8  },
  { id: 'V',   Component: Act5Measurement,       durationSec: 7  },
  { id: 'VI',  Component: Act6LegacyCalibration, durationSec: 10 },
] as const;

const TOTAL_DURATION_SEC = ACT_SEQUENCE.reduce((acc, a) => acc + a.durationSec, 0);

// ─── Sequencer (Canvas child) ────────────────────────────────────────────

function ActSequencer() {
  // Track elapsed time in React state so the active act re-renders on
  // each frame with updated `elapsedSec`. This is the only state that
  // updates per frame; React.memo on the acts means inactive ones
  // don't re-render.
  const [elapsed, setElapsed] = useState(0);

  // useFrame is R3F's animation hook — runs once per frame inside the
  // Canvas. We round to 1ms to avoid frame-rate-induced state thrash.
  useFrame(({ clock }) => {
    const t = Math.min(clock.elapsedTime, TOTAL_DURATION_SEC);
    setElapsed(Math.round(t * 1000) / 1000);
  });

  // Pick the active act + the elapsed-since-act-start value to pass it.
  let cumulative = 0;
  for (const act of ACT_SEQUENCE) {
    if (elapsed < cumulative + act.durationSec) {
      const within = elapsed - cumulative;
      const ActComponent = act.Component;
      return <ActComponent elapsedSec={within} />;
    }
    cumulative += act.durationSec;
  }
  // Past total duration — hold on the final act's last frame so the
  // grid is fully populated and stays as the final image.
  const last = ACT_SEQUENCE[ACT_SEQUENCE.length - 1];
  const LastComponent = last.Component;
  return <LastComponent elapsedSec={last.durationSec} />;
}

// ─── Public entry ────────────────────────────────────────────────────────

export interface FrameworkUniverseProps {
  /** Future FR-8 hook — operator mode at /control-room/framework will
   *  pass 'operator' to enable live WebSocket telemetry overlay. */
  mode?: 'visitor' | 'operator';
}

export function FrameworkUniverse({ mode = 'visitor' }: FrameworkUniverseProps = {}) {
  // `mode` is reserved for FR-8 operator mode; we keep it on the
  // signature so callers don't have to refactor when 4.G's operator
  // route lands. Currently unused beyond the prop guard.
  void mode;

  return (
    <Canvas
      shadows
      camera={{ position: [10, 8, 12], fov: 50 }}
      // dpr capped at 2.0 per FR-12 — performance contract for mobile.
      dpr={[1, 2]}
      // frameloop "demand" later when off-viewport per FR-12; for
      // T-route-framework's MVP the canvas is the whole page so we use
      // 'always'.
      frameloop="always"
      style={{ width: '100%', height: '100%' }}
    >
      <ActSequencer />
    </Canvas>
  );
}
