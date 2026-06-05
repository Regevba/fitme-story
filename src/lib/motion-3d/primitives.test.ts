// src/lib/motion-3d/primitives.test.ts
//
// Unit tests for the 5 calibrated isometric motion primitives.
// These are pure functions — no canvas, no React, no R3F — so they're
// easy to test deterministically.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  flyInTick,
  dollyTrackTick,
  parallaxTiltTick,
  pulseEmitTick,
  isoRotateTick,
} from './primitives';

// ─── flyInTick ───────────────────────────────────────────────────────────

test('flyInTick: at t=0 returns the from position', () => {
  const r = flyInTick({
    from: [10, 0, 0],
    to: [0, 0, 0],
    durationSec: 2,
    elapsedSec: 0,
  });
  assert.deepEqual(r.position, [10, 0, 0]);
});

test('flyInTick: at t=duration returns the to position', () => {
  const r = flyInTick({
    from: [10, 0, 0],
    to: [0, 5, 0],
    durationSec: 2,
    elapsedSec: 2,
  });
  // Smooth-step at 1.0 should be exactly 1.0
  assert.deepEqual(r.position, [0, 5, 0]);
});

test('flyInTick: respects delay — at t<delay returns the from position', () => {
  const r = flyInTick({
    from: [10, 0, 0],
    to: [0, 0, 0],
    durationSec: 2,
    delaySec: 1,
    elapsedSec: 0.5, // still inside delay
  });
  assert.deepEqual(r.position, [10, 0, 0]);
});

test('flyInTick: clamps after duration (no overshoot)', () => {
  const r = flyInTick({
    from: [0, 0, 0],
    to: [10, 0, 0],
    durationSec: 1,
    elapsedSec: 5, // way past
  });
  assert.deepEqual(r.position, [10, 0, 0]);
});

// ─── dollyTrackTick ──────────────────────────────────────────────────────

test('dollyTrackTick: at t=0 returns first waypoint', () => {
  const r = dollyTrackTick({
    waypoints: [[0, 0, 0], [10, 0, 0], [20, 0, 0]],
    lookAt: [0, 0, 0],
    legDurationSec: 1,
    elapsedSec: 0,
  });
  assert.deepEqual(r.cameraPosition, [0, 0, 0]);
  assert.deepEqual(r.lookAt, [0, 0, 0]);
});

test('dollyTrackTick: at midway through the track returns mid-segment', () => {
  const r = dollyTrackTick({
    waypoints: [[0, 0, 0], [10, 0, 0]],
    lookAt: [5, 0, 0],
    legDurationSec: 2,
    elapsedSec: 1, // halfway through 2-sec leg
  });
  // Smooth-step at 0.5 is 0.5, so cameraPosition x = 5
  assert.equal(r.cameraPosition[0], 5);
  assert.deepEqual(r.lookAt, [5, 0, 0]);
});

// ─── parallaxTiltTick ────────────────────────────────────────────────────

test('parallaxTiltTick: at pointer=(0,0) rotation is zero', () => {
  const r = parallaxTiltTick({ pointer: [0, 0] });
  assert.deepEqual(r.rotation, [0, 0, 0]);
});

test('parallaxTiltTick: pointer=(1,1) tilts at max magnitude on x+y axes', () => {
  const r = parallaxTiltTick({ pointer: [1, 1], maxRad: 0.1 });
  assert.equal(r.rotation[0], 0.1, 'pitch from pointer.y');
  assert.equal(r.rotation[1], 0.1, 'yaw from pointer.x');
  assert.equal(r.rotation[2], 0, 'roll always 0');
});

// ─── pulseEmitTick ───────────────────────────────────────────────────────

test('pulseEmitTick: opacity oscillates between min and max', () => {
  let minSeen = 1;
  let maxSeen = 0;
  for (let i = 0; i < 100; i++) {
    const r = pulseEmitTick({
      elapsedSec: i * 0.05,
      periodSec: 2.0,
      minOpacity: 0.3,
      maxOpacity: 1.0,
    });
    minSeen = Math.min(minSeen, r.opacity);
    maxSeen = Math.max(maxSeen, r.opacity);
  }
  // Allow some tolerance — we sample 100 points but may not hit exact peak/trough
  assert.ok(minSeen >= 0.3 - 0.001 && minSeen <= 0.5, `minSeen=${minSeen} should be near 0.3`);
  assert.ok(maxSeen >= 0.8 && maxSeen <= 1.0 + 0.001, `maxSeen=${maxSeen} should be near 1.0`);
});

// ─── isoRotateTick ───────────────────────────────────────────────────────

test('isoRotateTick: at t=0 rotation is zero on all axes', () => {
  const r = isoRotateTick({ elapsedSec: 0 });
  assert.deepEqual(r.rotation, [0, 0, 0]);
});

test('isoRotateTick: default axis is y; angle = elapsedSec * speed', () => {
  const r = isoRotateTick({ elapsedSec: 4, speed: 0.5 });
  assert.equal(r.rotation[0], 0, 'x stays 0');
  assert.equal(r.rotation[1], 2.0, 'y = 4 * 0.5 = 2');
  assert.equal(r.rotation[2], 0, 'z stays 0');
});

test('isoRotateTick: axis="z" rotates around z only', () => {
  const r = isoRotateTick({ elapsedSec: 3, speed: 1, axis: 'z' });
  assert.deepEqual(r.rotation, [0, 0, 3]);
});
