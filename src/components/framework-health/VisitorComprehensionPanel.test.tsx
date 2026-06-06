// src/components/framework-health/VisitorComprehensionPanel.test.tsx
//
// Smoke tests for the Phase 4.H T-comprehension-panel. Render-side
// verification (panel visible at /control-room/framework, headings
// readable, expected funnel ordered correctly) lands in Phase 4.J.
//
// At this layer we verify:
//   1. The module imports without runtime error
//   2. VisitorComprehensionPanel is exported as a function component

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VisitorComprehensionPanel } from './VisitorComprehensionPanel';

test('VisitorComprehensionPanel: module exports a function component', () => {
  assert.equal(typeof VisitorComprehensionPanel, 'function');
});

test('VisitorComprehensionPanel: function name preserved', () => {
  assert.equal(VisitorComprehensionPanel.name, 'VisitorComprehensionPanel');
});
