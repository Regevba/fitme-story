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
 * Playback (T-scrub-pause-timedilation, D2): the clock is no longer the
 * raw `clock.elapsedTime`. ActSequencer keeps a delta-accumulated clock
 * driven by a shared `PlaybackControl` ref — the DOM `<Controls>` overlay
 * writes pause / rate / seek into it, and the sequencer writes `elapsed`
 * back for the progress bar. The ref channel keeps the 60fps clock inside
 * the Canvas (only the active act re-renders per frame).
 *
 * Camera default position: [10, 8, 12], fov 50 — a comfortable
 * isometric-ish vantage that frames the architecture stack with
 * headroom for taller scenes (Act III adds 3 chambers; Act V's bars
 * sit in front).
 *
 * Mode prop ('visitor' | 'operator') is reserved for FR-8 — operator
 * mode at `/control-room/framework` passes the same scene tree with
 * live WebSocket telemetry overlay.
 */

'use client';

import { useEffect, useRef, useState, type ComponentType, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Act1Threshold } from './scenes/Act1-Threshold';
import { Act2Emergence } from './scenes/Act2-Emergence';
import { Act3Architecture } from './scenes/Act3-Architecture';
import { Act4GateFirings } from './scenes/Act4-GateFirings';
import { Act5Measurement } from './scenes/Act5-Measurement';
import { Act6LegacyCalibration } from './scenes/Act6-LegacyCalibration';
import type { ActProps } from './scenes/types';
import { Controls } from './Controls';
import { createPlaybackControl, type PlaybackControl } from './playback';
import {
  logUniverseActEnter,
  type UniverseActId,
  type UniverseMode,
} from '../../../lib/framework-universe-analytics';

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

// Map scene-side act id (single char roman) → canonical GA4 UniverseActId.
const ANALYTICS_ID_BY_SCENE_ID: Record<string, UniverseActId> = {
  I: 'I_threshold',
  II: 'II_emergence',
  III: 'III_architecture',
  IV: 'IV_gate_firings',
  V: 'V_measurement',
  VI: 'VI_legacy',
};

type ActIndex1Based = 1 | 2 | 3 | 4 | 5 | 6;

const TOTAL_DURATION_SEC = ACT_SEQUENCE.reduce((acc, a) => acc + a.durationSec, 0);

// ─── Act resolution (pure) ─────────────────────────────────────────────────

interface ResolvedAct {
  sceneId: string;
  index0: number;
  withinAct: number;
}

/** Resolve the active act + within-act elapsed for an absolute elapsed value.
 *  Past total duration, pins to the final act's last frame. */
function resolveActAtElapsed(elapsed: number): ResolvedAct {
  let cumulative = 0;
  for (let i = 0; i < ACT_SEQUENCE.length; i++) {
    const act = ACT_SEQUENCE[i];
    if (elapsed < cumulative + act.durationSec) {
      return { sceneId: act.id, index0: i, withinAct: elapsed - cumulative };
    }
    cumulative += act.durationSec;
  }
  const lastIdx = ACT_SEQUENCE.length - 1;
  return {
    sceneId: ACT_SEQUENCE[lastIdx].id,
    index0: lastIdx,
    withinAct: ACT_SEQUENCE[lastIdx].durationSec,
  };
}

/** Canonical GA4 act id at an absolute elapsed value. Passed to <Controls>
 *  so scrub-seek analytics can label the destination act without the control
 *  knowing the act durations. */
export function analyticsIdAtElapsed(elapsed: number): UniverseActId {
  return ANALYTICS_ID_BY_SCENE_ID[resolveActAtElapsed(elapsed).sceneId];
}

// ─── Sequencer (Canvas child) ────────────────────────────────────────────

interface ActSequencerProps {
  mode: UniverseMode;
  /** Shared playback control channel (written by <Controls>, read here). */
  control: RefObject<PlaybackControl>;
  /** Test-injection hook — defaults to the real GA4 emitter. */
  onActEnter?: typeof logUniverseActEnter;
}

