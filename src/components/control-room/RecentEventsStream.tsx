/**
 * RecentEventsStream — answers "what events have fired in the last
 * 30 minutes?"
 *
 * Phase 3.A.1 of analytics-observability. Calibration safety: live GA4
 * Realtime API binding deferred to 2026-06-04 per master plan §7.5.
 *
 * Metric formula: FT2
 * `docs/master-plan/analytics-dashboard-metric-definitions.md` Tile 4.
 */

import type { RecentEventsStreamData } from '@/lib/control-room/analytics-types';

import { TileMetaBadge, formatRelativeTime } from './analytics-tile-primitives';

export interface RecentEventsStreamProps {
  data: RecentEventsStreamData;
  /** Override "now" for deterministic testing/server-render. */
  now?: Date;
}

export function RecentEventsStream({ data, now }: RecentEventsStreamProps) {
  return (
    <article
      className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white dark:bg-[var(--color-neutral-900)] p-5"
      aria-labelledby="recent-events-title"
    >
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h3 id="recent-events-title" className="font-sans text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            Recent Events
          </h3>
          <p className="mt-1 font-sans text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
            Last {data.events.length} events from GA4 Realtime
          </p>
        </div>
        <TileMetaBadge meta={data.meta} />
      </header>

      {data.events.length === 0 ? (
        <p className="font-sans text-sm text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
          No recent events.
        </p>
      ) : (
        <ol className="space-y-2">
          {data.events.map((e, i) => (
            <li
              key={`${e.timestamp}-${i}`}
              className="flex items-baseline justify-between gap-3 rounded-sm border border-[var(--color-neutral-100)] dark:border-[var(--color-neutral-800)] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <code className="font-mono text-xs text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                  {e.event_name}
                </code>
                <p className="mt-1 truncate font-mono text-[10px] text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
                  {formatTopParams(e.top_params)}
                </p>
              </div>
              <time
                dateTime={e.timestamp}
                className="shrink-0 font-sans text-[10px] text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)] tabular-nums"
              >
                {formatRelativeTime(e.timestamp, now)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}

function formatTopParams(params: Record<string, string | number | boolean>): string {
  const entries = Object.entries(params).slice(0, 3);
  if (entries.length === 0) return '(no params)';
  return entries.map(([k, v]) => `${k}=${v}`).join(', ');
}
