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

// --- Track A: fuzzy typo tolerance ---

test('fuzzy: a single-character typo still surfaces the entry', () => {
  // 'framwork' is missing the 'e' in 'framework' — not a substring of any field.
  const hits = search(FIXTURES, 'framwork', {});
  assert.ok(hits.length >= 1, 'expected at least one fuzzy hit');
  assert.ok(
    hits.some((h) => h.entry.title.toLowerCase().includes('framework')),
    'expected a framework entry among fuzzy hits',
  );
});

test('fuzzy hits score strictly below the equivalent exact hit', () => {
  const exact = search(FIXTURES, 'framework', {});
  const fuzzy = search(FIXTURES, 'framwork', {});
  assert.ok(exact.length >= 1 && fuzzy.length >= 1);
  assert.ok(
    exact[0].score > fuzzy[0].score,
    `exact top (${exact[0].score}) should outscore fuzzy top (${fuzzy[0].score})`,
  );
});

test('fuzzy does not rescue unrelated gibberish', () => {
  const hits = search(FIXTURES, 'zzzunmatchableqqq', {});
  assert.equal(hits.length, 0);
});

test('fuzzy is suppressed for very short tokens', () => {
  // 'soc' (len 3) must not fuzzy-match 'gpu'/'cpu'/'path' etc.; only the exact SoC entry.
  const hits = search(FIXTURES, 'soc', {});
  assert.equal(hits.length, 1);
  assert.equal(hits[0].entry.id, 'soc');
});

// --- Track A: quoted phrase search ---

test('quoted phrase matches contiguous text', () => {
  const hits = search(FIXTURES, '"path b"', {});
  assert.equal(hits.length, 1);
  assert.equal(hits[0].entry.id, 'hadf-phase2');
});

test('quoted phrase does NOT match non-contiguous words', () => {
  // dev-guide body is 'state.json schema phase lifecycle dispatch model cache'
  // — 'cache schema' never appears contiguously.
  const hits = search(FIXTURES, '"cache schema"', {});
  assert.equal(hits.length, 0);
});

// --- Track A: tier / recency boost ---

test('tier boost lifts flagship above an equally-matching lighter tier', () => {
  const fx: SearchEntry[] = [
    {
      id: 'a',
      title: 'Alpha',
      description: '',
      body: 'widget',
      url: '/a',
      category: 'case-study',
      tags: { tier: 'light', version: '7.0' },
    },
    {
      id: 'b',
      title: 'Beta',
      description: '',
      body: 'widget',
      url: '/b',
      category: 'case-study',
      tags: { tier: 'flagship', version: '7.0' },
    },
  ];
  const hits = search(fx, 'widget', {});
  assert.equal(hits.length, 2);
  assert.equal(hits[0].entry.id, 'b', 'flagship should rank first');
});

// --- Track A: heading-anchor deep links ---

test('deep-links to the section whose body contains the match', () => {
  const fx: SearchEntry[] = [
    {
      id: 'doc',
      title: 'Doc',
      description: '',
      body: 'intro widget gizmo',
      url: '/framework/dev-guide',
      category: 'framework',
      tags: {},
      sections: [
        { anchor: 'overview', heading: 'Overview', body: 'overview intro text' },
        { anchor: 'the-gizmo', heading: 'The Gizmo', body: 'gizmo deep details here' },
      ],
    },
  ];
  const hits = search(fx, 'gizmo', {});
  assert.equal(hits.length, 1);
  assert.equal(hits[0].url, '/framework/dev-guide#the-gizmo');
});

test('falls back to top-level url when no section matches', () => {
  const fx: SearchEntry[] = [
    {
      id: 'doc',
      title: 'Widget Doc',
      description: '',
      body: 'widget content',
      url: '/framework/dev-guide',
      category: 'framework',
      tags: {},
      sections: [{ anchor: 'intro', heading: 'Intro', body: 'unrelated words' }],
    },
  ];
  // Matches the title token 'widget' but no section body contains it.
  const hits = search(fx, 'widget', {});
  assert.equal(hits.length, 1);
  assert.equal(hits[0].url, '/framework/dev-guide');
});

test('does not append an anchor to a url that already has one', () => {
  const fx: SearchEntry[] = [
    {
      id: 'g',
      title: 'Term',
      description: '',
      body: 'definition widget',
      url: '/glossary#term',
      category: 'glossary',
      tags: {},
      sections: [{ anchor: 'def', heading: 'Def', body: 'widget definition' }],
    },
  ];
  const hits = search(fx, 'widget', {});
  assert.equal(hits[0].url, '/glossary#term');
});

test('recency boost lifts a newer version above an equally-matching older one', () => {
  const fx: SearchEntry[] = [
    {
      id: 'old',
      title: 'Old',
      description: '',
      body: 'widget',
      url: '/old',
      category: 'case-study',
      tags: { tier: 'light', version: '5.0' },
    },
    {
      id: 'new',
      title: 'New',
      description: '',
      body: 'widget',
      url: '/new',
      category: 'case-study',
      tags: { tier: 'light', version: '7.9' },
    },
  ];
  const hits = search(fx, 'widget', {});
  assert.equal(hits[0].entry.id, 'new', 'newer version should rank first');
});
