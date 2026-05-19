/**
 * docs/master-plan/master-backlog-roadmap.md parser — UCC T31 port from
 * dashboard/src/scripts/parsers/roadmap.js.
 *
 * Parses the RICE prioritization matrix: enters the table when a line
 * containing `RICE PRIORITIZATION MATRIX` appears, and exits when a `---`
 * line closes the matrix. Each row produces one {@link RoadmapTask}.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { RoadmapTask } from '../types';
import { resolveRepoRoot } from './shared';

export function parseRoadmap(repoRoot?: string): RoadmapTask[] {
  const root = repoRoot ?? resolveRepoRoot();
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
          taskNumber: parseInt(cols[0]) || 0,
          name: cols[1].replace(/\*\*/g, ''),
          reach: parseInt(cols[2]) || 0,
          impact: parseFloat(cols[3]) || 0,
          confidence: cols[4],
          effortWeeks: parseFloat(cols[5]) || 0,
          rice: parseFloat(cols[6].replace(/\*/g, '')) || 0,
          priority: (cols[7] || '').replace(/\*\*/g, '').toLowerCase(),
        });
      }
    }
  }

  return tasks;
}
