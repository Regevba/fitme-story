import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllCaseStudies, getCaseStudyBySlug, getByTier } from './content';

test('getAllCaseStudies returns at least 13 case studies', async () => {
  const all = await getAllCaseStudies();
  assert.ok(all.length >= 13, `expected >= 13, got ${all.length}`);
});

test('getAllCaseStudies are sorted by timeline_position.order', async () => {
  const all = await getAllCaseStudies();
  const ordered = all.filter((c) => c.frontmatter.timeline_position);
  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1].frontmatter.timeline_position!.order;
    const curr = ordered[i].frontmatter.timeline_position!.order;
    assert.ok(prev <= curr, `out of order at index ${i}`);
  }
});

test('getCaseStudyBySlug resolves a known slug', async () => {
  const study = await getCaseStudyBySlug('soc-on-software');
  assert.ok(study);
  assert.equal(study.frontmatter.tier, 'flagship');
});

test('getByTier("flagship") returns at least 3 entries', async () => {
  const flagship = await getByTier('flagship');
  assert.ok(flagship.length >= 3, `expected >= 3, got ${flagship.length}`);
});
