/**
 * src/lib/motion-3d/primitives.ts — Calibrated Isometric motion primitives.
 *
 * Phase 4.B / T-primitive-motion. 5 reusable motion utilities for the 3D
 * Universe scene composition. Per research §3.4 (calibrated isometric):
 * predictable, performant, frame-rate-independent.
 *
 * These primitives are framework-agnostic — they expose simple `tick(t)`
 * functions that R3F components call from `useFrame(({ clock }) => …)`.
 * No React state; no setTimeout; no requestAnimationFrame internal loops.
 * Deterministic and SSR-safe.
 *
 * Theatre.js integration deferred to Phase 4.E (timeline scrub controls)
 * — the peer-dep conflict with @react-three/fiber v9 (Theatre.js still
 * pins ^8.13.6) blocks the cinematic-scrub workflow until upstream
 * Theatre.js releases v9-compatible @theatre/r3f.
 */

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Clamp `x` into [lo, hi]. */
function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

/** Smooth-step easing: 0→1 as t goes 0→1, ease-in-ease-out. */
function smoothStep(t: number): number {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

// ─── 1. Fly-in — translate from offset → 0 over duration ─────────────────

export interface FlyInTickResult {
  position: [number, number, number];
}

export interface FlyInOptions {
  from: [number, number, number];
  to: [number, number, number];
  durationSec: number;
  /** Time elapsed since scene start, in seconds (from useFrame clock). */
  elapsedSec: number;
  /** Optional delay before motion starts. */
  delaySec?: number;
}

/** Fly-in: smooth translation from `from` → `to` over `durationSec`,
 *  with optional `delaySec` lead-in. After `delaySec + durationSec`,
 *  the position stays clamped at `to`. */
export function flyInTick(opts: FlyInOptions): FlyInTickResult {
  const localT = opts.elapsedSec - (opts.delaySec ?? 0);
  const t = smoothStep(localT / opts.durationSec);
  return {
    position: [
      opts.from[0] + (opts.to[0] - opts.from[0]) * t,
      opts.from[1] + (opts.to[1] - opts.from[1]) * t,
      opts.from[2] + (opts.to[2] - opts.from[2]) * t,
    ],
  };
}

// ─── 2. Dolly-track — camera moves along a linear path ──────────────────

export interface DollyTrackTickResult {
  cameraPosition: [number, number, number];
  lookAt: [number, number, number];
}

export interface DollyTrackOptions {
  /** Camera path waypoints. */
  waypoints: ReadonlyArray<[number, number, number]>;
  /** Look-at point (typically the active act's anchor). */
  lookAt: [number, number, number];
  /** Time per leg in seconds. Whole track wall-time = waypoints.length × this. */
  legDurationSec: number;
  elapsedSec: number;
}

/** Dolly-track: smooth piecewise-linear camera traversal through waypoints,
 *  always looking at `lookAt`. Result is intended to be applied via
 *  `useThree(({camera})=>{ camera.position.set(...) })` in the consumer. */
export function dollyTrackTick(opts: DollyTrackOptions): DollyTrackTickResult {
  const totalDuration = opts.legDurationSec * Math.max(1, opts.waypoints.length - 1);
  const t = clamp(opts.elapsedSec / totalDuration, 0, 0.9999);
  const segIndex = Math.floor(t * (opts.waypoints.length - 1));
  const segT = smoothStep((t * (opts.waypoints.length - 1)) - segIndex);
  const a = opts.waypoints[segIndex];
  const b = opts.waypoints[Math.min(segIndex + 1, opts.waypoints.length - 1)];
  return {
    cameraPosition: [
      a[0] + (b[0] - a[0]) * segT,
      a[1] + (b[1] - a[1]) * segT,
      a[2] + (b[2] - a[2]) * segT,
    ],
    lookAt: opts.lookAt,
  };
}

// ─── 3. Parallax-tilt — small rotation in response to pointer ───────────

export interface ParallaxTiltTickResult {
  rotation: [number, number, number];
}

export interface ParallaxTiltOptions {
  /** Normalized pointer position, each in [-1, 1]. */
  pointer: [number, number];
  /** Max tilt magnitude in radians. Default ±0.05 (~3°). */
  maxRad?: number;
}

/** Parallax-tilt: maps pointer ∈ [-1,1]² to a small rotation around the
 *  X (pitch) + Y (yaw) axes. Pure function; caller is responsible for
 *  sampling the pointer (e.g., via `useThree({ pointer })`). */
export function parallaxTiltTick(opts: ParallaxTiltOptions): ParallaxTiltTickResult {
  const max = opts.maxRad ?? 0.05;
  return {
    rotation: [
      opts.pointer[1] * max, // pitch from y
      opts.pointer[0] * max, // yaw from x
      0,
    ],
  };
}

// ─── 4. Pulse-emit — opacity + scale pulse on a timer ───────────────────

export interface PulseEmitTickResult {
  opacity: number;
  scale: number;
}

export interface PulseEmitOptions {
  /** Time elapsed since scene start, in seconds. */
  elapsedSec: number;
  /** Pulse period in seconds. Default 1.6s. */
  periodSec?: number;
  /** Minimum opacity. Default 0.3. */
  minOpacity?: number;
  /** Maximum opacity. Default 1.0. */
  maxOpacity?: number;
  /** Minimum scale. Default 0.95. */
  minScale?: number;
  /** Maximum scale. Default 1.05. */
  maxScale?: number;
}

/** Pulse-emit: sinusoidal opacity + scale modulation. Useful for
 *  "telemetry-spike" or "gate-firing" emitters that need to visually
 *  pulse without per-component animation state. */
export function pulseEmitTick(opts: PulseEmitOptions): PulseEmitTickResult {
  const period = opts.periodSec ?? 1.6;
  const phase = (opts.elapsedSec % period) / period;
  const sin01 = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);
  return {
    opacity: (opts.minOpacity ?? 0.3) + ((opts.maxOpacity ?? 1.0) - (opts.minOpacity ?? 0.3)) * sin01,
    scale: (opts.minScale ?? 0.95) + ((opts.maxScale ?? 1.05) - (opts.minScale ?? 0.95)) * sin01,
  };
}

// ─── 5. Iso-rotate — slow continuous rotation around an axis ────────────

export interface IsoRotateTickResult {
  rotation: [number, number, number];
}

export interface IsoRotateOptions {
  elapsedSec: number;
  /** Angular velocity in radians/sec. Default 0.15 (about 1 RPM). */
  speed?: number;
  /** Axis to rotate around: 'x' | 'y' | 'z'. Default 'y'. */
  axis?: 'x' | 'y' | 'z';
}

/** Iso-rotate: monotonic rotation around a single axis. */
export function isoRotateTick(opts: IsoRotateOptions): IsoRotateTickResult {
  const speed = opts.speed ?? 0.15;
  const angle = opts.elapsedSec * speed;
  const axis = opts.axis ?? 'y';
  return {
    rotation: [
      axis === 'x' ? angle : 0,
      axis === 'y' ? angle : 0,
      axis === 'z' ? angle : 0,
    ],
  };
}
