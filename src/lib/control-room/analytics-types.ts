/**
 * Analytics dashboard tile contracts — Phase 3.A.1 of analytics-observability.
 *
 * TypeScript interfaces for the 5 tiles on /control-room/analytics. These
 * shapes are the contract between the tile components (consumers) and the
 * data fetchers (producers). Live producers ship post-2026-06-04 (see
 * docs/master-plan/analytics-master-plan-2026-05-13.md §7.5 calibration
 * safety classification). Until then, fixture data in `analytics-fixtures.ts`
 * implements these contracts.
 *
 * Cross-reference: `docs/master-plan/analytics-dashboard-metric-definitions.md`
 * defines the formula + source ledger for each tile.
 */

// ────────────────────────────────────────────────────────────────────────────
// Common types
// ────────────────────────────────────────────────────────────────────────────

export type CalibrationStatus = 'fixture' | 'live';

/**
 * Color band for tile thresholds. Maps to design-system semantic colors.
 *
 * `green`  — healthy / on-target
 * `amber`  — degraded / approaching threshold
 * `red`    — failing / past threshold
 * `gray`   — n/a or unknown
 */
export type TileBand = 'green' | 'amber' | 'red' | 'gray';

export interface TileMeta {
  /** Whether this tile renders fixture (placeholder) data or live data. */
  status: CalibrationStatus;
  /** ISO-8601 timestamp the tile was last refreshed. */
  refreshed_at: string;
  /** Source ledger reference (file path or API name) for operator inspection. */
  source: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Tile 1 — EventVolumeTile
// ────────────────────────────────────────────────────────────────────────────

export interface EventVolumeData {
  /** Number of GA4 events in the last 24 hours. */
  events_24h: number;
  /** Number of GA4 events in the prior 24-hour window (24-48h ago). */
  events_24h_prior: number;
  /** Average daily events over the last 7 days. */
  events_7d_avg: number;
  /** Daily event counts for the last 14 days for sparkline. Oldest first. */
  sparkline_14d: number[];
  /** Color band per metric-definitions Tile 1 thresholds. */
  band: TileBand;
  meta: TileMeta;
}

// ────────────────────────────────────────────────────────────────────────────
// Tile 2 — DriftTrendTile
// ────────────────────────────────────────────────────────────────────────────

export interface DriftTrendData {
  /** Current CSV taxonomy drift count from external-sync-status.json. */
  current_drift: number;
  /** Drift count from the prior snapshot for delta computation. */
  prior_snapshot: number;
  /** Daily drift counts for the last 14 snapshots. Oldest first. */
  sparkline_14d: number[];
  /** Color band per metric-definitions Tile 2 thresholds. */
  band: TileBand;
  meta: TileMeta;
}

// ────────────────────────────────────────────────────────────────────────────
// Tile 3 — TaxonomyHealthTile
// ────────────────────────────────────────────────────────────────────────────

export interface TaxonomyHealthData {
  /** Health percentage: events present in both code AND CSV, excluding orphans. */
  health_pct: number;
  /** Count of events declared in code AND in CSV (intersection). */
  events_in_csv: number;
  /** Count of events in code but missing from CSV. */
  events_missing_csv: number;
  /** Count of CSV rows with no matching code declaration (excluding forward-declared). */
  events_orphan_csv: number;
  /** Color band per metric-definitions Tile 3 thresholds. */
  band: TileBand;
  meta: TileMeta;
}

// ────────────────────────────────────────────────────────────────────────────
// Tile 4 — RecentEventsStream
// ────────────────────────────────────────────────────────────────────────────

export interface RecentEvent {
  /** ISO-8601 timestamp the event fired. */
  timestamp: string;
  /** GA4 event name (e.g. `home_action_tap`). */
  event_name: string;
  /** Top 3 event params for inline display. Keys vary by event. */
  top_params: Record<string, string | number | boolean>;
}

export interface RecentEventsStreamData {
  /** Up to 100 most-recent events from the GA4 Realtime API. */
  events: RecentEvent[];
  meta: TileMeta;
}

// ────────────────────────────────────────────────────────────────────────────
// Tile 5 — ForwardDeclaredEventsTile
// ────────────────────────────────────────────────────────────────────────────

export interface ForwardDeclaredEvent {
  /** Event name as declared in the CSV. */
  event_name: string;
  /** Screen scope where the event will eventually fire (e.g. `design_system`). */
  screen_scope: string;
  /** Notes column extract (after stripping the `[FORWARD-DECLARED]` prefix). */
  notes: string;
}

export interface ForwardDeclaredEventsData {
  /** All events tagged `[FORWARD-DECLARED]` in the canonical CSV. */
  events: ForwardDeclaredEvent[];
  meta: TileMeta;
}

// ────────────────────────────────────────────────────────────────────────────
// Tile bundle (page-level data shape)
// ────────────────────────────────────────────────────────────────────────────

export interface AnalyticsDashboardData {
  event_volume: EventVolumeData;
  drift_trend: DriftTrendData;
  taxonomy_health: TaxonomyHealthData;
  recent_events_stream: RecentEventsStreamData;
  forward_declared: ForwardDeclaredEventsData;
}
