'use client';

// CaseStudyComparisonTable — every case study at a glance.
//
// Goal 2 of the case-study presentation refactor backlog item (S3-G2 in the
// roadmap stress test). Single client component that takes pre-loaded rows
// from the server page and provides sort + filter + search + responsive
// collapse.
//
// Reuses the slate/indigo palette + Tailwind utilities already in use across
// /control-room and existing case-study templates. No new tokens.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowDown, ExternalLink, Search } from 'lucide-react';

export interface ComparisonRow {
  slug: string;
  title: string;
  version: string | null;
  date: string | null;
  workType: string | null;
  tier: 'flagship' | 'standard' | 'light' | 'appendix' | 'ops-combined' | 'unassigned';
  tldr: string | null;
  headlineNumber: string | null;
  killFired: boolean | null;
}

type SortKey = 'version' | 'date' | 'tier' | 'workType';
type SortDir = 'asc' | 'desc';

const TIER_ORDER: Record<ComparisonRow['tier'], number> = {
  flagship: 0,
  standard: 1,
  light: 2,
  'ops-combined': 3,
  appendix: 4,
  unassigned: 5,
};

const TIER_PILL: Record<ComparisonRow['tier'], string> = {
  flagship: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200',
  standard: 'bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-200',
  light: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
  appendix: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
  'ops-combined': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/20 dark:text-fuchsia-200',
  unassigned: 'bg-slate-50 text-slate-500 dark:bg-white/8 dark:text-white/50',
};

function compareVersion(a: string | null, b: string | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  // Compare semver-ish "7.8.1" vs "5.0" — split on dot, numeric-pairwise
  const pa = a.split('.').map((s) => parseInt(s, 10) || 0);
  const pb = b.split('.').map((s) => parseInt(s, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}

function truncate(s: string | null, n = 120): string {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export default function CaseStudyComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('version');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<Set<ComparisonRow['tier']>>(
    new Set(['flagship', 'standard', 'light', 'appendix', 'ops-combined', 'unassigned']),
  );

  const allTiers: ComparisonRow['tier'][] = [
    'flagship',
    'standard',
    'light',
    'ops-combined',
    'appendix',
    'unassigned',
  ];

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function toggleTier(t: ComparisonRow['tier']) {
    setTierFilter((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (!tierFilter.has(r.tier)) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        (r.tldr ?? '').toLowerCase().includes(q) ||
        (r.workType ?? '').toLowerCase().includes(q)
      );
    });
  }, [rows, search, tierFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'version':
          cmp = compareVersion(a.version, b.version);
          break;
        case 'date':
          cmp = (a.date ?? '').localeCompare(b.date ?? '');
          break;
        case 'tier':
          cmp = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
          break;
        case 'workType':
          cmp = (a.workType ?? '').localeCompare(b.workType ?? '');
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ArrowUp className="ml-1 h-3 w-3 opacity-30" aria-hidden="true" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3" aria-hidden="true" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" aria-hidden="true" />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter + search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tier">
          {allTiers.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTier(t)}
              aria-pressed={tierFilter.has(t)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                tierFilter.has(t)
                  ? TIER_PILL[t]
                  : 'bg-white text-slate-400 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-white/4 dark:text-white/40 dark:ring-white/15 dark:hover:bg-white/8'
              }`}
              style={{ '--tw-ring-color': 'var(--color-brand-indigo)' } as React.CSSProperties}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-white/40"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search title or TL;DR…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search case studies"
            className="rounded-full border border-slate-200 bg-white py-1.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
            style={{ '--tw-ring-color': 'var(--color-brand-indigo)' } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-slate-500 dark:text-white/50" aria-live="polite">
        Showing {sorted.length} of {rows.length} case studies
      </p>

      {/* Table — hidden on small screens */}
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white sm:block dark:border-white/10 dark:bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/4">
              <SortableTh active={sortKey === 'version'} onClick={() => toggleSort('version')}>
                Version <SortIcon k="version" />
              </SortableTh>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                Title
              </th>
              <SortableTh active={sortKey === 'date'} onClick={() => toggleSort('date')}>
                Date <SortIcon k="date" />
              </SortableTh>
              <SortableTh active={sortKey === 'workType'} onClick={() => toggleSort('workType')}>
                Type <SortIcon k="workType" />
              </SortableTh>
              <SortableTh active={sortKey === 'tier'} onClick={() => toggleSort('tier')}>
                Tier <SortIcon k="tier" />
              </SortableTh>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                TL;DR
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                Headline
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500 dark:text-white/50">
                  No case studies match. Adjust filters.
                </td>
              </tr>
            ) : (
              sorted.map((r) => (
                <tr
                  key={r.slug}
                  className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/4"
                >
                  <td className="px-4 py-3 align-top font-mono text-xs font-semibold text-slate-700 dark:text-white/70">
                    {r.version ?? '—'}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/case-studies/${r.slug}`}
                      className="font-medium text-slate-900 underline-offset-4 hover:underline dark:text-white"
                    >
                      {r.title}
                    </Link>
                    {r.killFired === true && (
                      <span className="ml-2 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800 dark:bg-rose-500/20 dark:text-rose-200">
                        kill fired
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-xs text-slate-500 dark:text-white/50">
                    {r.date ?? '—'}
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-slate-600 dark:text-white/60">
                    {r.workType ?? '—'}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${TIER_PILL[r.tier]}`}
                    >
                      {r.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-slate-600 dark:text-white/60">
                    {truncate(r.tldr, 120)}
                  </td>
                  <td className="px-4 py-3 align-top text-xs font-semibold text-slate-700 dark:text-white/70">
                    {r.headlineNumber ?? '—'}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/case-studies/${r.slug}`}
                      aria-label={`Open ${r.title}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-white/40 dark:hover:bg-white/8 dark:hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list */}
      <ul className="space-y-2 sm:hidden">
        {sorted.length === 0 ? (
          <li className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/4 dark:text-white/50">
            No case studies match. Adjust filters.
          </li>
        ) : (
          sorted.map((r) => (
            <li
              key={r.slug}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/4"
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/case-studies/${r.slug}`}
                  className="text-sm font-semibold text-slate-900 underline-offset-4 hover:underline dark:text-white"
                >
                  {r.title}
                </Link>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TIER_PILL[r.tier]}`}>
                  {r.tier}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-slate-500 dark:text-white/50">
                <span>v{r.version ?? '—'}</span>
                <span>{r.date ?? '—'}</span>
                {r.workType && <span>{r.workType}</span>}
                {r.killFired === true && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200">
                    kill fired
                  </span>
                )}
              </div>
              {r.tldr && (
                <p className="mt-2 text-xs text-slate-600 dark:text-white/60">{truncate(r.tldr, 140)}</p>
              )}
              {r.headlineNumber && (
                <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-white/70">
                  {r.headlineNumber}
                </p>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function SortableTh({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <th className="px-4 py-3 text-left">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center text-xs font-semibold uppercase tracking-wider transition ${
          active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/50'
        } hover:text-slate-900 dark:hover:text-white`}
      >
        {children}
      </button>
    </th>
  );
}
