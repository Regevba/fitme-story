import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEraGroups,
  nonEraStudies,
  eraIdForVersion,
  isEraEligible,
  parseVersion,
  type GroupableStudy,
  type Category,
} from './case-study-grouping';

function s(o: {
  slug: string;
  v?: string | null;
  d?: string;
  c: Category;
  m?: boolean;
  e?: Partial<Record<'pm' | 'dev', string>>;
}): GroupableStudy {
  return {
    slug: o.slug,
    title: o.slug,
    version: o.v ?? null,
    date: o.d ?? '',
    category: o.c,
    readingTimeMin: 5,
    emphasis: o.e,
    isMilestone: !!o.m,
  };
}

const data: GroupableStudy[] = [
  s({ slug: 'hadf', v: '7.0', d: '2026-04-16', c: 'framework', m: true }),
  s({ slug: 'f17', v: '7.9.1', d: '2026-06-04', c: 'framework' }),
  s({ slug: 'ucc', v: '7.5', d: '2026-05-01', c: 'product', e: { pm: 'x' } }),
  s({ slug: 'ds-web', v: '7.4', d: '2026-05-08', c: 'design-system' }),
  s({ slug: 'measurement', v: '6.0', d: '2026-04-16', c: 'framework', m: true }),
  s({ slug: 'onboarding', v: '2.0', d: '2026-04-07', c: 'product', m: true }),
  s({ slug: 'meta-analysis', v: null, d: '2026-04-20', c: 'meta' }),
  s({ slug: 'ssr', v: null, d: '2026-04-25', c: 'dev-deepdive' }),
];

test('parseVersion strips leading v + parses', () => {
  assert.equal(parseVersion('v7.9'), 7.9);
  assert.equal(parseVersion('6.0'), 6);
  assert.ok(Number.isNaN(parseVersion(null)));
});

test('eraIdForVersion buckets newest-first', () => {
  assert.equal(eraIdForVersion(7.9), 'v7');
  assert.equal(eraIdForVersion(6.0), 'v6');
  assert.equal(eraIdForVersion(5.2), 'v5');
  assert.equal(eraIdForVersion(4.4), 'v4');
  assert.equal(eraIdForVersion(2.0), 'v2');
  assert.equal(eraIdForVersion(NaN), 'v2');
});

test('meta + dev-deepdive + version-less are not era-eligible', () => {
  assert.equal(isEraEligible(data[6]), false); // meta
  assert.equal(isEraEligible(data[7]), false); // dev-deepdive
  assert.equal(nonEraStudies(data).length, 2);
});

test('era groups: newest-first, empty eras omitted', () => {
  const g = buildEraGroups(data, 'pm');
  assert.deepEqual(g.map((x) => x.id), ['v7', 'v6', 'v2']);
});

test('era counts exclude non-eligible studies', () => {
  const g = buildEraGroups(data, 'pm');
  assert.equal(g[0].count, 4); // hadf, f17, ucc, ds-web
});

test('milestones pinned separately from subgroups', () => {
  const g = buildEraGroups(data, 'pm');
  assert.deepEqual(g[0].milestones.map((m) => m.slug), ['hadf']);
  assert.equal(g[0].subGroups.find((sg) => sg.category === 'framework')!.studies.some((x) => x.slug === 'hadf'), false);
});

test('subgroups in fixed order, newest-first within', () => {
  const g = buildEraGroups(data, 'pm');
  assert.deepEqual(g[0].subGroups.map((sg) => sg.category), ['framework', 'design-system', 'product']);
  assert.equal(g[0].subGroups[0].studies[0].slug, 'f17'); // newest framework
});

test('lens-aware sort floats emphasized studies up', () => {
  const mixed = [
    s({ slug: 'old-emph', v: '7.1', d: '2026-04-01', c: 'product', e: { dev: 'x' } }),
    s({ slug: 'new-plain', v: '7.2', d: '2026-06-01', c: 'product' }),
  ];
  const devFirst = buildEraGroups(mixed, 'dev')[0].subGroups[0].studies.map((x) => x.slug);
  assert.deepEqual(devFirst, ['old-emph', 'new-plain']); // emphasized floats above newer
  const pmFirst = buildEraGroups(mixed, 'pm')[0].subGroups[0].studies.map((x) => x.slug);
  assert.deepEqual(pmFirst, ['new-plain', 'old-emph']); // no pm emphasis → date order
});
