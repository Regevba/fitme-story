/**
 * TaxonomyHealthTile — answers "are all events declared in iOS enum + web
 * helpers also documented in the canonical CSV?"
 *
 * Phase 3.A.1 of analytics-observability. Static-source tile (parses code
 * + CSV, not GA4) — calibration impact green per master plan §7.5.
 *
 * Metric formula: FT2
 * `docs/master-plan/analytics-dashboard-metric-definitions.md` Tile 3.
 */

import type { TaxonomyHealthData } from '@/lib/control-room/analytics-types';

import {
  TileMetaBadge,
  bandColorClass,
  formatNumber,
  formatPct,
} from './analytics-tile-primitives';

export interface TaxonomyHealthTileProps {
  data: TaxonomyHealthData;
}

export function TaxonomyHealthTile({ data }: TaxonomyHealthTileProps) {
  return (
    <article
      className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white dark:bg-[var(--color-neutral-900)] p-5"
      aria-labelledby="taxonomy-health-title"
    >
      <header className="mb-4 flex items-start justify-between">
        <div>
          <h3 id="taxonomy-health-title" className="font-sans text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            Taxonomy Health
          </h3>
          <p className="mt-1 font-sans text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
            Code ↔ CSV alignment across iOS + web
          </p>
        </div>
        <TileMetaBadge meta={data.meta} />
      </header>

      <div className="flex items-baseline gap-3">
        <span
          className="font-sans text-3xl font-semibold tabular-nums text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]"
          aria-label={`${formatPct(data.health_pct)} taxonomy health`}
        >
          {formatPct(data.health_pct)}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 font-sans text-xs">
        <Stat label="Aligned" value={data.events_in_csv} />
        <Stat label="Missing" value={data.events_missing_csv} amber={data.events_missing_csv > 0} />
        <Stat label="Orphan" value={data.events_orphan_csv} amber={data.events_orphan_csv > 0} />
      </dl>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${bandColorClass(data.band)}`}
          aria-hidden="true"
        />
        <span className="font-sans text-xs text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] capitalize">
          {data.band}
        </span>
      </div>
    </article>
  );
}

interface StatProps {
  label: string;
  value: number;
  amber?: boolean;
}

function Stat({ label, value, amber = false }: StatProps) {
  return (
    <div>
      <dt className="text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)] uppercase tracking-wider">
        {label}
      </dt>
      <dd
        className={`mt-1 font-sans text-base font-semibold tabular-nums ${
          amber
            ? 'text-[var(--color-warning-700)] dark:text-[var(--color-warning-400)]'
            : 'text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]'
        }`}
      >
        {formatNumber(value)}
      </dd>
    </div>
  );
}
