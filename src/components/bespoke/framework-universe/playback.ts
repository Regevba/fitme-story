/**
 * playback.ts — shared playback control channel for the 3D Universe timeline.
 *
 * T-scrub-pause-timedilation (operator decision 2026-06-18 D2: a custom
 * lightweight control, NOT Theatre.js v9). The control is a plain mutable
 * object shared *by ref* between two sides that must not re-render each other
 * 60×/sec:
 *
 *   - DOM `<Controls>` overlay  — WRITER: sets `paused`, `rate`, `seekTo`.
 *   - in-Canvas `ActSequencer`  — READER each frame; WRITES `elapsed` back so
 *                                 the DOM progress bar can poll it on its own
 *                                 (throttled) cadence.
 *
 * Keeping the 60fps clock inside the Canvas (as the pre-scrub sequencer did)
 * is the whole point of the ref channel: neither side triggers a React render
 * on the other per frame.
 */
export interface PlaybackControl {
  /** When true the clock holds — the sequencer stops advancing `elapsed`. */
  paused: boolean;
  /** Rate multiplier. 1 = real-time; 0.25 = 4× slow (FR-11 time-dilation). */
  rate: number;
  /** One-shot absolute seek target in seconds. The sequencer consumes it
   *  (sets its accumulator, then clears it back to null). */
  seekTo: number | null;
  /** Latest elapsed seconds, written by the sequencer each frame so the DOM
   *  controls can render the progress bar without subscribing to useFrame. */
  elapsed: number;
}

export function createPlaybackControl(): PlaybackControl {
  return { paused: false, rate: 1, seekTo: null, elapsed: 0 };
}

/** The two rates the control toggles between (FR-11: 4× slow). */
export const RATE_NORMAL = 1;
export const RATE_SLOW = 0.25;

/** Seconds the arrow keys jump per press (FR-11 keyboard scrub). */
export const KEYBOARD_SEEK_STEP_SEC = 2;
