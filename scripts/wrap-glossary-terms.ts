/**
 * wrap-glossary-terms.ts
 *
 * Wraps the first occurrence of each of 15 high-value glossary terms in every
 * .mdx file under content/ with <Term slug="...">...</Term>.
 *
 * Rules:
 *  - Only the FIRST occurrence per term per file
 *  - Skip frontmatter (gray-matter strips it)
 *  - Skip code fences (``` ... ```) and inline code (`...`)
 *  - Skip inside JSX component tags / attributes
 *  - Preserve surrounding whitespace and punctuation
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT_DIR = path.resolve('content');

interface TermDef {
  slug: string;
  pattern: string;
  caseInsensitive?: boolean;
}

const TERMS: TermDef[] = [
  { slug: 'soc', pattern: '\\bSoC\\b' },
  { slug: 'systolic-chain', pattern: '\\bsystolic(?:\\s+(?:chain|array))\\b', caseInsensitive: true },
  { slug: 'lora-hot-swap', pattern: '\\bLoRA(?:\\s+(?:hot-swap|adapter))?\\b' },
  { slug: 'palettization', pattern: '\\bpalettization\\b', caseInsensitive: true },
  { slug: 'big-little', pattern: 'big\\.LITTLE' },
  { slug: 'mahalanobis-distance', pattern: '\\bMahalanobis(?:\\s+distance)?\\b' },
  { slug: 'speculative-preload', pattern: '\\bspeculative(?:\\s+(?:pre[\\-]?load|cache\\s+pre[\\-]?load(?:ing)?))\\b', caseInsensitive: true },
  { slug: 'tpu', pattern: '\\bTPU\\b' },
  { slug: 'hadf', pattern: '\\b(?:HADF|Hardware[\\-\\s]Aware\\s+Dispatch(?:\\s+Framework)?)\\b' },
  { slug: 'dispatch-intelligence', pattern: '\\bdispatch\\s+intelligence\\b', caseInsensitive: true },
  { slug: 'hub-and-spoke', pattern: '\\bhub[\\-\\s]and[\\-\\s]spoke\\b', caseInsensitive: true },
  { slug: 'complexity-units', pattern: '\\bComplexity\\s+Units?\\b', caseInsensitive: true },
  { slug: 'parallel-write-safety', pattern: '\\b(?:parallel\\s+write\\s+safety|mirror\\s+pattern)\\b', caseInsensitive: true },
  { slug: 'eval-layer', pattern: '\\beval(?:uation)?\\s+layer\\b', caseInsensitive: true },
  { slug: 'phase-timing', pattern: '\\bphase[\\s\\-]timing\\b', caseInsensitive: true },
];

function computeExcludedRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];

  // Code fences: ```...```
  const fenceRe = /```[\s\S]*?```/g;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(text)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }

  // Inline code: `...`
  const inlineRe = /`[^`\n]+`/g;
  while ((m = inlineRe.exec(text)) !== null) {
    if (!isInRanges(m.index, ranges)) {
      ranges.push([m.index, m.index + m[0].length]);
    }
  }

  // Known bespoke JSX components — exclude self-closing and paired content
  const knownComponents = [
    'MetricsCard', 'FindingsTable', 'Pullquote', 'Figure',
    'BlueprintOverlay', 'ChipAffinityMap', 'PhaseTimingChart', 'DispatchReplay',
    'TimelineNav', 'Term',
  ];

  for (const comp of knownComponents) {
    const selfRe = new RegExp(`<${comp}[^>]*?\\/\\s*>`, 'gs');
    while ((m = selfRe.exec(text)) !== null) {
      ranges.push([m.index, m.index + m[0].length]);
    }
    const pairedRe = new RegExp(`<${comp}(?:\\s[^>]*)?>(?:[\\s\\S]*?)<\\/${comp}>`, 'g');
    while ((m = pairedRe.exec(text)) !== null) {
      ranges.push([m.index, m.index + m[0].length]);
    }
  }

  // Any remaining JSX open-tags starting with uppercase
  const jsxTagRe = /<[A-Z][A-Za-z0-9.]*(?:\s[^>]*)?\/?>/g;
  while ((m = jsxTagRe.exec(text)) !== null) {
    if (!overlapsAny(m.index, m.index + m[0].length, ranges)) {
      ranges.push([m.index, m.index + m[0].length]);
    }
  }

  return ranges.sort((a, b) => a[0] - b[0]);
}

function isInRanges(pos: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([s, e]) => pos >= s && pos < e);
}

function overlapsAny(start: number, end: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([s, e]) => start < e && end > s);
}

function findFirstUnexcluded(
  text: string,
  re: RegExp,
  excluded: Array<[number, number]>,
): RegExpExecArray | null {
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (!isInRanges(m.index, excluded)) {
      return m;
    }
  }
  return null;
}

function wrapMatch(text: string, m: RegExpExecArray, slug: string): string {
  const before = text.slice(0, m.index);
  const matched = m[0];
  const after = text.slice(m.index + matched.length);
  return `${before}<Term slug="${slug}">${matched}</Term>${after}`;
}

async function getAllMdxFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter(e => e.isFile() && e.name.endsWith('.mdx'))
    .map(e => path.join((e as any).parentPath ?? (e as any).path, e.name));
}

async function processFile(
  filePath: string,
): Promise<{ file: string; wraps: Array<{ slug: string; term: string }> }> {
  const raw = await readFile(filePath, 'utf8');
  const { data, content: body } = matter(raw);

  let workingBody = body;
  const wraps: Array<{ slug: string; term: string }> = [];

  for (const termDef of TERMS) {
    const flags = termDef.caseInsensitive ? 'gi' : 'g';
    const re = new RegExp(termDef.pattern, flags);
    const excluded = computeExcludedRanges(workingBody);
    const m = findFirstUnexcluded(workingBody, re, excluded);
    if (m) {
      workingBody = wrapMatch(workingBody, m, termDef.slug);
      wraps.push({ slug: termDef.slug, term: m[0] });
    }
  }

  if (wraps.length > 0) {
    const newRaw = matter.stringify(workingBody, data);
    await writeFile(filePath, newRaw, 'utf8');
  }

  return { file: filePath, wraps };
}

async function main() {
  const files = await getAllMdxFiles(CONTENT_DIR);
  console.log(`Found ${files.length} MDX files\n`);

  let totalWraps = 0;
  let filesModified = 0;
  const termCounts: Record<string, number> = {};

  for (const file of files.sort()) {
    const result = await processFile(file);
    const relPath = path.relative(CONTENT_DIR, result.file);
    if (result.wraps.length > 0) {
      filesModified++;
      totalWraps += result.wraps.length;
      const summary = result.wraps.map(w => `${w.slug}(${w.term})`).join(', ');
      console.log(`  [${result.wraps.length}] ${relPath}: ${summary}`);
      for (const w of result.wraps) {
        termCounts[w.slug] = (termCounts[w.slug] ?? 0) + 1;
      }
    } else {
      console.log(`  [ ] ${relPath}`);
    }
  }

  console.log('\n─── Summary ───────────────────────────────────────');
  console.log(`Files scanned:   ${files.length}`);
  console.log(`Files modified:  ${filesModified}`);
  console.log(`Total <Term> wraps added: ${totalWraps}`);
  console.log('\nPer-term wrap counts:');
  for (const [slug, count] of Object.entries(termCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${slug.padEnd(30)} ${count}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
