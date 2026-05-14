/**
 * ForwardDeclaredEventsTile — answers "which events are declared in the
 * canonical CSV with the [FORWARD-DECLARED] tag but not yet wired to a UI?"
 *
 * Phase 3.A.1 of analytics-observability. Static-source tile (parses CSV,
 * not GA4) — calibration impact green per master plan §7.5.
 *
 * Convention reference: master plan §5.4 forward-declared events.
 * Metric formula: FT2
 * `docs/master-plan/analytics-dashboard-metric-definitions.md` Tile 5.
 */

import type { ForwardDeclaredEventsData } from '@/lib/control-room/analytics-types';

import { TileMetaBadge } from './analytics-tile-primitives';

export interface ForwardDeclaredEventsTileProps {
  data: ForwardDeclaredEventsData;
}

export function ForwardDeclaredEventsTile({ data }: ForwardDeclaredEventsTileProps) {
  return (
    <article
      className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white dark:bg-[var(--color-neutral-900)] p-5"
      aria-labelledby="forward-declared-title"
    >
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h3 id="forward-declared-title" className="font-sans text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            Forward-Declared Events
          </h3>
          <p className="mt-1 font-sans text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
            Helpers exist; UI wiring deferred per §5.4 convention
          </p>
        </div>
        <TileMetaBadge meta={data.meta} />
      </header>

      {data.events.length === 0 ? (
        <p className="font-sans text-sm text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
          No forward-declared events.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.events.map((e) => (
            <li
              key={e.event_name}
              className="rounded-sm border border-[var(--color-neutral-100)] dark:border-[var(--color-neutral-800)] px-3 py-2"
            >
              <div className="flex items-baseline justify-between gap-3">
                <code className="font-mono text-xs text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                  {e.event_name}
                </code>
                <span className="shrink-0 rounded-full bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] px-2 py-0.5 font-sans text-[10px] text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-300)]">
                  {e.screen_scope}
                </span>
              </div>
              <p className="mt-1 font-sans text-xs text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
                {e.notes}
              </p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
