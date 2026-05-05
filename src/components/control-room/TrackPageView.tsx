'use client';

/**
 * TrackPageView — UCC task T36 client island.
 *
 * Fires two of the 8 GA4 events declared in the UCC PRD §10.1, both
 * keyed to page-load:
 *
 *   1. `dashboard_load` — once per route mount, with route +
 *      data_freshness_minutes + auth_method params.
 *   2. `dashboard_sync_warning_shown` — fires once on mount if the data
 *      sync is more than 6 hours stale (the same threshold the
 *      DataFreshnessFooter uses to flip into red-warning state).
 *
 * Embedded once at the top of every `/control-room/*` page. Renders
 * nothing — analytics-only. Effects run once via the empty-deps pattern
 * with explicit lint-acknowledged dep on `route` (which is stable per
 * page, not reactive).
 *
 * Source for the dual emission: pages already inherit the
 * DataFreshnessFooter via layout.tsx, but the footer is a server
 * component that can't fire client-only GA events. This component is
 * the natural home for both load + stale-warning events because both
 * derive from the same `freshness.json` snapshot read at first paint.
 */

import { useEffect, useRef } from 'react';
import freshnessData from '@/data/freshness.json';
import {
  trackDashboardLoad,
  trackSyncWarningShown,
  type ControlRoomRoute,
} from '@/lib/control-room/analytics';

interface FreshnessFile {
  syncedAt: string;
  source?: string;
}

const STALE_THRESHOLD_HOURS = 6;

function computeFreshnessMinutes(now: number): number {
  const data = freshnessData as FreshnessFile;
  const syncedAtMs = Date.parse(data.syncedAt);
  if (!Number.isFinite(syncedAtMs)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.round((now - syncedAtMs) / 60_000));
}

function freshnessSource(): string {
  const data = freshnessData as FreshnessFile;
  return data.source ?? 'unknown';
}

export interface TrackPageViewProps {
  route: ControlRoomRoute;
}

export function TrackPageView({ route }: TrackPageViewProps) {
  // useRef to prevent double-fire under React 19 StrictMode in dev.
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const now = Date.now();
    const freshnessMinutes = computeFreshnessMinutes(now);

    trackDashboardLoad({
      route,
      data_freshness_minutes: Number.isFinite(freshnessMinutes) ? freshnessMinutes : -1,
      // /control-room/* is gated by middleware basic-auth in production. The
      // 'basic' label is hard-coded here because the auth method is a
      // deploy-time invariant, not a runtime signal we can introspect from
      // the browser. If the gate ever flips to 'public' or 'extracted',
      // update this constant in the same PR.
      auth_method: 'basic',
    });

    const stalenessHours = freshnessMinutes / 60;
    if (Number.isFinite(stalenessHours) && stalenessHours > STALE_THRESHOLD_HOURS) {
      trackSyncWarningShown({
        staleness_hours: Math.round(stalenessHours * 10) / 10,
        source: freshnessSource(),
      });
    }
  }, [route]);

  return null;
}
