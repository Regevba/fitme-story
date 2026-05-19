/**
 * docs/product/metrics-framework.md parser — UCC T31 port from
 * dashboard/src/scripts/parsers/metrics.js.
 *
 * Walks the metrics tables under each `## N. Category` heading and emits
 * a flat array of {@link Metric}. The PRD-section column is optional and
 * normalized to `null` when absent.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Metric } from '../types';
import { resolveRepoRoot } from './shared';

export function parseMetrics(repoRoot?: string): Metric[] {
  const root = repoRoot ?? resolveRepoRoot();
  const raw = readFileSync(resolve(root, 'docs/product/metrics-framework.md'), 'utf-8');

  const metrics: Metric[] = [];
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
          prdSection: cols[4] || null,
        });
      }
    }
  }

  return metrics;
}
