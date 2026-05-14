/**
 * Fixture data for the analytics dashboard tiles.
 *
 * Used by the /control-room/analytics route during the Phase 1.B Calibration
 * Protocol soak window (2026-05-14 → 2026-06-04). After the window closes,
 * the GA4-backed tiles (EventVolumeTile, RecentEventsStream) switch to live
 * data via mcp-server-ga4. See FT2
 * `docs/master-plan/analytics-master-plan-2026-05-13.md` §7.5 for why this
 * split exists.
 *
 * The static-source tiles (DriftTrendTile, TaxonomyHealthTile,
 * ForwardDeclaredEventsTile) currently render fixture data here too for
 * scaffold consistency, but they CAN swap to live reads of the source files
 * any time without contaminating the calibration window — see metric
 * definitions doc per-tile "calibration impact" notes.
 */

import type {
  AnalyticsDashboardData,
  DriftTrendData,
  EventVolumeData,
  ForwardDeclaredEventsData,
  RecentEventsStreamData,
  TaxonomyHealthData,
} from './analytics-types';

const SCAFFOLD_REFRESHED_AT = '2026-05-14T05:00:00Z';

export const fixtureEventVolume: EventVolumeData = {
  events_24h: 1247,
  events_24h_prior: 1198,
  events_7d_avg: 1280,
  sparkline_14d: [
    1132, 1198, 1340, 1290, 1115, 1260, 1410, 1185, 1232, 1310, 1225, 1198, 1247, 1280,
  ],
  band: 'green',
  meta: {
    status: 'fixture',
    refreshed_at: SCAFFOLD_REFRESHED_AT,
    source: 'fixture (live binding deferred to 2026-06-04)',
  },
};

export const fixtureDriftTrend: DriftTrendData = {
  current_drift: 0,
  prior_snapshot: 0,
  sparkline_14d: [56, 56, 42, 42, 38, 12, 8, 4, 2, 0, 0, 0, 0, 0],
  band: 'green',
  meta: {
    status: 'fixture',
    refreshed_at: SCAFFOLD_REFRESHED_AT,
    source: 'fixture (mirrors actual Phase 1.A 56→0 drift trend)',
  },
};

export const fixtureTaxonomyHealth: TaxonomyHealthData = {
  health_pct: 100,
  events_in_csv: 112,
  events_missing_csv: 0,
  events_orphan_csv: 0,
  band: 'green',
  meta: {
    status: 'fixture',
    refreshed_at: SCAFFOLD_REFRESHED_AT,
    source: 'fixture (mirrors actual Phase 1.A close state — 112/112 enum/CSV alignment)',
  },
};

export const fixtureRecentEvents: RecentEventsStreamData = {
  events: [
    {
      timestamp: '2026-05-14T04:58:12Z',
      event_name: 'home_action_tap',
      top_params: { action_type: 'start_workout', day_type: 'push' },
    },
    {
      timestamp: '2026-05-14T04:57:45Z',
      event_name: 'nutrition_meal_logged',
      top_params: { meal_type: 'lunch', calories: 712 },
    },
    {
      timestamp: '2026-05-14T04:57:22Z',
      event_name: 'training_set_completed',
      top_params: { exercise: 'bench_press', reps: 8, weight_kg: 80 },
    },
    {
      timestamp: '2026-05-14T04:56:51Z',
      event_name: 'home_metric_tile_tap',
      top_params: { tile_id: 'recovery', recovery_score: 82 },
    },
    {
      timestamp: '2026-05-14T04:55:33Z',
      event_name: 'stats_period_changed',
      top_params: { period: 'last_7d' },
    },
  ],
  meta: {
    status: 'fixture',
    refreshed_at: SCAFFOLD_REFRESHED_AT,
    source: 'fixture (live GA4 Realtime binding deferred to 2026-06-04)',
  },
};

export const fixtureForwardDeclared: ForwardDeclaredEventsData = {
  events: [
    {
      event_name: 'design_system_component_expand',
      screen_scope: 'design_system',
      notes: 'helper exported in src/lib/design-system-analytics.ts; awaiting ComponentCard expand UI',
    },
    {
      event_name: 'design_system_code_copy',
      screen_scope: 'design_system',
      notes: 'helper exported in src/lib/design-system-analytics.ts; awaiting Copy snippet button',
    },
  ],
  meta: {
    status: 'fixture',
    refreshed_at: SCAFFOLD_REFRESHED_AT,
    source: 'fixture (mirrors current canonical CSV — 2 [FORWARD-DECLARED] entries)',
  },
};

export const fixtureDashboard: AnalyticsDashboardData = {
  event_volume: fixtureEventVolume,
  drift_trend: fixtureDriftTrend,
  taxonomy_health: fixtureTaxonomyHealth,
  recent_events_stream: fixtureRecentEvents,
  forward_declared: fixtureForwardDeclared,
};
