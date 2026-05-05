/**
 * /control-room/board — Kanban board (UCC T21 port).
 *
 * Source: dashboard/src/components/KanbanBoard.jsx (218 lines, client-side
 * with @dnd-kit drag-and-drop). This port is server-rendered and READ-ONLY:
 * the 8-column visual structure is preserved verbatim, but drag-and-drop is
 * deferred because @dnd-kit/* is not installed in fitme-story. The kanban
 * here is a status surface, not an interactive editor — the dashboard's
 * "Board changes are local only" semantics carry over (drag still requires
 * /pm-workflow to sync to GitHub).
 *
 * Phase grouping mirrors KanbanBoard.jsx lines 87-95 exactly:
 *   - 'backlog'  → only matches phase === 'backlog'
 *   - 'ux'       → matches phase ∈ {ux, integration, tasks}
 *   - 'done'     → matches phase ∈ {done, docs, merge, complete}
 *   - all others → exact phase match
 *
 * NOT YET WIRED (deferred):
 *   - Drag-and-drop card movement (@dnd-kit install + client island)
 *   - Filters (phase / priority / category dropdowns)
 *   - Undo toast on local moves
 *   - Filtered count + empty-state CTAs
 *   - Real FeatureCard component (T24); using inline minimal card here
 *
 * Data source: src/data/control-room-seeds/features.json (T31-T33 shipped 2026-05-08).
 */

import type { Metadata } from 'next';
import featuresData from '@/data/control-room-seeds/features.json';

export const metadata: Metadata = {
  title: 'Board — Control room',
  robots: { index: false, follow: false },
};

interface FeatureSeed {
  name: string;
  slug: string;
  phase: string | null;
  priority: string | null;
  rice: number | null;
  category: string | null;
  shipped: string | null;
  prd: string | null;
}

interface FeaturesSeedFile {
  shipped: FeatureSeed[];
  planned: FeatureSeed[];
  backlog: FeatureSeed[];
}

// ────────────────────────────────────────────────────────────────────────────
// Column definitions (verbatim from dashboard/src/components/KanbanBoard.jsx)
// ────────────────────────────────────────────────────────────────────────────

interface ColumnDef {
  id: string;
  label: string;
  color: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'backlog', label: 'Backlog', color: '#9CA3AF' },
  { id: 'research', label: 'Research', color: '#9CA3AF' },
  { id: 'prd', label: 'PRD', color: '#9CA3AF' },
  { id: 'ux', label: 'UX / Design', color: '#3B82F6' },
  { id: 'implement', label: 'Implement', color: '#3B82F6' },
  { id: 'testing', label: 'Testing', color: '#A855F7' },
  { id: 'review', label: 'Review', color: '#A855F7' },
  { id: 'done', label: 'Done', color: '#10B981' },
];

function bucketByColumn(features: FeatureSeed[], columnId: string): FeatureSeed[] {
  return features.filter((f) => {
    const phase = f.phase ?? 'backlog';
    if (columnId === 'backlog') return phase === 'backlog';
    if (columnId === 'ux') return phase === 'ux' || phase === 'integration' || phase === 'tasks';
    if (columnId === 'done')
      return phase === 'done' || phase === 'docs' || phase === 'merge' || phase === 'complete';
    if (columnId === 'implement') return phase === 'implement' || phase === 'implementation';
    return phase === columnId;
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Card (minimal inline; full FeatureCard port deferred to T24)
// ────────────────────────────────────────────────────────────────────────────

function FeatureCard({ feature }: { feature: FeatureSeed }) {
  const priorityClasses: Record<string, string> = {
    critical: 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-300/30 dark:bg-rose-400/10 dark:text-rose-200',
    high: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-300/30 dark:bg-amber-400/10 dark:text-amber-100',
    medium: 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-300/30 dark:bg-sky-400/10 dark:text-sky-100',
    low: 'border-slate-300 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
      <div className="text-sm font-semibold text-slate-950 dark:text-white">{feature.name}</div>
      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide">
        {feature.priority && (
          <span
            className={`rounded-full border px-1.5 py-0.5 ${
              priorityClasses[feature.priority] ?? priorityClasses.low
            }`}
          >
            {feature.priority}
          </span>
        )}
        {feature.category && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/55">
            {feature.category}
          </span>
        )}
        {feature.rice != null && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/55">
            RICE {feature.rice}
          </span>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Column
// ────────────────────────────────────────────────────────────────────────────

function Column({ column, features }: { column: ColumnDef; features: FeatureSeed[] }) {
  return (
    <div className="w-64 flex-shrink-0">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: column.color }}
          aria-hidden="true"
        />
        <h3 className="font-sans text-sm font-semibold text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          {column.label}
        </h3>
        <span className="rounded-full bg-[var(--color-neutral-100)] px-1.5 py-0.5 font-sans text-xs text-[var(--color-neutral-500)] dark:bg-white/[0.08] dark:text-white/55">
          {features.length}
        </span>
      </div>
      <div className="min-h-[120px] space-y-2 rounded-xl bg-slate-50/60 p-1 dark:bg-white/[0.02]">
        {features.length === 0 ? (
          <div className="py-8 text-center font-sans text-xs text-[var(--color-neutral-300)] dark:text-[var(--color-neutral-600)]">
            No items
          </div>
        ) : (
          features.map((f) => <FeatureCard key={f.slug} feature={f} />)
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export default function ControlRoomBoardPage() {
  const seed = featuresData as unknown as FeaturesSeedFile;
  const allFeatures: FeatureSeed[] = [
    ...(seed.shipped ?? []),
    ...(seed.planned ?? []),
    ...(seed.backlog ?? []),
  ];

  const columns = COLUMNS.map((col) => ({
    ...col,
    features: bucketByColumn(allFeatures, col.id),
  }));

  return (
    <article className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Board
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-sm leading-6 text-slate-600 dark:text-white/65">
          Every feature, bucketed by current phase. Counts reflect the seed snapshot built at deploy
          time; live drag-to-update lands in a follow-up PR.
        </p>
      </header>

      <div className="kanban-scroll flex gap-3 overflow-x-auto pb-4">
        {columns.map((col) => (
          <Column key={col.id} column={col} features={col.features} />
        ))}
      </div>

      <p className="mt-8 font-sans text-xs text-[var(--color-neutral-400)]">
        UCC migration in progress (T21 shipped {new Date().toISOString().slice(0, 10)}). Source:
        dashboard/src/components/KanbanBoard.jsx. Drag-and-drop deferred —{' '}
        <code className="rounded bg-[var(--color-neutral-100)] px-1 dark:bg-white/[0.06]">
          @dnd-kit
        </code>{' '}
        not installed in fitme-story. Filters + undo toast follow in T24+.
      </p>
    </article>
  );
}
