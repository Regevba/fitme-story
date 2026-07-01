/**
 * /control-room/analytics — analytics dashboard route.
 *
 * Phase 3.A.2–3.A.6 of analytics-observability. The Phase 1.B Calibration
 * Protocol soak window closed 2026-06-04, so the three calibration-safe
 * tiles (drift, taxonomy health, forward-declared) now bind to real synced
 * FT2 data via `getAnalyticsDashboard()`. The two GA4-API-backed tiles
 * (event volume, recent events) stay on fixtures by design — their sources
 * are not build-time-resolvable for a pre-launch property. Per-tile
 * provenance is shown by each tile's `meta.status` badge.
 *
 * Server component. No client APIs. Auth via the existing UCC passkey
 * flow that gates all /control-room/* routes.
 *
 * See:
 * - FT2 docs/master-plan/analytics-master-plan-2026-05-13.md §7.1
 * - FT2 docs/master-plan/analytics-dashboard-metric-definitions.md (per-tile contracts)
 * - FT2 docs/setup/control-room-analytics-setup-guide.md (operator runbook)
 * - README.md in this directory (route-local notes)
 */

import type { Metadata } from 'next';

import { DriftTrendTile } from '@/components/control-room/DriftTrendTile';
import { EventVolumeTile } from '@/components/control-room/EventVolumeTile';
import { ForwardDeclaredEventsTile } from '@/components/control-room/ForwardDeclaredEventsTile';
import { RecentEventsStream } from '@/components/control-room/RecentEventsStream';
import { TaxonomyHealthTile } from '@/components/control-room/TaxonomyHealthTile';
import { getAnalyticsDashboard } from '@/lib/control-room/analytics-live';

export const metadata: Metadata = {
  title: 'Analytics — FitMe Control Room',
  description:
    'Operator dashboard: event volume, CSV taxonomy drift, taxonomy health, recent events, forward-declared catalog.',
  robots: { index: false, follow: false },
};

export default function AnalyticsPage() {
  const data = getAnalyticsDashboard();

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="font-sans text-2xl font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
          Analytics
        </h1>
        <p className="mt-2 max-w-2xl font-sans text-sm text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
          Per-feature analytics health: event firing rate, taxonomy drift,
          alignment between code + canonical CSV, recent live events, and
          the forward-declared catalog. Drift, taxonomy-health, and
          forward-declared tiles read live synced FT2 data; the two
          GA4-API-backed tiles (event volume, recent events) show placeholder
          data until the property has post-launch traffic. Each tile’s status
          badge shows its provenance. See README.md for operator notes.
        </p>
      </header>

      <ProvenanceBanner />

      <section
        aria-label="Top-level metrics"
        className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        <EventVolumeTile data={data.event_volume} />
        <DriftTrendTile data={data.drift_trend} />
        <TaxonomyHealthTile data={data.taxonomy_health} />
      </section>

      <section
        aria-label="Realtime + catalog"
        className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <RecentEventsStream data={data.recent_events_stream} />
        <ForwardDeclaredEventsTile data={data.forward_declared} />
      </section>
    </main>
  );
}

function ProvenanceBanner() {
  return (
    <aside
      role="status"
      className="rounded-md border border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)] px-4 py-3"
    >
      <p className="font-sans text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
        <strong className="font-semibold">Live data.</strong> Drift, taxonomy
        health, and forward-declared tiles bind to synced FT2 data
        (external-sync-status.json + analytics-taxonomy.csv). Event volume and
        recent events remain placeholders until the GA4 property reports
        post-launch traffic — the GA4 Reporting/Realtime APIs are not
        resolvable at build time pre-launch.
      </p>
    </aside>
  );
}
