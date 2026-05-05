/**
 * Control-room DataFreshnessFooter — UCC task T25.
 *
 * Renders the last-sync timestamp + counts at the bottom of every control-room
 * page. Per PRD FR-8: when the sync is more than 6 hours old, the footer
 * switches to a red-warning state to surface staleness to the operator.
 *
 * Data source: `src/data/freshness.json`, written at prebuild time by
 * `scripts/sync-from-fittracker2.ts`. The file is overwritten on every sync
 * with `syncedAt` (ISO timestamp) + `counts` totals + the full `checkedFiles`
 * list. We only render `syncedAt` + the four count totals here.
 *
 * Server component, request-scoped: `Date.now()` is read inside the body
 * because the layout is auth-gated (no static caching benefit) and renders
 * once per request. The `react-hooks/purity` lint flags this pattern even
 * for RSCs, so the call is annotated below.
 */

import freshnessData from '@/data/freshness.json';

interface FreshnessFile {
  syncedAt: string;
  durationMs?: number;
  source?: string;
  counts: {
    sharedFiles?: number;
    featureFiles?: number;
    docFiles?: number;
    kbFiles?: number;
    bytesTotal?: number;
  };
}

const STALE_THRESHOLD_HOURS = 6;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

function formatRelative(deltaMs: number): string {
  if (deltaMs < MINUTE_MS) return 'just now';
  if (deltaMs < HOUR_MS) {
    const m = Math.round(deltaMs / MINUTE_MS);
    return `${m} minute${m === 1 ? '' : 's'} ago`;
  }
  if (deltaMs < 24 * HOUR_MS) {
    const h = Math.round(deltaMs / HOUR_MS);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  const d = Math.round(deltaMs / (24 * HOUR_MS));
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

export function DataFreshnessFooter() {
  const data = freshnessData as FreshnessFile;
  const syncedAtMs = Date.parse(data.syncedAt);
  // Server component renders once per request; this is the request-time clock.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const deltaMs = Number.isFinite(syncedAtMs) ? Math.max(0, now - syncedAtMs) : Number.POSITIVE_INFINITY;
  const isStale = deltaMs > STALE_THRESHOLD_HOURS * HOUR_MS;
  const relative = Number.isFinite(deltaMs) ? formatRelative(deltaMs) : 'unknown';

  const counts = data.counts ?? {};
  const shared = counts.sharedFiles ?? 0;
  const features = counts.featureFiles ?? 0;
  const docs = counts.docFiles ?? 0;

  const baseClasses =
    'mt-8 border-t px-4 py-3 text-center font-sans text-xs sm:px-6 lg:px-8';
  const stateClasses = isStale
    ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300'
    : 'border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] text-[var(--color-neutral-500)] dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)] dark:text-[var(--color-neutral-400)]';

  return (
    <footer
      role="contentinfo"
      aria-label="Data freshness"
      className={`${baseClasses} ${stateClasses}`}
    >
      <span className="font-medium">{isStale ? 'Stale data — ' : 'Last synced '}</span>
      <time dateTime={data.syncedAt}>{relative}</time>
      <span className="mx-2 text-[var(--color-neutral-300)] dark:text-[var(--color-neutral-700)]">·</span>
      <span>
        {shared} shared · {features} features · {docs} docs
      </span>
      {isStale ? (
        <span className="ml-2 font-semibold uppercase tracking-wider">
          (&gt;{STALE_THRESHOLD_HOURS}h)
        </span>
      ) : null}
    </footer>
  );
}
