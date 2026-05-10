#!/usr/bin/env node
/**
 * fitme-story figma-drift CLI.
 *
 * Run: `npm run figma-drift` (in fitme-story) OR `make figma-drift` (in FT2)
 *
 * Cross-checks the typed manifest (src/lib/design-system.ts) against actual
 * .figma.tsx files in src/components/** and emits a drift report. Optionally
 * appends a dated entry to docs/design-system/figma-code-sync-status.md.
 *
 * Optional flags:
 *   --append-report   write the report to docs/design-system/figma-code-sync-status.md
 *   --json            emit JSON instead of human-readable
 *
 * Designed to:
 *   - succeed silently when there are 0 findings (exit 0)
 *   - print + exit non-zero when there are 'fail'-severity findings
 *   - skip cleanly when FIGMA_ACCESS_TOKEN is absent (we're not making API
 *     calls in this version — local-only drift detection only)
 *
 * Future extension: when FIGMA_ACCESS_TOKEN is set, query the Figma file
 * for orphan node IDs (in Figma but not in any .figma.tsx). Tracked in
 * Bucket D follow-up + the figma-drift-weekly.yml CI workflow.
 */

import { readFileSync, existsSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Parse simple CLI flags
const args = process.argv.slice(2);
const appendReport = args.includes('--append-report');
const emitJson = args.includes('--json');

async function loadFigmaTsxFiles() {
  const entries = [];
  // Use Node's built-in glob (Node 22+) — matches the project's runtime
  for await (const filePath of glob('src/**/*.figma.tsx', { cwd: ROOT })) {
    const absPath = join(ROOT, filePath);
    const content = readFileSync(absPath, 'utf8');

    // Parse imports of the form: `import { Component } from './ComponentName';`
    const importMatch = content.match(/import\s*\{\s*(\w+)\s*\}\s*from\s*['"]\.\/(\w+)['"];/);
    if (!importMatch) continue;
    const componentName = importMatch[1];
    const sourceModule = importMatch[2];

    // Resolve the source path: same directory as the .figma.tsx file, replacing the extension
    const dir = dirname(filePath);
    const sourceFilePath = join(dir, `${sourceModule}.tsx`);

    // Parse all node-id query params from figma.connect URLs
    const nodeIdMatches = content.matchAll(/node-id=([0-9]+-[0-9]+)/g);
    const nodeIds = [...nodeIdMatches].map(m => m[1]);

    entries.push({
      filePath,
      componentName,
      nodeIds,
      sourceFilePath,
    });
  }
  return entries;
}

async function main() {
  // Dynamic import after we know paths — avoids relative-path resolution issues
  const { analyzeLocalDrift, formatDriftReportMarkdown } = await import(
    '../src/lib/figma-drift.ts'
  );

  const figmaTsxEntries = await loadFigmaTsxFiles();

  const componentSourceExists = (path) => existsSync(join(ROOT, path));

  const report = analyzeLocalDrift(figmaTsxEntries, componentSourceExists);

  // Output
  if (emitJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const md = formatDriftReportMarkdown(report);
    console.log(md);
  }

  // Optionally append to figma-code-sync-status.md
  if (appendReport) {
    const reportPath = resolve(ROOT, '../FitTracker2/docs/design-system/figma-code-sync-status.md');
    if (existsSync(reportPath)) {
      const md = formatDriftReportMarkdown(report);
      appendFileSync(reportPath, `\n${md}\n`);
      console.error(`Appended to ${relative(ROOT, reportPath)}`);
    } else {
      console.error(
        `Warning: ${reportPath} does not exist; skipping append. (Expected to find this file in the FT2 repo.)`,
      );
    }
  }

  // Exit code based on findings
  const failCount = report.findings.filter(f => f.severity === 'fail').length;
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('figma-drift error:', err);
  process.exit(2);
});
