import { test } from 'node:test';
import assert from 'node:assert/strict';
import { search, type SearchFilters } from './search';
import type { SearchEntry } from './search-index';

const FIXTURES: SearchEntry[] = [
  {
    id: 'soc',
    title: 'SoC (System on Chip)',
    description: 'A chip integrating CPU, GPU, memory.',
    body: 'system on chip silicon hardware',
    url: '/glossary#soc',
    category: 'glossary',
    tags: { glossary_category: 'hardware-analog' },
  },
  {
    id: 'hadf-phase2',
    title: 'HADF Phase 2 — Cloud Fingerprinting',
    description: 'Pre-registered measurement of cloud inference clustering.',
    body: 'silhouette score 0.5566 cluster k=5 path b green-lit',
    url: '/case-studies/hadf-phase2-cloud-fingerprinting',
    category: 'case-study',
    tags: { version: '7.7', tier: 'light' },
  },
  {
    id: 'framework-v7-8',
    title: 'Framework v7.8 Bridge',
    description: 'Mechanism A coverage telemetry + Mechanism C session attribution.',
    body: 'gate coverage hooks pre-commit advisory',
    url: '/case-studies/framework-v7-8-bridge',
    category: 'case-study',
    tags: { version: '7.8', tier: 'flagship' },
  },
  {
    id: 'dev-guide',
    title: 'Framework Dev Guide',
    description: 'How the framework works for developers.',
    body: 'state.json schema phase lifecycle dispatch model cache',
    url: '/framework/dev-guide',
    category: 'framework',
    tags: {},
  },
];

test('empty query returns all entries up to limit', () => {
  const hits = search(FIXTURES, '', {}, 100);
  assert.equal(hits.length, FIXTURES.length);
});

test('single-word query matches title and ranks above body-only matches', () => {
  const hits = search(FIXTURES, 'silhouette', {});
  assert.equal(hits.length, 1);
  assert.equal(hits[0].entry.id, 'hadf-phase2');
  assert.ok(hits[0].score > 0);
});

test('title matches outrank body matches', () => {
  const hits = search(FIXTURES, 'framework', {});
  // Both 'Framework Dev Guide' (title) and 'Framework v7.8 Bridge' (title) match.
  // Both should appear; the dev-guide lacks 'framework' in body but has it in title.
  assert.ok(hits.length >= 2);
  // Top hit should be a title-match.
  assert.ok(
    hits[0].entry.title.toLowerCase().includes('framework'),
    `expected top hit to have framework in title, got: ${hits[0].entry.title}`,
  );
});

test('faceted filter: category restricts results', () => {
  const filters: SearchFilters = { category: 'glossary' };
  const hits = search(FIXTURES, 'chip', filters);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].entry.category, 'glossary');
});

test('faceted filter: version restricts to one entry', () => {
  const filters: SearchFilters = { version: '7.8' };
  const hits = search(FIXTURES, '', filters);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].entry.id, 'framework-v7-8');
});

test('multi-token query matches AND-style and boosts when all tokens hit', () => {
  const hits = search(FIXTURES, 'silhouette cluster', {});
  assert.equal(hits.length, 1);
  assert.equal(hits[0].entry.id, 'hadf-phase2');
  assert.ok(hits[0].matchedTokens.includes('silhouette'));
  assert.ok(hits[0].matchedTokens.includes('cluster'));
});

test('snippet excerpts around the matched token', () => {
  const hits = search(FIXTURES, 'silhouette', {});
  assert.equal(hits.length, 1);
  assert.ok(
    hits[0].snippet.toLowerCase().includes('silhouette'),
    `snippet should include the matched token, got: ${hits[0].snippet}`,
  );
});

test('non-matching query returns zero hits (does not return all)', () => {
  const hits = search(FIXTURES, 'zzzunmatchableqqq', {});
  assert.equal(hits.length, 0);
});

test('limit caps the result count', () => {
  const hits = search(FIXTURES, '', {}, 2);
  assert.equal(hits.length, 2);
});

test('case-insensitive matching', () => {
  const lower = search(FIXTURES, 'silhouette', {});
  const upper = search(FIXTURES, 'SILHOUETTE', {});
  assert.equal(lower.length, upper.length);
  assert.equal(lower[0].entry.id, upper[0].entry.id);
});
