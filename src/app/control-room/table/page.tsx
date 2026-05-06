/**
 * /control-room/table — Sortable + searchable feature table.
 *
 * Wave 1 T22 shipped the static, server-rendered table (sort by phase →
 * priority → name; no interactivity). T30 adds the client island
 * `TableViewClient` for per-column toggle sort, global search, and
 * localStorage view persistence under `control-room:table`.
 *
 * This file remains a server component: it loads the seed data once at
 * build time and hands it to the island.
 *
 * Data source: src/data/control-room-seeds/features.json (T31-T33 shipped 2026-05-08).
 */

import type { Metadata } from 'next';
import featuresData from '@/data/control-room-seeds/features.json';
import { TableViewClient, type FeatureSeed } from './TableViewClient';
import { TrackPageView } from '@/components/control-room/TrackPageView';

export const metadata: Metadata = {
  title: 'Table — Control room',
  robots: { index: false, follow: false },
};

interface FeaturesSeedFile {
  shipped: FeatureSeed[];
  planned: FeatureSeed[];
  backlog: FeatureSeed[];
}

export default function ControlRoomTablePage() {
  const seed = featuresData as unknown as FeaturesSeedFile;
  const allFeatures: FeatureSeed[] = [
    ...(seed.shipped ?? []),
    ...(seed.planned ?? []),
    ...(seed.backlog ?? []),
  ];

  return (
    <article className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      {/* GA4: dashboard_load + dashboard_sync_warning_shown (UCC T36 Phase 2) */}
      <TrackPageView route="table" />

      <header className="mb-6">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Table
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-sm leading-6 text-slate-600 dark:text-white/65">
          Every feature in one sortable list — phase, priority, RICE, category, ship date. Click a
          column header to toggle sort; the search box filters by name, phase, priority, or
          category. Sort + search persist in localStorage; append <code>?reset=true</code> to the URL
          to clear.
        </p>
      </header>

      <TableViewClient features={allFeatures} />

      <p className="mt-8 font-sans text-xs text-[var(--color-neutral-400)]">
        UCC migration in progress (T22 shipped 2026-05-08; T30 sort + search shipped{' '}
        {new Date().toISOString().slice(0, 10)}). Source: dashboard/src/components/TableView.jsx.
      </p>
    </article>
  );
}
