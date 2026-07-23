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
import { loadFeaturesGrouped } from '@/lib/control-room/load-features-from-state';
import { TrackPageView } from '@/components/control-room/TrackPageView';
import { TrackedExternalLink } from '@/components/control-room/TrackedExternalLink';

const FT2_REPO_BLOB = 'https://github.com/Regevba/FitTracker2/blob/main';
const FT2_REPO_TREE = 'https://github.com/Regevba/FitTracker2/tree/main';

/** Resolve a clickable destination for a feature card.
 *  Prefer the explicit PRD path on the seed; fall back to the feature's
 *  `.claude/features/<slug>/` directory for features without a written PRD. */
function featureHref(feature: FeatureSeed): string {
  if (feature.prd) return `${FT2_REPO_BLOB}/${feature.prd.replace(/^\/+/, '')}`;
  return `${FT2_REPO_TREE}/.claude/features/${feature.slug}`;
}

export const metadata: Metadata = {
  title: 'Board — Control room',
  robots: { index: false, follow: false },
};

import type { FeatureSeed, GroupedFeatures } from '@/lib/control-room/load-features-from-state';

// ────────────────────────────────────────────────────────────────────────────
// Column definitions (verbatim from dashboard/src/components/KanbanBoard.jsx)
// ────────────────────────────────────────────────────────────────────────────

interface ColumnDef {
  id: string;
  label: string;
  color: string;
}

// Phase dots reference the semantic lifecycle tokens in globals.css (FIT-135)
// rather than raw hex, so dark mode and any future palette change flow through
// the design system instead of needing an edit here.
const COLUMNS: ColumnDef[] = [
  { id: 'backlog', label: 'Backlog', color: 'var(--color-phase-pending)' },
  { id: 'research', label: 'Research', color: 'var(--color-phase-pending)' },
  { id: 'prd', label: 'PRD', color: 'var(--color-phase-pending)' },
  { id: 'ux', label: 'UX / Design', color: 'var(--color-phase-building)' },
  { id: 'implement', label: 'Implement', color: 'var(--color-phase-building)' },
  { id: 'testing', label: 'Testing', color: 'var(--color-phase-verifying)' },
  { id: 'review', label: 'Review', color: 'var(--color-phase-verifying)' },
  { id: 'done', label: 'Done', color: 'var(--color-phase-done)' },
];

function bucketByColumn(features: FeatureSeed[], columnId: string): FeatureSeed[] {
  return features.filter((f) => {
    const phase = f.phase ?? 'backlog';
    if (columnId === 'backlog') return phase === 'backlog';
    if (columnId === 'ux')
      // state.json uses 'ux_or_integration'; legacy seed used 'ux' or 'integration'.
      // 'tasks' belongs here per dashboard/KanbanBoard.jsx convention.
      return phase === 'ux' || phase === 'integration' || phase === 'ux_or_integration' || phase === 'tasks';
    if (columnId === 'done')
      // state.json uses 'documentation' before 'complete'; legacy used 'docs'.
      return (
        phase === 'done' ||
        phase === 'docs' ||
        phase === 'documentation' ||
        phase === 'merge' ||
        phase === 'complete'
      );
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
    low: 'border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] text-[var(--color-neutral-700)] dark:border-white/10 dark:bg-white/5 dark:text-white/60',
  };

  const href = featureHref(feature);
  const targetLabel = feature.prd ? 'View PRD' : 'View feature directory';

  return (
    <TrackedExternalLink
      href={href}
      linkType="github"
      targetId={`prd:${feature.slug}`}
      className="block rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-0,#fff)] px-3 py-2.5 shadow-[var(--elevation-1)] transition-colors hover:border-[var(--color-brand-indigo)] hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none dark:hover:border-[var(--color-brand-indigo)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold text-[var(--color-neutral-900)] dark:text-white">{feature.name}</div>
        <span
          className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-[var(--color-neutral-500)] group-hover:text-[var(--color-brand-indigo)] dark:text-white/45"
          aria-label={targetLabel}
          title={targetLabel}
        >
          ↗
        </span>
      </div>
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
          <span className="rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-1.5 py-0.5 text-[var(--color-neutral-500)] dark:border-white/10 dark:bg-white/5 dark:text-white/55">
            {feature.category}
          </span>
        )}
        {feature.rice != null && (
          <span className="rounded-full border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-1.5 py-0.5 text-[var(--color-neutral-500)] dark:border-white/10 dark:bg-white/5 dark:text-white/55">
            RICE {feature.rice}
          </span>
        )}
      </div>
    </TrackedExternalLink>
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
      <div className="min-h-[120px] space-y-2 rounded-xl bg-[var(--color-neutral-50)]/60 p-1 dark:bg-white/[0.02]">
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

export default async function ControlRoomBoardPage() {
  const grouped: GroupedFeatures = await loadFeaturesGrouped();
  const allFeatures: FeatureSeed[] = [
    ...grouped.shipped,
    ...grouped.planned,
    ...grouped.backlog,
  ];

  const columns = COLUMNS.map((col) => ({
    ...col,
    features: bucketByColumn(allFeatures, col.id),
  }));

  return (
    <article className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      {/* GA4: dashboard_load + dashboard_sync_warning_shown (UCC T36) */}
      <TrackPageView route="board" />

      <header className="mb-6">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--color-neutral-900)] dark:text-white">
          Board
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-sm leading-6 text-[var(--color-neutral-700)] dark:text-white/65">
          Every feature, bucketed by current phase. Sourced live from{' '}
          <code className="rounded bg-[var(--color-neutral-100)] px-1 dark:bg-white/[0.06]">
            src/data/features/*.json
          </code>{' '}
          (synced from FT2 <code className="rounded bg-[var(--color-neutral-100)] px-1 dark:bg-white/[0.06]">.claude/features/*/state.json</code> at prebuild time). Drag-to-update lands in a follow-up PR.
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
