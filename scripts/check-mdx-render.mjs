#!/usr/bin/env node
// scripts/check-mdx-render.mjs
//
// W15 prevention gate (added 2026-05-21 per `.claude/integrity/observed-patterns.md` W15).
//
// Compiles every `.md` and `.mdx` file under `content/` via the same
// `next-mdx-remote` pipeline the runtime pages use. Catches the JSX-tag
// parse-failure class (`<digit`, `<non-letter`, `<-->`, `<==`, etc.) at
// PR time instead of at production deploy time.
//
// Why this exists:
// fitme-story PR #129 (2026-05-21) introduced the string `<5 min` in
// `content/framework/dev-guide.md`. All required PR checks passed (verify,
// gates), and the bad PR was merged. The Vercel preview deploy showed
// `fail` but was NOT a required check, so it didn't block the merge.
// Production deploys were broken for ~3 hours until the operator manually
// asked for an investigation.
//
// This script closes that silent-pass class. If `next-mdx-remote` would
// reject the content at production build time, this script rejects it at
// PR time.
//
// Exit codes:
//   0 — all MDX files compile cleanly
//   1 — at least one MDX file fails to compile
//   2 — script error (deps missing, content dir missing, etc.)
//
// Usage:
//   node scripts/check-mdx-render.mjs          # walk content/ + report
//   node scripts/check-mdx-render.mjs path/to/file.mdx ...  # check specific files
//
// Wired into `.github/workflows/integrity.yml` `mdx-render` job.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';

const ROOT = process.cwd();

// Directories whose contents are directly compiled by a prerendered Next.js
// page. Scoping here keeps the gate aligned with what production actually
// builds — false positives elsewhere (code-fence content interpreted as MDX
// by @mdx-js/mdx alone) would block PRs without preventing real failures.
// Expand this list when a new directory becomes prerendered.
const SCOPED_DIRS = [
  'content/framework',          // /framework/dev-guide page (caused W15)
  'content/04-case-studies',    // /case-studies/[slug] pages
];

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (e) {
    if (e.code === 'ENOENT') return out;
    throw e;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (ent.isFile() && (ent.name.endsWith('.md') || ent.name.endsWith('.mdx'))) {
      out.push(full);
    }
  }
  return out;
}

function stripFrontmatter(src) {
  // YAML frontmatter is parsed separately by the page wrapper; @mdx-js/mdx
  // doesn't know about it by default. Strip it before compiling.
  if (!src.startsWith('---\n')) return src;
  const end = src.indexOf('\n---\n', 4);
  if (end === -1) return src;
  return src.slice(end + 5);
}

async function checkFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const body = stripFrontmatter(raw);
  try {
    await compile(body, {
      remarkPlugins: [remarkGfm],
      // No rehype plugins needed for syntax-only validation; the page
      // wrapper applies its own (rehype-slug, rehype-autolink-headings,
      // rehype-pretty-code) at runtime.
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: err.message || String(err),
      line: err.line ?? err.position?.start?.line ?? null,
      column: err.column ?? err.position?.start?.column ?? null,
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  let files;
  if (args.length > 0) {
    files = args.map(p => path.resolve(p));
  } else {
    files = [];
    for (const rel of SCOPED_DIRS) {
      files.push(...(await walk(path.join(ROOT, rel))));
    }
  }

  if (files.length === 0) {
    console.error(`[check-mdx-render] No MDX files found in scoped dirs: ${SCOPED_DIRS.join(', ')}`);
    process.exit(2);
  }

  const failures = [];
  for (const file of files) {
    const result = await checkFile(file);
    if (!result.ok) {
      failures.push({ file, ...result });
    }
  }

  const rel = (p) => path.relative(ROOT, p);

  if (failures.length === 0) {
    console.log(`[check-mdx-render] ✓ ${files.length} MDX file(s) compile cleanly`);
    process.exit(0);
  }

  console.error(`[check-mdx-render] ✗ ${failures.length} of ${files.length} MDX file(s) failed to compile:\n`);
  for (const f of failures) {
    console.error(`  ${rel(f.file)}${f.line ? `:${f.line}${f.column ? `:${f.column}` : ''}` : ''}`);
    console.error(`    ${f.message.split('\n')[0]}`);
    console.error('');
  }
  console.error('Hint: see .claude/integrity/observed-patterns.md W15 for silence paths.');
  console.error('Most common cause: unescaped `<` followed by a digit or non-letter character.');
  console.error('Silence paths: rewrite without `<`, HTML-escape (&lt;), code-span wrap (`<5`), or block-fence.');
  process.exit(1);
}

main().catch(err => {
  console.error('[check-mdx-render] Script error:', err);
  process.exit(2);
});
