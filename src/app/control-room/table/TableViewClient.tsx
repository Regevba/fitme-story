'use client';

/**
 * /control-room/table — interactive sort + search island (UCC T30).
 *
 * Adds the per-column toggle sort + global search input that were deferred
 * in the T22 Wave 1 port (the original used @tanstack/react-table, which
 * isn't installed in fitme-story; here we hand-roll lightweight client-side
 * sort + filter). View state persists to localStorage via `useViewPrefs`
 * under the key `control-room:table`.
 *
 * The server parent at `page.tsx` loads + initially-orders the features;
 * this island re-orders + filters in place. No data fetch on the client.
 */

import { useMemo, useRef } from 'react';
import { useViewPrefs } from '@/lib/control-room/use-view-prefs';
import { trackFilterApply } from '@/lib/control-room/analytics';

// ────────────────────────────────────────────────────────────────────────────
// Domain types — duplicated minimally from page.tsx so the client island
// stays self-contained. Kept in sync via the seed shape (which is stable).
// ────────────────────────────────────────────────────────────────────────────

export interface FeatureSeed {
  name: string;
  slug: string;
  phase: string | null;
  priority: string | null;
  rice: number | null;
  category: string | null;
  shipped?: string | null;
  prd?: string | null;
}

export type SortKey = 'name' | 'phase' | 'priority' | 'rice' | 'category' | 'shipped';
export type SortDir = 'asc' | 'desc';

interface TablePrefs {
  sortKey: SortKey;
  sortDir: SortDir;
  search: string;
}

const DEFAULT_PREFS: TablePrefs = {
  sortKey: 'phase',
  sortDir: 'asc',
  search: '',
};

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

// ────────────────────────────────────────────────────────────────────────────
// Sort comparators
// ────────────────────────────────────────────────────────────────────────────

function compareForKey(key: SortKey, a: FeatureSeed, b: FeatureSeed): number {
  switch (key) {
    case 'name':
      return a.name.localeCompare(b.name);
    case 'phase': {
      const ai = PHASE_ORDER.indexOf(a.phase ?? 'backlog');
      const bi = PHASE_ORDER.indexOf(b.phase ?? 'backlog');
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    }
    case 'priority': {
      const ai = PRIORITY_ORDER[a.priority ?? ''] ?? 99;
      const bi = PRIORITY_ORDER[b.priority ?? ''] ?? 99;
      return ai - bi;
    }
    case 'rice': {
      const ai = a.rice ?? -1;
      const bi = b.rice ?? -1;
      return bi - ai; // higher RICE first by default
    }
    case 'category':
      return (a.category ?? '~').localeCompare(b.category ?? '~');
    case 'shipped':
      return (a.shipped ?? '').localeCompare(b.shipped ?? '');
  }
}

function applyPrefs(features: FeatureSeed[], prefs: TablePrefs): FeatureSeed[] {
  const q = prefs.search.trim().toLowerCase();
  const filtered = q
    ? features.filter((f) => {
        return (
          f.name.toLowerCase().includes(q) ||
          (f.phase ?? '').toLowerCase().includes(q) ||
          (f.priority ?? '').toLowerCase().includes(q) ||
          (f.category ?? '').toLowerCase().includes(q)
        );
      })
    : features;

  const dir = prefs.sortDir === 'asc' ? 1 : -1;
  return [...filtered].sort((a, b) => compareForKey(prefs.sortKey, a, b) * dir);
}

