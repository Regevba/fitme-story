'use client';

/**
 * InstrumentedAlertsBanner — UCC T36 Phase 2 client island.
 *
 * Wraps the AlertsBanner with GA4 instrumentation: when the operator
 * acknowledges (first-expand) the banner, fires `dashboard_blocker_acknowledged`
 * with the top alert's id + severity + time-since-load (the TTC measurement
 * primary metric).
 *
 * Pure forwarding wrapper — same alerts prop signature, no visual changes.
 * Renders nothing when alerts is empty (AlertsBanner internal short-circuit),
 * so safe to mount eagerly even before the alerts data wires in.
 */

import {
  AlertsBanner,
  type AlertsBannerProps,
  type ControlRoomAlert,
} from '@/components/control-room/AlertsBanner';
import {
  trackBlockerAcknowledged,
  timeSinceLoadMs,
  type AlertSeverity,
} from '@/lib/control-room/analytics';

const VALID_SEVERITIES: ReadonlySet<AlertSeverity> = new Set([
  'red',
  'amber',
  'blue',
  'purple',
  'info',
]);

function safeSeverity(value: ControlRoomAlert['severity']): AlertSeverity {
  if (value && VALID_SEVERITIES.has(value)) return value;
  return 'info';
}

export type InstrumentedAlertsBannerProps = Pick<AlertsBannerProps, 'alerts'>;

export function InstrumentedAlertsBanner({ alerts }: InstrumentedAlertsBannerProps) {
  const handleAcknowledge = (top: ControlRoomAlert) => {
    trackBlockerAcknowledged({
      feature_id: top.feature ?? top.id ?? 'unknown',
      alert_severity: safeSeverity(top.severity),
      time_since_load_ms: timeSinceLoadMs(),
    });
  };

  return <AlertsBanner alerts={alerts} onAcknowledge={handleAcknowledge} />;
}
