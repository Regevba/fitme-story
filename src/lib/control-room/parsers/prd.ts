/**
 * PRD parser — UCC T31 port from
 * dashboard/src/scripts/parsers/prd.js (FitTracker2 Astro source).
 *
 * Extracts feature sections (2.x headers) from `docs/product/PRD.md`.
 *
 * SERVER-ONLY: imported by builder.ts (build-time Server Component).
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { resolveDefaultMarkdownRoot } from '../types';

export interface PRDSection {
  section: string;
  name: string;
  metrics: string[];
  status: string | null;
}

export function parsePRD(repoRoot?: string): PRDSection[] {
  const root = repoRoot ?? resolveDefaultMarkdownRoot();
  const raw = readFileSync(resolve(root, 'docs/product/PRD.md'), 'utf-8');
  const features: PRDSection[] = [];
  let current: PRDSection | null = null;

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
