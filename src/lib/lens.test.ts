import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLens, LENS_COOKIE, DEFAULT_LENS, LENS_LABELS, LENS_COOKIE_MAX_AGE } from './lens';
import { navForLens, NAV } from './nav';

test('isLens accepts only dev|pm', () => {
  assert.equal(isLens('dev'), true);
  assert.equal(isLens('pm'), true);
  assert.equal(isLens('hr'), false);
  assert.equal(isLens('academic'), false);
  assert.equal(isLens(null), false);
  assert.equal(isLens(undefined), false);
  assert.equal(isLens(''), false);
});

test('lens constants', () => {
  assert.equal(LENS_COOKIE, 'fitme_lens');
  assert.equal(DEFAULT_LENS, 'pm');
  assert.equal(LENS_COOKIE_MAX_AGE, 60 * 60 * 24 * 365);
  assert.equal(LENS_LABELS.dev, 'Developer');
  assert.equal(LENS_LABELS.pm, 'Product manager');
});

test('navForLens: PM leads with product/process surfaces', () => {
  const order = navForLens('pm').map((i) => i.href);
  assert.deepEqual(order.slice(0, 4), ['/pm-flow', '/case-studies', '/framework', '/design-system']);
});

test('navForLens: Dev leads with engineering surfaces', () => {
  const order = navForLens('dev').map((i) => i.href);
  assert.deepEqual(order.slice(0, 4), ['/framework', '/design-system', '/case-studies', '/pm-flow']);
});

test('navForLens: null defaults to PM order', () => {
  assert.deepEqual(navForLens(null).map((i) => i.href), navForLens('pm').map((i) => i.href));
});

test('navForLens: every NAV item appears exactly once, regardless of lens', () => {
  for (const lens of ['pm', 'dev'] as const) {
    const hrefs = navForLens(lens).map((i) => i.href).sort();
    const expected = NAV.map((i) => i.href).sort();
    assert.deepEqual(hrefs, expected);
  }
});

test('navForLens: gated Control Center stays last; /story not in top nav (footer-only)', () => {
  const order = navForLens('pm').map((i) => i.href);
  assert.equal(order[order.length - 1], '/control-room');
  assert.equal(order.includes('/story'), false);
});
