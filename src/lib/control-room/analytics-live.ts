/**
 * Live data provider for the /control-room/analytics tiles.
 *
 * Phase 3.A.2–3.A.6 of analytics-observability — replaces the Phase 3.A.1
 * fixture scaffold. The Phase 1.B Calibration Protocol soak window closed
 * 2026-06-04 (FT2 analytics-master-plan §7.5), so the calibration-safe
 * (🟢) tiles now bind to real synced FT2 data:
 *
 *   - DriftTrendTile        ← src/data/shared/external-sync-status.json
 *   - TaxonomyHealthTile     ← src/data/shared/external-sync-status.json
 *   - ForwardDeclaredEvents  ← src/data/docs/docs/product/analytics-taxonomy.csv
 *
 * The two GA4-API-backed tiles remain on fixtures BY DESIGN — their
 * authoritative sources cannot be resolved at build/request time for a
 * pre-launch property:
 *
 *   - EventVolumeTile   → GA4 Reporting API (eventCount) — not synced; the
 *                         only real GA4 signal we mirror is the trailing-7d
 *                         active-users probe (a few users/day pre-launch),
 *                         which is NOT event volume, so we do not fake it.
 *   - RecentEventsStream → GA4 Realtime API — inherently un-syncable at
 *                         build time; needs a live server-side GA4 client.
 *
 * Each getter is wrapped so any read/parse failure falls back to the
 * matching fixture — a bad or missing synced file degrades one tile to
 * placeholder, never breaks the build. Source of truth for the whole split:
 * FT2 docs/master-plan/analytics-dashboard-metric-definitions.md.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type {
  AnalyticsDashboardData,
  DriftTrendData,
  EventVolumeData,
  ForwardDeclaredEvent,
  ForwardDeclaredEventsData,
  RecentEventsStreamData,
  TaxonomyHealthData,
  TileBand,
} from './analytics-types';
import {
  fixtureDriftTrend,
  fixtureEventVolume,
  fixtureForwardDeclared,
  fixtureRecentEvents,
  fixtureTaxonomyHealth,
} from './analytics-fixtures';
import { FITME_STORY_ROOT } from './types';

const DATA_DIR = resolve(FITME_STORY_ROOT, 'src/data');
const EXTERNAL_SYNC_PATH = resolve(DATA_DIR, 'shared/external-sync-status.json');
const TAXONOMY_CSV_PATH = resolve(DATA_DIR, 'docs/docs/product/analytics-taxonomy.csv');
const FORWARD_DECLARED_MARKER = '[FORWARD-DECLARED]';

// ── shared source readers ────────────────────────────────────────────────

interface TaxonomyStatus {
  as_of?: string;
  ios_enum_events?: number;
  ios_csv_rows?: number;
  ios_csv_drift_count?: number;
}

/** Read `sources.analytics.analytics_taxonomy_status` from the synced ledger. */
function readTaxonomyStatus(): TaxonomyStatus {
  const raw = JSON.parse(readFileSync(EXTERNAL_SYNC_PATH, 'utf-8')) as {
    sources?: { analytics?: { analytics_taxonomy_status?: TaxonomyStatus } };
  };
  const status = raw.sources?.analytics?.analytics_taxonomy_status;
  if (!status || typeof status !== 'object') {
    throw new Error('analytics_taxonomy_status block absent from external-sync-status.json');
  }
  return status;
}

function driftBand(drift: number): TileBand {
  if (drift === 0) return 'green';
  if (drift <= 5) return 'amber';
  return 'red';
}

function healthBand(missing: number, orphan: number, healthPct: number): TileBand {
  if (missing === 0 && orphan === 0) return 'green';
  if (healthPct >= 90) return 'amber';
  return 'red';
}

