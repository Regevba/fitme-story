// playback.test.ts — unit tests for the shared playback control channel
// (T-scrub-pause-timedilation, D2).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createPlaybackControl,
  RATE_NORMAL,
  RATE_SLOW,
  KEYBOARD_SEEK_STEP_SEC,
} from './playback';

test('createPlaybackControl: fresh control starts unpaused at real-time, no seek', () => {
  const c = createPlaybackControl();
  assert.equal(c.paused, false);
  assert.equal(c.rate, RATE_NORMAL);
  assert.equal(c.seekTo, null);
  assert.equal(c.elapsed, 0);
});

test('createPlaybackControl: returns a fresh object each call (no shared mutable singleton)', () => {
  const a = createPlaybackControl();
  const b = createPlaybackControl();
  a.paused = true;
  a.elapsed = 5;
  assert.equal(b.paused, false, 'controls must be independent');
  assert.equal(b.elapsed, 0);
});

test('playback rate constants: normal is real-time, slow is 4× slow', () => {
  assert.equal(RATE_NORMAL, 1);
  assert.equal(RATE_SLOW, 0.25);
  assert.ok(KEYBOARD_SEEK_STEP_SEC > 0, 'keyboard scrub step must be positive');
});
