/**
 * Act4-GateFirings.tsx — Act IV of the 3D Universe walkthrough.
 *
 * Phase 4.C / T-act4-gate-firings.
 *
 * Scene narrative: framework's gates fire under real telemetry. The
 * stable 8-chamber architecture from Act III remains as the scaffold,
 * and around it, **gate-firing emitters pulse** to represent the
 * mechanical enforcement events captured in
 * `src/data/integrity/gate-coverage-ft2.jsonl`.
 *
 * Each emitter:
 *   - Sits at a deliberate position around the architecture stack
 *   - Pulses opacity + scale via `pulseEmitTick` from Phase 4.B
 *   - Carries a `data-pr-id` (AC-10) and `data-pattern-id` (AC-11)
 *     anchor — read by Phase 4.E hover-card overlay
 *   - Shows a small label with the gate ID
 *
 * **AC-10 (PR-ID link)** and **AC-11 (pattern title hover)** are
 * activated by the Phase 4.E `T-overlay-wiring` + `T-pr-link-click`
 * tasks. Act IV ships the *visual surfaces + anchor data* those
 * tasks consume.
 *
 * Title: "v7.9 — Gates Enforce".
 *
 * Composition:
 *   - Reuse the 8-chamber stack from Act III (settled, no animation)
 *   - 5 representative gate-firing emitters spaced around the stack
 *   - Per-emitter pulsing animation via Phase 4.B motion primitives
 *   - Per-emitter pattern annotation (AC-11 anchor)
 *
 * Curated firings (for ship; full streaming loader is T-overlay-wiring):
 *   - W34   — PR cache window truncation        (this session, FT2 #631)
 *   - W30   — Q6 PR-list parity parser quirk    (FT2 #624, dur-fix #637)
 *   - W31   — Workflow delivery anomaly         (FT2 #623, dur-fix #637)
 *   - W32   — Single-phase auto-skip            (FT2 #624, dur-fix #637)
 *   - W11.b — Cron context phantom findings     (FT2 #621/#622)
 *
 * Default act duration: 8 seconds (longer than prior acts so the eye
 * can track multiple pulse cycles on each emitter).
 */

'use client';

import { memo, useMemo } from 'react';
import { Chamber } from '../primitives/Chamber';
import { Terrain } from '../primitives/Terrain';
import { Signage } from '../primitives/Signage';
import { HoverCard } from '../primitives/HoverCard';
import { pulseEmitTick } from '../../../../lib/motion-3d/primitives';
import { patternById } from '../../../../lib/framework-snapshot';
import type { ActProps } from './types';

// ─── Curated representative gate firings ────────────────────────────────
//
// Each firing represents a real observed event from the v7.9.1 build
// window or its predecessors. The PR numbers link to the closure PR
// in FitTracker2; the pattern_id is the W-pattern from the
// observed-patterns catalog whose remediation closed the firing class.

interface GateFiring {
  /** Pattern/W-ID that this firing represents. Used for AC-11 hover lookup. */
  patternId: string;
  /** Gate name as it appears in the framework gate catalog. */
  gateName: string;
  /** FT2 PR number where the durable fix landed. AC-10 anchor. */
  prNumber: number;
  /** World-space position [x, y, z]. */
  position: [number, number, number];
  /** Pulse period in seconds (slightly varied so emitters don't sync). */
  periodSec: number;
  /** Accent color matching the framework version that introduced the gate. */
  accent: string;
}

const FIRINGS: readonly GateFiring[] = [
  {
    patternId: 'W34',
    gateName: 'PR_CACHE_WINDOW',
    prNumber: 631,
    position: [5.0, 1.5, 3.0],
    periodSec: 1.4,
    accent: '#06B6D4', // v7.8 cyan
  },
  {
    patternId: 'W30',
    gateName: 'Q6_PARSER',
    prNumber: 637,
    position: [-5.0, 1.5, 3.0],
    periodSec: 1.6,
    accent: '#0EA5E9', // v7.7 sky
  },
  {
    patternId: 'W31',
    gateName: 'WORKFLOW_DELIVERY',
    prNumber: 637,
    position: [5.0, 4.5, -3.0],
    periodSec: 1.8,
    accent: '#06B6D4',
  },
  {
    patternId: 'W32',
    gateName: 'SINGLE_PHASE_SKIP',
    prNumber: 637,
    position: [-5.0, 4.5, -3.0],
    periodSec: 1.5,
    accent: '#0EA5E9',
  },
  {
    patternId: 'W11',
    gateName: 'CRON_CONTEXT',
    prNumber: 624,
    position: [0, 7.5, -4.0],
    periodSec: 1.7,
    accent: '#A855F7', // v6.0 purple (cron sat across multiple eras)
  },
] as const;

// ─── Reuse Act III's settled-chamber stack (no animation in Act IV) ─────

interface ChamberSlot {
  level: number;
  accent: string;
  label: string;
  to: [number, number, number];
  size: [number, number, number];
}

