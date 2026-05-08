#!/usr/bin/env node
// Audit script for the fitme-story showcase MDX corpus. Walks every
// content/04-case-studies/*.mdx file, parses frontmatter, and buckets
// each by disposition per the dual-outlet pattern contract:
// docs/case-studies/dual-outlet-pattern.md (in FT2)
//
// Usage:
//   node scripts/audit-frontmatter.mjs
//   node scripts/audit-frontmatter.mjs --json    # machine-readable output
//
// Exit codes:
//   0  All entries are compliant or have explicit chrome_minimal opt-out
//   1  At least one entry is BARE_WITHOUT_REASON (needs backfill or opt-out)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const dir = path.join(repoRoot, 'content/04-case-studies');

const REQUIRED = ['title', 'slug', 'tier', 'tldr'];
const HIGH_VALUE = ['kill_criteria', 'kill_criterion_fired', 'deferred_items', 'upstream_path', 'date'];

function bucketize(fm) {
  const tier = fm.tier;
  const cst = fm.case_study_type;
  const cm = fm.chrome_minimal;
  const cmReason = fm.chrome_minimal_reason;

  if (tier === 'unassigned') return { bucket: 'NON_CASE_STUDY', flags: [] };
  if (cst) return { bucket: `PRE_PM_WORKFLOW (${cst})`, flags: [] };
  if (cm === true && cmReason) return { bucket: 'BARE_INTENTIONAL', flags: [] };
  if (cm === true && !cmReason) {
    return { bucket: 'INVALID', flags: ['chrome_minimal=true MISSING chrome_minimal_reason'] };
  }

  const missingReq = REQUIRED.filter((k) => !fm[k]);
  const hasOneOf = !!(fm.visual_aid || (Array.isArray(fm.key_numbers) && fm.key_numbers.length));
  if (missingReq.length || !hasOneOf) {
    return {
      bucket: 'INVALID_REQUIRED',
      flags: [
        ...(missingReq.length ? [`missing required: ${missingReq.join(', ')}`] : []),
        ...(!hasOneOf ? ['missing visual_aid OR key_numbers'] : []),
      ],
    };
  }

  const hasHonest = Array.isArray(fm.honest_disclosures) && fm.honest_disclosures.length > 0;
  const hasTimeline = !!fm.timeline_position;
  const highCount = HIGH_VALUE.filter((k) => fm[k]).length;
  const flags = [];
  if (!hasHonest) flags.push('NO-honest_disclosures');
  if (!hasTimeline) flags.push('NO-timeline_position');
  if (!fm.kill_criteria) flags.push('NO-kill_criteria');
  if (!fm.visual_aid && !fm.key_numbers) flags.push('NO-visual');

  if (hasHonest && hasTimeline && highCount >= 3) return { bucket: 'COMPLIANT_FULL', flags };
  if (hasHonest && hasTimeline) return { bucket: 'COMPLIANT_PARTIAL', flags };
  if (!hasHonest && highCount === 0) return { bucket: 'BARE_WITHOUT_REASON', flags };
  return { bucket: 'COMPLIANT_THIN', flags };
}

function audit() {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx')).sort();
  const results = files.map((f) => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const { data: fm } = matter(raw);
    const { bucket, flags } = bucketize(fm);
    return { file: f, bucket, tier: fm.tier, flags };
  });
  return results;
}

function main() {
  const wantJson = process.argv.includes('--json');
  const results = audit();
  const counts = results.reduce((acc, r) => {
    const top = r.bucket.split(' ')[0];
    acc[top] = (acc[top] || 0) + 1;
    return acc;
  }, {});
  const bareCount = results.filter((r) => r.bucket === 'BARE_WITHOUT_REASON').length;
  const invalidCount = results.filter((r) => r.bucket === 'INVALID' || r.bucket === 'INVALID_REQUIRED').length;
  const exitCode = bareCount > 0 || invalidCount > 0 ? 1 : 0;

  if (wantJson) {
    console.log(JSON.stringify({ counts, results, exitCode }, null, 2));
  } else {
    console.log('=== fitme-story showcase MDX frontmatter audit ===');
    console.log(`scanned: ${results.length} files`);
    console.log('');
    console.log('Bucket counts:');
    for (const [b, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(n).padStart(3)} ${b}`);
    }
    console.log('');
    console.log('Per-file:');
    for (const r of results) {
      const flags = r.flags.length ? `  [${r.flags.join(', ')}]` : '';
      console.log(`  ${r.file.padEnd(50)} ${r.bucket}${flags}`);
    }
    console.log('');
    console.log(`Exit code: ${exitCode}`);
  }
  process.exit(exitCode);
}

main();
