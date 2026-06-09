#!/usr/bin/env node
// Backfill the `category` frontmatter field on every case-study MDX
// (dual-audience redesign T7, 2026-06-09).
//
// Subject category is the axis the /case-studies index sub-groups by within
// each framework era. It was previously derived by a fragile slug-regex that
// only covered the v7.x era; this makes it an explicit, data-driven frontmatter
// field on all studies. `era` is NOT stored — it is derived from
// timeline_position.version in src/lib/case-study-grouping.ts.
//
// Categorization is an explicit slug→category map (transparent + reviewable),
// not a regex, because subject is a judgment call per study. Edit CATEGORY here
// to recategorize; re-run is idempotent (overwrites an existing category line).
//
// No external deps (gray-matter etc.) — operates on the frontmatter text block
// directly so it runs with plain `node`.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', '04-case-studies');

/** slug (filename without NN/NNa- prefix and .mdx) → category */
const CATEGORY = {
  // --- framework: versions, gates, dispatch, measurement, process/failure-modes ---
  'framework-evolution': 'framework',
  'eval-driven-development': 'framework',
  'soc-on-software': 'framework',
  'parallel-stress-test': 'framework',
  'dispatch-intelligence': 'framework',
  'parallel-write-safety': 'framework',
  'measurement-v6': 'framework',
  'hadf': 'framework',
  'framework-story-site': 'framework',
  'stacked-pr-misfire': 'framework',
  'mechanical-enforcement-v7-6': 'framework',
  'validity-closure-v7-7': 'framework',
  'framework-honesty-fixes': 'framework',
  'hadf-phase2-cloud-fingerprinting': 'framework',
  'hadf-phase2bis-cross-sub-exp-synthesis': 'framework',
  'bridge-v7-8': 'framework',
  'framework-v7-8-1-branch-isolation': 'framework',
  'cross-repo-state-sync-impl': 'framework',
  'framework-v7-9-promotion': 'framework',
  'roadmap-stress-test-2026-05-07': 'framework',
  'stale-base-branch-trap-w17': 'framework',
  'orchid-research-arc': 'framework',
  'w26-ci-concurrency-fix': 'framework',
  'f16-try-repo-harness': 'framework',
  'f17-last-fired-at-index': 'framework',
  'f2-phase-0-reality-check': 'framework',
  'framework-v7-9-1-promotion': 'framework',
  't14-platform-parity': 'framework',

  // --- design-system: tokens, Figma↔code, UI audits, presentation ---
  'ui-audit-burndown': 'design-system',
  'case-study-presentation': 'design-system',
  'android-design-system': 'design-system',
  'fitme-story-website-design-system': 'design-system',
  'ios-ui-audit-p1-burndown': 'design-system',
  'fitme-story-ds-p2-deferred': 'design-system',
  'ios-ui-audit-p1-drift-cleanup': 'design-system',
  'fitme-story-ds-p2-final-sweep': 'design-system',
  'ui-ux-final-sweep-2026-05-12': 'design-system',

  // --- product: shipped app features ---
  'onboarding-pilot': 'product',
  'user-profile': 'product',
  'auth-flow-velocity': 'product',
  'ai-engine-architecture': 'product',
  'smart-reminders': 'product',
  'settings-v2': 'product',
  'dual-sync-race': 'product',
  'home-today-screen': 'product',
  'training-plan-v2': 'product',
  'stats-v2': 'product',
  'auth-polish-v2': 'product',
  'smart-reminders-behavioral': 'product',
  'unified-control-center': 'product',
  'import-training-plan': 'product',
  'push-notifications-v2': 'product',
  'gdpr-compliance': 'product',
  'google-analytics': 'product',
  'ucc-passkey-auth': 'product',
  'readiness-aware-training-alert': 'product',
  'trend-alerts-hrv': 'product',
  'ai-user-feedback-loop': 'product',

  // --- meta: audits, retrospectives, methodology, housekeeping ---
  'full-system-audit': 'meta',
  'backlog-roundup-housekeeping': 'meta',
  'meta-analysis': 'meta',
  'meta-analysis-validation': 'meta',
  'normalization-model': 'meta',

  // --- dev-deepdive: engineering plumbing write-ups ---
  'ssr-regression': 'dev-deepdive',
  'dispatchreplay': 'dev-deepdive',
  'lego-pmflow': 'dev-deepdive',
  'xctwaiter-abort-retry': 'dev-deepdive',
};

// Files that are not case studies — skipped (no category).
const SKIP = new Set(['README.mdx', '_AUDIT-REPORT-2026-05-08.md']);

function slugFromFilename(name) {
  // strip leading "NN" or "NNa" ordering prefix + extension
  return name.replace(/\.mdx?$/, '').replace(/^\d+[a-z]?-/, '');
}

let written = 0;
let skipped = 0;
const unmapped = [];

for (const name of readdirSync(DIR).sort()) {
  if (!/\.mdx?$/.test(name) || SKIP.has(name)) {
    skipped++;
    continue;
  }
  const slug = slugFromFilename(name);
  const category = CATEGORY[slug];
  if (!category) {
    unmapped.push(`${name} (slug: ${slug})`);
    continue;
  }
  const path = join(DIR, name);
  const src = readFileSync(path, 'utf8');
  const fmMatch = src.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    unmapped.push(`${name} (no frontmatter block)`);
    continue;
  }
  let fm = fmMatch[1];
  if (/^category:/m.test(fm)) {
    fm = fm.replace(/^category:.*$/m, `category: ${category}`); // idempotent overwrite
  } else {
    fm = `${fm}\ncategory: ${category}`; // append to end of frontmatter
  }
  const next = src.replace(/^---\n[\s\S]*?\n---/, `---\n${fm}\n---`);
  if (next !== src) {
    writeFileSync(path, next);
    written++;
  }
}

console.log(`backfill-case-study-category: wrote ${written} file(s), skipped ${skipped} non-case-study.`);
if (unmapped.length) {
  console.log(`\n⚠ UNMAPPED (${unmapped.length}) — add to CATEGORY map:`);
  unmapped.forEach((u) => console.log(`  - ${u}`));
  process.exitCode = 1;
}
