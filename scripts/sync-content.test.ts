import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeFrontmatter, extractUpstreamFrontmatter } from './sync-content';

test('extractUpstreamFrontmatter parses YAML front matter', () => {
  const input = '---\ntitle: Hello\nversion: 5.0\n---\n# Body';
  const result = extractUpstreamFrontmatter(input);
  assert.equal(result.data.title, 'Hello');
  assert.equal(result.data.version, 5.0);
  assert.equal(result.content.trim(), '# Body');
});

test('mergeFrontmatter preserves site-specific fields and updates upstream_sha', () => {
  const upstream = { title: 'Upstream title', date: '2026-01-01' };
  const existingSite = {
    tier: 'flagship',
    persona_emphasis: { hr: 'outcomes' },
    upstream_sha: 'old-sha',
  };
  const merged = mergeFrontmatter(upstream, existingSite, 'new-sha');
  assert.equal(merged.tier, 'flagship');
  assert.equal(merged.persona_emphasis.hr, 'outcomes');
  assert.equal(merged.title, 'Upstream title');
  assert.equal(merged.upstream_sha, 'new-sha');
});

test('mergeFrontmatter fills defaults when site-specific is empty', () => {
  const merged = mergeFrontmatter({ title: 'T' }, {}, 'sha');
  assert.equal(merged.tier, 'unassigned');
  assert.equal(merged.upstream_sha, 'sha');
});

test('mergeFrontmatter: upstream fields win over site-local fields they share', () => {
  const merged = mergeFrontmatter({ title: 'Upstream' }, { title: 'Local stale' }, 'sha');
  assert.equal(merged.title, 'Upstream');
});
