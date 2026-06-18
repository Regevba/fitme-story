/**
 * Controls.tsx — DOM timeline-control overlay for the 3D Universe.
 *
 * T-scrub-pause-timedilation (operator decision 2026-06-18 D2). Renders a
 * play/pause toggle, a scrub slider, a 4×-slow (time-dilation) toggle, and a
 * replay button, plus keyboard support (space = pause, ← / → = scrub) per
 * FR-11. It lives OUTSIDE the R3F <Canvas> as a sibling DOM overlay.
 *
 * It writes intent into the shared `PlaybackControl` ref (consumed by the
 * in-Canvas ActSequencer each frame) and polls `control.current.elapsed` on a
 * throttled interval to drive the progress bar — so the DOM updates at ~10fps
 * regardless of the 60fps render clock. Analytics (scrub_seek / time_dilation
 * / replay) fire on user commit, not on every drag frame.
 *
 * Handlers are plain functions (no useCallback) so the React Compiler can
 * memoize them itself — manual memoization can't be preserved alongside the
 * ref writes.
 */
'use client';

/* eslint-disable react-hooks/immutability --
 * This component's entire job is to operate the shared PlaybackControl ref
 * channel (see playback.ts): it writes `paused` / `rate` / `seekTo` into
 * `control.current`, which the in-Canvas ActSequencer reads each frame. The
 * mutation is intentional — it is the documented ref escape hatch for
 * coordinating a 60fps render loop with the DOM without re-rendering either
 * side per frame. */

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';
import type { PlaybackControl } from './playback';
import { RATE_NORMAL, RATE_SLOW, KEYBOARD_SEEK_STEP_SEC } from './playback';
import {
  logUniverseScrubSeek,
  logUniverseTimeDilation,
  logUniverseReplay,
  type UniverseActId,
  type UniverseMode,
} from '../../../lib/framework-universe-analytics';

const PROGRESS_POLL_MS = 100; // DOM progress refresh cadence (~10fps).

export interface ControlsProps {
  control: RefObject<PlaybackControl>;
  totalSec: number;
  mode: UniverseMode;
  /** Resolves the analytics act id at a given elapsed second — supplied by
   *  the parent so the sequence (durations) stays single-sourced. */
  resolveActId: (elapsedSec: number) => UniverseActId;
  // Test-injection hooks — default to the real GA4 emitters.
  onScrubSeek?: typeof logUniverseScrubSeek;
  onTimeDilation?: typeof logUniverseTimeDilation;
  onReplay?: typeof logUniverseReplay;
}

export function Controls({
  control,
  totalSec,
  mode,
  resolveActId,
  onScrubSeek = logUniverseScrubSeek,
  onTimeDilation = logUniverseTimeDilation,
  onReplay = logUniverseReplay,
}: ControlsProps) {
  const [paused, setPaused] = useState(false);
  const [slow, setSlow] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const draggingRef = useRef(false);

  // Poll the shared ref for elapsed → progress bar, decoupled from the 60fps
  // render clock. Skipped while the user is actively dragging the slider so
  // the thumb doesn't fight the poll.
  useEffect(() => {
    const id = setInterval(() => {
      if (draggingRef.current) return;
      const elapsed = control.current?.elapsed ?? 0;
      setProgress(totalSec > 0 ? Math.min(elapsed / totalSec, 1) : 0);
    }, PROGRESS_POLL_MS);
    return () => clearInterval(id);
  }, [control, totalSec]);

  function togglePause() {
    const next = !paused;
    setPaused(next);
    if (control.current) control.current.paused = next;
  }

  function seekToFraction(fraction: number, emit: boolean) {
    const clamped = Math.min(Math.max(fraction, 0), 1);
    const targetSec = clamped * totalSec;
    if (control.current) control.current.seekTo = targetSec;
    setProgress(clamped);
    if (emit) {
      onScrubSeek({
        target_fraction: Math.round(clamped * 1000) / 1000,
        target_act_id: resolveActId(targetSec),
        mode,
      });
    }
  }

  function toggleSlow() {
    const next = !slow;
    setSlow(next);
    const rate = next ? RATE_SLOW : RATE_NORMAL;
    if (control.current) control.current.rate = rate;
    onTimeDilation({
      rate_multiplier: rate,
      act_id: resolveActId(control.current?.elapsed ?? 0),
      mode,
    });
  }

  function replay() {
    if (control.current) {
      control.current.seekTo = 0;
      control.current.paused = false;
    }
    setPaused(false);
    setProgress(0);
    onReplay({ trigger: 'user_click', mode });
  }

  // Keyboard: space = pause/resume, ← / → = scrub ±step. Ignored when focus
  // is in a form control (incl. our own slider, which handles arrows
  // natively). Self-contained (reads/writes control.current directly) so the
  // effect deps stay stable props — it attaches once.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const ctrl = control.current;
      if (!ctrl) return;
      if (e.code === 'Space') {
        e.preventDefault();
        const next = !ctrl.paused;
        ctrl.paused = next;
        setPaused(next);
      } else if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
        e.preventDefault();
        const dir = e.code === 'ArrowRight' ? 1 : -1;
        const targetSec = Math.min(
          Math.max(ctrl.elapsed + dir * KEYBOARD_SEEK_STEP_SEC, 0),
          totalSec,
        );
        ctrl.seekTo = targetSec;
        const fraction = totalSec > 0 ? targetSec / totalSec : 0;
        setProgress(fraction);
        onScrubSeek({
          target_fraction: Math.round(fraction * 1000) / 1000,
          target_act_id: resolveActId(targetSec),
          mode,
        });
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [control, totalSec, mode, resolveActId, onScrubSeek]);

  return (
    <div role="group" aria-label="Universe playback controls" style={barStyle}>
      <button type="button" onClick={togglePause} aria-label={paused ? 'Play' : 'Pause'} style={btnStyle}>
        {paused ? '▶' : '❚❚'}
      </button>

      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={progress}
        aria-label="Scrub timeline"
        onPointerDown={() => {
          draggingRef.current = true;
        }}
        onPointerUp={(e) => {
          draggingRef.current = false;
          seekToFraction(Number((e.target as HTMLInputElement).value), true);
        }}
        onChange={(e) => {
          // Live scrub while dragging (no analytics until commit).
          seekToFraction(Number(e.target.value), false);
        }}
        style={sliderStyle}
      />

      <button
        type="button"
        onClick={toggleSlow}
        aria-label={slow ? 'Restore normal speed' : 'Slow to quarter speed'}
        style={{ ...btnStyle, color: slow ? '#2DD4BF' : '#E2E8F0' }}
      >
        {slow ? '0.25×' : '1×'}
      </button>

      <button type="button" onClick={replay} aria-label="Replay from start" style={btnStyle}>
        ↺
      </button>
    </div>
  );
}

const barStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: 24,
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 16px',
  borderRadius: 9999,
  background: 'rgba(15, 23, 42, 0.72)',
  backdropFilter: 'blur(8px)',
  color: '#E2E8F0',
  font: '500 13px/1 ui-sans-serif, system-ui, sans-serif',
  boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
  userSelect: 'none',
  zIndex: 10,
};

const sliderStyle: CSSProperties = { width: 220, accentColor: '#2DD4BF', cursor: 'pointer' };

const btnStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
  padding: '4px 6px',
  minWidth: 32,
  lineHeight: 1,
};
