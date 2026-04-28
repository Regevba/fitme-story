/**
 * Metrics parser — UCC T31 port from
 * dashboard/src/scripts/parsers/metrics.js (FitTracker2 Astro source).
 *
 * Extracts every metrics table from `docs/product/metrics-framework.md`.
 *
 * SERVER-ONLY: imported by builder.ts (build-time Server Component).
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { resolveDefaultMarkdownRoot } from '../types';

export interface MetricRow {
  category: string;
  name: string;
  definition: string;
  target: string;
  instrumentation: string;
  prdSection: string | null;
}

export function parseMetrics(repoRoot?: string): MetricRow[] {
  const root = repoRoot ?? resolveDefaultMarkdownRoot();
  const raw = readFileSync(resolve(root, 'docs/product/metrics-framework.md'), 'utf-8');
  const metrics: MetricRow[] = [];
  let currentCategory: string | null = null;

  for (const line of raw.split('\n')) {
    const catMatch = line.match(/^## \d+\.\s+(.+)/);
    if (catMatch) {
      currentCategory = catMatch[1];
      continue;
    }

    if (line.startsWith('|') && !line.startsWith('|---') && !line.startsWith('| Metric') && currentCategory) {
      const cols = line.split('|').map((c) => c.trim()).filter(Boolean);
      if (cols.length >= 4) {
        metrics.push({
          category: currentCategory,
          name: cols[0],
          definition: cols[1],
          target: cols[2],
          instrumentation: cols[3],
          prdSection: cols[4] ?? null,
        });
      }
    }
  }

  return metrics;
}
