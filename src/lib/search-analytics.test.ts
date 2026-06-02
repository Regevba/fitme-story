/**
 * Unit tests for the search_* GA4 helpers.
 *
 * Mirrors src/lib/control-room/analytics.test.ts: node:test + node:assert,
 * a per-test mock window.gtag, picked up by `npm test`. Covers one round-trip
 * per public helper plus server-safety, gtag-missing safety, and error
 * tolerance.
 */

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  trackSearchQuerySubmitted,
  trackSearchResultsViewed,
  trackSearchZeroResults,
  trackSearchResultClicked,
} from './search-analytics';

interface GtagCall {
  command: string;
  eventName: string;
  params: Record<string, unknown>;
}

type GlobalWithWindow = typeof globalThis & { window?: unknown };

function installMockWindow(gtagImpl?: (...args: unknown[]) => void): GtagCall[] {
  const calls: GtagCall[] = [];
  const defaultImpl = (
    command: string,
    eventName: string,
    params: Record<string, unknown>,
  ) => {
    calls.push({ command, eventName, params });
  };
  (globalThis as GlobalWithWindow).window = { gtag: gtagImpl ?? defaultImpl };
  return calls;
}

function uninstallMockWindow(): void {
  delete (globalThis as GlobalWithWindow).window;
}

afterEach(uninstallMockWindow);

test('trackSearchQuerySubmitted reaches gtag with the declared payload', () => {
  const calls = installMockWindow();
  trackSearchQuerySubmitted({ query_length: 9, source: 'nav' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].eventName, 'search_query_submitted');
  assert.deepEqual(calls[0].params, { query_length: 9, source: 'nav' });
});

test('trackSearchResultsViewed reaches gtag with the declared payload', () => {
  const calls = installMockWindow();
  trackSearchResultsViewed({ query_length: 4, result_count: 12, has_filters: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].eventName, 'search_results_viewed');
  assert.deepEqual(calls[0].params, { query_length: 4, result_count: 12, has_filters: true });
});

test('trackSearchZeroResults reaches gtag with the declared payload', () => {
  const calls = installMockWindow();
  trackSearchZeroResults({ query_length: 7, has_filters: false });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].eventName, 'search_zero_results');
  assert.deepEqual(calls[0].params, { query_length: 7, has_filters: false });
});

test('trackSearchResultClicked reaches gtag with the declared payload', () => {
  const calls = installMockWindow();
  trackSearchResultClicked({ result_category: 'case-study', result_rank: 2, query_length: 5 });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].eventName, 'search_result_clicked');
  assert.deepEqual(calls[0].params, {
    result_category: 'case-study',
    result_rank: 2,
    query_length: 5,
  });
});

test('server-safe: no window global → no throw, no call', () => {
  uninstallMockWindow();
  assert.doesNotThrow(() =>
    trackSearchQuerySubmitted({ query_length: 1, source: 'compact' }),
  );
});

test('gtag-missing safe: window without gtag → no throw, no call', () => {
  (globalThis as GlobalWithWindow).window = {};
  assert.doesNotThrow(() =>
    trackSearchResultsViewed({ query_length: 1, result_count: 0, has_filters: false }),
  );
});

test('error tolerance: a throwing gtag does not propagate', () => {
  installMockWindow(() => {
    throw new Error('tag blew up');
  });
  assert.doesNotThrow(() =>
    trackSearchResultClicked({ result_category: 'glossary', result_rank: 0, query_length: 3 }),
  );
});