// ────────────────────────────────────────────────────────────────────────────
// Cells (mirror page.tsx; kept inline since this island is self-contained)
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
      <span className="text-[var(--color-neutral-300)] dark:text-[var(--color-neutral-600)]">—</span>
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
      <span className="text-[var(--color-neutral-300)] dark:text-[var(--color-neutral-600)]">—</span>
    );
  }
  return (
    <span className="font-sans text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
      {value}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sortable header cell
// ────────────────────────────────────────────────────────────────────────────

interface SortHeaderProps {
  label: string;
  columnKey: SortKey;
  prefs: TablePrefs;
  onSort: (key: SortKey) => void;
}

function SortHeader({ label, columnKey, prefs, onSort }: SortHeaderProps) {
  const isActive = prefs.sortKey === columnKey;
  const arrow = isActive ? (prefs.sortDir === 'asc' ? '↑' : '↓') : '';
  return (
    <th
      className="px-3 py-2 text-left"
      aria-sort={isActive ? (prefs.sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={`group inline-flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${
          isActive
            ? 'text-[var(--color-brand-indigo)]'
            : 'text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-400)] dark:hover:text-[var(--color-neutral-200)]'
        }`}
      >
        <span>{label}</span>
        {arrow ? (
          <span aria-hidden="true" className="font-mono text-[10px]">
            {arrow}
          </span>
        ) : (
          <span aria-hidden="true" className="font-mono text-[10px] opacity-0 group-hover:opacity-30">
            ↕
          </span>
        )}
      </button>
    </th>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

export interface TableViewClientProps {
  features: FeatureSeed[];
}

export function TableViewClient({ features }: TableViewClientProps) {
  const [prefs, setPrefs] = useViewPrefs<TablePrefs>('table', DEFAULT_PREFS);

  const rows = useMemo(() => applyPrefs(features, prefs), [features, prefs]);

  // Debounce search-tracking so each keystroke doesn't fire GA. Sort fires
  // immediately because each click is a distinct intentional action.
  const searchTrackTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSort = (key: SortKey) => {
    let nextDir: SortDir = 'asc';
    setPrefs((prev) => {
      if (prev.sortKey === key) {
        nextDir = prev.sortDir === 'asc' ? 'desc' : 'asc';
        return { ...prev, sortDir: nextDir };
      }
      return { ...prev, sortKey: key, sortDir: 'asc' };
    });
    // GA4 dashboard_filter_apply — fire one event per intentional sort change.
    trackFilterApply({ filter_field: `sort:${key}:${nextDir}`, filter_value_count: 1 });
  };

  const handleSearch = (value: string) => {
    setPrefs((prev) => ({ ...prev, search: value }));
    // Debounced GA4 dashboard_filter_apply — coalesce keystrokes into one event
    // 500ms after the user stops typing. value.length=0 when search clears.
    if (searchTrackTimerRef.current) clearTimeout(searchTrackTimerRef.current);
    searchTrackTimerRef.current = setTimeout(() => {
      const trimmed = value.trim();
      trackFilterApply({
        filter_field: 'search',
        filter_value_count: trimmed.length > 0 ? trimmed.length : 0,
      });
    }, 500);
  };

  const handleResetPrefs = () => {
    setPrefs(DEFAULT_PREFS);
    if (searchTrackTimerRef.current) clearTimeout(searchTrackTimerRef.current);
    trackFilterApply({ filter_field: 'reset', filter_value_count: 0 });
  };

  const isCustomized =
    prefs.sortKey !== DEFAULT_PREFS.sortKey ||
    prefs.sortDir !== DEFAULT_PREFS.sortDir ||
    prefs.search !== DEFAULT_PREFS.search;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative flex-1 min-w-[240px]">
          <input
            type="search"
            placeholder="Search name, phase, priority, category…"
            value={prefs.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2 font-sans text-sm text-[var(--color-neutral-900)] outline-none transition-colors placeholder:text-[var(--color-neutral-400)] focus:border-[var(--color-brand-indigo)] dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]"
            aria-label="Search features"
          />
        </label>
        {isCustomized ? (
          <button
            type="button"
            onClick={handleResetPrefs}
            className="rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2 font-sans text-xs font-medium text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-50)] dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)] dark:text-[var(--color-neutral-400)] dark:hover:bg-white/[0.04]"
          >
            Reset view
          </button>
        ) : null}
        <span className="font-mono text-xs text-[var(--color-neutral-400)]">
          {rows.length} of {features.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-800)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] dark:border-[var(--color-neutral-800)] dark:bg-white/[0.02]">
              <SortHeader label="Feature" columnKey="name" prefs={prefs} onSort={handleSort} />
              <SortHeader label="Phase" columnKey="phase" prefs={prefs} onSort={handleSort} />
              <SortHeader label="Priority" columnKey="priority" prefs={prefs} onSort={handleSort} />
              <SortHeader label="RICE" columnKey="rice" prefs={prefs} onSort={handleSort} />
              <SortHeader label="Category" columnKey="category" prefs={prefs} onSort={handleSort} />
              <SortHeader label="Shipped" columnKey="shipped" prefs={prefs} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {rows.map((feature) => (
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
        {rows.length === 0 ? (
          <div className="py-8 text-center font-sans text-sm text-[var(--color-neutral-400)]">
            {prefs.search ? `No matches for "${prefs.search}".` : 'No features.'}
          </div>
        ) : null}
      </div>
    </>
  );
}
