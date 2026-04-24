import type { PhaseId } from './lifecycle-phases';

export type WorkItemType = 'feature' | 'enhancement' | 'fix' | 'chore';

export interface WorkItemTypeInfo {
  id: WorkItemType;
  label: string;         // "Feature"
  phaseCount: number;    // 10
  summary: string;       // short description
  phases: PhaseId[];     // the phases active for this work-item type
}

export const WORK_ITEM_TYPES: WorkItemTypeInfo[] = [
  {
    id: 'feature',
    label: 'Feature',
    phaseCount: 10,
    summary: 'New capability — research, PRD, design, build, measure.',
    phases: ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'],
  },
  {
    id: 'enhancement',
    label: 'Enhancement',
    phaseCount: 4,
    summary: 'Improve a shipped feature. Parent PRD already exists.',
    phases: ['P2', 'P4', 'P5', 'P7'],
  },
  {
    id: 'fix',
    label: 'Fix',
    phaseCount: 2,
    summary: 'Bug fix, security patch, error handling.',
    phases: ['P4', 'P5'],
  },
  {
    id: 'chore',
    label: 'Chore',
    phaseCount: 1,
    summary: 'Docs, config, refactor, dependency bump.',
    phases: ['P4'],
  },
];

export function getWorkItemType(id: WorkItemType): WorkItemTypeInfo {
  const found = WORK_ITEM_TYPES.find((w) => w.id === id);
  if (!found) throw new Error(`Unknown work item type: ${id}`);
  return found;
}
