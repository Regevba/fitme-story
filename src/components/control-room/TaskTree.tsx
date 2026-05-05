/**
 * Control-room TaskTree — UCC task T29.
 *
 * Replaces the dashboard's `DependencyGraph.jsx` (a 207-line SVG layered DAG
 * visualization) with a much lighter "tree" representation: tasks rendered
 * in topological order, each task showing its `depends_on` IDs as a compact
 * "← deps" annotation. Tasks on the critical path get a left-border accent.
 *
 * Why this instead of a proper graph: the operator's question is usually
 * "what depends on what" — a topologically-sorted text list answers that
 * in 1-2 lines per task, scans well in a side panel, and degrades gracefully
 * for the long-tail features whose DAGs are mostly linear chains.
 *
 * Server-compatible: pure render, no hooks, no client APIs. Designed to be
 * embedded inside per-feature drill-downs (T30+ wiring) or rendered as a
 * standalone view if a "/tasks/[feature]" route gets added later.
 *
 * Source: dashboard/src/components/DependencyGraph.jsx (replaced, not
 * preserved per token-map.md visual-review allowance).
 */

import type { Task } from '@/lib/control-room/parsers/tasks';

// ────────────────────────────────────────────────────────────────────────────
// Topological sort
// ────────────────────────────────────────────────────────────────────────────

/**
 * Returns tasks in topological order (deps before dependents). Tasks whose
 * `depends_on` references unknown ids are treated as having no dependency
 * for ordering purposes — that keeps the render robust against partially-
 * synced state. Cycles get broken by emitting tasks as soon as their
 * remaining-deps count is minimal (best-effort, no exception thrown).
 */
function topoSort(tasks: Task[]): Task[] {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const remaining = new Map<string, Set<string>>(
    tasks.map((t) => [
      t.id,
      new Set((t.depends_on ?? []).filter((d) => byId.has(d))),
    ]),
  );

  const out: Task[] = [];
  const emitted = new Set<string>();

  while (out.length < tasks.length) {
    // Pick all tasks whose remaining-deps set is now empty.
    const ready = tasks.filter(
      (t) => !emitted.has(t.id) && (remaining.get(t.id)?.size ?? 0) === 0,
    );

    if (ready.length === 0) {
      // Cycle or pathological state — emit one stuck task to make progress.
      const stuck = tasks.find((t) => !emitted.has(t.id));
      if (!stuck) break;
      ready.push(stuck);
    }

    // Sort within a "layer" by id for deterministic output.
    ready.sort((a, b) => a.id.localeCompare(b.id));

    for (const t of ready) {
      out.push(t);
      emitted.add(t.id);
      // Drop t.id from every other task's remaining set.
      for (const set of remaining.values()) set.delete(t.id);
    }
  }

  return out;
}

// ────────────────────────────────────────────────────────────────────────────
// Status dot
// ────────────────────────────────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  done: 'bg-emerald-500',
  in_progress: 'bg-sky-500',
  ready: 'border border-[var(--color-neutral-400)] bg-white',
  blocked: 'bg-[var(--color-neutral-300)] dark:bg-[var(--color-neutral-700)]',
};

function statusClass(status: string | undefined): string {
  return STATUS_DOT[status ?? 'blocked'] ?? STATUS_DOT.blocked;
}

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

export interface TaskTreeProps {
  tasks: Task[];
  featureName?: string;
  /** Task IDs on the critical path. Highlighted with a left-border accent. */
  criticalPath?: string[];
}

export function TaskTree({ tasks, featureName, criticalPath = [] }: TaskTreeProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-neutral-300)] bg-white p-4 text-center dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]">
        <p className="font-sans text-xs text-[var(--color-neutral-500)]">
          {featureName ? `${featureName}: no tasks recorded.` : 'No tasks to render.'}
        </p>
      </div>
    );
  }

  const sorted = topoSort(tasks);
  const criticalSet = new Set(criticalPath);

  return (
    <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]">
      {featureName ? (
        <h3 className="mb-3 font-sans text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">
          {featureName} — task DAG
        </h3>
      ) : null}

      <ol className="space-y-1.5">
        {sorted.map((t) => {
          const isCritical = criticalSet.has(t.id);
          const dotClass = statusClass(t.effectiveStatus ?? t.status);
          const deps = t.depends_on ?? [];

          return (
            <li
              key={t.id}
              className={`flex items-start gap-2 rounded-md py-1 pl-2 pr-2 ${
                isCritical
                  ? 'border-l-2 border-l-amber-500 bg-amber-50/40 dark:bg-amber-900/10'
                  : ''
              }`}
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClass}`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-[10px] font-bold text-[var(--color-neutral-500)]">
                    {t.id}
                  </span>
                  <span className="truncate font-sans text-sm text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                    {t.title ?? '(untitled task)'}
                  </span>
                  {isCritical ? (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      critical
                    </span>
                  ) : null}
                </div>
                {deps.length > 0 ? (
                  <div className="mt-0.5 font-mono text-[10px] text-[var(--color-neutral-400)]">
                    ← {deps.join(', ')}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
