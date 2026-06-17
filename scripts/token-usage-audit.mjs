#!/usr/bin/env node
// scripts/token-usage-audit.mjs
//
// fitme-story analogue of the iOS `make ui-audit` raw-literal scanner. The
// figma-drift detector checks manifest ↔ filesystem parity; this checks the
// OTHER drift axis: hardcoded color VALUES that bypass the design-token layer.
//
// What it flags (in src/components/**/*.tsx, excluding *.figma.tsx):
//   Tailwind ARBITRARY-VALUE color utilities with a literal color —
//     bg-[#1A1F2E], text-[#fff], border-[rgb(...)], ring-[hsl(...)], etc.
//   These bypass both Tailwind's scale and the `--color-*` CSS-var tokens.
//   The fix is a token: bg-[var(--color-...)] or a semantic class.
//
// What it does NOT flag (intentional, matching iOS ui-audit's skips):
//   - Comments (// and /* */ and {/* */}) — re-skin notes legitimately quote
//     the old hardcoded value next to the new token.
//   - `-[var(--...)]` arbitrary values — those ARE token references.
//   - Named Tailwind scale colors (text-amber-700 etc.) — those are a
//     design system; status/severity colors use them intentionally.
//   - Data-viz / 3D: inline-style hex in chart + framework-universe + bespoke
//     components is out of scope (series colors, SVG fills, R3F materials are
//     computed, not token-able). Tracked as a separate concern.
//
// Advisory by default (exit 0). Pass --strict to fail CI on any finding.
//   node scripts/token-usage-audit.mjs            # report, exit 0
//   node scripts/token-usage-audit.mjs --json     # machine-readable
//   node scripts/token-usage-audit.mjs --strict   # exit 1 on findings

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SCAN_DIR = join(ROOT, 'src/components');
const STRICT = process.argv.includes('--strict');
const JSON_OUT = process.argv.includes('--json');

// Arbitrary-value color utility with a literal color (hex / rgb / hsl), but NOT var().
const ARBITRARY_COLOR = /(?:bg|text|border|ring|fill|stroke|from|via|to|decoration|outline|caret|accent|shadow)-\[(#[0-9a-fA-F]{3,8}|(?:rgb|hsl)a?\([^\])]*\))\]/g;

function stripComments(src) {
  // Block comments /* ... */ (covers JSX {/* ... */} too) then line comments //...
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1'); // avoid stripping http:// — require non-colon before //
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.tsx') && !name.endsWith('.figma.tsx')) out.push(p);
  }
  return out;
}

const findings = [];
for (const file of walk(SCAN_DIR)) {
  const raw = readFileSync(file, 'utf8');
  const code = stripComments(raw);
  const lines = code.split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(ARBITRARY_COLOR)) {
      findings.push({ file: file.replace(ROOT, ''), line: i + 1, match: m[0], value: m[1] });
    }
  });
}

if (JSON_OUT) {
  console.log(JSON.stringify({ findings, count: findings.length }, null, 2));
} else if (findings.length === 0) {
  console.log('✅  token-usage-audit: 0 hardcoded arbitrary-value colors in src/components');
} else {
  console.error(`⚠ token-usage-audit: ${findings.length} hardcoded arbitrary-value color(s) — prefer a --color-* token:`);
  for (const f of findings) console.error(`   ${f.file}:${f.line}  ${f.match}`);
  console.error('   Fix: replace with bg-[var(--color-…)] or a semantic class. See docs/CONTRIBUTING-design-system.md §6.');
}

process.exit(STRICT && findings.length > 0 ? 1 : 0);