function ActSequencer({ mode, control, onActEnter = logUniverseActEnter }: ActSequencerProps) {
  // Elapsed in React state so the active act re-renders each frame; React.memo
  // on the acts means inactive ones don't. The accumulator is a ref so the
  // per-frame advance doesn't depend on the previous render's state value.
  const [elapsed, setElapsed] = useState(0);
  const accumRef = useRef(0);

  // The frame callback drives the shared PlaybackControl ref channel: it
  // consumes a one-shot `seekTo` and surfaces `elapsed` back to the DOM
  // <Controls>. Both are deliberate ref-channel writes (the documented escape
  // hatch for coordinating a 60fps loop with the DOM) which the React-Compiler
  // immutability rule can't model — scoped-disabled for the frame loop only.
  /* eslint-disable react-hooks/immutability */
  useFrame((_, delta) => {
    const ctrl = control.current;
    let next = accumRef.current;
    if (ctrl && ctrl.seekTo != null) {
      next = ctrl.seekTo;
      ctrl.seekTo = null;
    } else if (!ctrl || !ctrl.paused) {
      next += delta * (ctrl?.rate ?? 1);
    }
    next = Math.min(Math.max(next, 0), TOTAL_DURATION_SEC);
    accumRef.current = next;
    if (ctrl) ctrl.elapsed = next;
    setElapsed(Math.round(next * 1000) / 1000);
  });
  /* eslint-enable react-hooks/immutability */

  const { sceneId, index0, withinAct } = resolveActAtElapsed(elapsed);
  const activeAnalyticsId = ANALYTICS_ID_BY_SCENE_ID[sceneId];
  const activeIndex1: ActIndex1Based = (index0 + 1) as ActIndex1Based;

  // Fire framework_universe_act_enter on each act boundary crossing. Initial
  // mount fires for Act I so we capture funnel entry.
  const lastFiredActRef = useRef<UniverseActId | null>(null);
  useEffect(() => {
    if (lastFiredActRef.current === activeAnalyticsId) return;
    lastFiredActRef.current = activeAnalyticsId;
    onActEnter({
      act_id: activeAnalyticsId,
      act_index: activeIndex1,
      mode,
      session_elapsed_sec: Math.round(elapsed * 100) / 100,
    });
  }, [activeAnalyticsId, activeIndex1, mode, elapsed, onActEnter]);

  const ActComponent = ACT_SEQUENCE[index0].Component;
  return <ActComponent elapsedSec={withinAct} />;
}

// Exposed for the test harness only — exercises the analytics fan-out
// without spinning up an R3F Canvas.
export const __testing = { ANALYTICS_ID_BY_SCENE_ID, ACT_SEQUENCE, TOTAL_DURATION_SEC, resolveActAtElapsed };

// ─── Public entry ────────────────────────────────────────────────────────

export interface FrameworkUniverseProps {
  /** FR-8 hook — operator mode at /control-room/framework passes 'operator'
   *  to enable the live WebSocket telemetry overlay. */
  mode?: 'visitor' | 'operator';
}

export function FrameworkUniverse({ mode = 'visitor' }: FrameworkUniverseProps = {}) {
  const controlRef = useRef<PlaybackControl>(createPlaybackControl());

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows
        camera={{ position: [10, 8, 12], fov: 50 }}
        // dpr capped at 2.0 per FR-12 — performance contract for mobile.
        dpr={[1, 2]}
        frameloop="always"
        style={{ width: '100%', height: '100%' }}
      >
        <ActSequencer mode={mode} control={controlRef} />
      </Canvas>
      <Controls
        control={controlRef}
        totalSec={TOTAL_DURATION_SEC}
        mode={mode}
        resolveActId={analyticsIdAtElapsed}
      />
    </div>
  );
}
