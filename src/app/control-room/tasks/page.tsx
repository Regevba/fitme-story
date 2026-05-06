/**
 * /control-room/tasks — flat TaskCard grid (UCC T26).
 *
 * Replaces the dashboard's `TaskBoard.jsx` (which had swim-lanes by skill,
 * priority queue sidebar, and a dependency graph overlay) with a simpler
 * flat grid grouped by effective status. The reasoning is in tasks.md:
 * the Kanban board (/control-room/board) already covers the by-phase view,
 * and the priority queue is better surfaced as a focused future widget than
 * as a sidebar fighting for space with the grid. T29 will add a task-tree
 * for dependency visualization if a real need surfaces.
 *
 * Data source: every `.claude/features/<feat>/state.json` (FT2 source)
 * synced into `src/data/features/<feat>.json` at prebuild time. Read via
 * `parseStateFiles()` + `parseTasks()` — both server-only.
 *
 * Server component, no client interactivity. View persistence + filters
 * come in T30 (localStorage).
 */

import type { Metadata } from 'next';
import { parseStateFiles } from '@/lib/control-room/parsers/state';
import { parseTasks, type Task } from '@/lib/control-room/parsers/tasks';
import { TaskCard, type TaskStatus, type TaskSkill } from '@/components/control-room/TaskCard';
import { TrackPageView } from '@/components/control-room/TrackPageView';

export const metadata: Metadata = {
  title: 'Tasks — Control room',
  robots: { index: false, follow: false },
};

// ────────────────────────────────────────────────────────────────────────────
// Status grouping
// ────────────────────────────────────────────────────────────────────────────

interface StatusGroup {
  key: TaskStatus;
  label: string;
  hint: string;
}

const STATUS_GROUPS: StatusGroup[] = [
  { key: 'in_progress', label: 'In progress', hint: 'Active right now' },
  { key: 'ready', label: 'Ready', hint: 'Dependencies satisfied' },
  { key: 'blocked', label: 'Blocked', hint: 'Waiting on dependencies' },
  { key: 'done', label: 'Done', hint: 'Shipped' },
];

const KNOWN_STATUSES = new Set<TaskStatus>(['in_progress', 'ready', 'blocked', 'done']);

function normalizeStatus(value: string | undefined): TaskStatus {
  if (!value) return 'blocked';
  return KNOWN_STATUSES.has(value as TaskStatus) ? (value as TaskStatus) : 'blocked';
}

const KNOWN_SKILLS = new Set<TaskSkill>([
  '/dev',
  '/design',
  '/analytics',
  '/qa',
  '/marketing',
  '/ops',
  'unassigned',
]);

function normalizeSkill(value: string | undefined): TaskSkill | undefined {
  if (!value) return undefined;
  return KNOWN_SKILLS.has(value as TaskSkill) ? (value as TaskSkill) : 'unassigned';
}

// Flatten the per-feature task map into a single array, normalize status +
// skill into the TaskCard's enums.
interface FlatTask {
  id: string;
  featureName: string;
  status: TaskStatus;
  title?: string;
  skill?: TaskSkill;
  effort?: string | number;
  depends_on?: string[];
}

function flatten(byFeature: Map<string, Task[]>): FlatTask[] {
  const out: FlatTask[] = [];
  for (const [featureName, tasks] of byFeature) {
    for (const t of tasks) {
      out.push({
        id: t.id,
        featureName,
        status: normalizeStatus(t.effectiveStatus ?? t.status),
        title: t.title,
        skill: normalizeSkill(t.skill ?? t.assigned_skill),
        effort: t.effort_days,
        depends_on: t.depends_on,
      });
    }
  }
  return out;
}

function groupByStatus(tasks: FlatTask[]): Map<TaskStatus, FlatTask[]> {
  const groups = new Map<TaskStatus, FlatTask[]>();
  for (const status of KNOWN_STATUSES) groups.set(status as TaskStatus, []);
  for (const t of tasks) {
    const bucket = groups.get(t.status);
    if (bucket) bucket.push(t);
  }
  return groups;
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const states = parseStateFiles();
  const stateFilesForTasks = states
    .filter((s) => Array.isArray(s.tasks) && s.tasks.length > 0)
    .map((s) => ({ feature: s.feature ?? '(unknown)', tasks: s.tasks }));

  const { byFeature } = parseTasks(stateFilesForTasks);
  const allTasks = flatten(byFeature);
  const grouped = groupByStatus(allTasks);
  const featureCount = byFeature.size;

  return (
    <article className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      {/* GA4: dashboard_load + dashboard_sync_warning_shown (UCC T36 Phase 2) */}
      <TrackPageView route="tasks" />

      <header className="mb-6">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
          Tasks
        </h2>
        <p className="mt-1 max-w-2xl font-sans text-sm leading-6 text-[var(--color-neutral-500)]">
          Every task across every feature, grouped by effective status. Live source — written
          straight from `.claude/features/&lt;feat&gt;/state.json`. The Kanban board next door views
          the same data bucketed by phase instead.
        </p>
        <p className="mt-2 font-mono text-[10px] text-[var(--color-neutral-400)]">
          {allTasks.length} tasks across {featureCount} features
        </p>
      </header>

      {allTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-neutral-300)] bg-white p-12 text-center dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]">
          <p className="font-sans text-sm text-[var(--color-neutral-500)]">
            No tasks found across any feature state files.
          </p>
          <p className="mt-1 font-mono text-[10px] text-[var(--color-neutral-400)]">
            Tasks are defined in <code>.claude/features/&lt;feat&gt;/state.json</code>
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {STATUS_GROUPS.map(({ key, label, hint }) => {
            const tasks = grouped.get(key) ?? [];
            return (
              <section key={key}>
                <div className="mb-3 flex items-baseline gap-3">
                  <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                    {label}
                  </h3>
                  <span className="rounded-full bg-[var(--color-neutral-100)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-neutral-500)] dark:bg-white/[0.08] dark:text-white/55">
                    {tasks.length}
                  </span>
                  <span className="font-sans text-xs text-[var(--color-neutral-400)]">{hint}</span>
                </div>

                {tasks.length === 0 ? (
                  <p className="font-sans text-xs text-[var(--color-neutral-400)]">
                    No {label.toLowerCase()} tasks.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {tasks.map((t) => (
                      <TaskCard
                        key={`${t.featureName}::${t.id}`}
                        task={{
                          id: t.id,
                          title: t.title,
                          status: t.status,
                          skill: t.skill,
                          effort: t.effort,
                          depends_on: t.depends_on,
                        }}
                        featureName={t.featureName}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </article>
  );
}
