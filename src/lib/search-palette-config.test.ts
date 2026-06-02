/**
 * Guards the build ↔ client contract for the ⌘K palette.
 *
 * The build script (scripts/build-search-index.ts) and the client
 * (SearchPalette.tsx) MUST use the same MINISEARCH_OPTIONS, or
 * MiniSearch.loadJSON() throws / returns nothing. This test exercises the
 * exact round-trip — build an index, serialize, load with the shared options,
 * search — so a drift in fields/idField fails CI instead of production.
 */

import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import MiniSearch from 'minisearch';
import {
  MINISEARCH_OPTIONS,
  PALETTE_SEARCH_OPTIONS,
  openSearchPalette,
} from './search-palette-config';

type GlobalWithWindow = typeof globalThis & { window?: unknown };

afterEach(() => {
  delete (globalThis as GlobalWithWindow).window;
});

test('build → toJSON → loadJSON round-trip searches with the shared options', () => {
  const docs = [
    { docId: 0, title: 'Silhouette coefficient', description: 'cluster quality', body: 'k-means separability', url: '/glossary#silhouette', category: 'glossary', version: null, tier: null, tagText: '' },
    { docId: 1, title: 'Framework v7.8 Bridge', description: 'gate telemetry', body: 'mechanism a coverage', url: '/case-studies/v7-8', category: 'case-study', version: '7.8', tier: 'flagship', tagText: '7.8 flagship' },
  ];

  const build = new MiniSearch(MINISEARCH_OPTIONS);
  build.addAll(docs);
  const serialized = JSON.stringify(build.toJSON());

  // Client path: reload with the SAME options.
  const client = MiniSearch.loadJSON(serialized, MINISEARCH_OPTIONS);
  const hits = client.search('silhouette', PALETTE_SEARCH_OPTIONS);

  assert.ok(hits.length >= 1, 'expected at least one hit after reload');
  const top = hits[0] as Record<string, unknown>;
  assert.equal(top.title, 'Silhouette coefficient');
  assert.equal(top.url, '/glossary#silhouette');
  assert.equal(top.category, 'glossary');
});

test('prefix + fuzzy options surface a typo and a partial token', () => {
  const docs = [
    { docId: 0, title: 'Onboarding pilot', description: '', body: 'lifecycle', url: '/x', category: 'case-study', version: null, tier: null, tagText: '' },
  ];
  const mini = new MiniSearch(MINISEARCH_OPTIONS);
  mini.addAll(docs);

  assert.ok(mini.search('onboard', PALETTE_SEARCH_OPTIONS).length >= 1, 'prefix should match');
  assert.ok(mini.search('onboaring', PALETTE_SEARCH_OPTIONS).length >= 1, 'fuzzy typo should match');
});

test('openSearchPalette is a no-op on the server (no window)', () => {
  assert.doesNotThrow(() => openSearchPalette());
});

test('openSearchPalette dispatches the open event in a browser-like env', () => {
  let fired = false;
  (globalThis as GlobalWithWindow).window = {
    dispatchEvent: () => {
      fired = true;
      return true;
    },
  };
  // CustomEvent must exist for the dispatch path; stub minimally.
  (globalThis as typeof globalThis & { CustomEvent?: unknown }).CustomEvent = class {
    constructor(public type: string) {}
  };
  openSearchPalette();
  assert.equal(fired, true);
});
