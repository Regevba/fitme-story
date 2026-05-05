'use client';

/**
 * Control-room TaskCard — TypeScript port of dashboard/src/components/TaskCard.jsx
 *
 * UCC task T24. Renders a compact task tile (status dot + ID badge + title +
 * skill pill + effort label) with a hover tooltip showing dependencies and
 * status. Used inside KanbanBoard columns and the flat TaskCard grid (T26).
 *
 * Re-skin per token-map.md: `rounded-card`/`rounded-badge`/`shadow-card*` →
 * standard Tailwind; `bg-[#1A1F2E]` → `bg-[var(--color-neutral-800)]`. Skill
 * chip colors map to fitme-story's `--skill-*` palette.
 *
 * Source: dashboard/src/components/TaskCard.jsx (88 lines)
 */

import { useState } from 'react';

export type TaskStatus = 'done' | 'in_progress' | 'ready' | 'blocked';

export type TaskSkill =
  | '/dev'
  | '/design'
  | '/analytics'
  | '/qa'
  | '/marketing'
  | '/ops'
  | 'unassigned';

export interface ControlRoomTask {
  id: string;
  title?: string;
  name?: string;
  status?: TaskStatus;
  effectiveStatus?: TaskStatus;
  skill?: TaskSkill;
  effort?: string | number;
  depends_on?: string[];
}

interface StatusStyle {
  dot: string;
  text: string;
  symbol: string;
}

const STATUS_STYLES: Record<TaskStatus, StatusStyle> = {
  done: { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', symbol: '✓' },
  in_progress: { dot: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400', symbol: '●' },
  ready: { dot: 'border-2 border-[var(--color-neutral-300)] bg-white', text: 'text-[var(--color-neutral-500)]', symbol: '○' },
  blocked: { dot: 'bg-[var(--color-neutral-300)] dark:bg-[var(--color-neutral-700)]', text: 'text-[var(--color-neutral-500)]', symbol: '◌' },
};

const SKILL_STYLES: Record<TaskSkill, string> = {
  '/dev': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  '/design': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
  '/analytics': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  '/qa': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  '/marketing': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  '/ops': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  unassigned: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-300)]',
};

export interface TaskCardProps {
  task: ControlRoomTask;
  featureName?: string;
  isDragging?: boolean;
}

export function TaskCard({ task, featureName, isDragging = false }: TaskCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const status: TaskStatus = task.effectiveStatus ?? task.status ?? 'blocked';
  const sStyle = STATUS_STYLES[status];
  const skillClass = SKILL_STYLES[task.skill ?? 'unassigned'];
  const displayTitle = task.title ?? task.name ?? task.id;

  return (
    <div
      className={`relative cursor-pointer select-none rounded-xl border border-[var(--color-neutral-200)] bg-white p-2.5 transition-all duration-150 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)] ${
        isDragging
          ? 'rotate-1 scale-[1.02] opacity-90 shadow-2xl'
          : 'shadow-md hover:shadow-lg'
      }`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${sStyle.dot}`} />
        <span className="shrink-0 font-mono text-[10px] font-bold text-[var(--color-neutral-500)]">
          {task.id}
        </span>
        <span className="truncate text-xs font-semibold leading-tight text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
          {displayTitle}
        </span>
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        {task.skill ? (
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${skillClass}`}>
            {task.skill}
          </span>
        ) : null}
        {task.effort !== undefined && task.effort !== null ? (
          <span className="font-mono text-[10px] text-[var(--color-neutral-500)]">{task.effort}</span>
        ) : null}
      </div>

      {showTooltip ? (
        <div
          role="tooltip"
          className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-lg bg-[var(--color-neutral-900)] p-3 text-xs text-white shadow-lg dark:bg-[var(--color-neutral-100)] dark:text-[var(--color-neutral-900)]"
        >
          <p className="mb-1 font-semibold">{displayTitle}</p>
          {featureName ? (
            <p className="mb-1 text-[var(--color-neutral-300)] dark:text-[var(--color-neutral-700)]">
              Feature: {featureName}
            </p>
          ) : null}
          {task.depends_on && task.depends_on.length > 0 ? (
            <p className="text-[var(--color-neutral-300)] dark:text-[var(--color-neutral-700)]">
              Deps: {task.depends_on.join(' → ')}
            </p>
          ) : null}
          <p className={`mt-1 font-medium ${sStyle.text}`}>{status.replace('_', ' ')}</p>
        </div>
      ) : null}
    </div>
  );
}