const STACK_SLOTS: readonly ChamberSlot[] = [
  { level: 1, accent: '#4F46E5', label: 'Shared State',         to: [0, 0,   0],  size: [4.0, 2.5, 4.0] },
  { level: 2, accent: '#10B981', label: 'Skills + Cache',       to: [0, 2.6, 0],  size: [3.6, 1.8, 3.6] },
  { level: 3, accent: '#F59E0B', label: 'v5.0 SoC',             to: [0, 4.5, 0],  size: [3.3, 1.6, 3.3] },
  { level: 4, accent: '#F97066', label: 'v5.1 Adaptive Batch',  to: [0, 6.2, 0],  size: [3.0, 1.4, 3.0] },
  { level: 5, accent: '#EC4899', label: 'v5.2 Dispatch',        to: [0, 7.7, 0],  size: [2.7, 1.3, 2.7] },
  { level: 6, accent: '#A855F7', label: 'v6.0 Measurement',     to: [0, 9.1, 0],  size: [2.5, 1.2, 2.5] },
  { level: 7, accent: '#0EA5E9', label: 'v7.7 Validity Closure',to: [0, 10.4, 0], size: [2.3, 1.1, 2.3] },
  { level: 8, accent: '#06B6D4', label: 'v7.8 Bridge',          to: [0, 11.6, 0], size: [2.1, 1.0, 2.1] },
] as const;

// ─── Component ──────────────────────────────────────────────────────────

interface GateFiringEmitterProps {
  firing: GateFiring;
  elapsedSec: number;
  /** Resolved title from `patternById(firing.patternId)?.title` — passed
   *  in so the parent computes it once via useMemo rather than each
   *  emitter looking it up every frame. */
  patternTitle: string | null;
}

function GateFiringEmitter({ firing, elapsedSec, patternTitle }: GateFiringEmitterProps) {
  const { opacity, scale } = pulseEmitTick({
    elapsedSec,
    periodSec: firing.periodSec,
    minOpacity: 0.3,
    maxOpacity: 1.0,
    minScale: 0.85,
    maxScale: 1.15,
  });
  // We can't directly opacity-modulate the chamber's material from
  // outside in a clean way, so the pulse is encoded as: position-stable
  // scale change on a sphere proxy + a small label that fades. The
  // sphere uses the gate's accent emissive so the pulse reads as light.
  // Phase 4.E T-overlay-wiring (2026-06-06): the inline pattern title +
  // PR ID signages are no longer rendered as floating labels because
  // they would compete visually with the hover-card content. The
  // emitter sphere + gate name signage are wrapped in <HoverCard> so
  // pointing at any of them surfaces the full pattern title +
  // remediation (AC-11) + the PR link (AC-10) in one card.
  void patternTitle; // retained in signature for API stability — no longer drawn inline
  return (
    <HoverCard
      patternId={firing.patternId}
      prNumber={firing.prNumber}
      cardYOffset={1.2}
      analyticsActId="IV_gate_firings"
      analyticsLabelKind="gate_firing"
      analyticsLabelId={firing.patternId}
    >
      <group position={firing.position} scale={[scale, scale, scale]}>
        <mesh castShadow={false}>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial
            color={firing.accent}
            emissive={firing.accent}
            emissiveIntensity={opacity * 0.5}
            transparent
            opacity={opacity}
            roughness={0.4}
            metalness={0.0}
          />
        </mesh>
        {/* Gate name label — small, just above the emitter. */}
        <Signage
          text={firing.gateName}
          position={[0, 0.7, 0]}
          fontSize={0.18}
          color="#1E293B"
          glossaryTerm={firing.patternId}
        />
      </group>
    </HoverCard>
  );
}

function Act4GateFiringsImpl({ elapsedSec }: ActProps) {
  // Precompute each firing's resolved pattern title once per act start.
  // patternById walks the array but it's small (~56 entries), so this is
  // cheap; still, doing it per frame would be wasteful.
  const firingsWithTitles = useMemo(() => {
    return FIRINGS.map((f) => ({
      firing: f,
      title: patternById(f.patternId)?.title ?? null,
    }));
  }, []);

  return (
    <>
      {/* Lighting — slightly darker than Act III to emphasize the
          emitters' glow. Cool key + minimal fill. */}
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[10, 16, 6]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        color="#F8FAFC"
      />

      <Terrain />

      {/* Full 8-chamber architecture, settled (no animation in Act IV). */}
      {STACK_SLOTS.map((slot) => (
        <Chamber
          key={slot.level}
          position={slot.to}
          size={slot.size}
          accent={slot.accent}
          labelChild={<Signage text={slot.label} fontSize={0.26} />}
        />
      ))}

      {/* Gate-firing emitters around the stack — each pulses. */}
      {firingsWithTitles.map(({ firing, title }) => (
        <GateFiringEmitter
          key={firing.patternId}
          firing={firing}
          elapsedSec={elapsedSec}
          patternTitle={title}
        />
      ))}

      {/* Title above the architecture stack. */}
      <Signage
        text="v7.9 — Gates Enforce"
        position={[0, 14.0, 0]}
        fontSize={0.55}
      />
    </>
  );
}

export const Act4GateFirings = memo(Act4GateFiringsImpl);
