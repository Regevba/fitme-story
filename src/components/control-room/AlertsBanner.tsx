'use client';

/**
 * Control-room AlertsBanner — TypeScript port of dashboard/src/components/AlertsBanner.jsx
 *
 * UCC task T24. Renders a collapsed banner with alert count + critical/warning
 * pill badges; expands to show the full alert list on click.
 *
 * Decoupling note: the source component imported `trackBlockerAcknowledged`
 * directly from a sibling analytics module. Here the analytics call is
 * surfaced as an `onAcknowledge` callback prop so the parent (a client page
 * with a GA4 provider in scope) can wire it. T36 will provide the wiring.
 *
 * Re-skin per token-map.md: dashboard's bespoke `rounded-card`, `shadow-card`,
 * `rounded-badge`, surface-secondary-dark all replaced with fitme-story
 * neutrals + standard Tailwind utilities.
 *
 * Source: dashboard/src/components/AlertsBanner.jsx (77 lines)
 */

import { useState } from 'react';

export type AlertSeverity = 'red' | 'amber' | 'blue' | 'purple' | 'info';

export interface ControlRoomAlert {
  message: string;
  severity?: AlertSeverity;
  feature?: string;
  id?: string;
}

interface SeverityStyle {
  bg: string;
  text: string;
  icon: string;
}

const SEVERITY_STYLES: Record<AlertSeverity, SeverityStyle> = {
  red: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', icon: '✗' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', icon: '⚠' },
  blue: { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-700 dark:text-sky-300', icon: '⊘' },
  purple: { bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20', text: 'text-fuchsia-700 dark:text-fuchsia-300', icon: '◉' },
  info: { bg: 'bg-[var(--color-neutral-100)] dark:bg-white/[0.04]', text: 'text-[var(--color-neutral-500)]', icon: 'ℹ' },
};

export interface AlertsBannerProps {
  alerts?: ControlRoomAlert[];
  /**
   * Fires once on the first expansion of the banner — the moment the operator
   * engages with alerts. Wire to GA4 `dashboard_blocker_acknowledged` in T36.
   */
  onAcknowledge?: (top: ControlRoomAlert) => void;
}

export function AlertsBanner({ alerts = [], onAcknowledge }: AlertsBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (alerts.length === 0) return null;

  const criticalCount = alerts.filter((a) => a.severity === 'red').length;
  const warningCount = alerts.filter((a) => a.severity === 'amber').length;

  const handleToggle = () => {
    if (!expanded && onAcknowledge) {
      onAcknowledge(alerts[0] ?? { message: '', severity: 'info' });
    }
    setExpanded(!expanded);
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-[var(--color-neutral-800)]">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-[var(--color-neutral-50)] dark:hover:bg-white/[0.02]"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="text-amber-500">⚠</span>
          <span className="font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </span>
          {criticalCount > 0 ? (
            <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-xs text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
              {criticalCount} conflicts
            </span>
          ) : null}
          {warningCount > 0 ? (
            <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {warningCount} missing
            </span>
          ) : null}
        </div>
        <svg
          className={`h-4 w-4 text-[var(--color-neutral-500)] transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded ? (
        <div className="max-h-48 space-y-1.5 overflow-y-auto border-t border-[var(--color-neutral-100)] px-4 py-2 dark:border-[var(--color-neutral-700)]">
          {alerts.map((alert, i) => {
            const style = SEVERITY_STYLES[alert.severity ?? 'info'] ?? SEVERITY_STYLES.info;
            return (
              <div
                key={`${alert.id ?? alert.feature ?? 'alert'}-${i}`}
                className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs ${style.bg}`}
              >
                <span className="mt-0.5">{style.icon}</span>
                <span className={style.text}>{alert.message}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
