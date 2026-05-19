/**
 * docs/product/PRD.md parser — UCC T31 port from
 * dashboard/src/scripts/parsers/prd.js.
 *
 * Extracts feature blocks keyed by 2.x-style headings (`## 2.3 …` or
 * `### 2.3 …`). For each block it collects the **Status:** line and any
 * bullet points containing metric/target/baseline/measure language. The
 * heuristic is intentionally loose — the dashboard surface uses these
 * snippets as hints, not a strict spec.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { PRDFeature } from '../types';
import { resolveRepoRoot } from './shared';

export function parsePRD(repoRoot?: string): PRDFeature[] {
  const root = repoRoot ?? resolveRepoRoot();
  const raw = readFileSync(resolve(root, 'docs/product/PRD.md'), 'utf-8');

  const features: PRDFeature[] = [];
  let current: PRDFeature | null = null;

  for (const line of raw.split('\n')) {
    const headerMatch = line.match(/^#{2,3}\s+(\d+\.\d+)\s+(.+)/);
    if (headerMatch) {
      if (current) features.push(current);
      current = {
        section: headerMatch[1],
        name: headerMatch[2].replace(/[*_]/g, ''),
        metrics: [],
        status: null,
      };
      continue;
    }

    if (!current) continue;

    if (line.match(/\*\*Status\*\*:?\s*/i)) {
      current.status = line.replace(/.*\*\*Status\*\*:?\s*/i, '').trim();
    }

    if (line.match(/^\s*[-•]\s*.*(metric|target|baseline|measure)/i)) {
      current.metrics.push(line.replace(/^\s*[-•]\s*/, '').trim());
    }
  }

  if (current) features.push(current);
  return features;
}
