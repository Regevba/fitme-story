/**
 * /control-room/analytics — analytics dashboard route.
 *
 * Phase 3.A.1 of analytics-observability. Renders 5 tiles using fixture
 * data during the calibration window (2026-05-14 → 2026-06-04). Live GA4
 * binding ships in a follow-up PR after 2026-06-04 per master plan §7.5.
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
import { fixtureDashboard } from '@/lib/control-room/analytics-fixtures';

export const metadata: Metadata = {
  title: 'Analytics — FitMe Control Room',
  description:
    'Operator dashboard: event volume, CSV taxonomy drift, taxonomy health, recent events, forward-declared catalog.',
  robots: { index: false, follow: false },
};

export default function AnalyticsPage() {
  const data = fixtureDashboard;

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="font-sans text-2xl font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
          Analytics
        </h1>
        <p className="mt-2 max-w-2xl font-sans text-sm text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
          Per-feature analytics health: event firing rate, taxonomy drift,
          alignment between code + canonical CSV, recent live events, and
          the forward-declared catalog. GA4-backed tiles render fixture data
          during the Phase 1.B Calibration Protocol soak window
          (2026-05-14&nbsp;→&nbsp;2026-06-04). See README.md for operator notes.
        </p>
      </header>

      <CalibrationBanner />

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

function CalibrationBanner() {
  return (
    <aside
      role="status"
      className="rounded-md border border-[var(--color-warning-300)] bg-[var(--color-warning-50)] dark:border-[var(--color-warning-700)] dark:bg-[var(--color-warning-950)] px-4 py-3"
    >
      <p className="font-sans text-sm text-[var(--color-warning-800)] dark:text-[var(--color-warning-200)]">
        <strong className="font-semibold">Calibration window active.</strong> GA4-backed
        tiles render fixture data through 2026-06-04 per master plan §7.5
        calibration safety classification. Static-source tiles (drift,
        health, forward-declared) are accurate at scaffold time; live
        binding ships post-window.
      </p>
    </aside>
  );
}
