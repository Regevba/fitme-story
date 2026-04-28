/**
 * Roadmap parser — UCC T31 port from
 * dashboard/src/scripts/parsers/roadmap.js (FitTracker2 Astro source).
 *
 * Parses the RICE prioritization matrix in
 * `docs/master-plan/master-backlog-roadmap.md`.
 *
 * SERVER-ONLY: imported by builder.ts (build-time Server Component).
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { resolveDefaultMarkdownRoot } from '../types';

export interface RoadmapTask {
  taskNumber: number;
  name: string;
  reach: number;
  impact: number;
  confidence: string;
  effortWeeks: number;
  rice: number;
  priority: string;
}

export function parseRoadmap(repoRoot?: string): RoadmapTask[] {
  const root = repoRoot ?? resolveDefaultMarkdownRoot();
  const raw = readFileSync(resolve(root, 'docs/master-plan/master-backlog-roadmap.md'), 'utf-8');
  const tasks: RoadmapTask[] = [];
  let inMatrix = false;

  for (const line of raw.split('\n')) {
    if (line.includes('RICE PRIORITIZATION MATRIX')) { inMatrix = true; continue; }
    if (inMatrix && line.startsWith('---')) { inMatrix = false; continue; }

    if (inMatrix && line.startsWith('|') && !line.startsWith('|---') && !line.startsWith('| #')) {
      const cols = line.split('|').map((c) => c.trim()).filter(Boolean);
      if (cols.length >= 7) {
        tasks.push({
          taskNumber: Number.parseInt(cols[0]) || 0,
          name: cols[1].replace(/\*\*/g, ''),
          reach: Number.parseInt(cols[2]) || 0,
          impact: Number.parseFloat(cols[3]) || 0,
          confidence: cols[4],
          effortWeeks: Number.parseFloat(cols[5]) || 0,
          rice: Number.parseFloat(cols[6].replace(/\*/g, '')) || 0,
          priority: (cols[7] ?? '').replace(/\*\*/g, '').toLowerCase(),
        });
      }
    }
  }

  return tasks;
}
