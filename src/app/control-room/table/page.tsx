/**
 * /control-room/table — Sortable feature table (UCC T22 port).
 *
 * Source: dashboard/src/components/TableView.jsx (174 lines, client-side
 * with @tanstack/react-table). This port is server-rendered: the same 6
 * columns + phase/priority badge palettes are preserved, with rows sorted
 * by PHASE_ORDER then PRIORITY_ORDER then name (mirrors the dashboard's
 * default sort).
 *
 * Interactivity (column-toggle sort, global search) is deferred — the
 * @tanstack/react-table dependency is not installed in fitme-story. The
 * table here is a static readout; T24+ will add a client island for sort
 * + search once the dep is added.
 *
 * NOT YET WIRED:
 *   - Per-column toggle sort
 *   - Global search input
 *   - Filtered row count (currently shows total count only)
 *
 * Data source: src/data/control-room-seeds/features.json (T31-T33 shipped 2026-05-08).
 */

import type { Metadata } from 'next';
import featuresData from '@/data/control-room-seeds/features.json';

export const metadata: Metadata = {
  title: 'Table — Control room',
  robots: { index: false, follow: false },
};

interface FeatureSeed {
  name: string;
  slug: string;
  phase: string | null;
  priority: string | null;
  rice: number | null;
  category: string | null;
  shipped?: string | null;
  prd?: string | null;
}

interface FeaturesSeedFile {
  shipped: FeatureSeed[];
  planned: FeatureSeed[];
  backlog: FeatureSeed[];
}

// ────────────────────────────────────────────────────────────────────────────
// Sort orders (verbatim from dashboard/src/components/TableView.jsx)
// ────────────────────────────────────────────────────────────────────────────

const PHASE_ORDER = [
  'backlog',
  'research',
  'prd',
  'tasks',
  'ux',
  'integration',
  'implement',
  'implementation',
  'testing',
  'review',
  'merge',
  'docs',
  'done',
  'complete',
];

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const PHASE_BADGE: Record<string, string> = {
  backlog: 'bg-slate-100 text-slate-600 dark:bg-white/[0.08] dark:text-white/55',
  research: 'bg-slate-100 text-slate-600 dark:bg-white/[0.08] dark:text-white/55',
  prd: 'bg-slate-100 text-slate-600 dark:bg-white/[0.08] dark:text-white/55',
  tasks: 'bg-slate-100 text-slate-600 dark:bg-white/[0.08] dark:text-white/55',
  ux: 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200',
  integration: 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200',
  implement: 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200',
  implementation: 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200',
  testing: 'bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-200',
  review: 'bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-200',
  merge: 'bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-200',
  docs: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200',
  complete: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200',
};

const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-200',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-400/15 dark:text-yellow-200',
  low: 'bg-slate-100 text-slate-500 dark:bg-white/[0.08] dark:text-white/45',
};

function compareFeatures(a: FeatureSeed, b: FeatureSeed): number {
  const phaseA = PHASE_ORDER.indexOf(a.phase ?? 'backlog');
  const phaseB = PHASE_ORDER.indexOf(b.phase ?? 'backlog');
  const phaseDelta = (phaseA === -1 ? 99 : phaseA) - (phaseB === -1 ? 99 : phaseB);
  if (phaseDelta !== 0) return phaseDelta;

  const prioA = PRIORITY_ORDER[a.priority ?? ''] ?? 99;
  const prioB = PRIORITY_ORDER[b.priority ?? ''] ?? 99;
  if (prioA !== prioB) return prioA - prioB;

  return a.name.localeCompare(b.name);
}

// ────────────────────────────────────────────────────────────────────────────
// Cells
// ────────────────────────────────────────────────────────────────────────────

function PhaseCell({ phase }: { phase: string | null }) {
  const value = phase ?? 'backlog';
  const klass = PHASE_BADGE[value] ?? PHASE_BADGE.backlog;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${klass}`}>{value}</span>
  );
}

function PriorityCell({ priority }: { priority: string | null }) {
  if (!priority) {
    return (
      <span className="text-[var(--color-neutral-300)] dark:text-[var(--color-neutral-600)]">
        —
      </span>
    );
  }
  const klass = PRIORITY_BADGE[priority] ?? '';
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${klass}`}>{priority}</span>
  );
}

function MutedOrDash({ value }: { value: string | number | null | undefined }) {
  if (value == null || value === '') {
    return (
      <span className="text-[var(--color-neutral-300)] dark:text-[var(--color-neutral-600)]">
        —
      </span>
    );
  }
  return (
    <span className="font-sans text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
      {value}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export default function ControlRoomTablePage() {
  const seed = featuresData as unknown as FeaturesSeedFile;
  const allFeatures: FeatureSeed[] = [
    ...(seed.shipped ?? []),
    ...(seed.planned ?? []),
    ...(seed.backlog ?? []),
  ];
  const sorted = [...allFeatures].sort(compareFeatures);

  return (
    <article className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Table
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-sm leading-6 text-slate-600 dark:text-white/65">
          Every feature in one sortable list — phase, priority, RICE, category, ship date.
          Per-column sort + search land in a follow-up PR.
        </p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-800)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] dark:border-[var(--color-neutral-800)] dark:bg-white/[0.02]">
              <th className="px-3 py-2 text-left font-sans text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
                Feature
              </th>
              <th className="px-3 py-2 text-left font-sans text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
                Phase
              </th>
              <th className="px-3 py-2 text-left font-sans text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
                Priority
              </th>
              <th className="px-3 py-2 text-left font-sans text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
                RICE
              </th>
              <th className="px-3 py-2 text-left font-sans text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
                Category
              </th>
              <th className="px-3 py-2 text-left font-sans text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
                Shipped
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((feature) => (
              <tr
                key={feature.slug}
                className="border-b border-[var(--color-neutral-50)] transition-colors hover:bg-[var(--color-neutral-50)]/60 dark:border-[var(--color-neutral-800)]/50 dark:hover:bg-white/[0.02]"
              >
                <td className="px-3 py-2.5 font-medium text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                  {feature.name}
                </td>
                <td className="px-3 py-2.5">
                  <PhaseCell phase={feature.phase} />
                </td>
                <td className="px-3 py-2.5">
                  <PriorityCell priority={feature.priority} />
                </td>
                <td className="px-3 py-2.5">
                  {feature.rice == null ? (
                    <MutedOrDash value={null} />
                  ) : (
                    <span className="font-mono text-xs text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                      {feature.rice}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <MutedOrDash value={feature.category} />
                </td>
                <td className="px-3 py-2.5">
                  <MutedOrDash value={feature.shipped} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="py-8 text-center font-sans text-sm text-[var(--color-neutral-400)]">
            No features.
          </div>
        )}
      </div>

      <div className="mt-3 font-sans text-xs text-[var(--color-neutral-400)] dark:text-[var(--color-neutral-500)]">
        {sorted.length} features (sorted by phase → priority → name)
      </div>

      <p className="mt-8 font-sans text-xs text-[var(--color-neutral-400)]">
        UCC migration in progress (T22 shipped {new Date().toISOString().slice(0, 10)}). Source:
        dashboard/src/components/TableView.jsx. Per-column sort + global search deferred —{' '}
        <code className="rounded bg-[var(--color-neutral-100)] px-1 dark:bg-white/[0.06]">
          @tanstack/react-table
        </code>{' '}
        not installed in fitme-story.
      </p>
    </article>
  );
}
