'use client';

/**
 * Control-room FeatureCard — TypeScript port of dashboard/src/components/FeatureCard.jsx
 *
 * UCC task T24. Renders a draggable feature tile for the Kanban board: priority
 * badge + title + category + work-type + RICE + task-progress bar + shipped/ETA
 * footer. The phase determines the left-border accent color.
 *
 * Re-skin per token-map.md:
 *   - `bg-priority-*` (red/amber/yellow/gray) → rose/amber/amber/slate Tailwind
 *   - `border-l-status-*` (4 buckets) → slate/sky/fuchsia/emerald Tailwind
 *     - gray bucket (backlog/research/prd/tasks) → slate-400
 *     - blue bucket (ux/integration/implement) → sky-500
 *     - purple bucket (testing/review/merge) → fuchsia-500
 *     - green bucket (docs/done) → emerald-500
 *   - `rounded-card` → `rounded-xl`; `rounded-badge` → `rounded-md`
 *   - `shadow-card` → shadow-md / shadow-lg / shadow-2xl
 *   - `bg-[#1A1F2E]` → `bg-[var(--color-neutral-800)]`
 *
 * Source: dashboard/src/components/FeatureCard.jsx (117 lines)
 */

import type { MouseEventHandler } from 'react';

export type FeaturePhase =
  | 'backlog'
  | 'research'
  | 'prd'
  | 'tasks'
  | 'ux'
  | 'integration'
  | 'implement'
  | 'testing'
  | 'review'
  | 'merge'
  | 'docs'
  | 'done';

export type FeaturePriority = 'critical' | 'high' | 'medium' | 'low';

export type FeatureCategory =
  | 'product'
  | 'gdpr'
  | 'infra'
  | 'design'
  | 'ai'
  | 'measurement'
  | 'platform'
  | 'marketing'
  | 'process';

export type FeatureWorkType = 'feature' | 'fix' | 'bug' | 'chore' | 'spike' | 'refactor';

export interface ControlRoomFeature {
  name: string;
  phase?: FeaturePhase;
  priority?: FeaturePriority;
  rice?: number | string;
  category?: FeatureCategory;
  shipped?: string;
  eta?: string;
  workType?: FeatureWorkType;
  taskCount?: number;
  tasksDone?: number;
}

interface PriorityStyle {
  dot: string;
  text: string;
  label: string;
}

const PRIORITY_STYLES: Record<FeaturePriority, PriorityStyle> = {
  critical: { dot: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', label: 'P0' },
  high: { dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', label: 'P1' },
  medium: { dot: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-300', label: 'P2' },
  low: { dot: 'bg-slate-300', text: 'text-[var(--color-neutral-500)]', label: 'P3' },
};

const STATUS_BORDER: Record<FeaturePhase, string> = {
  backlog: 'border-l-slate-400',
  research: 'border-l-slate-400',
  prd: 'border-l-slate-400',
  tasks: 'border-l-slate-400',
  ux: 'border-l-sky-500',
  integration: 'border-l-sky-500',
  implement: 'border-l-sky-500',
  testing: 'border-l-fuchsia-500',
  review: 'border-l-fuchsia-500',
  merge: 'border-l-fuchsia-500',
  docs: 'border-l-emerald-500',
  done: 'border-l-emerald-500',
};

const CATEGORY_BADGE: Record<FeatureCategory, string> = {
  product: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  gdpr: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  infra: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-300)]',
  design: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
  ai: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  measurement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  platform: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  marketing: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  process: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

const WORK_TYPE_BADGE: Record<Exclude<FeatureWorkType, 'feature'>, string> = {
  fix: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  bug: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  chore: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-300)]',
  spike: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  refactor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
};

export interface FeatureCardProps {
  feature: ControlRoomFeature;
  isDragging?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function FeatureCard({ feature, isDragging = false, onClick }: FeatureCardProps) {
  const { name, phase, priority, rice, category, shipped, eta, workType, taskCount, tasksDone } =
    feature;
  const pStyle = priority ? PRIORITY_STYLES[priority] : null;
  const borderClass = phase ? STATUS_BORDER[phase] : 'border-l-[var(--color-neutral-300)]';
  const catClass = category ? CATEGORY_BADGE[category] : CATEGORY_BADGE.product;
  const showProgress = (taskCount ?? 0) > 0;
  const progressPct =
    showProgress && taskCount ? ((tasksDone ?? 0) / taskCount) * 100 : 0;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`select-none rounded-xl border-l-4 bg-white p-3 transition-all duration-150 dark:bg-[var(--color-neutral-800)] ${borderClass} ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isDragging
          ? 'rotate-1 scale-[1.02] opacity-90 shadow-2xl'
          : 'shadow-md hover:shadow-lg'
      }`}
    >
      <div className="mb-2 flex items-start gap-2">
        {pStyle ? (
          <span className={`mt-0.5 shrink-0 text-xs font-bold ${pStyle.text}`}>{pStyle.label}</span>
        ) : null}
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
          {name}
        </h3>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        {category ? (
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${catClass}`}>
            {category}
          </span>
        ) : null}
        {workType && workType !== 'feature' ? (
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
              WORK_TYPE_BADGE[workType] ??
              'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-300)]'
            }`}
          >
            {workType}
          </span>
        ) : null}
        {rice !== undefined && rice !== null ? (
          <span className="font-mono text-[10px] text-[var(--color-neutral-500)]">RICE {rice}</span>
        ) : null}
      </div>

      {showProgress ? (
        <div className="mb-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)]">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="shrink-0 font-mono text-[10px] text-[var(--color-neutral-500)]">
            {tasksDone ?? 0}/{taskCount}
          </span>
        </div>
      ) : null}

      <div className="flex items-center justify-between text-[10px] text-[var(--color-neutral-500)]">
        {shipped ? <span>Shipped {shipped}</span> : null}
        {eta ? <span>ETA: {eta}</span> : null}
        {!shipped && !eta ? <span>&nbsp;</span> : null}
      </div>
    </div>
  );
}