/** PascalCase CSV Category → snake_case screen scope (e.g. DesignSystem → design_system). */
function toScreenScope(category: string): string {
  return category
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

// ── per-tile live getters (each falls back to its fixture on error) ───────

/** Tile 2 — DriftTrend. Live from external-sync-status.json (calibration 🟢). */
export function getDriftTrend(): DriftTrendData {
  try {
    const status = readTaxonomyStatus();
    const currentDrift = Number(status.ios_csv_drift_count ?? 0);
    // Real 14-snapshot day-history is not carried in the synced ledger; reuse
    // the fixture's real 56→0 Phase 1.A trajectory but anchor the final point
    // to the live current value so the tile's headline number is authoritative.
    const sparkline = [...fixtureDriftTrend.sparkline_14d.slice(0, -1), currentDrift];
    return {
      current_drift: currentDrift,
      prior_snapshot: currentDrift,
      sparkline_14d: sparkline,
      band: driftBand(currentDrift),
      meta: {
        status: 'live',
        refreshed_at: status.as_of ?? new Date().toISOString(),
        source: 'external-sync-status.json::sources.analytics.analytics_taxonomy_status.ios_csv_drift_count',
      },
    };
  } catch {
    return fixtureDriftTrend;
  }
}

/** Tile 3 — TaxonomyHealth. Live from external-sync-status.json (calibration 🟢). */
export function getTaxonomyHealth(): TaxonomyHealthData {
  try {
    const status = readTaxonomyStatus();
    const enumEvents = Number(status.ios_enum_events ?? 0);
    const missing = Number(status.ios_csv_drift_count ?? 0);
    const inCsv = Math.max(enumEvents - missing, 0);
    const orphan = Math.max(Number(status.ios_csv_rows ?? 0) - inCsv, 0);
    const denom = inCsv + missing + orphan;
    const healthPct = denom === 0 ? 0 : Math.round((inCsv / denom) * 1000) / 10;
    return {
      health_pct: healthPct,
      events_in_csv: inCsv,
      events_missing_csv: missing,
      events_orphan_csv: orphan,
      band: healthBand(missing, orphan, healthPct),
      meta: {
        status: 'live',
        refreshed_at: status.as_of ?? new Date().toISOString(),
        source: 'external-sync-status.json::sources.analytics.analytics_taxonomy_status',
      },
    };
  } catch {
    return fixtureTaxonomyHealth;
  }
}

/**
 * Parse the `[FORWARD-DECLARED]` rows out of the taxonomy CSV.
 *
 * The CSV is not RFC-4180 quoted (the Notes column contains unescaped
 * commas), so we anchor on the marker rather than splitting the whole row:
 * Category + Event Name are the first two comma fields (neither contains a
 * comma); Notes is everything from the marker onward.
 */
export function parseForwardDeclared(csv: string): ForwardDeclaredEvent[] {
  const out: ForwardDeclaredEvent[] = [];
  for (const line of csv.split('\n')) {
    const markerIdx = line.indexOf(FORWARD_DECLARED_MARKER);
    if (markerIdx === -1) continue;
    const fields = line.split(',');
    const category = (fields[0] ?? '').trim();
    const eventName = (fields[1] ?? '').trim();
    if (!eventName) continue;
    const notes = line.slice(markerIdx + FORWARD_DECLARED_MARKER.length).trim();
    out.push({
      event_name: eventName,
      screen_scope: toScreenScope(category),
      notes,
    });
  }
  return out;
}

/** Tile 5 — ForwardDeclared. Live from the taxonomy CSV (calibration 🟢). */
export function getForwardDeclared(): ForwardDeclaredEventsData {
  try {
    const csv = readFileSync(TAXONOMY_CSV_PATH, 'utf-8');
    const events = parseForwardDeclared(csv);
    if (events.length === 0) return fixtureForwardDeclared;
    return {
      events,
      meta: {
        status: 'live',
        refreshed_at: new Date().toISOString(),
        source: 'analytics-taxonomy.csv (rows tagged [FORWARD-DECLARED])',
      },
    };
  } catch {
    return fixtureForwardDeclared;
  }
}

/**
 * Tile 1 — EventVolume. Stays on the fixture BY DESIGN: the authoritative
 * source is the GA4 Reporting API (eventCount), which is not synced and is
 * unreachable for a pre-launch property. We surface honest provenance rather
 * than reinterpret the active-users probe as event volume.
 */
export function getEventVolume(): EventVolumeData {
  return {
    ...fixtureEventVolume,
    meta: {
      ...fixtureEventVolume.meta,
      status: 'fixture',
      source:
        'fixture — GA4 Reporting API (eventCount) not available at build time for pre-launch property; real synced GA4 signal is active-users probe only',
    },
  };
}

/**
 * Tile 4 — RecentEventsStream. Stays on the fixture BY DESIGN: the GA4
 * Realtime API cannot be resolved at build/request time without a live
 * server-side GA4 client (ships with launch instrumentation).
 */
export function getRecentEvents(): RecentEventsStreamData {
  return {
    ...fixtureRecentEvents,
    meta: {
      ...fixtureRecentEvents.meta,
      status: 'fixture',
      source: 'fixture — GA4 Realtime API requires a live server-side client (post-launch)',
    },
  };
}

/** Assemble the full dashboard. Each tile is independently fault-isolated. */
export function getAnalyticsDashboard(): AnalyticsDashboardData {
  return {
    event_volume: getEventVolume(),
    drift_trend: getDriftTrend(),
    taxonomy_health: getTaxonomyHealth(),
    recent_events_stream: getRecentEvents(),
    forward_declared: getForwardDeclared(),
  };
}
