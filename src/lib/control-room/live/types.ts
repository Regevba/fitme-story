/**
 * Live-source envelope types for the control-room (UCC) live data feed.
 *
 * Every `live/<source>.ts` module returns a `LiveSourceResult<T>` and MUST
 * NOT throw. The runtime contract is FAIL-SOFT (the opposite of the build-time
 * `scripts/sync-from-fittracker2.ts` fail-fast philosophy): if a live fetch
 * cannot complete, the module returns `{ degraded: true, mode: 'snapshot' }`
 * and the caller falls back to the synced `external-sync-status.json` slice.
 *
 * SERVER-ONLY: these modules read tokens from `process.env`. Importing them in
 * client code would leak secrets, so each module guards `typeof window`.
 */

/** Where a rendered value came from. */
export type LiveOrigin = 'live' | 'snapshot';

/**
 * Uniform result envelope for a single external source.
 *
 * - `data`   — the live payload when `mode === 'live'`, else `null`.
 * - `healthy`/`alerts` — surfaced on the source tile.
 * - `degraded` — true when no live data could be fetched (use the snapshot).
 * - `error`  — internal reason for the degrade; NEVER rendered publicly.
 */
export interface LiveSourceResult<T> {
  source: string;
  mode: LiveOrigin;
  degraded: boolean;
  data: T | null;
  healthy: boolean;
  alerts: number;
  fetchedAt: string | null;
  error?: string;
}

/** Build a degraded result — the caller should fall back to the snapshot. */
export function degradedResult<T>(source: string, error: string): LiveSourceResult<T> {
  return {
    source,
    mode: 'snapshot',
    degraded: true,
    data: null,
    healthy: false,
    alerts: 0,
    fetchedAt: null,
    error,
  };
}

/** Build a successful live result. */
export function liveResult<T>(
  source: string,
  data: T,
  opts: { healthy: boolean; alerts: number; fetchedAt: string },
): LiveSourceResult<T> {
  return {
    source,
    mode: 'live',
    degraded: false,
    data,
    healthy: opts.healthy,
    alerts: opts.alerts,
    fetchedAt: opts.fetchedAt,
  };
}
