/**
 * Control-room DataFreshnessFooter — UCC task T25 + live-feed Phase 2 PR F.
 *
 * Renders the data-freshness line at the bottom of every control-room page.
 * Two modes:
 *   - LIVE  — the FT2 state Blob is configured + reachable (Phase 2). Shows
 *     "Live as of <relative> · commit <sha7>" driven by the bundle's
 *     `generated_at`, in green.
 *   - SNAPSHOT — no Blob (or unreachable). Shows the prior "Last synced …"
 *     behavior driven by `src/data/freshness.json::syncedAt`.
 * Either mode flips to a rose stale-warning when the authoritative timestamp is
 * more than 6 hours old (PRD FR-8).
 *
 * Server component, request-scoped: `Date.now()` is read once per request (the
 * layout is auth-gated, no static-cache benefit). Provenance comes from
 * `getDataOrigin()` (lib/live-data/data-source) which returns 'snapshot' with
 * null timestamps when the Blob is unconfigured — so with no Blob this renders
 * exactly as before.
 */

import freshnessData from '@/data/freshness.json';
import { getDataOrigin } from '@/lib/live-data/data-source';

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

export interface FreshnessViewInput {
  origin: 'live-blob' | 'snapshot';
  blobGeneratedAt: string | null;
  commitSha: string | null;
  syncedAt: string;
  now: number;
}

export interface FreshnessView {
  mode: 'live' | 'snapshot';
  authoritativeTimestamp: string;
  relative: string;
  isStale: boolean;
  commitShort: string | null;
}

/**
 * Pure view computation — pick the authoritative timestamp (blob generated_at
 * when live, else synced_at), the relative label, staleness, and short commit.
 */
export function computeFreshnessView(input: FreshnessViewInput): FreshnessView {
  const isLive = input.origin === 'live-blob' && Boolean(input.blobGeneratedAt);
  const authoritativeTimestamp = isLive ? input.blobGeneratedAt! : input.syncedAt;
  const ms = Date.parse(authoritativeTimestamp);
  const deltaMs = Number.isFinite(ms) ? Math.max(0, input.now - ms) : Number.POSITIVE_INFINITY;
  return {
    mode: isLive ? 'live' : 'snapshot',
    authoritativeTimestamp,
    relative: Number.isFinite(deltaMs) ? formatRelative(deltaMs) : 'unknown',
    isStale: deltaMs > STALE_THRESHOLD_HOURS * HOUR_MS,
    commitShort: isLive && input.commitSha ? input.commitSha.slice(0, 7) : null,
  };
}

export async function DataFreshnessFooter() {
  const data = freshnessData as FreshnessFile;
  const origin = await getDataOrigin();
  // Server component renders once per request; this is the request-time clock.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  const view = computeFreshnessView({
    origin: origin.origin,
    blobGeneratedAt: origin.blobGeneratedAt,
    commitSha: origin.commitSha,
    syncedAt: data.syncedAt,
    now,
  });

  const counts = data.counts ?? {};
  const shared = counts.sharedFiles ?? 0;
  const features = counts.featureFiles ?? 0;
  const docs = counts.docFiles ?? 0;

  const baseClasses =
    'mt-8 border-t px-4 py-3 text-center font-sans text-xs sm:px-6 lg:px-8';
  const stateClasses = view.isStale
    ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300'
    : view.mode === 'live'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300'
      : 'border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] text-[var(--color-neutral-500)] dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)] dark:text-[var(--color-neutral-400)]';

  const label = view.isStale
    ? view.mode === 'live'
      ? 'Stale live data — '
      : 'Stale data — '
    : view.mode === 'live'
      ? 'Live as of '
      : 'Last synced ';

  return (
    <footer
      role="contentinfo"
      aria-label="Data freshness"
      className={`${baseClasses} ${stateClasses}`}
    >
      {view.mode === 'live' && !view.isStale ? (
        <span
          className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle"
          aria-hidden="true"
        />
      ) : null}
      <span className="font-medium">{label}</span>
      <time dateTime={view.authoritativeTimestamp}>{view.relative}</time>
      {view.commitShort ? (
        <>
          <span className="mx-2 text-[var(--color-neutral-300)] dark:text-[var(--color-neutral-700)]">·</span>
          <span>
            commit <code className="font-mono">{view.commitShort}</code>
          </span>
        </>
      ) : null}
      <span className="mx-2 text-[var(--color-neutral-300)] dark:text-[var(--color-neutral-700)]">·</span>
      <span>
        {shared} shared · {features} features · {docs} docs
      </span>
      {view.isStale ? (
        <span className="ml-2 font-semibold uppercase tracking-wider">
          (&gt;{STALE_THRESHOLD_HOURS}h)
        </span>
      ) : null}
    </footer>
  );
}
