import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEraGroups,
  nonEraStudies,
  eraIdForVersion,
  isEraEligible,
  parseVersion,
  compareVersionsDesc,
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
  const g = buildEraGroups(data);
  assert.deepEqual(g.map((x) => x.id), ['v7', 'v6', 'v2']);
});

test('era counts exclude non-eligible studies', () => {
  const g = buildEraGroups(data);
  assert.equal(g[0].count, 4); // hadf, f17, ucc, ds-web
});

test('milestones pinned separately from subgroups', () => {
  const g = buildEraGroups(data);
  assert.deepEqual(g[0].milestones.map((m) => m.slug), ['hadf']);
  assert.equal(g[0].subGroups.find((sg) => sg.category === 'framework')!.studies.some((x) => x.slug === 'hadf'), false);
});

test('subgroups in fixed order, newest-first within', () => {
  const g = buildEraGroups(data);
  assert.deepEqual(g[0].subGroups.map((sg) => sg.category), ['framework', 'design-system', 'product']);
  assert.equal(g[0].subGroups[0].studies[0].slug, 'f17'); // newest framework
});

test('recency sort: higher version first, then newest date — lens does not reorder', () => {
  const mixed = [
    s({ slug: 'v71-apr', v: '7.1', d: '2026-04-01', c: 'product', e: { dev: 'x' } }),
    s({ slug: 'v72-jun', v: '7.2', d: '2026-06-01', c: 'product' }),
    s({ slug: 'v72-may', v: '7.2', d: '2026-05-01', c: 'product' }),
  ];
  const order = buildEraGroups(mixed)[0].subGroups[0].studies.map((x) => x.slug);
  // v7.2 (higher version) before v7.1; within v7.2, newest date first.
  assert.deepEqual(order, ['v72-jun', 'v72-may', 'v71-apr']);
});

test('recency sort: multi-segment versions — v7.10 > v7.9.1 > v7.9 > v7.8.6 > v7.8.5 (parseFloat regression guard)', () => {
  const mixed = [
    s({ slug: 'v785', v: '7.8.5', d: '2026-06-09', c: 'product' }),
    s({ slug: 'v90', v: '7.9', d: '2026-05-21', c: 'product' }),
    s({ slug: 'v710', v: '7.10', d: '2026-06-10', c: 'product' }),
    s({ slug: 'v786', v: '7.8.6', d: '2026-05-20', c: 'product' }),
    s({ slug: 'v791', v: '7.9.1', d: '2026-06-04', c: 'product' }),
  ];
  const order = buildEraGroups(mixed)[0].subGroups[0].studies.map((x) => x.slug);
  // Newest framework version first — v7.10 must NOT sink below v7.9.
  assert.deepEqual(order, ['v710', 'v791', 'v90', 'v786', 'v785']);
});

test('compareVersionsDesc: segment-wise newest-first', () => {
  assert.ok(compareVersionsDesc('7.10', '7.9') < 0); // 7.10 newer
  assert.ok(compareVersionsDesc('7.9.1', '7.9') < 0); // patch newer than base
  assert.ok(compareVersionsDesc('7.8.6', '7.8.5') < 0);
  assert.equal(compareVersionsDesc('7.9', '7.9'), 0);
});

test('version-less studies are excluded from eras (kept in nonEraStudies)', () => {
  const mixed = [
    s({ slug: 'nover', v: null, d: '2026-12-01', c: 'product' }),
    s({ slug: 'v20', v: '2.0', d: '2026-01-01', c: 'product' }),
  ];
  // version-less product study is not era-eligible → only the versioned one appears in the era
  const eraSlugs = buildEraGroups(mixed).flatMap((e) => e.subGroups.flatMap((sg) => sg.studies.map((x) => x.slug)));
  assert.deepEqual(eraSlugs, ['v20']);
  assert.deepEqual(nonEraStudies(mixed).map((x) => x.slug), ['nover']);
});
