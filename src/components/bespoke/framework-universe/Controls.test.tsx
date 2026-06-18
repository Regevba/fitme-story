// Controls.test.tsx — smoke test for the timeline-control overlay.
// Interaction behaviour (slider/keyboard/analytics) lands in Phase 4.J with
// Playwright + a real DOM; here we verify the module loads and exports a
// function component without a runtime error.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Controls } from './Controls';

test('Controls: module exports a function component', () => {
  assert.equal(typeof Controls, 'function');
});

test('Controls: name property preserved', () => {
  assert.equal(Controls.name, 'Controls');
});
