// src/lib/control-room/state-sync-health.ts
//
// FIT-183 (R17) — pure health computation behind the cross-repo state-sync
// health endpoint. Kept separate from the route handler so it is unit-testable
// without Next request plumbing (mirrors control-room/DataFreshnessFooter's
// computeFreshnessView).
//
// The fitme-story pre-build sync (scripts/sync-from-fittracker2.ts) mirrors FT2
// state into src/data and stamps src/data/freshness.json::syncedAt. If that sync
// silently stops (cron auth drift, SSD unmount, etc.) the mirrored data goes
// stale without any surface. This endpoint makes staleness a queryable HTTP
// signal the FT2 daily checkpoint probes.

/**
 * Freshness threshold — synced data older than this is unhealthy.
 *
 * Calibrated to the actual FT2→fitme-story mirror cadence. The forward sync
 * is a *manual* periodic `chore(sync)` PR to main (not an automated cron —
 * the blob live-feed path is inert until BLOB_READ_WRITE_TOKEN is wired), and
 * in practice runs roughly daily-to-every-few-days. The original 6h threshold
 * was far tighter than that cadence, so the endpoint reported `stale` for most
 * of the gap between normal manual syncs — a chronic false WARN in
 * `make integrity-sweep`. 48h tolerates the normal cadence while still flagging
 * a genuinely stalled sync (cron/SSD/auth drift → >2 days silent).
 */
export const STALE_THRESHOLD_MINUTES = 48 * 60; // 48h

export interface SyncHealthInput {
  /** freshness.json::syncedAt (ISO-8601), or null if the file is missing. */
  syncedAt: string | null;
  /** Count of mirrored FT2 feature state.json files. */
  ft2StateCount: number;
  /** Line count of the mirrored gate-coverage-ft2.jsonl stream. */
  gateCoverageLines: number;
  /** Current time in epoch ms (injected for deterministic tests). */
  now: number;
}

export interface SyncHealthView {
  last_sync_ts: string | null;
  ft2_state_count: number;
  gate_coverage_lines: number;
  /** Whole minutes since the last sync; null when syncedAt is unparseable. */
  age_minutes: number | null;
  healthy: boolean;
  /** Machine-readable reason when not healthy. */
  reason: 'ok' | 'no_sync_timestamp' | 'unparseable_timestamp' | 'stale' | 'empty_mirror';
}

export function computeSyncHealth(input: SyncHealthInput): SyncHealthView {
  const { syncedAt, ft2StateCount, gateCoverageLines, now } = input;

  const base = {
    last_sync_ts: syncedAt,
    ft2_state_count: ft2StateCount,
    gate_coverage_lines: gateCoverageLines,
  };

  if (!syncedAt) {
    return { ...base, age_minutes: null, healthy: false, reason: 'no_sync_timestamp' };
  }

  const parsed = Date.parse(syncedAt);
  if (Number.isNaN(parsed)) {
    return { ...base, age_minutes: null, healthy: false, reason: 'unparseable_timestamp' };
  }

  const ageMinutes = Math.max(0, Math.floor((now - parsed) / 60_000));

  // An empty mirror (0 feature files) means the sync ran but copied nothing —
  // treat as unhealthy even if the timestamp is fresh.
  if (ft2StateCount <= 0) {
    return { ...base, age_minutes: ageMinutes, healthy: false, reason: 'empty_mirror' };
  }

  if (ageMinutes > STALE_THRESHOLD_MINUTES) {
    return { ...base, age_minutes: ageMinutes, healthy: false, reason: 'stale' };
  }

  return { ...base, age_minutes: ageMinutes, healthy: true, reason: 'ok' };
}
