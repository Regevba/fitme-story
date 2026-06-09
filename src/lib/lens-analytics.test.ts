import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  trackHomeLensSelect,
  trackNavLensSwitch,
  trackStoryScrollDepth,
  trackCaseStudyEraExpand,
  trackCaseStudyOpen,
} from './lens-analytics';

// The site has no consent gate (GA opt-in via env); emit() guards on
// window + window.gtag and silently no-ops otherwise. These tests assert the
// no-op guard (no throw with no window/gtag) and correct payloads when gtag
// is present — matching the site's actual analytics model.

const g = globalThis as { window?: unknown };

afterEach(() => {
  delete g.window;
});

test('no-op guard: helpers do not throw when window is absent', () => {
  delete g.window;
  assert.doesNotThrow(() => {
    trackHomeLensSelect('pm');
    trackNavLensSwitch(null, 'dev');
    trackStoryScrollDepth('grew');
    trackCaseStudyEraExpand('v7', true);
    trackCaseStudyOpen('hadf', 'v7', 'dev');
  });
});

test('no-op guard: helpers do not throw when gtag is missing', () => {
  g.window = {}; // window present but no gtag
  assert.doesNotThrow(() => trackHomeLensSelect('dev'));
});

test('emits correct event names + params when gtag is present', () => {
  const calls: Array<[string, string, Record<string, unknown>]> = [];
  g.window = { gtag: (...args: unknown[]) => calls.push(args as [string, string, Record<string, unknown>]) };

  trackHomeLensSelect('pm');
  trackNavLensSwitch('pm', 'dev');
  trackStoryScrollDepth('today');
  trackCaseStudyEraExpand('v6', false);
  trackCaseStudyOpen('measurement-v6', 'v6', 'pm');

  assert.deepEqual(calls[0], ['event', 'home_lens_select', { lens: 'pm' }]);
  assert.deepEqual(calls[1], ['event', 'nav_lens_switch', { from_lens: 'pm', to_lens: 'dev' }]);
  assert.deepEqual(calls[2], ['event', 'story_scroll_depth', { section: 'today' }]);
  assert.deepEqual(calls[3], ['event', 'case_study_era_expand', { era: 'v6', expanded: false }]);
  assert.deepEqual(calls[4], ['event', 'case_study_open', { slug: 'measurement-v6', era: 'v6', lens: 'pm' }]);
});

test('nav_lens_switch maps null from-lens to "none"', () => {
  const calls: Array<unknown[]> = [];
  g.window = { gtag: (...args: unknown[]) => calls.push(args) };
  trackNavLensSwitch(null, 'pm');
  assert.deepEqual(calls[0], ['event', 'nav_lens_switch', { from_lens: 'none', to_lens: 'pm' }]);
});
