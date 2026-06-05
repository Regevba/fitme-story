/**
 * Shared types for 3D Universe per-act scenes.
 *
 * Phase 4.C scenes (Act1-Threshold through Act6-LegacyCalibration) all
 * accept a uniform `ActProps` shape. The parent `FrameworkUniverse`
 * timeline controller is responsible for computing `elapsedSec` from its
 * internal clock + active-act selection, and passes it to whichever act is
 * currently being rendered.
 */

export interface ActProps {
  /** Seconds elapsed since this act started rendering. Used to drive
   *  Phase 4.B motion primitives (flyIn, dollyTrack, pulseEmit, etc.). */
  elapsedSec: number;
  /** Optional override for act duration in seconds — only meaningful when
   *  a scene composes its primitives with internal sub-stage timing.
   *  Defaults vary per act; consult the act's own header. */
  durationSec?: number;
}
