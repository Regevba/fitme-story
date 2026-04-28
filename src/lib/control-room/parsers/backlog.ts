/**
 * Backlog parser — UCC T31 port from
 * dashboard/src/scripts/parsers/backlog.js (FitTracker2 Astro source).
 *
 * Parses `docs/product/backlog.md` into the four canonical sections
 * (Done, In Progress, Planned, Backlog).
 *
 * SERVER-ONLY: imported by builder.ts (build-time Server Component).
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { resolveDefaultMarkdownRoot } from '../types';

export interface BacklogDoneItem {
  name: string;
  ref: string;
  date: string;
  notes: string;
}

export interface BacklogInProgressItem {
  name: string;
  owner: string;
  branch: string;
  status: string;
}

export interface BacklogPlannedItem {
  rice: number;
  task: string;
  phase: string;
  description: string;
}

export interface BacklogItem {
  name: string;
  detail: string;
  done: boolean;
}

export interface BacklogResult {
  done: BacklogDoneItem[];
  inProgress: BacklogInProgressItem[];
  planned: BacklogPlannedItem[];
  backlog: BacklogItem[];
}

type SectionKey = keyof BacklogResult;

export function parseBacklog(repoRoot?: string): BacklogResult {
  const root = repoRoot ?? resolveDefaultMarkdownRoot();
  const raw = readFileSync(resolve(root, 'docs/product/backlog.md'), 'utf-8');
  const sections: BacklogResult = { done: [], inProgress: [], planned: [], backlog: [] };
  let currentSection: SectionKey | null = null;

  for (const line of raw.split('\n')) {
    if (line.startsWith('## Done')) { currentSection = 'done'; continue; }
    if (line.startsWith('## In Progress')) { currentSection = 'inProgress'; continue; }
    if (line.startsWith('## Planned')) { currentSection = 'planned'; continue; }
    if (line.startsWith('## Backlog')) { currentSection = 'backlog'; continue; }

    if (currentSection === 'done' && line.startsWith('|') && !line.startsWith('|---') && !line.startsWith('| #')) {
      const cols = line.split('|').map((c) => c.trim()).filter(Boolean);
      if (cols.length >= 4) {
        sections.done.push({ name: cols[1], ref: cols[2], date: cols[3], notes: cols[4] ?? '' });
      }
    }

    if (currentSection === 'inProgress' && line.startsWith('|') && !line.startsWith('|---') && !line.startsWith('| #')) {
      const cols = line.split('|').map((c) => c.trim()).filter(Boolean);
      if (cols.length >= 4) {
        sections.inProgress.push({ name: cols[1], owner: cols[2], branch: cols[3], status: cols[4] ?? '' });
      }
    }

    if (currentSection === 'planned' && line.startsWith('|') && !line.startsWith('|---') && !line.startsWith('| RICE')) {
      const cols = line.split('|').map((c) => c.trim()).filter(Boolean);
      if (cols.length >= 4) {
        const rice = Number.parseFloat(cols[0]) || 0;
        sections.planned.push({ rice, task: cols[1], phase: cols[2], description: cols[3] });
      }
    }

    if (currentSection === 'backlog') {
      const match = line.match(/^- \[[ x]\] (.+?)(?:\s*—\s*(.+))?$/);
      if (match) {
        const done = line.includes('[x]');
        sections.backlog.push({ name: match[1], detail: match[2] ?? '', done });
      }
    }
  }

  return sections;
}
